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

type AgentSpeaker =
  | "manager"
  | "researcher"
  | "copywriter"
  | "social"
  | "finance"
  | "hr"
  | "qc";

type ChatRecipient = "ceo" | "all" | AgentSpeaker;
type AgentMoveIntent = "stay" | "pantry" | "desk" | "manager_handoff" | "copier";
type DeliverableKey =
  | "landingPageCopy"
  | "launchThread"
  | "shortVideoScript"
  | "socialMediaPlan"
  | "financePlan"
  | "hrOpsChecklist"
  | "qcAuditReport";

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
  socialMediaPlan?: string;
  financePlan?: string;
  hrOpsChecklist?: string;
  qcAuditReport?: string;
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
  socialMediaPlan?: string;
  financePlan?: string;
  hrOpsChecklist?: string;
  qcAuditReport?: string;
  revisedSection?: DeliverableKey;
  revisionSummary?: string;
}

const SECTION_LABELS: Record<DeliverableKey, string> = {
  landingPageCopy: "Copy Landing Page (landingPageCopy)",
  launchThread: "Utas Peluncuran Viral (launchThread)",
  shortVideoScript: "Skrip Video Pendek 45 Detik (shortVideoScript)",
  socialMediaPlan: "Kalender Konten Social Media 7 Hari (socialMediaPlan)",
  financePlan: "Strategi Pricing & Finance (financePlan)",
  hrOpsChecklist: "SOP Tim & Operasional HR (hrOpsChecklist)",
  qcAuditReport: "Sertifikat Audit Pre-Launch QC (qcAuditReport)",
};

const SECTION_OWNERS: Record<DeliverableKey, AgentSpeaker> = {
  landingPageCopy: "copywriter",
  launchThread: "copywriter",
  shortVideoScript: "copywriter",
  socialMediaPlan: "social",
  financePlan: "finance",
  hrOpsChecklist: "hr",
  qcAuditReport: "qc",
};

function normalizeSpeaker(raw: unknown, fallback: AgentSpeaker): AgentSpeaker {
  if (typeof raw !== "string") return fallback;
  const s = raw.trim().toLowerCase();
  if (s.includes("manager") || s.includes("alex")) return "manager";
  if (s.includes("research") || s.includes("maya") || s.includes("riset")) return "researcher";
  if (s.includes("copy") || s.includes("leo")) return "copywriter";
  if (s.includes("social") || s.includes("sora") || s.includes("sosmed")) return "social";
  if (s.includes("finance") || s.includes("raka") || s.includes("keuangan")) return "finance";
  if (s === "hr" || s.includes("human") || s.includes("nadia")) return "hr";
  if (s === "qc" || s.includes("quality") || s.includes("bima")) return "qc";
  return fallback;
}

function normalizeRecipient(raw: unknown, fallback: ChatRecipient): ChatRecipient {
  if (typeof raw !== "string") return fallback;
  const s = raw.trim().toLowerCase();
  if (s.includes("ceo") || s.includes("bos") || s.includes("user") || s.includes("kamu")) {
    return "ceo";
  }
  if (s.includes("all") || s.includes("semua") || s.includes("tim")) return "all";
  return normalizeSpeaker(s, fallback === "ceo" || fallback === "all" ? "manager" : fallback);
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
  if (s.includes("qc") || s.includes("audit") || s.includes("quality")) return "qcAuditReport";
  if (s.includes("hr") || s.includes("sop") || s.includes("ops")) return "hrOpsChecklist";
  if (s.includes("finance") || s.includes("pricing") || s.includes("harga")) return "financePlan";
  if (s.includes("social") || s.includes("sosmed") || s.includes("kalender")) {
    return "socialMediaPlan";
  }
  if (s.includes("video") || s.includes("script") || s.includes("skrip") || s.includes("tiktok") || s.includes("reel")) {
    return "shortVideoScript";
  }
  if (s.includes("thread") || s.includes("utas") || s.includes("twitter")) {
    return "launchThread";
  }
  if (s.includes("landing") || s.includes("headline") || s.includes("cta")) {
    return "landingPageCopy";
  }
  return undefined;
}

function detectRevisionRequest(
  message: string,
  hasDeliverable: boolean,
  target: "all" | AgentSpeaker
): { isRevision: boolean; hintedSection: DeliverableKey | null } {
  if (!hasDeliverable) return { isRevision: false, hintedSection: null };

  const lower = message.toLowerCase();
  const hasRevisionVerb =
    /(revisi|ubah|ganti|perbaiki|perhalus|pertajam|perketat|bikin.*lebih|buat.*lebih|tambahin|tambahkan|tweak|edit|poles|rombak|pendekin|panjangin|turunin|naikin|diskon|lebih agresif|lebih santai|lebih elegan|lebih nendang|lebih persuasif|lebih padat|lebih ketat)/i.test(
      lower
    );

  if (!hasRevisionVerb) return { isRevision: false, hintedSection: null };

  if (/(qc|audit|checklist|kualitas|sertifikat|pre-launch)/i.test(lower) || target === "qc") {
    return { isRevision: true, hintedSection: "qcAuditReport" };
  }
  if (/(finance|harga|pricing|tier|promo|margin|revenue|budget|keuangan|diskon)/i.test(lower) || target === "finance") {
    return { isRevision: true, hintedSection: "financePlan" };
  }
  if (/(sosmed|social|kalender|jadwal konten|instagram|ig|fyp|distribusi)/i.test(lower) || target === "social") {
    return { isRevision: true, hintedSection: "socialMediaPlan" };
  }
  if (/(hr|sop|tim|onboarding|sla|operasional|shift|support)/i.test(lower) || target === "hr") {
    return { isRevision: true, hintedSection: "hrOpsChecklist" };
  }
  if (/(video|skrip|script|tiktok|reels|hook video|45\s*detik)/i.test(lower)) {
    return { isRevision: true, hintedSection: "shortVideoScript" };
  }
  if (/(thread|utas|twitter|x\b|postingan)/i.test(lower)) {
    return { isRevision: true, hintedSection: "launchThread" };
  }
  if (/(landing|halaman|headline|subheadline|cta|copy|benefit|manfaat|draft|launch kit)/i.test(lower) || target === "copywriter" || target === "manager") {
    return { isRevision: true, hintedSection: "landingPageCopy" };
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

    const revObj = (obj.deliverableRevision ?? obj.deliverablePatch ?? obj.revision) as
      | Record<string, unknown>
      | undefined;

    if (revObj && typeof revObj === "object") {
      const patch: DeliverablePatch = {};
      const keys: DeliverableKey[] = [
        "landingPageCopy",
        "launchThread",
        "shortVideoScript",
        "socialMediaPlan",
        "financePlan",
        "hrOpsChecklist",
        "qcAuditReport",
      ];
      for (const k of keys) {
        const val = revObj[k];
        if (typeof val === "string" && val.trim()) {
          patch[k] = val.trim();
          patch.revisedSection = k;
        }
      }

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

      if (keys.some((k) => Boolean(patch[k]))) {
        deliverablePatch = patch;
      }
    }
  }

  const turns: DialogueTurn[] = [];
  const fallbackOrder: AgentSpeaker[] = [
    defaultSpeaker,
    defaultSpeaker === "manager" ? "social" : "manager",
    defaultSpeaker === "qc" ? "finance" : "qc",
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

  if (turns.length === 0 && cleaned.length > 0) {
    const lines = cleaned
      .split(/\n+/)
      .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
      .filter((l) => l.length > 3 && !l.startsWith("{") && !l.startsWith("}"));

    for (const line of lines.slice(0, 3)) {
      const match = line.match(
        /^(Alex|Maya|Leo|Sora|Raka|Nadia|Bima|Manager|Researcher|Copywriter|Social|Finance|HR|QC)\s*[:\-–]\s*(.+)$/i
      );
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
          deliverable.shortVideoScript ||
          deliverable.socialMediaPlan ||
          deliverable.financePlan ||
          deliverable.hrOpsChecklist ||
          deliverable.qcAuditReport)
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
      ctx.researchSummary ? `Riset Maya: ${ctx.researchSummary.slice(0, 280)}` : "",
      hasDeliverable ? `Status Launch Kit 7-Divisi: SELESAI & SIAP REVISI` : "Status Launch Kit: Belum dicetak",
    ]
      .filter(Boolean)
      .join("\n");

    const personaHeader =
      "Kamu adalah sutradara dialog 7 divisi BRICKLAUNCH STUDIO (Bahasa Indonesia akrab, profesional-santai, tegas sesuai persona masing-masing):\n" +
      "- 'manager' = Alex (AI Manager): tenang, terstruktur, tegas, koordinator tim.\n" +
      "- 'researcher' = Maya (Market Researcher): analitis, penasaran, obsesi psikologi konsumen & data.\n" +
      "- 'copywriter' = Leo (Conversion Copywriter): punchy, kreatif, fokus konversi, energik.\n" +
      "- 'social' = Sora (Social Media Specialist): trend-savvy, ceria, jago viral Reels/TikTok/Threads & komunitas.\n" +
      "- 'finance' = Raka (Finance Strategist): presisi angka, pragmatis, jago pricing tier, margin & ROI.\n" +
      "- 'hr' = Nadia (Human Resources): hangat, suportif, teratur soal SOP tim, SLA & budaya kerja.\n" +
      "- 'qc' = Bima (Product QC): teliti, perfeksionis, ketat menjaga standar kualitas produk sebelum launch.\n" +
      "ATURAN: Jawab Bahasa Indonesia. Keluarkan HANYA JSON valid tanpa markdown fences.";

    if (isRevision && deliverable) {
      const targetSection: DeliverableKey = hintedSection || "landingPageCopy";
      const ownerSpeaker = SECTION_OWNERS[targetSection];
      const existingSectionCopy = deliverable[targetSection] || "";
      const sectionLabel = SECTION_LABELS[targetSection];

      const revisionContents =
        `Konteks Proyek:\n${contextSummary}\n\n` +
        `Draf ${sectionLabel} SAAT INI:\n"""\n${existingSectionCopy}\n"""\n\n` +
        `Permintaan Revisi CEO (${target === "all" ? "Semua Tim" : target}): "${message}"\n\n` +
        `TUGAS REVISI LIVE:\n` +
        `1. Revisi ${sectionLabel} secara nyata sesuai arahan CEO dalam Bahasa Indonesia yang lebih tajam.\n` +
        `2. Buat 1-2 giliran dialog natural (pemilik divisi '${ownerSpeaker}' konfirmasi revisi & cetak ulang file .md terbaru di copier; jika CEO chat ke Alex, Alex ikut berkoordinasi singkat).\n` +
        `3. Keluarkan STRICT JSON:\n` +
        `{\n` +
        `  "turns": [\n` +
        `    {"speaker": "${ownerSpeaker}", "to": "ceo", "text": "Konfirmasi revisi natural bahwa file .md terbaru siap diunduh", "moveTo": "copier"}\n` +
        `  ],\n` +
        `  "deliverableRevision": {\n` +
        `    "section": "${targetSection}",\n` +
        `    "updatedContent": "Teks Markdown Bahasa Indonesia hasil revisi lengkap untuk ${targetSection}",\n` +
        `    "revisionSummary": "Ringkasan 1 kalimat perubahan yang diterapkan"\n` +
        `  }\n` +
        `}`;

      const { response, modelUsed } = await generateWithResilience(ai, {
        profile: "orchestrate",
        systemInstruction: personaHeader,
        contents: revisionContents,
        temperature: ownerSpeaker === "copywriter" || ownerSpeaker === "social" ? 0.7 : 0.4,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        timeoutMs: 30000,
      });

      const { turns, deliverablePatch } = parseChatPayload(
        response.text || "",
        ownerSpeaker,
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

    const targetPrompt =
      mode === "AGENT_BANTER"
        ? "Pilih 3 agent berbeda dari 7 divisi (manager/researcher/copywriter/social/finance/hr/qc — libatkan divisi Social/Finance/HR/QC!) dan buat 3 giliran obrolan seru saling menyahut soal kopi, tren konten, pricing, SOP, atau standar QC studio."
        : target === "all"
          ? `CEO ke SEMUA 7 DIVISI: "${message}". Buat 2-3 giliran dialog dari divisi paling relevan yang menjawab CEO + saling sahut singkat.`
          : `CEO DM khusus ke ${target}: "${message}". Buat 1-2 giliran (agent ${target} wajib jawab CEO dulu sesuai kepribadiannya, opsional 1 rekan divisi lain nimbrung singkat).`;

    const fastContents =
      `Konteks Proyek:\n${contextSummary}\n` +
      `Chat terakhir:\n${historyBlock}\n` +
      `Tugas: ${targetPrompt}\n` +
      `Jika CEO memberi tugas kerja -> moveTo:'desk'/'copier'/'manager_handoff'; jika santai -> 'stay'/'pantry'.\n` +
      `Format JSON: {"turns":[{"speaker":"manager"|"researcher"|"copywriter"|"social"|"finance"|"hr"|"qc","to":"ceo"|"all"|"manager"|"researcher"|"copywriter"|"social"|"finance"|"hr"|"qc","text":"balasan 1-2 kalimat Bahasa Indonesia","moveTo":"stay"}]}`;

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
