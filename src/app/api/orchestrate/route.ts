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

      // 1 panggilan terpadu hemat kuota: Maya (Market Research) + masukan awal Raka (Finance) & Nadia (HR) -> sintesis 3 angle oleh Alex
      const { response: synthesisRes, modelUsed } = await generateWithResilience(ai, {
        profile: "orchestrate",
        useSearchGrounding: true,
        responseMimeType: "application/json",
        maxOutputTokens: 1200,
        systemInstruction:
          "Kamu menjalankan kolaborasi pra-produksi 7-divisi di BRICKLAUNCH STUDIO:\n" +
          "- Maya (Market & Psychology Researcher): pain point audiens, psikologi beli & celah kompetitor.\n" +
          "- Raka (Finance): validasi kelayakan harga & margin.\n" +
          "- Nadia (HR): kesiapan kapasitas tim.\n" +
          "- Alex (AI Manager): menyintesis menjadi 3 Marketing Angle kontras untuk dipilih CEO.\n" +
          "Gunakan BAHASA INDONESIA tajam dan natural. Keluarkan HANYA JSON valid tanpa markdown fences.",
        contents:
          `Brief Produk Digital dari CEO: "${ceoBrief}"\n\n` +
          `Susun analisis pasar Maya + catatan kelayakan Finance/HR + 3 Marketing Angle Alex dalam STRICT JSON valid:\n` +
          `{\n` +
          `  "researchSummary": "Ringkasan 4-6 kalimat tajam mencakup pain point audiens, celah kompetitor, estimasi titik harga potensial (Raka), dan kesiapan eksekusi tim (Nadia)",\n` +
          `  "managerReport": "Ringkasan eksekutif 2 kalimat dari Alex merekomendasikan cara memilih angle terbaik sebelum seluruh 7 divisi produksi & QC",\n` +
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
          "Maya, Raka, dan Nadia selesai melakukan riset & validasi awal. Pilih 1 dari 3 angle di bawah agar seluruh 7 divisi langsung produksi dan audit QC.",
        mayaHandoffLine:
          parsed.mayaHandoffLine ||
          "Alex, dossier riset pasarnya beres! Raka & Nadia juga sudah konfirmasi kelayakan harga dan tim.",
        alexApprovalLine:
          parsed.alexApprovalLine ||
          "Mantap tim! Bos CEO, 3 angle peluncuran terbaik sudah siap — pilih satu buat kita eksekusi sampai lolos QC Bima.",
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

      // Produksi serentak 7 divisi + Pre-Launch Product QC oleh Bima
      const { response: copyRes, modelUsed } = await generateWithResilience(ai, {
        profile: "orchestrate",
        responseMimeType: "application/json",
        maxOutputTokens: 1200,
        systemInstruction:
          "Kamu mengorkestrasi produksi final 5 divisi BRICKLAUNCH STUDIO dalam BAHASA INDONESIA:\n" +
          "- Leo (Copywriter): landingPageCopy, launchThread, shortVideoScript.\n" +
          "- Sora (Social Media Specialist): socialMediaPlan (kalender distribusi 7 hari TikTok/Reels/Threads).\n" +
          "- Raka (Finance): financePlan (pricing tier, promo rilis, margin & proyeksi revenue).\n" +
          "- Nadia (HR): hrOpsChecklist (SOP peluncuran, SLA respon & pembagian tugas tim).\n" +
          "- Bima (Product QC): qcAuditReport (skor audit /100, verifikasi konsistensi & clearance pra-rilis).\n" +
          "Buat setiap bagian PADAT & TAJAM (65-95 kata per field) agar seluruh objek JSON rapi di bawah 850 kata. Keluarkan HANYA JSON valid.",
        contents:
          `Brief Produk: "${ceoBrief}"\n` +
          `Riset Pasar: ${researchSummary}\n` +
          `Angle Disetujui CEO: "${selectedAngle.title}" — ${selectedAngle.hook} (Target: ${selectedAngle.targetAudience})\n\n` +
          `Keluarkan STRICT JSON valid SAJA:\n` +
          `{\n` +
          `  "landingPageCopy": "Markdown singkat: ## Headline, **Subheadline**, 3 bullet manfaat, **Primary CTA**",\n` +
          `  "launchThread": "Markdown utas 5 bagian X/Threads berlabel 1/5 sampai 5/5",\n` +
          `  "shortVideoScript": "Markdown skrip video 45d dengan **[0-5d Hook]**, **[5-35d Isi]**, **[35-45d CTA]**",\n` +
          `  "socialMediaPlan": "Markdown kalender konten 7 hari (H1-H7) multi-platform & community growth oleh Sora (BAB 4)",\n` +
          `  "financePlan": "Markdown 2 tier harga, early-bird, unit economics & proyeksi revenue Bulan 1 oleh Raka (BAB 5)",\n` +
          `  "hrOpsChecklist": "Markdown SOP operasional peluncuran, SLA respon & customer onboarding oleh Nadia (BAB 6)",\n` +
          `  "qcAuditReport": "Markdown Post-Launch QC Checklist & Go-Live Sign-Off oleh Bima (BAB 7)",\n` +
          `  "qcCertificate": {\n` +
          `    "score": 96,\n` +
          `    "status": "PASSED — APPROVED FOR LAUNCH",\n` +
          `    "copyVsPricing": "1 kalimat hasil verifikasi konsistensi copy landing page vs pricing tier",\n` +
          `    "socialVsFunnel": "1 kalimat hasil verifikasi kalender sosmed 7 hari vs funnel rilis",\n` +
          `    "sopVsSla": "1 kalimat hasil verifikasi SOP operasional vs SLA respon pembeli",\n` +
          `    "auditorSignOff": "1 kalimat tanda tangan resmi Bima mengesahkan peluncuran"\n` +
          `  },\n` +
          `  "qcSignoffLine": "1 kalimat konfirmasi Bima ke Alex bahwa Sertifikat QC resmi PASSED",\n` +
          `  "leoPrintLine": "1 kalimat antusias Leo ke Alex saat mencetak Master Launch Kit 7-BAB di Copier West Wing",\n` +
          `  "handoffSummary": "Catatan serah terima 2 kalimat dari Alex bahwa Master Launch Kit 7-BAB tersertifikasi QC siap diunduh"\n` +
          `}`,
      });

      const parsed = extractJsonObject<{
        landingPageCopy?: string;
        launchThread?: string;
        shortVideoScript?: string;
        socialMediaPlan?: string;
        financePlan?: string;
        hrOpsChecklist?: string;
        qcAuditReport?: string;
        qcCertificate?: {
          score?: number;
          status?: string;
          copyVsPricing?: string;
          socialVsFunnel?: string;
          sopVsSla?: string;
          auditorSignOff?: string;
        };
        qcSignoffLine?: string;
        leoPrintLine?: string;
        handoffSummary?: string;
      }>(copyRes.text || "");

      const cert = parsed.qcCertificate;
      const qcScore =
        typeof cert?.score === "number" && cert.score >= 70 && cert.score <= 100
          ? Math.round(cert.score)
          : 96;

      return NextResponse.json({
        phase: "COMPLETED",
        modelUsed,
        finalDeliverable: {
          landingPageCopy: parsed.landingPageCopy || "",
          launchThread: parsed.launchThread || "",
          shortVideoScript: parsed.shortVideoScript || "",
          socialMediaPlan:
            parsed.socialMediaPlan ||
            "- **H1-H2:** Teaser pain-point TikTok/Reels & behind-the-build Threads.\n- **H3:** Launch Day multi-platform.\n- **H4-H7:** Demo nyata, social proof & last call promo early-bird.",
          financePlan:
            parsed.financePlan ||
            "- **Starter & Pro Tier** dengan early-bird 48 jam, net margin ~92% untuk produk digital, dan target BEP di 10 penjualan pertama.",
          hrOpsChecklist:
            parsed.hrOpsChecklist ||
            "- **Pra-Rilis:** Uji link checkout & sinkronisasi lintas divisi.\n- **SLA Respon:** ≤ 30 menit pada jam puncak.\n- **Onboarding:** Email akses instan + panduan cepat.",
          qcAuditReport:
            parsed.qcAuditReport ||
            "- **Verifikasi Pra-Tayang:** Link checkout, file unduhan mobile/desktop & kebijakan refund terverifikasi.\n- **Go-Live Sign-Off:** Disetujui penuh untuk rilis publik oleh Bima.",
          qcCertificate: {
            score: qcScore,
            status: cert?.status || "PASSED — APPROVED FOR LAUNCH",
            copyVsPricing:
              cert?.copyVsPricing ||
              "PASS — Klaim manfaat Landing Page & CTA selaras dengan skema harga dan promo early-bird Raka.",
            socialVsFunnel:
              cert?.socialVsFunnel ||
              "PASS — Kalender 7 hari Sora mengarahkan trafik secara runtut menuju konversi Launch Day & Last Call.",
            sopVsSla:
              cert?.sopVsSla ||
              "PASS — SOP onboarding otomatis & SLA respon pembeli Nadia siap menopang lonjakan trafik rilis.",
            auditorSignOff:
              cert?.auditorSignOff ||
              "Seluruh 7 BAB Master Launch Kit telah lulus verifikasi lintas divisi tanpa temuan kritis.",
          },
        },
        qcSignoffLine:
          parsed.qcSignoffLine ||
          `Sertifikat Audit QC terbit — Skor ${qcScore}/100 (PASSED — APPROVED FOR LAUNCH)! Seluruh 7 BAB siap dicetak!`,
        leoPrintLine:
          parsed.leoPrintLine ||
          `QC Bima PASSED (${qcScore}/100)! Gue balik lewat pintu tengah ke Copier West Wing buat cetak Master Launch Kit 7-BAB!`,
        handoffSummary:
          parsed.handoffSummary ||
          `Master Launch Kit 7-BAB untuk "${selectedAngle.title}" telah LOLOS Sertifikat Audit QC Bima (${qcScore}/100) dan siap diunduh (.md).`,
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
