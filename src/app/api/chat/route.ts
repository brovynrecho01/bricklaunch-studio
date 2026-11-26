import { NextResponse } from "next/server";
import {
  formatReadableError,
  generateWithResilience,
  getServerGeminiClient,
  isQuotaOrRateLimitError,
  isTransientOverloadError,
} from "@/lib/geminiServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AgentSpeaker = "manager" | "researcher" | "copywriter";
type ChatRecipient = "ceo" | "all" | AgentSpeaker;
type AgentMoveIntent = "stay" | "pantry" | "desk" | "manager_handoff" | "copier";
type DeliverableKey = "landingPageCopy" | "launchThread" | "shortVideoScript";

interface ChatHistoryItem {
  sender: string;
  to?: string;
  text: string;
}

interface SelectedAngleContext {
  id?: string;
  title?: string;
  hook?: string;
  targetAudience?: string;
}

interface FinalDeliverableContext {
  landingPageCopy?: string;
  launchThread?: string;
  shortVideoScript?: string;
}

interface AgentChatRequest {
  mode?: "CEO_MESSAGE" | "AGENT_BANTER";
  target?: "all" | AgentSpeaker;
  message?: string;
  history?: ChatHistoryItem[];
  studioContext?: {
    workflowPhase?: string;
    ceoBrief?: string;
    researchSummary?: string;
    selectedAngle?: SelectedAngleContext | null;
    selectedAngleTitle?: string;
    finalDeliverable?: FinalDeliverableContext | null;
  };
}

interface DialogueTurn {
  speaker: AgentSpeaker;
  to: ChatRecipient;
  text: string;
  moveTo?: AgentMoveIntent;
}

interface DeliverablePatch {
  landingPageCopy?: string;
  launchThread?: string;
  shortVideoScript?: string;
  revisedSection?: DeliverableKey;
  revisionSummary?: string;
}

function normalizeSpeaker(raw: unknown, fallback: AgentSpeaker): AgentSpeaker {
  if (typeof raw !== "string") return fallback;
  const s = raw.trim().toLowerCase();
  if (s.includes("manager") || s.includes("alex")) return "manager";
  if (s.includes("research") || s.includes("maya") || s.includes("riset")) return "researcher";
  if (s.includes("copy") || s.includes("leo")) return "copywriter";
  return fallback;
}

function normalizeRecipient(raw: unknown, fallback: ChatRecipient): ChatRecipient {
  if (typeof raw !== "string") return fallback;
  const s = raw.trim().toLowerCase();
  if (s.includes("ceo") || s.includes("bos") || s.includes("user") || s.includes("kamu")) {
    return "ceo";
  }
  if (s.includes("all") || s.includes("semua") || s.includes("tim")) return "all";
  if (s.includes("manager") || s.includes("alex")) return "manager";
  if (s.includes("research") || s.includes("maya") || s.includes("riset")) return "researcher";
  if (s.includes("copy") || s.includes("leo")) return "copywriter";
  return fallback;
}

function normalizeMove(raw: unknown): AgentMoveIntent {
  if (typeof raw !== "string") return "stay";
  const s = raw.trim().toLowerCase();
  if (s === "pantry") return "pantry";
  if (s === "desk" || s === "meja") return "desk";
  if (s === "manager_handoff" || s === "handoff") return "manager_handoff";
  if (s === "copier" || s === "printer") return "copier";
  return "stay";
}

function normalizeSectionKey(raw: unknown): DeliverableKey | undefined {
  if (typeof raw !== "string") return undefined;
  const s = raw.trim().toLowerCase();
  if (s.includes("landing") || s.includes("headline") || s.includes("cta")) {
    return "landingPageCopy";
  }
  if (s.includes("thread") || s.includes("utas") || s.includes("twitter")) {
    return "launchThread";
  }
  if (s.includes("video") || s.includes("script") || s.includes("skrip") || s.includes("tiktok") || s.includes("reel")) {
    return "shortVideoScript";
  }
  return undefined;
}

/**
 * Deteksi apakah pesan CEO meminta revisi pada salah satu bagian finalDeliverable yang sudah ada.
 */
function detectRevisionRequest(
  message: string,
  hasDeliverable: boolean,
  target: "all" | AgentSpeaker
): { isRevision: boolean; hintedSection: DeliverableKey | null } {
  if (!hasDeliverable) return { isRevision: false, hintedSection: null };
  if (target === "researcher") {
    // Maya tidak menulis copy final kecuali user eksplisit menyebut revisi copy/video/thread
    const explicit = /(revisi|ubah|ganti|perbaiki|perhalus|bikin ulang).*(landing|copy|thread|utas|video|skrip|hook)/i.test(
      message
    );
    if (!explicit) return { isRevision: false, hintedSection: null };
  }

  const lower = message.toLowerCase();
  const hasRevisionVerb =
    /(revisi|ubah|ganti|perbaiki|perhalus|pertajam|bikin.*lebih|buat.*lebih|tambahin|tambahkan|tweak|edit|poles|rombak|pendekin|panjangin|lebih agresif|lebih santai|lebih elegan|lebih nendang|lebih persuasif)/i.test(
      lower
    );

  const mentionsVideo = /(video|skrip|script|tiktok|reels|hook video|45\s*detik)/i.test(lower);
  const mentionsThread = /(thread|utas|twitter|x\b|postingan)/i.test(lower);
  const mentionsLanding =
    /(landing|halaman|headline|subheadline|cta|copy|benefit|manfaat|penawaran|launch kit|draft|hasil)/i.test(
      lower
    );

  if (!hasRevisionVerb && !(mentionsVideo || mentionsThread || mentionsLanding)) {
    return { isRevision: false, hintedSection: null };
  }

  if (hasRevisionVerb && (mentionsVideo || mentionsThread || mentionsLanding)) {
    const hintedSection: DeliverableKey = mentionsVideo
      ? "shortVideoScript"
      : mentionsThread
        ? "launchThread"
        : "landingPageCopy";
    return { isRevision: true, hintedSection };
  }

  return { isRevision: false, hintedSection: null };
}

function tryParseJson(cleaned: string): unknown {
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstObj = cleaned.indexOf("{");
    const lastObj = cleaned.lastIndexOf("}");
    const firstArr = cleaned.indexOf("[");
    const lastArr = cleaned.lastIndexOf("]");

    const trySlice = (start: number, end: number) => {
      if (start !== -1 && end > start) {
        try {
          return JSON.parse(cleaned.slice(start, end + 1));
        } catch {
          return null;
        }
      }
      return null;
    };

    return trySlice(firstObj, lastObj) ?? trySlice(firstArr, lastArr);
  }
}

function parseChatPayload(
  rawText: string,
  defaultSpeaker: AgentSpeaker,
  defaultRecipient: ChatRecipient,
  hintedSection: DeliverableKey | null
): { turns: DialogueTurn[]; deliverablePatch: DeliverablePatch | null } {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = tryParseJson(cleaned);

  let candidateList: unknown[] = [];
  let deliverablePatch: DeliverablePatch | null = null;

  if (Array.isArray(parsed)) {
    candidateList = parsed;
  } else if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.turns)) candidateList = obj.turns;
    else if (Array.isArray(obj.dialogue)) candidateList = obj.dialogue;
    else if (Array.isArray(obj.messages)) candidateList = obj.messages;
    else if (Array.isArray(obj.dialog)) candidateList = obj.dialog;
    else if (typeof obj.text === "string" || typeof obj.message === "string") {
      candidateList = [obj];
    }

    // Parse optional live deliverable revision patch
    const revObj = (obj.deliverableRevision ?? obj.deliverablePatch ?? obj.revision) as
      | Record<string, unknown>
      | undefined;

    if (revObj && typeof revObj === "object") {
      const patch: DeliverablePatch = {};
      if (typeof revObj.landingPageCopy === "string" && revObj.landingPageCopy.trim()) {
        patch.landingPageCopy = revObj.landingPageCopy.trim();
        patch.revisedSection = "landingPageCopy";
      }
      if (typeof revObj.launchThread === "string" && revObj.launchThread.trim()) {
        patch.launchThread = revObj.launchThread.trim();
        patch.revisedSection = "launchThread";
      }
      if (typeof revObj.shortVideoScript === "string" && revObj.shortVideoScript.trim()) {
        patch.shortVideoScript = revObj.shortVideoScript.trim();
        patch.revisedSection = "shortVideoScript";
      }

      // Support { section, updatedContent } shape as well
      const sec = normalizeSectionKey(revObj.section) || hintedSection || undefined;
      const updated = revObj.updatedContent ?? revObj.content ?? revObj.newCopy;
      if (sec && typeof updated === "string" && updated.trim()) {
        patch[sec] = updated.trim();
        patch.revisedSection = sec;
      }

      if (typeof revObj.revisionSummary === "string" && revObj.revisionSummary.trim()) {
        patch.revisionSummary = revObj.revisionSummary.trim();
      } else if (typeof revObj.summary === "string" && revObj.summary.trim()) {
        patch.revisionSummary = revObj.summary.trim();
      }

      if (patch.landingPageCopy || patch.launchThread || patch.shortVideoScript) {
        deliverablePatch = patch;
      }
    }
  }

  const turns: DialogueTurn[] = [];
  const fallbackOrder: AgentSpeaker[] = [
    defaultSpeaker,
    defaultSpeaker === "manager" ? "researcher" : "manager",
    defaultSpeaker === "copywriter" ? "researcher" : "copywriter",
  ];

  for (let i = 0; i < candidateList.length && turns.length < 3; i++) {
    const item = candidateList[i];
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const rawMsg = rec.text ?? rec.message ?? rec.dialog ?? rec.content ?? rec.reply;
    if (typeof rawMsg !== "string" || !rawMsg.trim()) continue;

    const speaker = normalizeSpeaker(
      rec.speaker ?? rec.agent ?? rec.sender ?? rec.name,
      fallbackOrder[i % fallbackOrder.length]
    );
    const to = normalizeRecipient(rec.to ?? rec.recipient ?? rec.target, defaultRecipient);
    const moveTo = normalizeMove(rec.moveTo ?? rec.move ?? rec.action);

    turns.push({
      speaker,
      to,
      text: rawMsg.trim(),
      moveTo,
    });
  }

  // Fallback jika model membalas teks biasa Bahasa Indonesia tanpa JSON
  if (turns.length === 0 && cleaned.length > 0) {
    const lines = cleaned
      .split(/\n+/)
      .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
      .filter((l) => l.length > 3 && !l.startsWith("{") && !l.startsWith("}"));

    for (const line of lines.slice(0, 3)) {
      const match = line.match(/^(Alex|Maya|Leo|Manager|Researcher|Copywriter)\s*[:\-–]\s*(.+)$/i);
      if (match) {
        turns.push({
          speaker: normalizeSpeaker(match[1], defaultSpeaker),
          to: defaultRecipient,
          text: match[2].replace(/^["']|["']$/g, "").trim(),
          moveTo: "stay",
        });
      }
    }

    if (turns.length === 0) {
      turns.push({
        speaker: defaultSpeaker,
        to: defaultRecipient,
        text: cleaned.replace(/^["']|["']$/g, "").slice(0, 280),
        moveTo: "stay",
      });
    }
  }

  return { turns, deliverablePatch };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AgentChatRequest;
    const mode = body.mode || "CEO_MESSAGE";
    const target = body.target || "all";
    const message = (body.message || "").trim();
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    const ctx = body.studioContext || {};

    if (mode === "CEO_MESSAGE" && !message) {
      return NextResponse.json(
        { error: "Tulis pesan atau perintah terlebih dahulu untuk dikirim ke agent." },
        { status: 400 }
      );
    }

    const ai = getServerGeminiClient();

    const deliverable = ctx.finalDeliverable || null;
    const hasDeliverable = Boolean(
      deliverable &&
        (deliverable.landingPageCopy ||
          deliverable.launchThread ||
          deliverable.shortVideoScript)
    );

    const { isRevision, hintedSection } =
      mode === "CEO_MESSAGE"
        ? detectRevisionRequest(message, hasDeliverable, target)
        : { isRevision: false, hintedSection: null };

    const historyBlock =
      history.length > 0
        ? history
            .map((h) => `${h.sender}${h.to ? `->${h.to}` : ""}: ${h.text}`)
            .join("\n")
        : "(awal)";

    const angleText = ctx.selectedAngle?.title
      ? `${ctx.selectedAngle.title} (${ctx.selectedAngle.hook || ""})`
      : ctx.selectedAngleTitle || "-";

    const contextSummary = [
      `Fase Studio: ${ctx.workflowPhase || "IDLE"}`,
      `Brief Produk: ${ctx.ceoBrief || "Belum ada"}`,
      `Angle Aktif: ${angleText}`,
      ctx.researchSummary ? `Riset Maya: ${ctx.researchSummary.slice(0, 320)}` : "",
      hasDeliverable ? `Status Launch Kit: SUDAH SELESAI & SIAP REVISI` : "Status Launch Kit: Belum dicetak",
    ]
      .filter(Boolean)
      .join("\n");

    const personaHeader =
      "Kamu adalah sutradara dialog multi-agent BRICKLAUNCH STUDIO (Bahasa Indonesia natural, akrab, dan tajam sesuai karakter tiap agent):\n" +
      "- speaker 'manager' = Alex (AI Manager): tenang, terstruktur, tegas, suportif memimpin tim.\n" +
      "- speaker 'researcher' = Maya (Market & Psychology Researcher): analitis, penasaran, terobsesi psikologi konsumen & insight data.\n" +
      "- speaker 'copywriter' = Leo (Conversion Copywriter): punchy, kreatif, fokus konversi, penuh energi.\n" +
      "ATURAN: Jawab dalam Bahasa Indonesia. Keluarkan HANYA objek JSON valid tanpa markdown fences.";

    if (isRevision && deliverable) {
      const targetSection: DeliverableKey = hintedSection || "landingPageCopy";
      const existingSectionCopy = deliverable[targetSection] || "";

      const sectionLabel =
        targetSection === "shortVideoScript"
          ? "Skrip Video Pendek 45 Detik (shortVideoScript)"
          : targetSection === "launchThread"
            ? "Utas Peluncuran Viral (launchThread)"
            : "Copy Landing Page (landingPageCopy)";

      const revisionContents =
        `Konteks Proyek:\n${contextSummary}\n\n` +
        `Draf ${sectionLabel} SAAT INI:\n"""\n${existingSectionCopy}\n"""\n\n` +
        `Permintaan Revisi CEO (${target === "all" ? "Semua Tim" : target}): "${message}"\n\n` +
        `TUGAS REVISI LIVE:\n` +
        `1. Revisi ${sectionLabel} secara nyata sesuai permintaan CEO dalam Bahasa Indonesia yang jauh lebih tajam & siap publish.\n` +
        `2. Buat 1-2 giliran dialog natural (jika CEO chat ke Alex, Alex koordinasi singkat lalu Leo konfirmasi sudah merevisi & mencetak ulang file .md terbaru di copier; jika ke Leo langsung, Leo langsung eksekusi & konfirmasi).\n` +
        `3. Keluarkan STRICT JSON:\n` +
        `{\n` +
        `  "turns": [\n` +
        `    {"speaker": "manager"|"copywriter", "to": "ceo"|"copywriter", "text": "Konfirmasi revisi natural dalam Bahasa Indonesia bahwa file .md sudah diperbarui", "moveTo": "desk"|"copier"}\n` +
        `  ],\n` +
        `  "deliverableRevision": {\n` +
        `    "section": "${targetSection}",\n` +
        `    "updatedContent": "Teks lengkap Markdown Bahasa Indonesia hasil revisi untuk bagian ${targetSection}",\n` +
        `    "revisionSummary": "Ringkasan 1 kalimat perubahan yang diterapkan"\n` +
        `  }\n` +
        `}`;

      const { response, modelUsed } = await generateWithResilience(ai, {
        profile: "orchestrate",
        systemInstruction: personaHeader,
        contents: revisionContents,
        maxOutputTokens: 1200,
        responseMimeType: "application/json",
        timeoutMs: 15000,
      });

      const defaultSpeaker: AgentSpeaker = target === "manager" ? "manager" : "copywriter";
      const { turns, deliverablePatch } = parseChatPayload(
        response.text || "",
        defaultSpeaker,
        "ceo",
        targetSection
      );

      return NextResponse.json({
        turns,
        deliverablePatch,
        isRevision: Boolean(deliverablePatch),
        modelUsed,
      });
    }

    // Standard fast office chat / banter / Q&A
    const targetPrompt =
      mode === "AGENT_BANTER"
        ? "Buat 3 giliran obrolan singkat antar Alex (manager), Maya (researcher), dan Leo (copywriter) saling menyahut tentang kopi, pantry, psikologi pembeli, atau progres proyek studio."
        : target === "all"
          ? `CEO ke SEMUA TIM: "${message}". Buat 2-3 giliran dialog (agent jawab CEO + saling sahut singkat sesuai kepribadian masing-masing).`
          : `CEO DM khusus ke ${target}: "${message}". Buat 1-2 giliran (agent ${target} wajib jawab CEO dulu sesuai kepribadiannya, opsional 1 rekan nimbrung singkat).`;

    const fastContents =
      `Konteks Proyek:\n${contextSummary}\n` +
      `Chat terakhir:\n${historyBlock}\n` +
      `Tugas: ${targetPrompt}\n` +
      `Jika CEO memberi tugas kerja -> moveTo:'desk'/'copier'/'manager_handoff'; jika ngobrol santai -> 'stay'/'pantry'.\n` +
      `Format JSON: {"turns":[{"speaker":"manager"|"researcher"|"copywriter","to":"ceo"|"all"|"manager"|"researcher"|"copywriter","text":"balasan 1-2 kalimat Bahasa Indonesia","moveTo":"stay"}]}`;

    const { response, modelUsed } = await generateWithResilience(ai, {
      profile: "fast_chat",
      systemInstruction: personaHeader,
      contents: fastContents,
      maxOutputTokens: 500,
      responseMimeType: "application/json",
      timeoutMs: 9000,
    });

    const defaultSpeaker: AgentSpeaker = target === "all" ? "manager" : target;
    const defaultRecipient: ChatRecipient = mode === "AGENT_BANTER" ? "all" : "ceo";

    const { turns, deliverablePatch } = parseChatPayload(
      response.text || "",
      defaultSpeaker,
      defaultRecipient,
      null
    );

    if (turns.length === 0) {
      throw new Error("Agent belum berhasil memproses pesan, silakan coba kirim ulang.");
    }

    return NextResponse.json({
      turns,
      deliverablePatch,
      isRevision: Boolean(deliverablePatch),
      modelUsed,
    });
  } catch (err) {
    const message = formatReadableError(err);
    const status = isQuotaOrRateLimitError(err)
      ? 429
      : message.includes("GEMINI_API_KEY") || isTransientOverloadError(err)
        ? 503
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
