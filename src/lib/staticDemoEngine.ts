import type {
  AgentId,
  ChatRecipient,
  ChatTarget,
  DeliverableKey,
  FinalDeliverable,
  MarketingAngle,
} from "@/store/useAgencyStore";

export const IS_STATIC_DEMO_MODE =
  process.env.NEXT_PUBLIC_STATIC_DEMO === "true";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runStaticDemoStartBrief(ceoBrief: string) {
  await sleep(900);

  const brief = ceoBrief.trim();
  const angles: MarketingAngle[] = [
    {
      id: "angle-1",
      title: "Anti-Ribet & Hemat Waktu 10x",
      hook: `Berhenti buang 5 jam seminggu untuk hal manual — "${brief}" langsung siap pakai dalam 3 menit.`,
      targetAudience: "Freelancer & solopreneur sibuk yang butuh sistem praktis tanpa setup rumit",
    },
    {
      id: "angle-2",
      title: "Standar Profesional & Kredibilitas Instan",
      hook: `Ubah cara klien memandang bisnismu dengan sistem "${brief}" berstandar agensi premium.`,
      targetAudience: "Kreator digital & konsultan independen yang ingin menaikkan tarif jasa",
    },
    {
      id: "angle-3",
      title: "ROI Terukur & Anti Bocor Cashflow",
      hook: `Satu investasi kecil untuk "${brief}" yang langsung menutup kebocoran waktu, fokus, dan profit bulananmu.`,
      targetAudience: "Founder micro-business & indie hacker yang fokus pada efisiensi margin",
    },
  ];

  return {
    phase: "AWAITING_CEO_APPROVAL",
    researchSummary:
      `Riset pasar Maya (West Wing) + validasi Finance (Raka) & HR (Nadia) di East Wing untuk "${brief}": (1) audiens jenuh dengan solusi teknis yang butuh setup berjam-jam, (2) kompetitor gagal menampilkan hasil nyata di hari pertama, (3) struktur harga psikologis Rp149rb–Rp299rb menghasilkan net margin >90% dengan konversi optimal.`,
    researchSources: [],
    marketingAngles: angles,
    managerReport:
      "Maya, Raka, dan Nadia sudah menyelaraskan riset pasar, unit economics, serta kesiapan operasional. Pilih 1 angle pemenang agar 7 divisi menyusun Master Launch Kit 7-BAB & Sertifikat QC Bima.",
    mayaHandoffLine:
      `Alex, riset untuk "${brief}" selesai! Raka & Nadia di East Wing juga sudah konfirmasi kelayakan pricing dan tim.`,
    alexApprovalLine:
      "Mantap tim! Bos CEO, 3 Marketing Angle siap dipilih — ACC satu agar seluruh 7 divisi langsung produksi & audit QC.",
  };
}

export async function runStaticDemoApproveAngle(
  ceoBrief: string,
  selectedAngle: MarketingAngle
) {
  await sleep(1100);

  const deliverable: FinalDeliverable = {
    landingPageCopy: [
      `## ${selectedAngle.title}: Cara Tercepat Kuasai ${ceoBrief}`,
      ``,
      `**${selectedAngle.hook}** Dirancang khusus untuk ${selectedAngle.targetAudience.toLowerCase()} agar langsung eksekusi hari ini.`,
      ``,
      `- **Siap Pakai dalam 3 Menit:** Struktur modular tinggal duplikasi tanpa pusing konfigurasi.`,
      `- **Berbasis Psikologi Pengguna:** Memangkas langkah repetitif yang bikin alur kerja macet.`,
      `- **Panduan Cepat & Update Gratis:** Langsung terasa dampaknya sejak minggu pertama.`,
      ``,
      `**Primary CTA:** Dapatkan ${ceoBrief} Sekarang — Amankan Harga Early-Bird →`,
    ].join("\n"),

    launchThread: [
      `**1/5** Kebanyakan orang gagal konsisten bukan karena kurang niat, tapi sistemnya terlalu ribet. Itu alasan kami merilis **${ceoBrief}**. 🧵`,
      ``,
      `**2/5** Masalah utama ${selectedAngle.targetAudience.toLowerCase()}: tab berantakan, file tercecer, dan waktu habis di administrasi.`,
      ``,
      `**3/5** Solusi kami — **${selectedAngle.title}**. ${selectedAngle.hook}`,
      ``,
      `**4/5** Di dalam **${ceoBrief}**, semua template, checklist, dan panduan cepat sudah menyatu rapi dalam satu workspace.`,
      ``,
      `**5/5** Amankan harga early-bird **${ceoBrief}** lewat link di bio sebelum promo 48 jam berakhir! 🚀`,
    ].join("\n"),

    shortVideoScript: [
      `**[0-5d Hook]** *(Close-up layar penuh tab berantakan → transisi snap ke tampilan bersih)*`,
      `"Stop buang waktu tiap minggu buat kerja manual! Kenalin **${ceoBrief}**."`,
      ``,
      `**[5-35d Isi]** *(Demo cepat 3 klik fitur inti + teks overlay kontras)*`,
      `"${selectedAngle.hook} Cukup isi sekali, semua progres langsung rapi dalam satu layar."`,
      ``,
      `**[35-45d CTA]** *(Mockup produk + panah ke bio)*`,
      `"Klik link di bio sekarang untuk ambil **${ceoBrief}** hari ini!"`,
    ].join("\n"),

    socialMediaPlan: [
      `- **Hari 1 (Teaser Problem — TikTok/Reels):** Video singkat 15d memotret kekacauan alur kerja manual sebelum memakai ${ceoBrief}.`,
      `- **Hari 2 (Behind The Build — X/Threads):** Cerita riset & psikologi pembeli di balik desain fitur inti.`,
      `- **Hari 3 (Launch Day — Multi-Platform):** Publish Utas 5-bagian + Reels 45d + IG Story countdown promo 48 jam.`,
      `- **Hari 4 (Mini Demo — TikTok/IG):** Screen recording 30 detik setup 3 menit langsung jalan.`,
      `- **Hari 5 (Carousel Edukasi — IG/LinkedIn):** 5 kesalahan yang langsung dibereskan oleh ${ceoBrief}.`,
      `- **Hari 6 (Social Proof & Q&A):** Bagikan testimoni pengguna awal + buka sesi tanya jawab komentar/DM.`,
      `- **Hari 7 (Last Call & Community Onboarding):** Pengingat penutupan bonus early-bird + ajakan bergabung ke grup komunitas pembeli.`,
    ].join("\n"),

    financePlan: [
      `- **Starter Tier:** Rp149.000 *(Early-Bird 48 Jam: Rp99.000)* — produk inti + panduan cepat.`,
      `- **Pro Bundle Tier:** Rp299.000 *(Early-Bird: Rp229.000)* — produk inti + bonus template lanjutan + update seumur hidup.`,
      `- **Unit Economics:** Biaya payment gateway & hosting ~7% → **Net Margin ~93% per transaksi**.`,
      `- **Proyeksi Bulan 1 (Konservatif):** 120 pembeli (70% Starter, 30% Pro) ≈ **Rp22.400.000 Gross Revenue** | Break-Even Point di penjualan ke-8.`,
    ].join("\n"),

    hrOpsChecklist: [
      `- **Pra-Rilis (H-2):** Sinkronisasi lintas sayap antara West Wing (Copy/Sosmed) & East Wing (Finance/QC) + uji coba checkout link.`,
      `- **SLA Respon Pembeli:** Balas DM, komentar, dan tiket support maksimal **≤ 30 menit** pada 6 jam puncak peluncuran.`,
      `- **Customer Onboarding Otomatis:** Email akses instan + video walkthrough 2 menit + kanal FAQ mandiri.`,
      `- **Ritme Tim & Retrospektif (H+7):** Rotasi shift support agar tim bebas burnout + review feedback pelanggan untuk rilis v1.1.`,
    ].join("\n"),

    qcAuditReport: [
      `- **Checklist Pra-Tayang Teknis:** Uji tautan checkout, verifikasi file unduhan di desktop & mobile, serta pastikan email konfirmasi otomatis terkirim.`,
      `- **Checklist Klaim & Legal:** Seluruh janji manfaat pada landing page realistis, kebijakan lisensi penggunaan & ketentuan refund tertulis jelas.`,
      `- **Checklist Hari-H Go-Live:** Monitoring 60 menit pertama (checkout rate, lonjakan DM, tautan bio TikTok/IG/X) + eskalasi cepat ke Alex & Raka jika ada anomali pembayaran.`,
      `- **Keputusan Go-Live:** ✅ **DISETUJUI PENUH UNTUK RILIS PUBLIK** oleh Bima (Product QC & Launch Auditor).`,
    ].join("\n"),

    qcCertificate: {
      score: 97,
      status: "PASSED — APPROVED FOR LAUNCH",
      copyVsPricing:
        "PASS — Janji manfaat Landing Page & CTA early-bird 48 jam 100% selaras dengan tier Rp99rb/Rp149rb/Rp299rb dari Raka.",
      socialVsFunnel:
        "PASS — Kalender 7 hari Sora mengarahkan trafik secara konsisten dari teaser (H1-H2) ke Launch Day (H3) dan last call (H7).",
      sopVsSla:
        "PASS — SOP onboarding otomatis & SLA respon ≤ 30 menit dari Nadia siap menopang lonjakan trafik rilis.",
      auditorSignOff:
        "Seluruh 7 BAB Master Launch Kit telah diaudit menyeluruh tanpa temuan kritis. Produk dinyatakan laik edar & siap diluncurkan.",
    },
  };

  return {
    phase: "COMPLETED",
    finalDeliverable: deliverable,
    qcSignoffLine:
      `Audit QC selesai — Skor 97/100 (PASSED — APPROVED FOR LAUNCH)! Copy vs Pricing, Sosmed vs Funnel, dan SOP vs SLA semua konsisten!`,
    leoPrintLine: `Sertifikat QC Bima PASSED (97/100)! Gue balik lewat pintu tengah ke Copier West Wing buat cetak Master Launch Kit 7-BAB!`,
    handoffSummary: `Master Launch Kit 7-BAB untuk "${ceoBrief}" telah LOLOS Sertifikat Audit QC Bima (97/100 — PASSED) dan selesai dicetak. File .md resmi siap diunduh!`,
  };
}

export async function runStaticDemoChat(params: {
  mode: "CEO_MESSAGE" | "AGENT_BANTER";
  target: ChatTarget;
  message?: string;
  ceoBrief?: string;
  finalDeliverable?: FinalDeliverable | null;
}): Promise<{
  turns: Array<{
    speaker: AgentId;
    to: ChatRecipient;
    text: string;
    moveTo?: "stay" | "pantry" | "desk" | "manager_handoff" | "copier";
  }>;
  deliverablePatch: (Partial<FinalDeliverable> & {
    revisedSection?: DeliverableKey;
    revisionSummary?: string;
  }) | null;
}> {
  await sleep(500);

  if (params.mode === "AGENT_BANTER") {
    return {
      turns: [
        {
          speaker: "social",
          to: "finance",
          text: "Raka, gue baru lewat pintu kaca dari West Wing nih — promo early-bird 48 jam di Reels hari pertama aman buat margin kan?",
          moveTo: "stay",
        },
        {
          speaker: "finance",
          to: "social",
          text: "Aman banget Sora! Net margin produk digital kita ~93%, tinggal kunci batas kuota promonya biar urgensi tinggi.",
          moveTo: "stay",
        },
        {
          speaker: "qc",
          to: "all",
          text: "Mantap! Begitu draf 7-BAB siap, lempar ke meja QC East Wing biar langsung gue terbitkan Sertifikat Audit resminya.",
          moveTo: "stay",
        },
      ],
      deliverablePatch: null,
    };
  }

  const msg = (params.message || "").trim();
  const lower = msg.toLowerCase();
  const hasDeliverable = Boolean(params.finalDeliverable);

  const isRevision =
    hasDeliverable &&
    /(revisi|ubah|ganti|perbaiki|perhalus|pertajam|perketat|bikin.*lebih|buat.*lebih|tambah|poles)/i.test(
      lower
    );

  if (isRevision && params.finalDeliverable) {
    let section: DeliverableKey = "landingPageCopy";
    if (params.target === "qc" || /(qc|audit|checklist|kualitas|sertifikat)/i.test(lower)) {
      section = "qcAuditReport";
    } else if (params.target === "finance" || /(harga|pricing|finance|keuangan|margin|promo|revenue)/i.test(lower)) {
      section = "financePlan";
    } else if (params.target === "social" || /(sosmed|social|kalender|konten|ig|instagram|fyp)/i.test(lower)) {
      section = "socialMediaPlan";
    } else if (params.target === "hr" || /(hr|sop|tim|onboarding|sla|operasional)/i.test(lower)) {
      section = "hrOpsChecklist";
    } else if (/(video|skrip|script|tiktok|reels|hook)/i.test(lower)) {
      section = "shortVideoScript";
    } else if (/(thread|utas|twitter|x\b)/i.test(lower)) {
      section = "launchThread";
    }

    const revisedMap: Record<DeliverableKey, { speaker: AgentId; content: string; reply: string }> = {
      landingPageCopy: {
        speaker: "copywriter",
        content: `## ${params.ceoBrief || "Produk Digital"} — Revisi Copy Lebih Tajam\n\n**Berhenti menunda pertumbuhanmu karena sistem manual yang melelahkan.**\n\n- **Hasil Terukur Hari Pertama:** Langsung pakai dalam 3 menit.\n- **Standar Agensi Profesional:** Bikin klien langsung percaya.\n- **Garansi Panduan Jelas:** Lengkap dengan checklist anti-gagal.\n\n**Primary CTA:** Mulai Lebih Efisien Sekarang →`,
        reply: "Beres Bos! BAB 3 (Landing Page) sudah gue pertajam dan dicetak ulang ke Master Launch Kit 7-BAB (.md).",
      },
      launchThread: {
        speaker: "copywriter",
        content: `**1/5 (Revisi)** Jujur, berapa jam minggu ini hilang cuma buat kerja repetitif? 🧵\n\n**2/5** Itulah celah yang kami bereskan lewat **${params.ceoBrief || "produk ini"}**.\n\n**3/5** Simpel, terstruktur, dan langsung terasa hasilnya sejak hari pertama.\n\n**4/5** Semua panduan & template siap pakai tanpa perlu setup teknis.\n\n**5/5** Cek link bio sekarang untuk akses promo rilis terbatas! 🚀`,
        reply: "BAB 3 (Utas Viral) sudah gue revisi lebih relatable & langsung masuk Master Launch Kit (.md), Bos!",
      },
      shortVideoScript: {
        speaker: "copywriter",
        content: `**[0-5d Hook — REVISI AGRESIF]** *(Zoom cepat + teks besar)*\n"Masih rugi waktu tiap minggu gara-gara alur kerja berantakan? Coba **${params.ceoBrief || "ini"}**!"\n\n**[5-35d Isi]** *(Split screen Before vs After)*\n"3 menit setup, semua pekerjaan rapi otomatis, langsung kelihatan pro di depan klien."\n\n**[35-45d CTA]**\n"Klik link di bio sekarang sebelum harga early-bird ditutup!"`,
        reply: "BAB 3 (Hook Video 45d) udah gue bikin jauh lebih agresif & dicetak ulang di Copier West Wing, Bos!",
      },
      socialMediaPlan: {
        speaker: "social",
        content: `- **H1-H2:** 2x/hari video pendek pain-point + poll IG Story interaktif.\n- **H3 (Launch):** Reels 45d + Thread 5-part + Live Q&A 20 menit.\n- **H4-H5:** Demo screen-recording nyata + carousel studi kasus.\n- **H6-H7:** Testimoni pengguna + countdown penutupan bonus early-bird.`,
        reply: "BAB 4 (Kalender Social Media) sudah gue rombak lebih padat & fokus konversi, Bos! File .md terupdate.",
      },
      financePlan: {
        speaker: "finance",
        content: `- **Flash Launch (24 Jam):** Rp89.000 (akselerasi testimoni awal).\n- **Reguler Single:** Rp149.000 | **Pro + Bonus:** Rp279.000.\n- **Proyeksi Margin Bersih:** ~92% setelah biaya gateway; target 150 buyer = **Rp26,5 Juta** bulan pertama.`,
        reply: "BAB 5 (Pricing & Proyeksi Margin) sudah gue hitung ulang di East Wing & dicetak ulang ke file .md, Bos!",
      },
      hrOpsChecklist: {
        speaker: "hr",
        content: `- **SLA Support Dipercepat:** Maksimal 15 menit saat jam puncak rilis.\n- **Onboarding Pembeli:** Otomatisasi email akses + grup komunitas.\n- **Backup Shift & QA Harian:** Rotasi jaga tim agar bebas burnout selama pekan peluncuran.`,
        reply: "BAB 6 (SOP Tim & SLA Operasional) sudah aku perbarui di Master Launch Kit (.md), Bos!",
      },
      qcAuditReport: {
        speaker: "qc",
        content: `- **Audit Teknis Diperketat:** Uji checkout, mobile layout, kecepatan unduh & email transaksi.\n- **Audit Klaim & Legal:** Bebas klaim berlebihan; lisensi & kebijakan refund tertulis eksplisit.\n- **Go-Live Sign-Off:** ✅ **VERIFIED & CLEARED (98/100)** oleh Bima.`,
        reply: "BAB 7 & Sertifikat QC sudah gue perketat & diverifikasi ulang! Versi terbaru langsung masuk file .md.",
      },
    };

    const chosen = revisedMap[section];
    return {
      turns: [{ speaker: chosen.speaker, to: "ceo", text: chosen.reply, moveTo: "copier" }],
      deliverablePatch: {
        [section]: chosen.content,
        revisedSection: section,
        revisionSummary: `Revisi bagian ${section} selesai diperbarui & dicetak ulang ke Master Launch Kit 7-BAB (.md).`,
      },
    };
  }

  const singleReplies: Record<AgentId, string> = {
    manager: "Siap Bos! West Wing & East Wing terkoordinasi rapi — tinggal arahkan prioritas berikutnya.",
    researcher: "Dari data psikologi pembeli, fokus pada hasil cepat di 5 menit pertama selalu menaikkan konversi!",
    copywriter: "Siap Bos! Gue pastikan setiap headline & CTA di BAB 3 langsung menusuk kebutuhan utama audiens.",
    social: "Aman Bos! Gue pantau format Reels & TikTok yang retensinya paling tinggi buat BAB 4 minggu ini.",
    finance: "Semua angka margin dan struktur tier BAB 5 aman terkendali di East Wing — siap simulasi kapan saja!",
    hr: "Kapasitas seluruh 7 divisi lintas sayap sehat dan SOP BAB 6 siap jalan tanpa hambatan, Bos!",
    qc: "Tenang Bos, meja QC East Wing gue jaga ketat — nggak ada produk rilis tanpa Sertifikat QC resmi!",
  };

  if (params.target !== "all") {
    return {
      turns: [{ speaker: params.target, to: "ceo", text: singleReplies[params.target], moveTo: "desk" }],
      deliverablePatch: null,
    };
  }

  return {
    turns: [
      { speaker: "manager", to: "ceo", text: "Siap Bos! Seluruh 7 divisi di West & East Wing langsung sinkron.", moveTo: "stay" },
      { speaker: "social", to: "ceo", text: "Tim Creative West Wing siap tancap gas!", moveTo: "stay" },
      { speaker: "qc", to: "ceo", text: "Dan tim Finance, HR & QC East Wing siap mengawal sampai Sertifikat Launch terbit!", moveTo: "stay" },
    ],
    deliverablePatch: null,
  };
}
