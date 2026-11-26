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
  await sleep(950);

  const brief = ceoBrief.trim();

  const executiveBrief = [
    `- **Core Promise:** Membantu target pembeli mencapai hasil nyata dari **${brief}** dalam 7 hari pertama melalui sistem langkah-demi-langkah yang langsung bisa dipraktikkan tanpa kurva belajar teknis.`,
    `- **Unique Mechanism (The 3-Minute Plug & Execute Framework):** Mengganti teori panjang dan spreadsheet/template rumit dengan struktur modular siap pakai + checklist harian anti-macet yang dirancang berdasarkan psikologi eksekusi pemula hingga praktisi sibuk.`,
    `- **Primary Target Avatar:** Pekerja kreatif, freelancer, dan solopreneur usia 23–38 tahun di Indonesia yang sudah lelah membeli produk digital generik yang berakhir menumpuk di folder unduhan tanpa pernah benar-benar dipakai.`,
  ].join("\n");

  const researchSummary = [
    `## 2.1 Target Avatar Profile`,
    `- **Demografi:** Usia 23–38 tahun, berdomisili di kota besar Indonesia (Jabodetabek, Bandung, Surabaya, Bali), profesi freelancer, kreator digital, karyawan ambisius, atau solopreneur dengan pendapatan Rp6 juta–Rp25 juta/bulan. Aktif di TikTok, Instagram Reels, dan X/Threads pada jam makan siang & malam hari (20.00–23.00 WIB).`,
    `- **Frustrasi Harian:** Menghabiskan berjam-jam mencari tutorial gratis yang terpotong-potong di YouTube/TikTok, sudah mencoba merakit sistem sendiri namun selalu berantakan di minggu kedua karena terlalu kompleks.`,
    `- **Secret Desires:** Ingin merasa memegang kendali penuh, tampil profesional dan terorganisir di depan klien/lingkungan, serta mencapai hasil konkret tanpa harus mengorbankan waktu istirahat atau keluarga.`,
    ``,
    `## 2.2 5 Visceral Pain Points`,
    `1. **[External] Informasi Tercecer & Tidak Terstruktur:** Materi gratis di internet saling bertentangan sehingga pembeli bingung harus mulai dari langkah pertama yang mana untuk **${brief}**.`,
    `2. **[External] Setup Awal Terlalu Rumit:** Produk serupa di pasaran penuh rumus atau jargon teknis yang membuat pemula menyerah sebelum merasakan manfaat pertamanya.`,
    `3. **[External] Tidak Ada Alur Eksekusi Harian:** Pembeli sering mendapat teori bagus tapi tidak tahu aksi konkret 15 menit per hari yang benar-benar menggerakkan jarum hasil.`,
    `4. **[Internal] Trauma "Beli Tapi Tidak Terpakai":** Rasa bersalah diam-diam karena sudah berkali-kali keluar uang membeli ebook/template/tools yang akhirnya mangkrak di Google Drive.`,
    `5. **[Internal] Imposter Syndrome & Kelelahan Mental:** Merasa tertinggal dari rekan sebayanya yang tampak selalu rapi, konsisten, dan bertumbuh lebih cepat.`,
    ``,
    `## 2.3 3 Hidden Objections & Neutralizers`,
    `1. **Keberatan 1 — "Takut cuma teori doang & ujung-ujungnya nggak kepakai."**`,
    `   - *Neutralizer:* Tunjukkan rincian modul actionable + panduan Quick-Win 15 menit pertama dan contoh hasil jadi (Before vs. After) langsung di Landing Page.`,
    `2. **Keberatan 2 — "Saya pemula / sibuk banget, takut nggak sempat setting."**`,
    `   - *Neutralizer:* Tekankan mekanisme Plug & Execute 3 menit + video walkthrough singkat 2 menit yang memandu langkah demi langkah tanpa istilah teknis.`,
    `3. **Keberatan 3 — "Kenapa harus bayar kalau tutorial gratis di YouTube banyak?"**`,
    `   - *Neutralizer:* Bandingkan biaya tersembunyi dari 20+ jam trial-error tanpa arah versus investasi 1x harga ngopi Rp149.000 untuk sistem teruji yang langsung memotong kurva belajar.`,
    ``,
    `## 2.4 Competitor Gap Analysis & Unfair Advantage`,
    `- **Kelemahan Kompetitor:** 80% produk di niche **${brief}** hanya menjual daftar teori panjang atau template estetik tanpa panduan implementasi, tanpa contoh kasus lokal Indonesia, dan tanpa dukungan onboarding pasca-beli.`,
    `- **Unfair Advantage Kita:** Menggabungkan framework ringkas anti-bingung, studi kasus realistis lokal, bonus checklist eksekusi harian, serta jaminan panduan onboarding 3 tahap.`,
    ``,
    `## 2.5 5 Exact Voice-of-Customer (VoC) Phrases`,
    `1. *"Gue udah nonton puluhan video dan save ratusan postingan, tapi pas mau mulai tetap aja blank harus ngapain dulu."*`,
    `2. *"Males banget beli produk digital yang isinya cuma teori textbook—gue butuh yang langsung bisa dipakai hari ini."*`,
    `3. *"Waktu gue abis buat kerjaan utama, nggak mungkin tiap hari luangin 2 jam cuma buat ngutak-ngatik sistem."*`,
    `4. *"Jujur udah beberapa kali beli template/panduan, eh minggu pertama semangat, minggu kedua lupa total."*`,
    `5. *"Pengen banget punya alur yang rapi dan jelas progresnya, biar nggak tiap bulan ngerasa jalan di tempat."*`,
  ].join("\n");

  const angles: MarketingAngle[] = [
    {
      id: "angle-1",
      title: "Angle 1 — Pain / Anti-Mainstream: Stop Koleksi Teori yang Mangkrak",
      hook: `90% orang gagal di "${brief}" bukan karena kurang motivasi—tapi karena terjebak tutorial ribet yang nggak pernah didesain buat orang sibuk.`,
      targetAudience: "Pemula & praktisi yang pernah kecewa dengan panduan/template generik sebelumnya",
      whyItConverts:
        "Mengangkat rasa bersalah internal (trauma beli tapi tidak terpakai) ke permukaan dan memindahkan kesalahan ke metode lama, menciptakan efek 'akhirnya ada yang ngerti masalah gue'.",
    },
    {
      id: "angle-2",
      title: "Angle 2 — Speed / System / Shortcut: Plug & Execute dalam 3 Menit",
      hook: `Potong 20 jam trial-error menjadi 1 sistem siap pakai—mulai jalankan "${brief}" dengan rapi hanya dalam 15 menit sehari.`,
      targetAudience: "Freelancer & solopreneur sibuk yang menghargai kecepatan, kejelasan langkah, dan ROI waktu",
      whyItConverts:
        "Menjawab keberatan terbesar pembeli sibuk dengan angka konkret (3 menit setup, 15 menit/hari) sehingga nilai investasi Rp149.000 terasa jauh lebih murah dibanding waktu yang dihemat.",
    },
    {
      id: "angle-3",
      title: "Angle 3 — Identity / Lifestyle Transformation: Naik Kelas ke Standar Pro",
      hook: `Bedanya amatir dan profesional bukan di seberapa keras mereka lembur—tapi di sistem "${brief}" yang diam-diam bekerja rapi di belakang layar.`,
      targetAudience: "Kreator, konsultan & profesional ambisius yang ingin meningkatkan kepercayaan diri serta kualitas hidup",
      whyItConverts:
        "Menyentuh hasrat identitas dan status (secret desire), memposisikan pembelian produk bukan sebagai biaya, melainkan langkah naik kelas ke versi diri yang lebih terkendali.",
    },
  ];

  return {
    phase: "AWAITING_CEO_APPROVAL",
    executiveBrief,
    researchSummary,
    researchSources: [],
    marketingAngles: angles,
    managerReport:
      "Maya telah menyelesaikan riset 5 visceral pain points, 3 hidden objections, dan 5 exact VoC buyers. Pilih 1 dari 3 angle kontras di bawah agar Raka, Sora, Nadia, Leo, dan Bima (QC) langsung menyusun Master Launch Kit 7-BAB berstandar agensi.",
    mayaHandoffLine:
      `Alex, dossier riset psikologi lengkap (Avatar, 5 Pain Points, 3 Objections & 5 VoC) untuk "${brief}" sudah beres!`,
    alexApprovalLine:
      "Mantap Maya! Bos CEO, 3 Marketing Angle yang kontras secara psikologis siap dipilih di Gerbang ACC.",
  };
}

export async function runStaticDemoApproveAngle(
  ceoBrief: string,
  selectedAngle: MarketingAngle
) {
  await sleep(1100);

  const brief = ceoBrief.trim();

  const financePlan = [
    `## 5.1 3-Tier Pricing Architecture (IDR)`,
    `| Tier | Nama Paket | Harga Reguler | Isi & Diferensiasi Nilai | Target Pembeli |`,
    `| :--- | :--- | :--- | :--- | :--- |`,
    `| **Tier 1** | **Starter / Core** | **Rp149.000** | Akses penuh sistem utama **${brief}** + Panduan Quick-Start 15 Menit + Checklist Harian. | Pemula yang ingin langsung praktik mandiri dengan risiko rendah. |`,
    `| **Tier 2** | **Complete Bundle *(Recommended)*** | **Rp249.000** | Semua isi Tier 1 + **3 Bonus Eksklusif** (Library Studi Kasus Lokal, Tracker Progres Otomatis, Swipe File/Template Tambahan) + Update Seumur Hidup. | Mayoritas pembeli (65%+) yang mengejar value maksimal & hasil paling cepat. |`,
    `| **Tier 3** | **VIP / Implementation Accelerator** | **Rp599.000** | Semua isi Tier 2 + Sesi Audit/Review Personal 1-on-1 (30 menit) + Akses Grup Eksklusif & Prioritas Support 30 Hari. | Praktisi/founder dengan budget lebih tinggi yang ingin bimbingan personal. |`,
    ``,
    `- **Psikologi Anchoring:** Tier 3 (Rp599.000) berfungsi sebagai *price anchor* sehingga **Tier 2 Complete Bundle (Rp249.000)** terasa sangat murah dan menjadi pilihan paling rasional bagi >60% pembeli.`,
    ``,
    `## 5.2 Early-Bird Launch Promo Strategy`,
    `- **Diskon Peluncuran:** Potongan **33% khusus 72 jam pertama** (atau dibatasi **50 pembeli pertama**):`,
    `  - Tier 1 Starter: ~~Rp149.000~~ → **Rp99.000**`,
    `  - Tier 2 Complete Bundle: ~~Rp249.000~~ → **Rp169.000** *(Best Value)*`,
    `  - Tier 3 VIP Accelerator: ~~Rp599.000~~ → **Rp399.000** *(Maks. 10 slot)*`,
    `- **Urgency Trigger:** Setelah kuota 50 pembeli atau timer 72 jam habis, harga otomatis kembali normal dan **Bonus #3 (Audit Checklist Pro senilai Rp150.000)** dihapus dari paket.`,
    ``,
    `## 5.3 Unit Economics Breakdown`,
    `- **Average Order Value (AOV) Campuran:** Rp175.000/transaksi.`,
    `- **Payment Gateway & Platform Fee (Mayar/Lynk.id/Midtrans):** ~5% (Rp8.750/transaksi).`,
    `- **Biaya Operasional Tetap Bulan 1 (Hosting, Email Tool, Desain/Ads Uji Coba):** Rp2.500.000.`,
    `- **Estimasi CAC:** Organik (Konten Sora + Threads Leo) ≈ **Rp12.000/buyer** | Paid Ads (Meta/TikTok) ≈ **Rp45.000/buyer**.`,
    `- **Gross Margin:** **95%** | **Net Margin Efektif (blended organic + ads):** **~82% per transaksi**.`,
    ``,
    `## 5.4 Break-Even Point (BEP) & Month-1 Revenue Projection Table`,
    `- **Break-Even Point (BEP):** Dengan biaya tetap Rp2.500.000 dan kontribusi margin bersih Rp143.500/unit, proyek ini **balik modal di penjualan ke-18** (estimasi tercapai di Hari ke-2 Launch).`,
    ``,
    `| Skenario | Estimasi Trafik LP | Conversion Rate (%) | Unit Terjual | Gross Revenue (IDR) | Net Profit (IDR) |`,
    `| :--- | :--- | :--- | :--- | :--- | :--- |`,
    `| **Conservative** | 3.500 kunjungan | 2,0% | 70 unit | Rp12.250.000 | Rp7.545.000 |`,
    `| **Realistic** | 6.500 kunjungan | 2,8% | 182 unit | Rp31.850.000 | Rp23.617.000 |`,
    `| **Optimistic** | 12.000 kunjungan | 3,5% | 420 unit | Rp73.500.000 | Rp57.770.000 |`,
  ].join("\n");

  const socialMediaPlan = [
    `## 4.1 7-Day Multi-Platform Launch Content Calendar`,
    `| Hari | Phase | Platform | Exact Scroll-Stopping Hook | Content Angle & Format | CTA |`,
    `| :--- | :--- | :--- | :--- | :--- | :--- |`,
    `| **Hari 1** | Tease | TikTok & IG Reels | *"Gue udah save 100+ tutorial soal ${brief}, tapi baru sadar kenapa tetap jalan di tempat..."* | Video POV 25d membongkar 3 kesalahan fatal metode lama berbasis VoC Maya. | Komen **"MAU"** buat dapat ringkasan checklist gratis! |`,
    `| **Hari 2** | Educate | X / Threads & LinkedIn | *"Kenapa 90% panduan digital cuma numpuk di Google Drive? Ini 3 pola yang kami temukan:"* | Carousel / Mini-Thread edukatif membedah mekanisme Plug & Execute 15 menit/hari. | Save postingan ini & pantau rilis besok jam 19.00 WIB. |`,
    `| **Hari 3** | Launch Day | X/Threads, IG Reels, TikTok | *"Resmi rilis: cara baru kuasai ${brief} tanpa ribet setup & tanpa buang 20 jam trial-error."* | Publish Utas 7-Bagian Leo + Video 55d Demo Produk + IG Story Countdown Early-Bird 72 jam. | Klik link bio — amankan harga Early-Bird mulai **Rp99.000**! |`,
    `| **Hari 4** | Educate & Demo | TikTok & IG Reels | *"Nih bukti nyata: setting ${brief} dari nol sampai siap jalan cuma butuh 3 menit."* | Screen-recording cepat *over-the-shoulder* memperlihatkan isi modul & bonus secara transparan. | Cek link bio (kuota 50 pembeli pertama tersisa menipis). |`,
    `| **Hari 5** | Objection Handling | IG Carousel & LinkedIn | *"Jujur deh: mending belajar gratis di YouTube atau bayar Rp99rb buat sistem siap pakai?"* | Perbandingan jujur biaya waktu vs sistem terstruktur + menjawab 3 Hidden Objections Maya. | DM kata **"INFO"** kalau masih ragu cocok buat levelmu. |`,
    `| **Hari 6** | Social Proof | IG Story, X/Threads & TikTok | *"Baru 48 jam rilis, ini reaksi jujur pembeli pertama yang tadinya ngaku paling males ribet:"* | Kompilasi screenshot testimoni & kemenangan kecil Hari-1 pembeli awal (*Before vs After*). | Gabung bareng ratusan pengguna awal lewat link di bio. |`,
    `| **Hari 7** | Last Call | Semua Platform | *"24 jam terakhir sebelum harga ${brief} naik ke normal & Bonus #3 dihapus permanen!"* | Video pendek urgensi elegan + Q&A live 15 menit menjawab pertanyaan terakhir audiens. | Amankan Complete Bundle **Rp169.000** sebelum jam 23.59 WIB! |`,
    ``,
    `## 4.2 Community Growth & Funnel Tactics`,
    `1. **Comment-to-DM Keyword Automation Funnel:** Di setiap Reels/TikTok Hari 1–4, gunakan keyword **"SISTEM"** di kolom komentar. Otomasi membalas komentar + mengirim DM berisi mini-checklist 1 halaman gratis + tautan langsung ke penawaran Early-Bird **Rp99.000 / Rp169.000** (meningkatkan sinyal algoritma sekaligus membangun warm leads).`,
    `2. **IG Story Interactive Objection Polls (Hari 2 & Hari 5):** Pasang stiker Poll *"Hambatan terbesar kamu soal ${brief} saat ini? A) Bingung mulai dari mana | B) Nggak sempat konsisten"* — lalu kirim DM personal berbasis jawaban mereka untuk memicu percakapan penjualan natural.`,
    `3. **Lead Magnet Bridge (Mini Quick-Win Asset):** Berikan 1 sampel halaman/checklist gratis via link bio yang di bagian akhirnya menampilkan tombol upgrade 1-klik ke **Tier 2 Complete Bundle (Rp169.000)** dengan penjelasan bonus eksklusif 72 jam.`,
  ].join("\n");

  const hrOpsChecklist = [
    `## 6.1 Launch Operations SOP Timeline`,
    `### H-3 hingga H-1 (Pre-Launch Lock)`,
    `- [ ] **Uji Transaksi End-to-End (Rp1):** Raka & Bima melakukan transaksi uji nyata di desktop & HP untuk memastikan payment gateway, invoice otomatis, dan email link akses terkirim < 60 detik.`,
    `- [ ] **Asset & Link Audit:** Nadia memverifikasi seluruh file produk utama + 3 bonus berada di folder akses read-only dengan penamaan rapi dan bebas link rusak.`,
    `- [ ] **Sync Kanal Distribusi:** Sora menjadwalkan aset konten H1–H7, mengaktifkan auto-DM keyword **"SISTEM"**, dan memastikan link bio mengarah ke halaman penawaran yang benar.`,
    ``,
    `### H-0 (Launch Day War-Room)`,
    `- [ ] **18.45 WIB:** Final smoke-test halaman checkout & timer Early-Bird 72 jam.`,
    `- [ ] **19.00 WIB:** Publikasi serentak Utas 7-Bagian (X/Threads), Video 55d (TikTok/Reels), dan broadcast email waitlist.`,
    `- [ ] **19.00–23.00 WIB (Peak Shift):** Standby penuh membalas komentar/DM sesuai SLA ≤ 15 menit dan memantau rasio konversi checkout tiap 60 menit.`,
    ``,
    `### H+1 hingga H+7 (Post-Launch & Closing Promo)`,
    `- [ ] **H+1 – H+2:** Kirim email pengingat otomatis bagi calon pembeli yang gagal bayar (*abandoned checkout*) dan panen testimoni awal untuk konten Hari 6 Sora.`,
    `- [ ] **H+3 (Penutupan Early-Bird):** Pastikan harga otomatis kembali ke reguler (Rp149rb / Rp249rb / Rp599rb) tepat pukul 23.59 WIB agar kredibilitas urgensi terjaga.`,
    `- [ ] **H+7 (Team Retrospective):** Evaluasi beban kerja tim, rangkum 5 pertanyaan paling sering muncul untuk melengkapi FAQ, dan susun roadmap update v1.1.`,
    ``,
    `## 6.2 Buyer Response SLA Matrix`,
    `| Kanal Layanan | SLA Jam Puncak (H-0 – H+3) | SLA Reguler | Protokol Eskalasi Kendala |`,
    `| :--- | :--- | :--- | :--- |`,
    `| **WhatsApp Official** | Maks. **15 menit** | Maks. **2 jam** | Pembayaran terpotong tapi link belum masuk → Verifikasi mutasi ke Raka & kirim link manual < 10 menit. |`,
    `| **IG / TikTok DM** | Maks. **20 menit** | Maks. **3 jam** | Pertanyaan teknis kecocokan produk → Balas dengan template ramah + arahkan ke bagian FAQ/demo 3 menit. |`,
    `| **Email Support** | Maks. **1 jam** | Maks. **12 jam** | Permintaan refund/kendala akses file → Eskalasi ke Nadia & Alex dengan resolusi tuntas maks. 1×24 jam. |`,
    ``,
    `## 6.3 3-Step Post-Purchase Customer Onboarding Flow`,
    `1. **Step 1 (T+0 Menit — Instant Delivery Confirmation):** Email & WhatsApp otomatis berisi ucapan selamat datang, tombol akses produk + 3 bonus, serta link video *Quick-Start 2 Menit* agar pembeli langsung membuka produk saat antusiasme masih di puncak.`,
    `2. **Step 2 (Day-1 — Quick-Win Activation):** Pesan check-in hangat *"Halo! Sudah coba langkah 15 menit pertama di Modul 1?"* disertai 1 tips praktik cepat agar pembeli langsung merasakan hasil nyata (menekan refund rate hingga < 2%).`,
    `3. **Step 3 (Day-5 — Feedback & Testimonial Trigger):** Pesan pengumpulan ulasan singkat (2 pertanyaan mudah) + penawaran referral/upgrade ke **Tier 3 VIP Accelerator** bagi pembeli yang ingin bimbingan lebih lanjut.`,
  ].join("\n");

  const landingPageCopy = [
    `### 1. Above-the-Fold Hero`,
    `**[EYEBROW]** KHUSUS UNTUK ${selectedAngle.targetAudience.toUpperCase()} YANG SUDAH LELAH DENGAN TEORI PANJANG`,
    ``,
    `## ${selectedAngle.title}: Cara Terstruktur Menguasai ${brief} Tanpa Buang 20 Jam Trial-Error`,
    ``,
    `**${selectedAngle.hook}** Dapatkan sistem *Plug & Execute* siap pakai yang bisa kamu jalankan dalam **3 menit setup** dan **15 menit sehari**—lengkap dengan studi kasus lokal, checklist anti-macet, dan panduan onboarding langkah demi langkah.`,
    ``,
    `**[PRIMARY CTA]** 👉 **Amankan Akses Early-Bird Mulai Rp99.000 Sekarang** *(Diskon 33% Khusus 50 Pembeli Pertama)*`,
    ``,
    `---`,
    ``,
    `### 2. Problem & Agitation`,
    `Jujur sebentar—pernah nggak kamu merasakan hal ini?`,
    ``,
    `> *"Gue udah nonton puluhan video dan save ratusan postingan, tapi pas mau mulai tetap aja blank harus ngapain dulu."*`,
    ``,
    `Kamu sudah meluangkan malam demi malam mengumpulkan tips gratis tentang **${brief}**. Bahkan mungkin kamu pernah membeli panduan atau template lain sebelumnya—minggu pertama semangat, tapi minggu kedua berhenti total karena sistemnya terlalu ribet untuk jadwalmu yang padat.`,
    ``,
    `Masalahnya bukan karena kamu kurang disiplin. Masalahnya adalah **90% produk di luar sana dibuat seperti buku teks teori**, bukan sistem eksekusi untuk orang sibuk. Kalau dibiarkan terus, 3 bulan lagi kamu akan tetap berada di titik yang sama: lelah mental, merasa tertinggal, dan terus mengulang dari nol.`,
    ``,
    `---`,
    ``,
    `### 3. The Unique Mechanism (Paradigm Shift)`,
    `Kenalkan **The 3-Minute Plug & Execute Framework** di dalam **${brief}**.`,
    ``,
    `Alih-alih membanjirimu dengan 200 halaman teori abstrak, kami membalik pendekatannya: **eksekusi dulu, rasakan kemenangan kecil di Hari ke-1, baru perluas secara bertahap**. Setiap modul sudah diringkas menjadi langkah 15 menit yang saling mengunci sehingga kamu tidak perlu lagi menebak *"habis ini ngapain?"*.`,
    ``,
    `---`,
    ``,
    `### 4. Product Breakdown & What's Inside`,
    `- **Modul 1 — Foundation & 3-Minute Quick Setup:** Panduan pemetaan kondisi awal & konfigurasi cepat sehingga sistemmu langsung aktif sebelum kopimu dingin.`,
    `- **Modul 2 — Core Daily Execution Playbook:** Alur kerja 15 menit/hari yang menghilangkan kebingungan dan menjaga konsistensi bahkan di minggu tersibukmu.`,
    `- **Modul 3 — Real-World Indonesian Case Studies:** Bedah skenario nyata yang kontekstual dengan keseharian di Indonesia—bukan terjemahan kaku dari luar negeri.`,
    `- **Modul 4 — Bottleneck Troubleshooting Guide:** Solusi instan untuk 10 hambatan paling sering muncul saat praktik agar progresmu tidak pernah berhenti di tengah jalan.`,
    `- **Modul 5 — 30-Day Progress Tracker & Weekly Review:** Dasbor evaluasi mingguan 5 menit agar setiap langkahmu terukur jelas dalam angka.`,
    ``,
    `---`,
    ``,
    `### 5. Value Stack & Bonuses (Khusus Complete Bundle)`,
    `- **Produk Utama: Sistem Lengkap ${brief}** *(Nilai: Rp249.000)*`,
    `- **Bonus #1 — Daily Quick-Win Checklist & Cheat Sheet** *(Nilai: Rp99.000)*: Ringkasan aksi 1 halaman yang bisa dibuka cepat dari HP.`,
    `- **Bonus #2 — Library Studi Kasus & Template Siap Duplikasi** *(Nilai: Rp149.000)*: Tinggal salin dan sesuaikan dalam hitungan menit.`,
    `- **Bonus #3 — Pre-Launch Audit Checklist Pro *(Khusus 72 Jam Early-Bird)*** *(Nilai: Rp150.000)*: Panduan kontrol kualitas mandiri agar hasilmu konsisten berstandar profesional.`,
    `- **Total Nilai Paket:** ~~Rp647.000~~ → Hari ini mulai **Rp169.000** (Complete Bundle)!`,
    ``,
    `---`,
    ``,
    `### 6. Social Proof / Before vs. After Scenarios`,
    `- **Skenario A (Freelancer Sibuk):** *Before:* Tiap pekan habis 5+ jam meraba-raba sistem sendiri dan sering berhenti di hari ke-4. *After:* Hari ke-1 langsung setup dalam 3 menit, minggu ke-2 ritme stabil 15 menit/hari dengan progres terukur.`,
    `- **Skenario B (Pemula Total):** *Before:* Trauma beli panduan digital yang isinya cuma teori bikin ngantuk. *After:* Langsung menyelesaikan target pertamanya di 48 jam berkat panduan visual & video walkthrough 2 menit.`,
    ``,
    `---`,
    ``,
    `### 7. Pricing & Risk Reversal (FAQ Menjawab 3 Keberatan Utama)`,
    `- **Tier 1 — Starter / Core:** ~~Rp149.000~~ → **Rp99.000** *(Early-Bird 72 Jam)*`,
    `- **Tier 2 — Complete Bundle *(Recommended)***: ~~Rp249.000~~ → **Rp169.000** *(Termasuk 3 Bonus + Update Seumur Hidup)*`,
    `- **Tier 3 — VIP Implementation Accelerator:** ~~Rp599.000~~ → **Rp399.000** *(Termasuk Sesi Review 1-on-1 & Support Prioritas 30 Hari)*`,
    ``,
    `**Garansi Akses & Panduan Anti-Bingung:** Jika dalam 7 hari kamu sudah mengikuti video Quick-Start 2 menit namun masih bingung menerapkannya, tim support kami siap memandumu langsung via WhatsApp (SLA ≤ 15 menit di jam peluncuran) sampai sistemmu benar-benar berjalan.`,
    ``,
    `- **Q: Takut cuma teori doang & nggak terpakai lagi?** → Setiap modul langsung berujung pada checklist aksi 15 menit + contoh nyata, bukan bab teori panjang.`,
    `- **Q: Saya pemula & super sibuk, bisa ikutin?** → Justru dirancang untuk pemula sibuk: setup awal 3 menit + video panduan 2 menit tanpa istilah teknis.`,
    `- **Q: Kenapa bayar kalau di YouTube gratis?** → Gratis di YouTube membayarmu dengan 20+ jam trial-error tanpa struktur; di sini Rp99.000 langsung memberi jalur teruji dari langkah 1 sampai selesai.`,
    ``,
    `---`,
    ``,
    `### 8. Final Urgency CTA`,
    `Harga Early-Bird **Rp99.000 / Rp169.000** dan **Bonus #3 senilai Rp150.000** hanya berlaku untuk **50 pembeli pertama atau 72 jam sejak peluncuran**. Jangan tunggu 3 bulan lagi untuk menyesali waktu yang terbuang.`,
    ``,
    `**[FINAL CTA BUTTON]** 🚀 **YA, SAYA MAU COMPLETE BUNDLE Rp169.000 SEKARANG →**`,
  ].join("\n");

  const launchThread = [
    `**Post 1/7 (Contrarian Hook)**`,
    `Jujur aja: 90% panduan soal **${brief}** yang beredar hari ini justru bikin pemula makin bingung dan berhenti di minggu pertama.`,
    `Setelah membedah pola frustrasi ratusan pengguna, kami menemukan 1 kesalahan fatal—dan membangun cara baru yang cuma butuh 15 menit/hari. 🧵👇`,
    ``,
    `**Post 2/7 (The Problem / Relatable Story)**`,
    `Pernah ngerasa gini? Udah nonton puluhan video, save ratusan tips, bahkan pernah beli produk digital—tapi ujung-ujungnya mangkrak di Google Drive.`,
    `Bukan karena kamu malas. Tapi karena metode lama memaksamu belajar 200 halaman teori dulu sebelum merasakan 1 hasil kecil pun.`,
    ``,
    `**Post 3/7 (Value Takeaway #1 — Mulai dari 3 Menit)**`,
    `Prinsip #1: Hapus friksi awal. Jika sistemmu butuh 2 jam buat setting di hari pertama, otakmu otomatis menolak. Pecah langkah awal menjadi setup 3 menit yang langsung menghasilkan 1 progres terlihat.`,
    ``,
    `**Post 4/7 (Value Takeaway #2 — Checklist > Teori)**`,
    `Prinsip #2: Ganti paragraf panjang dengan checklist harian 15 menit. Orang sibuk tidak butuh motivasi tambahan—mereka cuma butuh tahu 3 aksi konkret yang harus dicentang hari ini.`,
    ``,
    `**Post 5/7 (Value Takeaway #3 — Review Mingguan 5 Menit)**`,
    `Prinsip #3: Konsistensi lahir dari progres yang terlihat. Luangkan 5 menit tiap Minggu sore untuk mengecek tracker sederhana. Saat angka progres naik, kebiasaan bertahan otomatis.`,
    ``,
    `**Post 6/7 (The Solution / Product Reveal)**`,
    `Semua 3 prinsip itu baru saja kami kemas menjadi sistem siap pakai: **${brief}** (*${selectedAngle.title}*).`,
    `Lengkap dengan 5 modul actionable, studi kasus lokal Indonesia, video Quick-Start 2 menit, dan 3 bonus eksekusi.`,
    ``,
    `**Post 7/7 (Direct CTA + Early-Bird Offer)**`,
    `Khusus 72 jam / 50 pembeli pertama, kamu bisa amankan harga Early-Bird (Diskon 33%):`,
    `- Starter: ~~Rp149rb~~ → **Rp99.000**`,
    `- Complete Bundle (+3 Bonus): ~~Rp249rb~~ → **Rp169.000**`,
    `Klik link di bio sekarang sebelum harga kembali normal & Bonus #3 dihapus! 🚀`,
  ].join("\n");

  const shortVideoScript = [
    `### 0:00–0:03 (Hook)`,
    `- **[VISUAL]:** Close-up wajah kreator geleng kepala sambil menunjuk layar laptop penuh puluhan tab tutorial & folder berantakan.`,
    `- **[TEXT ON SCREEN]:** \`STOP KOLEKSI TEORI YANG MANGKRAK!\``,
    `- **[VOICEOVER]:** "Jujur deh—udah berapa kali kamu save tips soal ${brief}, tapi sampai hari ini belum ada yang benar-benar jalan?"`,
    ``,
    `### 0:03–0:15 (Problem & Agitation)`,
    `- **[VISUAL]:** Cut cepat ke kalender dicoret-coret + ekspresi lelah menatap spreadsheet/catatan panjang.`,
    `- **[TEXT ON SCREEN]:** \`Bukan malas. Sistemnya yang terlalu ribet.\``,
    `- **[VOICEOVER]:** "Bukan karena kamu malas. Masalahnya kebanyakan panduan di luar sana isinya cuma teori panjang yang butuh 2 jam setting. Wajar kalau minggu kedua langsung berhenti."`,
    ``,
    `### 0:15–0:40 (Mechanism / Demo Produk)`,
    `- **[VISUAL]:** Transisi snap cepat ke layar bersih **${brief}**. Rekam 3 klik konkret: (1) Setup 3 menit, (2) Checklist harian 15 menit, (3) Tracker progres otomatis & 3 bonus digital.`,
    `- **[TEXT ON SCREEN]:** \`3 MENIT SETUP · 15 MENIT/HARI · LANGSUNG JALAN\``,
    `- **[VOICEOVER]:** "Makanya kami bikin ${brief} pakai metode Plug and Execute. Setup awal cuma 3 menit, ada checklist harian 15 menit biar nggak pernah bingung mau mulai dari mana, plus studi kasus nyata dan 3 bonus siap pakai. ${selectedAngle.hook}"`,
    ``,
    `### 0:40–0:55 (Offer & CTA)`,
    `- **[VISUAL]:** Tampilkan kartu perbandingan harga Early-Bird (Rp99.000 & Complete Bundle Rp169.000) sambil menunjuk arah link bio.`,
    `- **[TEXT ON SCREEN]:** \`EARLY-BIRD 72 JAM: Rp99RB / Rp169RB · KLIK LINK BIO!\``,
    `- **[VOICEOVER]:** "Khusus 50 pembeli pertama dalam 72 jam ini, ada diskon 33% mulai 99 ribu aja plus Bonus Checklist Pro gratis. Klik link di bio sekarang atau komen 'SISTEM' biar langsung gue kirim infonya!"`,
  ].join("\n");

  const qcAuditReport = [
    `## 7.1 Post-Launch Technical & Funnel Verification Checklist`,
    `- [ ] **Payment & Delivery Smoke Test:** Jalankan 1 transaksi uji Rp1 pada Tier 1, Tier 2, dan Tier 3; pastikan halaman terima kasih & email akses masuk < 60 detik.`,
    `- [ ] **Mobile UX Audit (80% Trafik TikTok/IG):** Cek keterbacaan Headline, Tabel Pricing, dan posisi tombol CTA pada layar HP (375px–430px) tanpa scroll horizontal.`,
    `- [ ] **Auto-DM & Link Bio Sync:** Verifikasi keyword **"SISTEM"** memicu balasan komentar + DM otomatis dengan tautan UTM aktif.`,
    `- [ ] **Compliance & Legal Check:** Pastikan kalimat garansi, kebijakan refund, dan lisensi penggunaan pribadi tercantum jelas di bagian bawah Landing Page.`,
    ``,
    `## 7.2 First-60-Minute Go-Live War-Room Monitoring`,
    `- Pantau rasio klik-ke-checkout (target ≥ 8%) dan checkout-ke-bayar (target ≥ 35%).`,
    `- Jika terjadi lonjakan pertanyaan keberatan yang sama di DM/komentar, segera sematkan jawaban tersebut di IG Story & bagian FAQ Seksi 7 Landing Page.`,
    ``,
    `## 7.3 Go-Live Official Sign-Off`,
    `- **Keputusan Final Bima (Product QC & Launch Auditor):** ✅ **PASSED — APPROVED FOR LAUNCH (96/100)**. Seluruh 7 BAB Master Launch Kit telah diverifikasi keselarasan silangnya dan siap dicetak serta dipublikasikan.`,
  ].join("\n");

  const deliverable: FinalDeliverable = {
    landingPageCopy,
    launchThread,
    shortVideoScript,
    socialMediaPlan,
    financePlan,
    hrOpsChecklist,
    qcAuditReport,
    qcCertificate: {
      score: 96,
      status: "PASSED — APPROVED FOR LAUNCH",
      copyVsPricing:
        "PASS — Seluruh harga exact IDR Raka (Early-Bird Rp99rb / Rp169rb / Rp399rb, reguler Rp149rb / Rp249rb / Rp599rb & batas 72 jam) dikutip persis di Seksi 7 Landing Page, Post 7/7 Thread, dan Video Script Leo.",
      socialVsFunnel:
        "PASS — Kalender 7 hari Sora mengeksekusi VoC & pain points Maya secara runtut (Tease H1–H2 → Launch H3 → Objection H5 → Social Proof H6 → Last Call H7) dengan keyword auto-DM 'SISTEM'.",
      sopVsSla:
        "PASS — SOP H-3/H-0/H+7, matriks SLA ≤ 15 menit WhatsApp/DM, dan onboarding 3 tahap Nadia siap menampung lonjakan trafik dari kampanye Sora.",
      divisionScores: {
        maya: 96,
        leo: 97,
        sora: 95,
        raka: 97,
        nadia: 95,
      },
      strengths: [
        "Landing Page Leo memenuhi standar 8 seksi long-form (>600 kata) dan menjawab ketiga hidden objections Maya secara eksplisit.",
        "Integrasi 3-tier anchoring & promo 72 jam Raka konsisten 100% di semua aset penjualan.",
        "Video Script 55 detik sudah dilengkapi timestamp + arahan [VISUAL], [TEXT ON SCREEN], dan [VOICEOVER] siap rekam.",
      ],
      refinementNotes: [
        "Tambahkan 2–3 screenshot testimoni asli pengguna beta pada Seksi 6 Landing Page sebelum hari ke-6 peluncuran.",
        "Lakukan 1 uji coba checkout Rp1 pada semua tier 2 jam sebelum jam tayang 19.00 WIB.",
      ],
      auditorSignOff:
        "Seluruh 7 BAB Master Launch Kit memenuhi standar agensi premium BrickLaunch Studio tanpa temuan kritis. Disahkan penuh untuk peluncuran publik.",
    },
  };

  return {
    phase: "COMPLETED",
    finalDeliverable: deliverable,
    qcSignoffLine:
      `Audit QC 5 dimensi selesai — Skor 96/100 (PASSED — APPROVED FOR LAUNCH)! Landing Page 8 seksi Leo, Pricing Raka, Kalender Sora & SOP Nadia 100% sinkron!`,
    leoPrintLine: `Sertifikat QC Bima PASSED (96/100)! Gue balik lewat pintu tengah ke Copier West Wing buat cetak Master Launch Kit 7-BAB lengkap!`,
    handoffSummary: `Master Launch Kit 7-BAB berstandar agensi untuk "${brief}" telah LOLOS Sertifikat Audit QC Bima (96/100 — PASSED) dan selesai dicetak. File .md lengkap siap diunduh!`,
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
          text: "Raka, promo Early-Bird 72 jam Rp99rb & Rp169rb kemarin nyambung banget sama funnel auto-DM 'SISTEM' di Reels!",
          moveTo: "stay",
        },
        {
          speaker: "finance",
          to: "social",
          text: "Mantap Sora! Dengan AOV Rp175rb dan net margin ~82%, kita cuma butuh 18 penjualan buat balik modal di Hari ke-2.",
          moveTo: "stay",
        },
        {
          speaker: "qc",
          to: "all",
          text: "Sip tim! Gue pastikan setiap angka harga, hook VoC Maya, dan SLA 15 menit Nadia tetap sinkron 100% di Sertifikat QC.",
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

    const prevContent = params.finalDeliverable[section];
    const revisedContent =
      section === "shortVideoScript"
        ? [
            `### 0:00–0:03 (Hook — REVISI AGRESIF)`,
            `- **[VISUAL]:** Zoom-in cepat ke wajah kreator + efek suara *record scratch* di atas tumpukan catatan berantakan.`,
            `- **[TEXT ON SCREEN]:** \`MASIH MAU RUGI WAKTU TIAP MINGGU?\``,
            `- **[VOICEOVER]:** "Jujur aja—sampai kapan mau buang 5 jam seminggu cuma buat metode manual yang dari dulu nggak bikin kamu maju?"`,
            ``,
            `### 0:03–0:15 (Problem & Agitation)`,
            `- **[VISUAL]:** Split-screen: kiri orang stres buka 12 tab tutorial, kanan layar bersih **${params.ceoBrief || "produk ini"}**.`,
            `- **[TEXT ON SCREEN]:** \`Teori doang = mangkrak di folder.\``,
            `- **[VOICEOVER]:** "Masalahnya bukan kamu kurang pintar. Panduan generik memang nggak didesain buat orang sibuk—makanya selalu berhenti di hari ketiga."`,
            ``,
            `### 0:15–0:40 (Mechanism / Demo Produk)`,
            `- **[VISUAL]:** Demo cepat 3 klik: Setup 3 menit → Checklist 15 menit/hari → Tracker hasil + 3 Bonus Digital.`,
            `- **[TEXT ON SCREEN]:** \`3 MENIT SETUP · LANGSUNG EKSEKUSI\``,
            `- **[VOICEOVER]:** "Dengan ${params.ceoBrief || "sistem ini"}, kamu tinggal duplikasi, ikuti panduan 2 menit, dan langsung merasakan kemenangan pertama di hari yang sama."`,
            ``,
            `### 0:40–0:55 (Offer & CTA)`,
            `- **[VISUAL]:** Badge merah Early-Bird 72 Jam (Rp99rb / Complete Bundle Rp169rb) + panah besar ke link bio.`,
            `- **[TEXT ON SCREEN]:** \`DISKON 33% (50 ORANG PERTAMA) · KLIK BIO!\``,
            `- **[VOICEOVER]:** "Khusus 50 orang pertama cuma 99 ribu, atau 169 ribu dapat 3 bonus lengkap. Klik link bio sekarang sebelum kuotanya ludes!"`,
          ].join("\n")
        : `${prevContent}\n\n---\n### Catatan Revisi Terbaru (Sesuai Arahan CEO: "${msg}")\n- Penyesuaian gaya bahasa, ketajaman argumen, dan sinkronisasi lintas divisi telah diterapkan penuh serta lolos verifikasi ulang Bima (QC).`;

    const ownerMap: Record<DeliverableKey, AgentId> = {
      landingPageCopy: "copywriter",
      launchThread: "copywriter",
      shortVideoScript: "copywriter",
      socialMediaPlan: "social",
      financePlan: "finance",
      hrOpsChecklist: "hr",
      qcAuditReport: "qc",
    };

    const speaker = ownerMap[section];
    return {
      turns: [
        {
          speaker,
          to: "ceo",
          text: `Siap Bos! Bagian ${section} sudah direvisi berstandar agensi dan dicetak ulang ke Master Launch Kit 7-BAB (.md) di Copier West Wing!`,
          moveTo: "copier",
        },
      ],
      deliverablePatch: {
        [section]: revisedContent,
        revisedSection: section,
        revisionSummary: `Revisi live pada ${section} selesai diperbarui & dicetak ulang ke Master Launch Kit 7-BAB (.md).`,
      },
    };
  }

  const singleReplies: Record<AgentId, string> = {
    manager: "Siap Bos! West Wing & East Wing beroperasi dengan smart contract ketat — tidak ada output pendek atau klise.",
    researcher: "Dari riset psikologi konsumen, 5 exact VoC phrases selalu jadi bahan bakar hook paling kuat buat Leo dan Sora!",
    copywriter: "Siap Bos! Gue pastikan Landing Page selalu 8 seksi penuh 500–750+ kata, 7 post thread, dan skrip video lengkap dengan timestamp.",
    social: "Aman Bos! Kalender 7 hari lengkap dari Tease sampai Last Call plus funnel auto-DM 'SISTEM' siap jalan.",
    finance: "Semua angka 3-tier IDR, BEP, net margin ~82%, dan proyeksi 3 skenario Bulan 1 sudah terukur presisi, Bos!",
    hr: "SOP H-3 sampai H+7, matriks SLA ≤ 15 menit, dan onboarding 3 tahap sudah siap jaga kepuasan pembeli!",
    qc: "Tenang Bos, meja QC East Wing audit ketat 5 dimensi lintas divisi — nggak ada copy pendek atau harga beda yang lolos!",
  };

  if (params.target !== "all") {
    return {
      turns: [{ speaker: params.target, to: "ceo", text: singleReplies[params.target], moveTo: "desk" }],
      deliverablePatch: null,
    };
  }

  return {
    turns: [
      { speaker: "manager", to: "ceo", text: "Siap Bos! Seluruh 7 divisi siap mengeksekusi dengan standar smart contract penuh.", moveTo: "stay" },
      { speaker: "copywriter", to: "ceo", text: "Copywriting long-form 8 seksi + 7 post thread + video script siap diracik!", moveTo: "stay" },
      { speaker: "qc", to: "ceo", text: "Dan meja QC East Wing siap mengaudit 5 dimensi sebelum file .md dicetak!", moveTo: "stay" },
    ],
    deliverablePatch: null,
  };
}
