import type {
  AgentId,
  ChatRecipient,
  ChatTarget,
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
      `Hasil riset pasar untuk "${brief}" menunjukkan 3 pain point dominan: (1) calon pembeli lelah dengan solusi generik yang butuh konfigurasi berjam-jam, (2) kompetitor terlalu teknis dan lupa menonjolkan hasil akhir yang langsung terasa di hari pertama, dan (3) pembeli lebih cepat konversi saat melihat alur kerja siap pakai + contoh nyata. Celah terbesar ada pada positioning yang menggabungkan kemudahan instan dengan tampilan profesional.`,
    researchSources: [],
    marketingAngles: angles,
    managerReport:
      "Maya sudah merangkum celah pasar dan psikologi audiens dengan sangat tajam. Pilih 1 dari 3 angle di bawah agar Leo langsung meracik Launch Kit lengkapnya.",
    mayaHandoffLine:
      `Alex, riset untuk "${brief}" udah beres! Audiens paling sensitif sama setup ribet dan hasil instan.`,
    alexApprovalLine:
      "Mantap Maya! Bos CEO, 3 Marketing Angle terbaik sudah siap — silakan ACC satu agar Leo tancap gas.",
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
      `**${selectedAngle.hook}** Dirancang khusus untuk ${selectedAngle.targetAudience.toLowerCase()} agar langsung eksekusi hari ini tanpa trial-error.`,
      ``,
      `- **Siap Pakai dalam 3 Menit:** Struktur modular tinggal duplikasi dan langsung berjalan di alur kerjamu.`,
      `- **Dirancang dari Psikologi Pengguna Nyata:** Menghapus langkah repetitif yang paling sering bikin proyek mandek.`,
      `- **Update & Panduan Ringkas:** Dilengkapi checklist eksekusi cepat sehingga kamu langsung merasakan hasilnya di minggu pertama.`,
      ``,
      `**Primary CTA:** Dapatkan ${ceoBrief} Sekarang — Mulai Lebih Rapi Hari Ini →`,
    ].join("\n"),

    launchThread: [
      `**1/5** Kebanyakan orang gagal konsisten bukan karena kurang niat, tapi karena sistemnya terlalu ribet. Itu alasan kami membangun **${ceoBrief}**. 🧵👇`,
      ``,
      `**2/5** Dari riset ke puluhan kreator & ${selectedAngle.targetAudience.toLowerCase()}, masalahnya selalu sama: terlalu banyak tab, file tercecer, dan waktu habis untuk administrasi.`,
      ``,
      `**3/5** Pendekatan kami sederhana — **${selectedAngle.title}**. ${selectedAngle.hook}`,
      ``,
      `**4/5** Di dalam **${ceoBrief}**, kamu langsung dapat alur kerja end-to-end, template siap isi, dan panduan praktik cepat tanpa perlu belajar teknis dari nol.`,
      ``,
      `**5/5** Siap naik level hari ini? Cek tautan peluncuran di bio dan amankan akses early-bird **${ceoBrief}** sebelum harga normal berlaku! 🚀`,
    ].join("\n"),

    shortVideoScript: [
      `**[0-5d Hook]** *(Visual: Close-up layar penuh tab berantakan, lalu transisi snap ke tampilan bersih)*`,
      `"Stop! Masih buang waktu tiap minggu gara-gara alur kerja manual? Kenalin **${ceoBrief}**."`,
      ``,
      `**[5-35d Isi]** *(Visual: Demo cepat 3 klik fitur utama dengan teks overlay besar)*`,
      `"${selectedAngle.hook} Kamu tinggal buka, isi data utama sekali, dan semua progres langsung terpantau rapi dalam satu layar. Cocok banget buat ${selectedAngle.targetAudience.toLowerCase()} yang pengen hasil profesional tanpa pusing setup."`,
      ``,
      `**[35-45d CTA]** *(Visual: Mockup produk + panah ke tombol link bio)*`,
      `"Klik link di bio sekarang buat dapetin **${ceoBrief}** dan rasakan bedanya mulai hari ini!"`,
    ].join("\n"),
  };

  return {
    phase: "COMPLETED",
    finalDeliverable: deliverable,
    leoPrintLine: `Lex, Launch Kit untuk angle "${selectedAngle.title}" udah kelar dan lagi gue cetak di mesin fotokopi!`,
    handoffSummary: `Launch Kit lengkap untuk "${ceoBrief}" (${selectedAngle.title}) sudah dicetak Leo dan diverifikasi Alex. Kamu bisa langsung unduh file .md atau minta revisi live lewat DM!`,
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
  deliverablePatch: {
    landingPageCopy?: string;
    launchThread?: string;
    shortVideoScript?: string;
    revisedSection?: keyof FinalDeliverable;
    revisionSummary?: string;
  } | null;
}> {
  await sleep(550);

  if (params.mode === "AGENT_BANTER") {
    return {
      turns: [
        {
          speaker: "manager",
          to: "researcher",
          text: params.ceoBrief
            ? `May, proyek "${params.ceoBrief}" kemarin responsnya oke banget. Ada insight baru dari tren minggu ini?`
            : "May, kopi Pantry hari ini pas banget. Ada tren produk digital yang lagi ramai minggu ini?",
          moveTo: "stay",
        },
        {
          speaker: "researcher",
          to: "copywriter",
          text: "Lagi rame banget template produktivitas + playbook AI yang langsung bisa dipakai dalam 5 menit, Le!",
          moveTo: "stay",
        },
        {
          speaker: "copywriter",
          to: "all",
          text: "Catat! Begitu Bos CEO kasih brief baru, gue siapin hook 3 detik pertama yang bikin orang langsung berhenti scroll!",
          moveTo: "stay",
        },
      ],
      deliverablePatch: null,
    };
  }

  const msg = (params.message || "").trim();
  const lower = msg.toLowerCase();
  const hasDeliverable = Boolean(params.finalDeliverable);

  // Deteksi revisi live pada mode Static Showcase GitHub Pages
  const isRevision =
    hasDeliverable &&
    /(revisi|ubah|ganti|perbaiki|perhalus|pertajam|bikin.*lebih|buat.*lebih|lebih agresif|lebih santai|lebih relatable|poles)/i.test(
      lower
    );

  if (isRevision && params.finalDeliverable) {
    const isVideo = /(video|skrip|script|tiktok|reels|hook)/i.test(lower);
    const isThread = /(thread|utas|twitter|x\b)/i.test(lower);
    const section: keyof FinalDeliverable = isVideo
      ? "shortVideoScript"
      : isThread
        ? "launchThread"
        : "landingPageCopy";

    const revisedContent =
      section === "shortVideoScript"
        ? [
            `**[0-5d Hook — VERSI REVISI AGRESIF]** *(Visual: Zoom cepat + efek suara whoosh)*`,
            `"Jujur deh — sampai kapan mau rugi waktu tiap minggu cuma karena sistem kerja yang berantakan? Ini jalan pintasnya: **${params.ceoBrief || "Produk Digitalmu"}**!"`,
            ``,
            `**[5-35d Isi]** *(Visual: Split screen Before chaos vs After super rapi)*`,
            `"Dalam kurang dari 3 menit, semua pekerjaan langsung tersusun otomatis. Tanpa rumus ribet, tanpa drama revisi, langsung kelihatan profesional di depan klien."`,
            ``,
            `**[35-45d CTA]** *(Visual: Highlight tombol link bio + countdown promo)*`,
            `"Jangan tunggu minggu depan — klik link di bio sekarang dan ambil akses **${params.ceoBrief || "Launch Kit"}** hari ini!"`,
          ].join("\n")
        : section === "launchThread"
          ? [
              `**1/5 (Revisi Relatable)** Pernah nggak sih merasa kerja 10 jam sehari tapi ujungnya habis buat ngurus file & administrasi? Gue juga pernah di posisi itu. 🧵`,
              ``,
              `**2/5** Masalahnya bukan kamu kurang produktif — tapi alat kerjamu nggak dibangun buat alur kerja modern.`,
              ``,
              `**3/5** Itu kenapa kami racik **${params.ceoBrief || "produk ini"}**: simpel, langsung jalan, dan kerasa bedanya sejak hari pertama.`,
              ``,
              `**4/5** Semua checklist, template, dan sistem tracking sudah menyatu rapi — tinggal pakai tanpa pusing setup.`,
              ``,
              `**5/5** Kalau kamu pengen kerja lebih tenang dengan hasil lebih rapi, cek link di bio ya. Worth every second! ✨`,
            ].join("\n")
          : [
              `## ${params.ceoBrief || "Produk Digital"} — Versi Revisi Lebih Halus & Persuasif`,
              ``,
              `**Bangun alur kerja yang tenang, rapi, dan meyakinkan klien sejak menit pertama.**`,
              ``,
              `- **Langsung Jalan Tanpa Hambatan:** Semua struktur penting sudah disiapkan agar kamu fokus pada karya terbaikmu.`,
              `- **Tampilan Elegan Berkelas Studio:** Meningkatkan kepercayaan klien secara instan pada setiap interaksi.`,
              `- **Dirancang untuk Pertumbuhan Jangka Panjang:** Skalabel mengikuti perkembangan proyek dan pendapatanmu.`,
              ``,
              `**Primary CTA:** Mulai Pengalaman Kerja Lebih Rapi Sekarang →`,
            ].join("\n");

    return {
      turns:
        params.target === "manager"
          ? [
              {
                speaker: "manager",
                to: "copywriter",
                text: `Noted Bos! Leo, tolong langsung terapkan revisi "${msg}" dan cetak ulang file .md terbaru ya.`,
                moveTo: "desk",
              },
              {
                speaker: "copywriter",
                to: "ceo",
                text: "Beres Bos! Revisi sudah gue poles dan cetak ulang di mesin fotokopi — file .md terbaru langsung bisa diunduh sekarang.",
                moveTo: "copier",
              },
            ]
          : [
              {
                speaker: "copywriter",
                to: "ceo",
                text: "Siap Bos! Naskahnya udah gue revisi sesuai arahan dan langsung dicetak ulang di copier — cek tab Launch Kit & file .md terbarunya ya!",
                moveTo: "copier",
              },
            ],
      deliverablePatch: {
        [section]: revisedContent,
        revisedSection: section,
        revisionSummary: `Revisi live (${section}) selesai diterapkan Leo dan dicetak ulang — file .md terbaru siap diunduh.`,
      },
    };
  }

  // Obrolan / tanya jawab biasa per persona agent
  if (params.target === "researcher") {
    return {
      turns: [
        {
          speaker: "researcher",
          to: "ceo",
          text: `Menarik banget pertanyaannya, Bos! Dari sisi psikologi pembeli, kunci utamanya ada di kejelasan hasil instan + bukti visual nyata sebelum mereka klik beli.`,
          moveTo: "desk",
        },
      ],
      deliverablePatch: null,
    };
  }

  if (params.target === "copywriter") {
    return {
      turns: [
        {
          speaker: "copywriter",
          to: "ceo",
          text: "Siap Bos! Prinsip gue simpel: 3 detik pertama harus langsung menyentil masalah terbesar audiens, baru tawarkan jalan pintas yang konkret.",
          moveTo: "desk",
        },
      ],
      deliverablePatch: null,
    };
  }

  if (params.target === "manager") {
    return {
      turns: [
        {
          speaker: "manager",
          to: "ceo",
          text: params.ceoBrief
            ? `Siap Bos! Fokus kita saat ini menjaga eksekusi "${params.ceoBrief}" tetap tajam. Kalau ada bagian yang ingin direvisi, tinggal instruksikan ke saya atau Leo.`
            : "Siap Bos! Tim dalam kondisi prima — tinggal klik salah satu Sample Launch Mission atau masukkan brief barumu kapan pun siap.",
          moveTo: "desk",
        },
      ],
      deliverablePatch: null,
    };
  }

  return {
    turns: [
      {
        speaker: "manager",
        to: "ceo",
        text: "Siap Bos CEO! Pesan diterima — seluruh tim langsung sinkron.",
        moveTo: "stay",
      },
      {
        speaker: "researcher",
        to: "ceo",
        text: "Dari sisi riset pasar, gue siap bongkar insight audiens kapan pun dibutuhkan!",
        moveTo: "stay",
      },
      {
        speaker: "copywriter",
        to: "ceo",
        text: "Dan gue siap ubah insight Maya jadi copy & hook yang langsung konversi!",
        moveTo: "stay",
      },
    ],
    deliverablePatch: null,
  };
}
