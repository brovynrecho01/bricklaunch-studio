"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Coffee,
  Copy,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  Maximize2,
  Megaphone,
  MessageCircle,
  MessageSquareText,
  Minimize2,
  Monitor,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Printer,
  RotateCcw,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Video,
  X,
} from "lucide-react";
import {
  ALL_AGENT_IDS,
  CameraPreset,
  ChatRecipient,
  ChatTarget,
  DeliverableKey,
  useAgencyStore,
  WorkflowPhase,
} from "@/store/useAgencyStore";
import { BrickLaunchHorizontalLogo } from "./BrickLaunchLogo";

const SAMPLE_LAUNCH_MISSIONS = [
  "Template Notion: Freelance Finance & Tax OS",
  "AI Prompt Engineering Playbook untuk Solopreneur",
  "Micro-SaaS: Automated Invoice & Client Tracker",
] as const;

const QUICK_CHAT_CHIPS = [
  "Ngobrol santai dulu yuk!",
  "Sora, tren konten apa yang lagi viral?",
  "Raka, margin produk digital ideal berapa?",
  "Bima, apa syarat wajib lolos QC produk?",
] as const;

const REVISION_CHAT_CHIPS = [
  "Leo, bikin hook videonya lebih agresif!",
  "Sora, bikin jadwal konten Sosmed lebih padat",
  "Raka, revisi pricing tier biar makin menarik",
  "Nadia, tambahin SLA support di SOP HR",
  "Bima, perketat checklist audit QC-nya",
] as const;

const DELIVERABLE_TABS: Array<{
  id: DeliverableKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "landingPageCopy", label: "Landing", icon: FileText },
  { id: "launchThread", label: "Thread", icon: MessageSquareText },
  { id: "shortVideoScript", label: "Video 45d", icon: Video },
  { id: "socialMediaPlan", label: "Sosmed", icon: Megaphone },
  { id: "financePlan", label: "Finance", icon: DollarSign },
  { id: "hrOpsChecklist", label: "HR Ops", icon: UserCheck },
  { id: "qcAuditReport", label: "QC Gate", icon: ClipboardCheck },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "CEO Brief & Live Demo",
    actor: "Human CEO",
    desc: "Kamu mengirim ide produk digital atau klik 1-klik Sample Launch Mission.",
  },
  {
    step: "02",
    title: "Riset Pasar, Finance & Kesiapan HR",
    actor: "Maya · Raka · Nadia",
    desc: "Maya membedah psikologi audiens & kompetitor, Raka cek kelayakan margin, Nadia cek kapasitas tim.",
  },
  {
    step: "03",
    title: "Laporan Pra-Produksi (3 Angles)",
    actor: "Alex · AI Manager",
    desc: "Alex menyintesis 3 Marketing Angle kontras dan menyiapkan Gerbang Persetujuan CEO.",
  },
  {
    step: "04",
    title: "Human-in-the-Loop CEO Approval",
    actor: "Human CEO",
    desc: "Studio berhenti agar kamu meninjau riset dan menyetujui 1 angle peluncuran terbaik.",
  },
  {
    step: "05",
    title: "Produksi Serentak 4 Divisi",
    actor: "Leo · Sora · Raka · Nadia",
    desc: "Leo menulis copy & skrip, Sora menyusun kalender Sosmed 7 hari, Raka finalisasi pricing, Nadia menyusun SOP tim.",
  },
  {
    step: "06",
    title: "Pre-Launch Product QC Gate",
    actor: "Bima · QC Product",
    desc: "Sebelum rilis, Bima mengaudit konsistensi copy, angka pricing, jadwal konten & SOP hingga LOLOS QC.",
  },
  {
    step: "07",
    title: "Cetak Copier, Ekspor .md & Revisi Live",
    actor: "Seluruh 7 Divisi",
    desc: "Leo mencetak Launch Kit 7-divisi (.md) di mesin fotokopi, dan kamu bisa DM divisi mana pun untuk revisi live.",
  },
] as const;

const CAMERA_BUTTONS: Array<{
  id: CameraPreset;
  label: string;
  tooltip: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "campus", label: "Full Campus", tooltip: "Full Campus (West & East Wing)", icon: Camera },
  { id: "west_wing", label: "West Wing", tooltip: "West Wing (Creative & Alex)", icon: Monitor },
  { id: "east_wing", label: "East Wing", tooltip: "East Wing (Finance, Ops & QC)", icon: ClipboardCheck },
  { id: "pantry", label: "Pantry Bar", tooltip: "Pantry & Coffee Bar", icon: Coffee },
];

const CHAT_TARGETS: Array<{
  id: ChatTarget;
  label: string;
  roleShort: string;
  dotColor?: string;
}> = [
  { id: "all", label: "Semua", roleShort: "7 Divisi" },
  { id: "manager", label: "Alex", roleShort: "Manager", dotColor: "#60A5FA" },
  { id: "researcher", label: "Maya", roleShort: "Riset", dotColor: "#0284C7" },
  { id: "copywriter", label: "Leo", roleShort: "Copy", dotColor: "#D97706" },
  { id: "social", label: "Sora", roleShort: "Sosmed", dotColor: "#DB2777" },
  { id: "finance", label: "Raka", roleShort: "Finance", dotColor: "#059669" },
  { id: "hr", label: "Nadia", roleShort: "HR", dotColor: "#7C3AED" },
  { id: "qc", label: "Bima", roleShort: "QC", dotColor: "#DC2626" },
];

const RECIPIENT_DISPLAY: Record<ChatRecipient, string> = {
  ceo: "CEO",
  all: "Semua Tim",
  manager: "Alex",
  researcher: "Maya",
  copywriter: "Leo",
  social: "Sora",
  finance: "Raka",
  hr: "Nadia",
  qc: "Bima",
};

const PHASE_LABELS: Record<WorkflowPhase, { label: string; color: string }> = {
  IDLE: { label: "STANDBY · 7 DIVISI", color: "text-slate-300 bg-white/10 border-white/15" },
  RESEARCHING: {
    label: "RISET & VALIDASI",
    color: "text-sky-200 bg-sky-500/20 border-sky-400/35",
  },
  AWAITING_CEO_APPROVAL: {
    label: "TUNGGU ACC CEO",
    color: "text-rose-100 bg-rose-500/25 border-rose-400/45",
  },
  COPYWRITING: {
    label: "PRODUKSI 4 DIVISI",
    color: "text-amber-100 bg-amber-500/25 border-amber-400/45",
  },
  QC_REVIEW: {
    label: "AUDIT QC BIMA",
    color: "text-red-100 bg-red-500/25 border-red-400/45",
  },
  PRINTING_DELIVERABLE: {
    label: "PRINT LAUNCH KIT",
    color: "text-violet-100 bg-violet-500/25 border-violet-400/45",
  },
  COMPLETED: {
    label: "QC PASSED · SIAP",
    color: "text-emerald-100 bg-emerald-500/25 border-emerald-400/45",
  },
};

const CHAPTER_OVERVIEW = [
  { bab: "SERTIFIKAT", title: "Product QC & Launch Audit Certificate", owner: "Bima (QC)" },
  { bab: "BAB 1", title: "Executive Brief & Selected Pre-Production Angle", owner: "Alex (Manager)" },
  { bab: "BAB 2", title: "Market Intelligence & Buyer Psychology", owner: "Maya (Research)" },
  { bab: "BAB 3", title: "High-Converting Copywriting Suite (LP, Thread & 45s Video)", owner: "Leo (Copywriter)" },
  { bab: "BAB 4", title: "7-Day Multi-Platform Social Media Calendar & Community Growth", owner: "Sora (Social Media)" },
  { bab: "BAB 5", title: "Pricing Tiers, Early-Bird, Unit Economics & Month-1 Projection", owner: "Raka (Finance)" },
  { bab: "BAB 6", title: "Launch Operations SOP, Buyer Response SLA & Onboarding", owner: "Nadia (HR Ops)" },
  { bab: "BAB 7", title: "Post-Launch QC Checklist & Go-Live Sign-Off", owner: "Bima (Product QC)" },
] as const;

const AGENT_PROFILE_CARDS = [
  {
    name: "Alex",
    wing: "West Wing",
    role: "AI Manager / Handoff Orchestrator",
    color: "#1E293B",
    ring: "#60A5FA",
    desc: "Tenang, terstruktur, tegas. Mengoordinasikan West & East Wing, menyintesis 3 Marketing Angle, dan menyusun BAB 1.",
  },
  {
    name: "Maya",
    wing: "West Wing",
    role: "Market & Psychology Researcher",
    color: "#0284C7",
    ring: "#38BDF8",
    desc: "Analitis & data-driven. Membedah psikologi konsumen, pain point terdalam, dan menyusun BAB 2.",
  },
  {
    name: "Leo",
    wing: "West Wing",
    role: "Conversion Copywriter",
    color: "#D97706",
    ring: "#FBBF24",
    desc: "Punchy & fokus konversi. Menulis BAB 3 (Landing Page, Thread, Skrip 45d) & mencetak paket di Copier.",
  },
  {
    name: "Sora",
    wing: "West Wing",
    role: "Social Media Specialist",
    color: "#DB2777",
    ring: "#F472B6",
    desc: "Trend-savvy & kreatif. Merancang BAB 4 (Kalender Konten 7 Hari multi-platform & pertumbuhan komunitas).",
  },
  {
    name: "Raka",
    wing: "East Wing",
    role: "Finance & Pricing Strategist",
    color: "#059669",
    ring: "#34D399",
    desc: "Presisi angka & pragmatis. Menyusun BAB 5 (Pricing Tiers, Early-Bird, Unit Economics & Proyeksi Bulan 1).",
  },
  {
    name: "Nadia",
    wing: "East Wing",
    role: "Human Resources & Team Ops",
    color: "#7C3AED",
    ring: "#A78BFA",
    desc: "Hangat & teratur. Menyusun BAB 6 (Launch Operations SOP, SLA respon pembeli & onboarding pelanggan).",
  },
  {
    name: "Bima",
    wing: "East Wing",
    role: "Product QC & Launch Auditor",
    color: "#DC2626",
    ring: "#F87171",
    desc: "Teliti & perfeksionis. Menerbitkan Sertifikat Audit QC resmi (/100) serta menyusun BAB 7 Go-Live Sign-Off.",
  },
] as const;

export function CeoCommandHud() {
  const [isMounted, setIsMounted] = useState(false);

  const {
    agents,
    workflowPhase,
    ceoBrief,
    researchSummary,
    researchSources,
    managerReport,
    marketingAngles,
    selectedAngleId,
    finalDeliverable,
    handoffSummary,
    telemetryLogs,
    chatMessages,
    chatTarget,
    isChatOpen,
    chatPopupExpiresAt,
    isChatting,
    cameraPreset,
    isDrawerOpen,
    activeDeliverableTab,
    isCommandExpanded,
    isProcessing,
    error,
    setCameraPreset,
    setDrawerOpen,
    setActiveDeliverableTab,
    setChatOpen,
    touchChatPopup,
    setCommandExpanded,
    collapseAllPanels,
    setChatTarget,
    clearError,
    startBrief,
    approveAngle,
    sendCeoChat,
    triggerAgentBanter,
    resetStudio,
  } = useAgencyStore();

  const [briefInput, setBriefInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [copiedTab, setCopiedTab] = useState<DeliverableKey | null>(null);
  const [drawerSection, setDrawerSection] = useState<"deliverables" | "logs">("logs");
  const [chatRemainingSec, setChatRemainingSec] = useState<number>(180);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-hide popup HUD obrolan agent setelah 3 menit (180 detik) tanpa aktivitas baru
  useEffect(() => {
    if (!isChatOpen || !chatPopupExpiresAt) return;

    const updateCountdown = () => {
      const diffSec = Math.max(0, Math.ceil((chatPopupExpiresAt - Date.now()) / 1000));
      setChatRemainingSec(diffSec);
      if (diffSec === 0) {
        setChatOpen(false);
      }
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [isChatOpen, chatPopupExpiresAt, setChatOpen]);

  useEffect(() => {
    if (finalDeliverable) {
      setDrawerSection("deliverables");
    }
  }, [finalDeliverable]);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages.length, isChatOpen]);

  const selectedAngle = useMemo(
    () => marketingAngles.find((a) => a.id === selectedAngleId) || null,
    [marketingAngles, selectedAngleId]
  );

  if (!isMounted) return null;

  const formattedChatTimer = `${String(Math.floor(chatRemainingSec / 60)).padStart(2, "0")}:${String(
    chatRemainingSec % 60
  ).padStart(2, "0")}`;

  const anyPanelOpen = isChatOpen || isDrawerOpen || isCommandExpanded;

  const handleDeploy = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = briefInput.trim();
    if (!trimmed || isProcessing) return;
    await startBrief(trimmed);
  };

  const handleRunSampleMission = async (missionTitle: string) => {
    if (isProcessing) return;
    setBriefInput(missionTitle);
    await startBrief(missionTitle);
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || isChatting) return;
    setChatInput("");
    await sendCeoChat(chatTarget, trimmed);
  };

  const handleCopyActiveTab = async () => {
    if (!finalDeliverable) return;
    const text = finalDeliverable[activeDeliverableTab];
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(activeDeliverableTab);
      setTimeout(() => setCopiedTab(null), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleDownloadMarkdown = () => {
    if (!finalDeliverable) return;
    const slug = (ceoBrief || "launch-kit")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48);

    const cert = finalDeliverable.qcCertificate || {
      score: 96,
      status: "PASSED — APPROVED FOR LAUNCH",
      copyVsPricing:
        "PASS — Seluruh janji manfaat Landing Page & CTA konsisten dengan struktur harga & promo Raka.",
      socialVsFunnel:
        "PASS — Kalender distribusi 7 hari Sora selaras penuh dengan funnel peluncuran produk.",
      sopVsSla:
        "PASS — SOP operasional peluncuran & SLA respon pembeli Nadia siap menopang trafik Hari-H.",
      auditorSignOff:
        "Master Launch Kit 7-BAB telah diverifikasi menyeluruh dan dinyatakan layak rilis publik.",
    };

    const generatedAt = new Date().toLocaleString("id-ID");

    const markdown = [
      `# BRICKLAUNCH STUDIO — MASTER LAUNCH KIT (7 CHAPTERS)`,
      ``,
      `> **PRODUCT QC & LAUNCH AUDIT CERTIFICATE (Verified by Bima)**`,
      `>`,
      `> - **Audit Score:** \`${cert.score} / 100\``,
      `> - **Official Status:** ✅ **${cert.status}**`,
      `> - **Cross-Division Check — Copy vs. Pricing:** ${cert.copyVsPricing}`,
      `> - **Cross-Division Check — Social Schedule vs. Funnel:** ${cert.socialVsFunnel}`,
      `> - **Cross-Division Check — SOP vs. SLA:** ${cert.sopVsSla}`,
      `> - **Auditor Sign-Off (Bima — Product QC & Launch Auditor):** _"${cert.auditorSignOff}"_`,
      `> - **Timestamp:** ${generatedAt}`,
      ``,
      `---`,
      ``,
      `# BAB 1: Executive Brief & Selected Pre-Production Angle`,
      `_Disusun oleh: **Alex — AI Manager / Handoff Orchestrator (West Wing)**_`,
      ``,
      `- **Product Brief (CEO):** ${ceoBrief}`,
      selectedAngle ? `- **Selected Marketing Angle:** **${selectedAngle.title}**` : "",
      selectedAngle ? `- **Core Positioning Hook:** "${selectedAngle.hook}"` : "",
      selectedAngle ? `- **Primary Target Audience:** ${selectedAngle.targetAudience}` : "",
      managerReport ? `\n**Executive Manager Summary:**\n${managerReport}` : "",
      ``,
      `---`,
      ``,
      `# BAB 2: Market Intelligence & Buyer Psychology`,
      `_Disusun oleh: **Maya — Market & Psychology Researcher (West Wing)**_`,
      ``,
      researchSummary || "_Belum ada ringkasan riset._",
      ``,
      `---`,
      ``,
      `# BAB 3: High-Converting Copywriting Suite (Landing Page, Launch Thread & Short Video Script)`,
      `_Disusun oleh: **Leo — Conversion Copywriter (West Wing)**_`,
      ``,
      `## 3.1 Conversion Landing Page Copy`,
      ``,
      finalDeliverable.landingPageCopy,
      ``,
      `## 3.2 5-Part Viral Launch Thread (X / Threads)`,
      ``,
      finalDeliverable.launchThread,
      ``,
      `## 3.3 45-Second Short Video Script (TikTok / Reels)`,
      ``,
      finalDeliverable.shortVideoScript,
      ``,
      `---`,
      ``,
      `# BAB 4: 7-Day Multi-Platform Social Media Calendar & Community Growth`,
      `_Disusun oleh: **Sora — Social Media Specialist (West Wing)**_`,
      ``,
      finalDeliverable.socialMediaPlan,
      ``,
      `---`,
      ``,
      `# BAB 5: Pricing Tiers, Early-Bird Strategy, Unit Economics & Month-1 Revenue Projection`,
      `_Disusun oleh: **Raka — Finance & Pricing Strategist (East Wing)**_`,
      ``,
      finalDeliverable.financePlan,
      ``,
      `---`,
      ``,
      `# BAB 6: Launch Operations SOP, Buyer Response SLA & Customer Onboarding`,
      `_Disusun oleh: **Nadia — Human Resources & Team Ops (East Wing)**_`,
      ``,
      finalDeliverable.hrOpsChecklist,
      ``,
      `---`,
      ``,
      `# BAB 7: Post-Launch QC Checklist & Go-Live Sign-Off`,
      `_Disusun oleh: **Bima — Product QC & Launch Auditor (East Wing)**_`,
      ``,
      finalDeliverable.qcAuditReport,
      ``,
      `---`,
      `_Dokumen resmi diterbitkan oleh **BrickLaunch Studio (Dual-Wing Autonomous 7-Division Agency)** pada ${generatedAt}._`,
      ``,
    ]
      .filter((line) => line !== undefined)
      .join("\n");

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bricklaunch-master-7bab-${slug || "kit"}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const phaseMeta = PHASE_LABELS[workflowPhase];
  const agentList = ALL_AGENT_IDS.map((id) => agents[id]);
  const targetMeta = CHAT_TARGETS.find((t) => t.id === chatTarget);
  const targetDisplayName = targetMeta
    ? `${targetMeta.label} (${targetMeta.roleShort})`
    : "Semua 7 Divisi";

  const activeChatChips = finalDeliverable ? REVISION_CHAT_CHIPS : QUICK_CHAT_CHIPS;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-2.5 sm:p-4">
      {/* TOP BAR (Horizontal Brand Lockup + Camera + Panel Toggles) */}
      <header className="pointer-events-auto flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/15 bg-slate-950/72 px-3.5 py-2 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0">
          <BrickLaunchHorizontalLogo compact />
          <div className="hidden md:flex flex-col min-w-0 border-l border-white/15 pl-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 text-[9.5px] font-semibold tracking-widest text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI CORE // 7 DIVISIONS
              </span>
            </div>
            <p className="hidden lg:block mt-0.5 truncate text-[10.5px] text-slate-300/85">
              From Raw Idea to Launch-Ready Digital Product — Orchestrated by Autonomous Agents.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-0.5">
            {CAMERA_BUTTONS.map((btn) => {
              const Icon = btn.icon;
              const active = cameraPreset === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setCameraPreset(btn.id)}
                  title={btn.tooltip}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">{btn.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setChatOpen(!isChatOpen)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold transition cursor-pointer ${
              isChatOpen
                ? "border-amber-400/50 bg-amber-400/15 text-amber-100"
                : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/15"
            }`}
            title="Buka/Lipat Jendela Obrolan & Revisi Live 7 Divisi"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Obrolan</span>
            <span className="rounded-full bg-white/15 px-1.5 text-[9.5px]">
              {chatMessages.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(!isDrawerOpen)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold transition cursor-pointer ${
              isDrawerOpen
                ? "border-sky-400/50 bg-sky-400/15 text-sky-100"
                : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/15"
            }`}
            title={isDrawerOpen ? "Lipat Panel Log & Kit" : "Buka Panel Log & Kit"}
          >
            {isDrawerOpen ? (
              <PanelRightClose className="h-3.5 w-3.5" />
            ) : (
              <PanelRightOpen className="h-3.5 w-3.5" />
            )}
            <span className="hidden md:inline">
              {finalDeliverable ? "Launch Kit" : "Log Kantor"}
            </span>
            {finalDeliverable && !isDrawerOpen && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (anyPanelOpen) {
                collapseAllPanels();
              } else {
                setCommandExpanded(true);
              }
            }}
            className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold transition cursor-pointer ${
              !anyPanelOpen
                ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-100"
                : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/15"
            }`}
            title={
              anyPanelOpen
                ? "Mode Lega: Lipat semua panel agar tampilan 3D penuh"
                : "Bentangkan HUD Perintah"
            }
          >
            {anyPanelOpen ? (
              <Maximize2 className="h-3.5 w-3.5" />
            ) : (
              <Minimize2 className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {anyPanelOpen ? "Mode Lega" : "Tampilkan HUD"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsInfoModalOpen(true)}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:border-amber-400/60 hover:bg-amber-400/20 hover:text-amber-100 cursor-pointer"
            title="Profil Agensi 7 Divisi & Cara Kerja BrickLaunch Studio"
            aria-label="Agency Profile and How It Works"
          >
            <HelpCircle className="h-3.5 w-3.5 text-amber-300" />
            <span className="hidden xl:inline">How It Works</span>
          </button>

          {workflowPhase !== "IDLE" && (
            <button
              type="button"
              onClick={resetStudio}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-slate-300 transition hover:bg-white/15 hover:text-white disabled:opacity-40 cursor-pointer"
              title="Reset Studio"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* MIDDLE ROW */}
      <div className="relative my-2 flex min-h-0 flex-1 items-stretch justify-between gap-3 overflow-hidden">
        {/* LEFT PANEL: OBROLAN & REVISI LIVE 7 DIVISI */}
        {isChatOpen ? (
          <aside className="pointer-events-auto flex min-h-0 max-h-full w-full max-w-[375px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950/82 text-white shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
                <h2 className="truncate text-[11px] font-bold tracking-wide text-white">
                  {finalDeliverable ? "OBROLAN & REVISI 7 DIVISI" : "OBROLAN & PERINTAH TIM"}
                </h2>
              </div>

              <div className="flex items-center gap-1">
                <span
                  title="Popup obrolan otomatis menghilang setelah 3 menit"
                  className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9.5px] text-slate-300"
                >
                  {formattedChatTimer}
                </span>
                <button
                  type="button"
                  onClick={triggerAgentBanter}
                  disabled={isChatting}
                  title="Picu obrolan spontan antar 7 divisi"
                  className="inline-flex items-center gap-1 rounded-lg border border-sky-400/35 bg-sky-500/15 px-2 py-1 text-[10px] font-semibold text-sky-200 transition hover:bg-sky-500/25 disabled:opacity-40 cursor-pointer"
                >
                  <Users className="h-3 w-3" />
                  <span>Ngobrol Tim</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  title="Lipat jendela obrolan"
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable 7-Division Agent Target Selector */}
            <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 bg-white/[0.03] px-2.5 py-1.5">
              {CHAT_TARGETS.map((t) => {
                const active = chatTarget === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setChatTarget(t.id)}
                    title={`${t.label} — ${t.roleShort}`}
                    className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10.5px] font-semibold transition cursor-pointer ${
                      active
                        ? "bg-amber-400 text-slate-950 shadow-sm"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {t.dotColor && (
                      <span
                        className="h-2 w-2 rounded-full ring-1 ring-white/40"
                        style={{ backgroundColor: t.dotColor }}
                      />
                    )}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {finalDeliverable && (
              <div className="shrink-0 border-b border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] text-emerald-200">
                <span className="font-bold text-emerald-300">Mode Revisi 7 Divisi:</span> DM Leo,
                Sora, Raka, Nadia, atau Bima untuk merevisi bagian mana pun secara live!
              </div>
            )}

            {/* Cloud Message Feed */}
            <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2.5">
              {chatMessages.map((msg) => {
                const isCeo = msg.sender === "ceo";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCeo ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[92%] rounded-2xl px-3 py-2 text-xs shadow-md ${
                        isCeo
                          ? "rounded-br-sm border border-amber-400/40 bg-gradient-to-br from-amber-400/25 to-orange-500/20 text-amber-50"
                          : "rounded-bl-sm border border-white/15 bg-white/[0.07] text-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span
                            className="h-2 w-2 rounded-full ring-1 ring-white/30"
                            style={{ backgroundColor: msg.accentColor }}
                          />
                          <span className={isCeo ? "text-amber-200" : "text-white"}>
                            {msg.senderName}
                          </span>
                          <span className="rounded-full bg-white/10 px-1.5 text-[9px] font-semibold text-sky-200">
                            → {RECIPIENT_DISPLAY[msg.to]}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-slate-400">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 leading-relaxed text-[11.5px]">{msg.text}</p>
                    </div>
                  </div>
                );
              })}

              {isChatting && (
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-slate-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                  <span>Tim agent sedang memproses balasan...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Chips */}
            <div className="flex shrink-0 gap-1.5 overflow-x-auto border-t border-white/10 px-2.5 py-1.5">
              {activeChatChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={isChatting}
                  onClick={() => sendCeoChat(chatTarget, chip)}
                  className="shrink-0 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-slate-200 transition hover:border-amber-400/50 hover:bg-amber-400/15 hover:text-amber-100 disabled:opacity-40 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSendChat}
              className="flex shrink-0 items-center gap-1.5 border-t border-white/10 bg-slate-900/75 p-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                  touchChatPopup();
                }}
                onFocus={() => touchChatPopup()}
                disabled={isChatting}
                placeholder={
                  finalDeliverable
                    ? `Minta revisi atau chat ke ${targetDisplayName}...`
                    : `Pesan/tugas ke ${targetDisplayName}...`
                }
                className="flex-1 rounded-xl border border-white/15 bg-slate-950/80 px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:border-amber-400/60 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isChatting || !chatInput.trim()}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-950 shadow-md transition hover:brightness-110 disabled:opacity-40 cursor-pointer"
                title="Kirim pesan"
              >
                {isChatting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </form>
          </aside>
        ) : (
          <div className="pointer-events-auto flex flex-col items-start gap-2 self-start pt-1">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/74 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-xl transition hover:border-amber-400/50 hover:bg-slate-900/90 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4 text-amber-400" />
              <span>{finalDeliverable ? "Revisi / Chat 7 Divisi" : "Obrolan 7 Divisi"}</span>
              <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
                {chatMessages.length}
              </span>
            </button>

            <button
              type="button"
              onClick={triggerAgentBanter}
              disabled={isChatting}
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-slate-950/68 px-3 py-1.5 text-[11px] font-semibold text-sky-200 shadow-lg backdrop-blur-xl transition hover:bg-sky-500/20 disabled:opacity-40 cursor-pointer"
            >
              {isChatting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Users className="h-3.5 w-3.5" />
              )}
              <span>Picu Ngobrol Tim</span>
            </button>
          </div>
        )}

        {/* CENTER ERROR TOAST */}
        {error && (
          <div className="pointer-events-auto absolute left-1/2 top-0 z-40 w-full max-w-md -translate-x-1/2 rounded-2xl border border-rose-400/40 bg-rose-950/92 p-3 text-xs text-rose-100 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
              <div className="flex-1 leading-relaxed">
                <div className="font-semibold text-rose-200">Notifikasi Orkestrasi</div>
                <p className="mt-0.5 text-rose-100/90">{error}</p>
              </div>
              <button
                type="button"
                onClick={clearError}
                className="rounded-lg p-1 text-rose-200 hover:bg-white/10 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* RIGHT PANEL: LOG KANTOR & 7-TAB LAUNCH KIT DRAWER */}
        {isDrawerOpen ? (
          <aside className="pointer-events-auto flex min-h-0 max-h-full w-full max-w-[390px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950/82 text-white shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="flex items-center gap-1 rounded-xl bg-white/5 p-0.5">
                <button
                  type="button"
                  onClick={() => setDrawerSection("logs")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold transition cursor-pointer ${
                    drawerSection === "logs"
                      ? "bg-white/15 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Activity className="h-3.5 w-3.5 text-sky-400" />
                  Log Kantor
                  <span className="rounded-full bg-white/10 px-1.5 text-[9.5px] text-slate-300">
                    {telemetryLogs.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerSection("deliverables")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold transition cursor-pointer ${
                    drawerSection === "deliverables"
                      ? "bg-white/15 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5 text-amber-400" />
                  Launch Kit
                  {finalDeliverable && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-wider ${phaseMeta.color}`}
                >
                  {phaseMeta.label}
                </span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  title="Lipat panel log"
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {drawerSection === "logs" ? (
              <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
                {telemetryLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sky-300">{log.agent}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="mt-1 leading-relaxed text-slate-200">{log.action}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {!finalDeliverable ? (
                  <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-400">
                      <Printer className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">
                      Launch Kit 7 Divisi Belum Dicetak
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Jalankan Sample Launch Mission atau masukkan brief produk. Seluruh 7 divisi
                      (termasuk Sosmed, Finance, HR &amp; Audit QC Bima) akan mencetak paket
                      lengkapnya di sini.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Scrollable 7-Division Deliverable Tabs */}
                    <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 p-2">
                      {DELIVERABLE_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeDeliverableTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveDeliverableTab(tab.id)}
                            className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10.5px] font-semibold transition cursor-pointer ${
                              active
                                ? "bg-amber-400 text-slate-950 shadow-sm"
                                : "bg-white/5 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2.5">
                      {/* Bima's Official Product QC & Launch Audit Certificate Banner */}
                      {activeDeliverableTab === "qcAuditReport" && finalDeliverable.qcCertificate && (
                        <div className="rounded-xl border border-emerald-400/40 bg-gradient-to-br from-emerald-950/75 via-slate-900/90 to-slate-950 p-3 text-[11px] shadow-lg">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              PRODUCT QC CERTIFICATE
                            </span>
                            <span className="rounded-full bg-emerald-400/20 border border-emerald-400/40 px-2 py-0.5 font-mono text-[10.5px] font-bold text-emerald-200">
                              {finalDeliverable.qcCertificate.score}/100
                            </span>
                          </div>
                          <div className="mt-1.5 text-xs font-bold text-white">
                            ✅ {finalDeliverable.qcCertificate.status}
                          </div>
                          <div className="mt-2 space-y-1 text-[10.5px] text-slate-200">
                            <p>• <strong className="text-emerald-200">Copy vs. Pricing:</strong> {finalDeliverable.qcCertificate.copyVsPricing}</p>
                            <p>• <strong className="text-emerald-200">Social vs. Funnel:</strong> {finalDeliverable.qcCertificate.socialVsFunnel}</p>
                            <p>• <strong className="text-emerald-200">SOP vs. SLA:</strong> {finalDeliverable.qcCertificate.sopVsSla}</p>
                          </div>
                          <p className="mt-2 border-t border-white/10 pt-1.5 italic text-[10.5px] text-emerald-100/90">
                            &ldquo;{finalDeliverable.qcCertificate.auditorSignOff}&rdquo; — Bima (QC)
                          </p>
                        </div>
                      )}

                      {handoffSummary && (
                        <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-[11px] leading-relaxed text-emerald-100">
                          <span className="font-semibold text-emerald-300">
                            Alex &amp; Bima (QC):{" "}
                          </span>
                          {handoffSummary}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-900/80 p-3 font-sans text-xs leading-relaxed text-slate-100">
                        {finalDeliverable[activeDeliverableTab]}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 border-t border-white/10 p-2.5">
                      <button
                        type="button"
                        onClick={handleCopyActiveTab}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/15 cursor-pointer"
                      >
                        {copiedTab === activeDeliverableTab ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Salin
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadMarkdown}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-105 cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Launch Kit (.md)
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </aside>
        ) : (
          <div className="pointer-events-auto flex flex-col items-end gap-2 self-start pt-1">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/74 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-xl transition hover:border-sky-400/50 hover:bg-slate-900/90 cursor-pointer"
            >
              <Activity className="h-3.5 w-3.5 text-sky-400" />
              <span>{finalDeliverable ? "Buka Launch Kit 7-Div" : "Log Kantor"}</span>
              {finalDeliverable ? (
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] text-slate-200">
                  {telemetryLogs.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM COLLAPSIBLE / EXPANDABLE COMMAND HUD */}
      <footer
        className={`pointer-events-auto mx-auto w-full transition-all duration-300 ease-out ${
          isCommandExpanded ? "max-w-5xl" : "max-w-2xl"
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-950/82 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2.5 px-3.5 py-2">
            <button
              type="button"
              onClick={() => setCommandExpanded(!isCommandExpanded)}
              className="flex shrink-0 items-center gap-2 text-left transition hover:opacity-90 cursor-pointer"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                <Rocket className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold tracking-wide text-white">
                HUD PERINTAH CEO
              </span>
              <span
                className={`hidden sm:inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-wider ${phaseMeta.color}`}
              >
                {phaseMeta.label}
              </span>
            </button>

            {/* Scrollable 7-Division Agent DM Pills */}
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
              {agentList.map((ag) => (
                <button
                  key={ag.id}
                  type="button"
                  onClick={() => setChatTarget(ag.id)}
                  title={`Klik untuk DM ${ag.name} (${ag.role})`}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] text-slate-200 transition hover:border-amber-400/50 hover:bg-white/10 cursor-pointer"
                >
                  <span
                    className="h-2 w-2 rounded-full ring-1 ring-white/40"
                    style={{ backgroundColor: ag.accentColor }}
                  />
                  <span className="font-semibold">{ag.name}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCommandExpanded(!isCommandExpanded)}
              className="flex items-center gap-1.5 shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold text-amber-300 transition hover:bg-white/10 cursor-pointer"
            >
              <span>{isCommandExpanded ? "Gulir Tutup" : "Bentangkan"}</span>
              {isCommandExpanded ? (
                <ChevronDown className="h-4 w-4 transition-transform" />
              ) : (
                <ChevronUp className="h-4 w-4 transition-transform" />
              )}
            </button>
          </div>

          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
              isCommandExpanded
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="max-h-[40vh] overflow-y-auto border-t border-white/10 px-3.5 py-3 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-sky-500/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        handleRunSampleMission(
                          SAMPLE_LAUNCH_MISSIONS[
                            Math.floor(Math.random() * SAMPLE_LAUNCH_MISSIONS.length)
                          ]
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400/90 px-2.5 py-1 text-[11px] font-bold text-slate-950 shadow-sm transition hover:bg-amber-300 disabled:opacity-40 cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-slate-950" />
                      Run Sample Launch Mission
                    </button>
                    <span className="hidden sm:inline text-[10.5px] text-slate-300">
                      atau pilih preset 1-klik:
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {SAMPLE_LAUNCH_MISSIONS.map((mission) => (
                      <button
                        key={mission}
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleRunSampleMission(mission)}
                        className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-slate-950/65 px-2.5 py-1 text-[10.5px] font-medium text-slate-100 transition hover:border-amber-400/60 hover:bg-amber-400/15 hover:text-amber-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Sparkles className="h-2.5 w-2.5 text-amber-400 shrink-0" />
                        <span>{mission}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleDeploy} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={briefInput}
                    onChange={(e) => setBriefInput(e.target.value)}
                    disabled={isProcessing}
                    placeholder="Tulis ide produk digitalmu lalu deploy seluruh 7 divisi (termasuk Sosmed, Finance, HR & QC)..."
                    className="flex-1 rounded-xl border border-white/15 bg-slate-900/80 px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/20 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !briefInput.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 px-5 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Mengorkestrasi...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4" />
                        Deploy 7 Divisi
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* AGENCY PROFILE / HOW IT WORKS MODAL (7 DIVISIONS) */}
      {isInfoModalOpen && (
        <div
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-md"
          onClick={() => setIsInfoModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-slate-950/94 text-white shadow-2xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-[#141517] via-slate-900 to-[#F04A1A]/15 px-6 py-4">
              <div className="flex flex-wrap items-center gap-3.5">
                <BrickLaunchHorizontalLogo />
                <div className="border-l border-white/15 pl-3.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                    <ShieldCheck className="h-3 w-3" />
                    7 Autonomous Divisions · Server-Side AI Core
                  </span>
                  <p className="mt-1 text-xs text-slate-300">
                    Autonomous Digital Product Launch Agency — 3D Virtual Office + Multi-Agent AI
                    Orchestration
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Kampus Dual-Wing 24m × 10m &amp; Arsitektur 7 Divisi
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-200">
                  <strong>BrickLaunch Studio</strong> kini beroperasi di kampus dua sayap lega{" "}
                  <strong>West Wing (Executive, Research, Copy &amp; Social Media + Copier)</strong>{" "}
                  dan <strong>East Wing (Finance, HR, Product QC &amp; Pantry Bar)</strong> yang
                  terhubung oleh <strong>pintu kaca otomatis berengsel</strong> di titik{" "}
                  <code>[0, 0, -0.5]</code> — menghasilkan{" "}
                  <strong>Master Launch Kit 7-BAB</strong> lengkap dengan{" "}
                  <strong>Sertifikat Audit QC Resmi</strong>.
                </p>
              </div>

              <div>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-sky-300">
                  Roster Lengkap 7 Divisi (West Wing &amp; East Wing)
                </h3>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {AGENT_PROFILE_CARDS.map((card) => (
                    <div
                      key={card.name}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full ring-2"
                            style={{
                              backgroundColor: card.color,
                              boxShadow: `0 0 0 2px ${card.ring}`,
                            }}
                          />
                          <span className="text-sm font-bold text-white">{card.name}</span>
                        </div>
                        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-slate-300">
                          {card.wing}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] font-semibold text-amber-300/95">
                        {card.role}
                      </div>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
                        {card.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                  Struktur Master Launch Kit 7-BAB (.md) + Sertifikat QC
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {CHAPTER_OVERVIEW.map((ch) => (
                    <div
                      key={ch.bab}
                      className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 rounded-md bg-amber-400/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                          {ch.bab}
                        </span>
                        <span className="truncate text-[11px] font-semibold text-white">
                          {ch.title}
                        </span>
                      </div>
                      <span className="shrink-0 text-[10px] text-slate-400">{ch.owner}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  7-Tahap Alur Kerja Human-in-the-Loop + Pre-Launch QC
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {WORKFLOW_STEPS.map((item) => (
                    <div
                      key={item.step}
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 font-mono text-[11px] font-bold text-amber-300">
                        {item.step}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{item.title}</span>
                          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] text-slate-300">
                            {item.actor}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-slate-900/70 px-6 py-3">
              <span className="text-[11px] text-slate-400">
                Tip: Klik karakter Lego 3D dari divisi mana saja untuk langsung DM atau minta revisi!
              </span>
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 text-xs font-bold text-slate-950 transition hover:brightness-110 cursor-pointer"
              >
                Masuk ke Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HUMAN-IN-THE-LOOP CEO APPROVAL MODAL */}
      {workflowPhase === "AWAITING_CEO_APPROVAL" && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-slate-950/94 text-white shadow-2xl">
            <div className="shrink-0 border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/60 px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-rose-200">
                    GERBANG PERSETUJUAN CEO
                  </span>
                  <span className="text-xs text-slate-400">
                    Alex menjeda alur kerja untuk ACC kamu
                  </span>
                </div>
                <span className="text-xs font-medium text-sky-300 truncate max-w-[240px]">
                  Brief: {ceoBrief}
                </span>
              </div>
              <h2 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-white">
                Pilih 1 Marketing Angle Peluncuran
              </h2>
              {managerReport && (
                <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white">Alex (AI Manager): </span>
                  {managerReport}
                </p>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-5">
              <div className="rounded-2xl border border-sky-400/25 bg-sky-500/10 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0284C7] ring-2 ring-sky-300/40" />
                  Hasil Riset Pasar (Maya) + Validasi Finance (Raka) &amp; HR (Nadia)
                </div>
                <p className="mt-2 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-slate-100">
                  {researchSummary}
                </p>

                {researchSources.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-sky-400/20 pt-2.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-300/80 mr-1">
                      Sumber Riset:
                    </span>
                    {researchSources.map((src) => (
                      <a
                        key={src.url}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-slate-950/60 px-2.5 py-0.5 text-[10.5px] text-sky-200 transition hover:bg-sky-400/20"
                      >
                        <span className="max-w-[160px] truncate">{src.title}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
                {marketingAngles.map((angle, index) => (
                  <div
                    key={angle.id}
                    className="group flex flex-col justify-between rounded-2xl border border-white/15 bg-white/[0.04] p-4 transition hover:border-amber-400/60 hover:bg-amber-400/[0.08]"
                  >
                    <div>
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        Angle 0{index + 1}
                      </span>
                      <h3 className="mt-2.5 text-sm font-bold text-white leading-snug">
                        {angle.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-200">
                        &ldquo;{angle.hook}&rdquo;
                      </p>
                      <div className="mt-3 rounded-xl bg-slate-900/75 px-2.5 py-2 text-[11px] text-slate-300">
                        <span className="font-semibold text-slate-400">Target: </span>
                        {angle.targetAudience}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => approveAngle(angle.id)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:brightness-110 disabled:opacity-45 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      ACC &amp; Produksi 7 Divisi + QC
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
