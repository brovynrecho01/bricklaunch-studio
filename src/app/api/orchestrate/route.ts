import { NextResponse } from "next/server";
import {
  extractJsonObject,
  formatReadableError,
  generateWithResilience,
  getServerGeminiClient,
  isQuotaOrRateLimitError,
  isTransientOverloadError,
} from "@/lib/geminiServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface MarketingAnglePayload {
  id: string;
  title: string;
  hook: string;
  targetAudience: string;
}

interface StartBriefRequest {
  action: "START_BRIEF";
  ceoBrief: string;
}

interface ApproveAngleRequest {
  action: "APPROVE_ANGLE";
  ceoBrief: string;
  researchSummary: string;
  selectedAngle: MarketingAnglePayload;
}

type OrchestrateRequest = StartBriefRequest | ApproveAngleRequest;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<OrchestrateRequest>;
    if (!body?.action) {
      return NextResponse.json(
        { error: "Field wajib hilang: action ('START_BRIEF' | 'APPROVE_ANGLE')." },
        { status: 400 }
      );
    }

    const ai = getServerGeminiClient();

    if (body.action === "START_BRIEF") {
      const ceoBrief = typeof body.ceoBrief === "string" ? body.ceoBrief.trim() : "";
      if (!ceoBrief) {
        return NextResponse.json(
          { error: "Masukkan ide atau brief produk digital terlebih dahulu." },
          { status: 400 }
        );
      }

      // 1 panggilan terpadu (hemat kuota 50% & 2x lebih cepat):
      // Maya menyusun intelijen pasar + Alex langsung menyintesis 3 Marketing Angles untuk CEO
      const { response: synthesisRes, modelUsed } = await generateWithResilience(ai, {
        profile: "orchestrate",
        useSearchGrounding: true,
        responseMimeType: "application/json",
        maxOutputTokens: 1200,
        systemInstruction:
          "Kamu menjalankan kolaborasi 2 agent di BRICKLAUNCH STUDIO:\n" +
          "1. Maya (Market Researcher): membedah pain point audiens, celah kompetitor, dan peluang pasar.\n" +
          "2. Alex (AI Manager): merangkum hasil riset Maya menjadi 3 Marketing Angle berbeda untuk dipilih CEO.\n" +
          "Gunakan BAHASA INDONESIA yang tajam, spesifik, dan natural. Keluarkan HANYA objek JSON valid tanpa markdown fences.",
        contents:
          `Brief Produk Digital dari CEO: "${ceoBrief}"\n\n` +
          `Buat analisis pasar dari Maya + sintesis 3 Marketing Angle dari Alex dalam STRICT JSON valid:\n` +
          `{\n` +
          `  "researchSummary": "Ringkasan riset Maya 4-6 kalimat tajam mencakup pain point utama audiens, celah kompetitor, dan peluang konversi",\n` +
          `  "managerReport": "Ringkasan eksekutif 2 kalimat dari Alex merekomendasikan cara memilih angle terbaik",\n` +
          `  "mayaHandoffLine": "1 kalimat obrolan natural Maya ke Alex saat menyerahkan hasil riset",\n` +
          `  "alexApprovalLine": "1 kalimat obrolan natural Alex ke CEO bahwa 3 angle siap dipilih",\n` +
          `  "marketingAngles": [\n` +
          `    { "id": "angle-1", "title": "Nama angle singkat & kuat", "hook": "Hook positioning 1-2 kalimat berkonversi tinggi", "targetAudience": "Segmen pembeli spesifik" },\n` +
          `    { "id": "angle-2", "title": "Nama angle singkat & kuat", "hook": "Hook positioning 1-2 kalimat berkonversi tinggi", "targetAudience": "Segmen pembeli spesifik" },\n` +
          `    { "id": "angle-3", "title": "Nama angle singkat & kuat", "hook": "Hook positioning 1-2 kalimat berkonversi tinggi", "targetAudience": "Segmen pembeli spesifik" }\n` +
          `  ]\n` +
          `}\n` +
          `Pastikan ketiga angle benar-benar berbeda (Kecepatan/ROI, Identitas/Status, Anti-Ribet/Pain-Relief).`,
      });

      const chunks =
        synthesisRes.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sources: Array<{ title: string; url: string }> = [];
      for (const chunk of chunks) {
        const web = chunk?.web;
        if (web?.uri && !sources.some((s) => s.url === web.uri)) {
          sources.push({
            title: web.title || web.uri,
            url: web.uri,
          });
        }
      }

      const parsed = extractJsonObject<{
        managerReport: string;
        researchSummary: string;
        mayaHandoffLine?: string;
        alexApprovalLine?: string;
        marketingAngles: MarketingAnglePayload[];
      }>(synthesisRes.text || "");

      const angles = Array.isArray(parsed.marketingAngles)
        ? parsed.marketingAngles.slice(0, 3).map((angle, idx) => ({
            id: angle.id || `angle-${idx + 1}`,
            title: angle.title || `Angle Peluncuran ${idx + 1}`,
            hook: angle.hook || "",
            targetAudience: angle.targetAudience || "Pembeli produk digital",
          }))
        : [];

      if (angles.length === 0) {
        throw new Error("AI Manager gagal menyusun 3 marketing angles.");
      }

      return NextResponse.json({
        phase: "AWAITING_CEO_APPROVAL",
        modelUsed,
        researchSummary: parsed.researchSummary || "",
        researchSources: sources.slice(0, 6),
        marketingAngles: angles,
        managerReport:
          parsed.managerReport ||
          "Maya sudah merampungkan riset pasar. Silakan pilih 1 dari 3 angle di bawah ini agar Leo bisa langsung menulis materi launch kit.",
        mayaHandoffLine:
          parsed.mayaHandoffLine ||
          "Alex, dossier riset pasarnya sudah beres! Celah kompetitornya jelas banget buat kita ambil.",
        alexApprovalLine:
          parsed.alexApprovalLine ||
          "Mantap Maya! Bos CEO, saya sudah rangkum 3 angle peluncuran terbaik — silakan pilih satu buat kita eksekusi.",
      });
    }

    if (body.action === "APPROVE_ANGLE") {
      const ceoBrief = typeof body.ceoBrief === "string" ? body.ceoBrief.trim() : "";
      const researchSummary =
        typeof body.researchSummary === "string" ? body.researchSummary.trim() : "";
      const selectedAngle = body.selectedAngle;

      if (!ceoBrief || !selectedAngle?.title) {
        return NextResponse.json(
          { error: "Data kurang untuk APPROVE_ANGLE (ceoBrief, selectedAngle)." },
          { status: 400 }
        );
      }

      const { response: copyRes, modelUsed } = await generateWithResilience(ai, {
        profile: "orchestrate",
        responseMimeType: "application/json",
        maxOutputTokens: 1200,
        systemInstruction:
          "Kamu adalah Leo, Senior Conversion Copywriter di BrickLaunch Studio, berkolaborasi dengan Alex (AI Manager). " +
          "Tulis copywriting direct-response yang tajam, spesifik, persuasif, dan natural dalam BAHASA INDONESIA. Keluarkan HANYA JSON valid.",
        contents:
          `Brief Produk: "${ceoBrief}"\n` +
          `Riset Pasar: ${researchSummary}\n` +
          `Marketing Angle Disetujui CEO:\n` +
          `- Judul: ${selectedAngle.title}\n` +
          `- Hook: ${selectedAngle.hook}\n` +
          `- Target Audiens: ${selectedAngle.targetAudience}\n\n` +
          `Buat paket peluncuran lengkap siap pakai dalam BAHASA INDONESIA sebagai STRICT JSON valid SAJA (tanpa markdown fences di luar JSON). ` +
          `Buat setiap aset padat, tajam, dan siap publish agar total JSON tetap rapi di bawah 950 kata:\n` +
          `{\n` +
          `  "landingPageCopy": "Markdown Bahasa Indonesia berisi ## Headline, **Subheadline**, 3 poin manfaat utama, dan **Primary CTA**",\n` +
          `  "launchThread": "Markdown utas viral 5 bagian untuk X/Threads dalam Bahasa Indonesia berlabel 1/5 sampai 5/5",\n` +
          `  "shortVideoScript": "Markdown skrip video 45 detik TikTok/Reels dalam Bahasa Indonesia dengan **[0-5d Hook]**, **[5-35d Isi]**, dan **[35-45d CTA]** beserta arahan visual",\n` +
          `  "leoPrintLine": "1 kalimat obrolan antusias dari Leo ke Alex saat mencetak paket Launch Kit di mesin fotokopi",\n` +
          `  "handoffSummary": "Catatan serah terima 2 kalimat dalam Bahasa Indonesia dari Alex & Leo bahwa Launch Kit siap diunduh CEO"\n` +
          `}`,
      });

      const parsed = extractJsonObject<{
        landingPageCopy: string;
        launchThread: string;
        shortVideoScript: string;
        leoPrintLine?: string;
        handoffSummary?: string;
      }>(copyRes.text || "");

      return NextResponse.json({
        phase: "COMPLETED",
        modelUsed,
        finalDeliverable: {
          landingPageCopy: parsed.landingPageCopy || "",
          launchThread: parsed.launchThread || "",
          shortVideoScript: parsed.shortVideoScript || "",
        },
        leoPrintLine:
          parsed.leoPrintLine ||
          `Lex, semua materi buat "${selectedAngle.title}" udah kelar! Lagi gue print di mesin fotokopi nih.`,
        handoffSummary:
          parsed.handoffSummary ||
          `Leo telah mencetak Launch Kit lengkap untuk "${selectedAngle.title}" dan menyerahkannya kepada Alex untuk CEO.`,
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
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
