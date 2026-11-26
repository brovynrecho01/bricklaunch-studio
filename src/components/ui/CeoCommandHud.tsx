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
  Coffee,
  Copy,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  Maximize2,
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
  Users,
  Video,
  X,
} from "lucide-react";
import { BrickLaunchHorizontalLogo } from "./BrickLaunchLogo";
import {
  CameraPreset,
  ChatRecipient,
  ChatTarget,
  FinalDeliverable,
  useAgencyStore,
  WorkflowPhase,
} from "@/store/useAgencyStore";

const SAMPLE_LAUNCH_MISSIONS = [
  "Template Notion: Freelance Finance & Tax OS",
  "AI Prompt Engineering Playbook untuk Solopreneur",
  "Micro-SaaS: Automated Invoice & Client Tracker",
] as const;

const QUICK_CHAT_CHIPS = [
  "Ngobrol santai dulu yuk!",
  "Gimana kabar & progress kantor?",
  "Maya, tren produk digital apa yang lagi naik?",
] as const;

const REVISION_CHAT_CHIPS = [
  "Leo, bikin hook videonya lebih agresif!",
  "Alex, tolong perhalus copy landing page-nya",
  "Leo, buat utas peluncurannya lebih relatable",
] as const;

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "CEO Brief",
    actor: "Human CEO",
    desc: "Kamu mengirim ide produk digital mentah atau menekan 1-klik Sample Launch Mission.",
  },
  {
    step: "02",
    title: "Maya Market & Psychology Research",
    actor: "Maya · Researcher",
    desc: "Maya berjalan ke meja riset untuk membedah pain point pembeli, psikologi konsumen, dan celah kompetitor.",
  },
  {
    step: "03",
    title: "Alex Pre-Production Report (3 Angles)",
    actor: "Alex · AI Manager",
    desc: "Maya menyerahkan dossier ke Meja Manager; Alex menyintesis 3 Marketing Angle yang kontras.",
  },
  {
    step: "04",
    title: "Human-in-the-Loop CEO Approval",
    actor: "Human CEO",
    desc: "Alur dijeda di Gerbang ACC agar kamu meninjau riset dan memilih 1 angle pemenang.",
  },
  {
    step: "05",
    title: "Leo Conversion Copy Drafting",
    actor: "Leo · Copywriter",
    desc: "Alex memberi brief ke Leo untuk menulis Landing Page, Utas 5-bagian X/Threads, dan Skrip Video 45 detik.",
  },
  {
    step: "06",
    title: "Alex QA & Live DM Revision Loop",
    actor: "Alex & Leo",
    desc: "Kapan pun setelah jadi, kamu bisa DM Leo atau Alex di chat untuk merevisi bagian mana pun secara live.",
  },
  {
    step: "07",
    title: "Leo Copier Printing & .md Export",
    actor: "Leo · Copier Zone",
    desc: "Leo mencetak paket akhir di mesin fotokopi 3D dan menghasilkan Launch Kit Markdown (.md) siap unduh.",
  },
] as const;

const CAMERA_BUTTONS: Array<{
  id: CameraPreset;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "overview", label: "Overview", icon: Camera },
  { id: "workstations", label: "Workstations", icon: Monitor },
  { id: "pantry", label: "Pantry Bar", icon: Coffee },
  { id: "copier", label: "Copier", icon: Printer },
];

const CHAT_TARGETS: Array<{
  id: ChatTarget;
  label: string;
  dotColor?: string;
}> = [
  { id: "all", label: "Semua Tim" },
  { id: "manager", label: "Alex", dotColor: "#60A5FA" },
  { id: "researcher", label: "Maya", dotColor: "#0284C7" },
  { id: "copywriter", label: "Leo", dotColor: "#D97706" },
];

const RECIPIENT_DISPLAY: Record<ChatRecipient, string> = {
  ceo: "CEO",
  all: "Semua Tim",
  manager: "Alex",
  researcher: "Maya",
  copywriter: "Leo",
};

const PHASE_LABELS: Record<WorkflowPhase, { label: string; color: string }> = {
  IDLE: { label: "STANDBY", color: "text-slate-300 bg-white/10 border-white/15" },
  RESEARCHING: {
    label: "MAYA RISET",
    color: "text-sky-200 bg-sky-500/20 border-sky-400/35",
  },
  AWAITING_CEO_APPROVAL: {
    label: "TUNGGU ACC CEO",
    color: "text-rose-100 bg-rose-500/25 border-rose-400/45",
  },
  COPYWRITING: {
    label: "LEO NULIS COPY",
    color: "text-amber-100 bg-amber-500/25 border-amber-400/45",
  },
  PRINTING_DELIVERABLE: {
    label: "PRINT LAUNCH KIT",
    color: "text-violet-100 bg-violet-500/25 border-violet-400/45",
  },
  COMPLETED: {
    label: "LAUNCH KIT SIAP",
    color: "text-emerald-100 bg-emerald-500/25 border-emerald-400/45",
  },
};

type DeliverableTab = keyof FinalDeliverable;

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
  const [copiedTab, setCopiedTab] = useState<DeliverableTab | null>(null);
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

    const markdown = [
      `# BRICKLAUNCH STUDIO — Autonomous Launch Kit`,
      ``,
      `**Brief Produk:** ${ceoBrief}`,
      selectedAngle
        ? `**Angle Disetujui:** ${selectedAngle.title} — ${selectedAngle.hook}`
        : "",
      selectedAngle ? `**Target Audiens:** ${selectedAngle.targetAudience}` : "",
      `**Waktu Generate:** ${new Date().toLocaleString("id-ID")}`,
      ``,
      `---`,
      ``,
      `## Ringkasan Riset Pasar (Maya — Market & Psychology Researcher)`,
      ``,
      researchSummary || "_Belum ada ringkasan riset._",
      ``,
      `---`,
      ``,
      `## 1. Copy Landing Page Konversi (Leo — Copywriter)`,
      ``,
      finalDeliverable.landingPageCopy,
      ``,
      `---`,
      ``,
      `## 2. Utas Peluncuran Viral (X / Threads)`,
      ``,
      finalDeliverable.launchThread,
      ``,
      `---`,
      ``,
      `## 3. Skrip Video Pendek 45 Detik (TikTok / Reels)`,
      ``,
      finalDeliverable.shortVideoScript,
      ``,
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bricklaunch-${slug || "kit"}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const phaseMeta = PHASE_LABELS[workflowPhase];
  const agentList = [agents.manager, agents.researcher, agents.copywriter];
  const targetDisplayName =
    chatTarget === "all"
      ? "Semua Tim"
      : chatTarget === "manager"
        ? "Alex (Manager)"
        : chatTarget === "researcher"
          ? "Maya (Riset)"
          : "Leo (Copywriter)";

  const activeChatChips = finalDeliverable ? REVISION_CHAT_CHIPS : QUICK_CHAT_CHIPS;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-2.5 sm:p-4">
      {/* TOP BAR (Compact & Portfolio-Ready) */}
      <header className="pointer-events-auto flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/15 bg-slate-950/72 px-3.5 py-2 shadow-2xl backdrop-blur-xl">
        {/* Studio Brand Identity (Horizontal Header Lockup) */}
        <div className="flex items-center gap-3 min-w-0">
          <BrickLaunchHorizontalLogo compact />
          <div className="hidden md:flex flex-col min-w-0 border-l border-white/15 pl-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 text-[9.5px] font-semibold tracking-widest text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI CORE // CONNECTED
              </span>
            </div>
            <p className="hidden lg:block mt-0.5 truncate text-[10.5px] text-slate-300/85">
              From Raw Idea to Launch-Ready Digital Product — Orchestrated by Autonomous Agents.
            </p>
          </div>
        </div>

        {/* Camera Presets & Panel Controls */}
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
                  title={`Kamera: ${btn.label}`}
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
            title="Buka/Lipat Jendela Obrolan & Revisi Live"
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

          {/* Mode Lega (Toggle Focus 3D) */}
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

          {/* Agency Profile / How It Works (?) Button */}
          <button
            type="button"
            onClick={() => setIsInfoModalOpen(true)}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:border-amber-400/60 hover:bg-amber-400/20 hover:text-amber-100 cursor-pointer"
            title="Profil Agensi & Cara Kerja 7-Tahap BrickLaunch Studio"
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

      {/* MIDDLE ROW: SLIDING LEFT CHAT + CENTER TOAST + SLIDING RIGHT DRAWER */}
      <div className="relative my-2 flex min-h-0 flex-1 items-stretch justify-between gap-3 overflow-hidden">
        {/* LEFT SIDE: FLOATING LAUNCHER OR EXPANDED CLOUD CHAT PANEL */}
        {isChatOpen ? (
          <aside className="pointer-events-auto flex min-h-0 max-h-full w-full max-w-[360px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950/80 text-white shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-[11px] font-bold tracking-wide text-white">
                    {finalDeliverable ? "OBROLAN & REVISI LIVE" : "OBROLAN & PERINTAH AGENT"}
                  </h2>
                </div>
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
                  title="Picu Alex, Maya, dan Leo untuk saling ngobrol"
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

            {/* Agent Target Selector */}
            <div className="flex shrink-0 items-center gap-1 border-b border-white/10 bg-white/[0.03] px-2.5 py-1.5">
              {CHAT_TARGETS.map((t) => {
                const active = chatTarget === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setChatTarget(t.id)}
                    className={`inline-flex flex-1 items-center justify-center gap-1 rounded-lg px-1.5 py-1 text-[10.5px] font-semibold transition cursor-pointer ${
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
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Revision Hint Banner when deliverable exists */}
            {finalDeliverable && (
              <div className="shrink-0 border-b border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] text-emerald-200">
                <span className="font-bold text-emerald-300">Mode Revisi Aktif:</span> DM Leo atau
                Alex untuk mengubah copy Landing Page, Thread, atau Skrip Video secara langsung!
              </div>
            )}

            {/* Scrollable Cloud Message Feed */}
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

            {/* Quick Chat / Live Revision Chips */}
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

            {/* Chat / Command Input */}
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
          /* Compact Floating Pill on Left Edge when Chat is Folded */
          <div className="pointer-events-auto flex flex-col items-start gap-2 self-start pt-1">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/74 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-xl transition hover:border-amber-400/50 hover:bg-slate-900/90 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4 text-amber-400" />
              <span>{finalDeliverable ? "Revisi / Chat Agent" : "Obrolan Agent"}</span>
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

        {/* RIGHT SIDE: FLOATING LAUNCHER OR EXPANDED LOG/LAUNCH KIT DRAWER */}
        {isDrawerOpen ? (
          <aside className="pointer-events-auto flex min-h-0 max-h-full w-full max-w-[360px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950/80 text-white shadow-2xl backdrop-blur-xl transition-all duration-300">
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
                  className={`rounded-full border px-2 py-0.5 text-[9.5px] font-semibold tracking-wider ${phaseMeta.color}`}
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
                      Launch Kit Belum Dicetak
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Jalankan salah satu Sample Launch Mission atau masukkan brief produk di
                      bawah. Leo akan mencetak hasil lengkapnya di sini.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid shrink-0 grid-cols-3 gap-1 border-b border-white/10 p-2">
                      {(
                        [
                          { id: "landingPageCopy", label: "Landing", icon: FileText },
                          { id: "launchThread", label: "Thread", icon: MessageSquareText },
                          { id: "shortVideoScript", label: "Video 45d", icon: Video },
                        ] as const
                      ).map((tab) => {
                        const Icon = tab.icon;
                        const active = activeDeliverableTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveDeliverableTab(tab.id)}
                            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-semibold transition cursor-pointer ${
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

                    <div className="min-h-0 flex-1 overflow-y-auto p-3">
                      {handoffSummary && (
                        <div className="mb-2.5 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-[11px] leading-relaxed text-emerald-100">
                          <span className="font-semibold text-emerald-300">Alex &amp; Leo: </span>
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
                        Download Markdown (.md)
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </aside>
        ) : (
          /* Compact Floating Pill on Right Edge when Drawer is Folded */
          <div className="pointer-events-auto flex flex-col items-end gap-2 self-start pt-1">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/74 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-xl transition hover:border-sky-400/50 hover:bg-slate-900/90 cursor-pointer"
            >
              <Activity className="h-3.5 w-3.5 text-sky-400" />
              <span>{finalDeliverable ? "Buka Launch Kit" : "Log Kantor"}</span>
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

      {/* BOTTOM COLLAPSIBLE / EXPANDABLE COMMAND HUD + LIVE DEMO MISSION BAR */}
      <footer
        className={`pointer-events-auto mx-auto w-full transition-all duration-300 ease-out ${
          isCommandExpanded ? "max-w-4xl" : "max-w-xl"
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-950/80 shadow-2xl backdrop-blur-xl">
          {/* Interactive Roll/Expand Handle Bar (no nested interactive elements) */}
          <div className="flex items-center justify-between gap-3 px-3.5 py-2">
            <button
              type="button"
              onClick={() => setCommandExpanded(!isCommandExpanded)}
              className="flex flex-1 items-center gap-2 min-w-0 text-left transition hover:opacity-90 cursor-pointer"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                <Rocket className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold tracking-wide text-white truncate">
                HUD PERINTAH CEO
              </span>
              <span
                className={`hidden sm:inline-flex rounded-full border px-2 py-0.5 text-[9.5px] font-semibold tracking-wider ${phaseMeta.color}`}
              >
                {phaseMeta.label}
              </span>
            </button>

            {/* Compact Live Agent Roster Dots (Click to DM agent) */}
            <div className="hidden md:flex items-center gap-1.5">
              {agentList.map((ag) => (
                <button
                  key={ag.id}
                  type="button"
                  onClick={() => setChatTarget(ag.id)}
                  title={`Klik untuk DM ${ag.name} (${ag.role})`}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] text-slate-200 transition hover:border-amber-400/50 hover:bg-white/10 cursor-pointer"
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

          {/* Smooth Collapsible & Scrollable Body */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
              isCommandExpanded
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="max-h-[40vh] overflow-y-auto border-t border-white/10 px-3.5 py-3 space-y-2.5">
                {/* One-Click "Run Sample Launch Mission" Quick-Start Bar */}
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

                {/* CEO Brief Deployment Form */}
                <form onSubmit={handleDeploy} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={briefInput}
                    onChange={(e) => setBriefInput(e.target.value)}
                    disabled={isProcessing}
                    placeholder="Tulis ide produk digitalmu sendiri lalu tekan Deploy Agents..."
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
                        Deploy Agents
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* AGENCY PROFILE / HOW IT WORKS MODAL (z-50) */}
      {isInfoModalOpen && (
        <div
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-md"
          onClick={() => setIsInfoModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-slate-950/94 text-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-[#141517] via-slate-900 to-[#F04A1A]/15 px-6 py-4">
              <div className="flex flex-wrap items-center gap-3.5">
                <BrickLaunchHorizontalLogo />
                <div className="border-l border-white/15 pl-3.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                    <ShieldCheck className="h-3 w-3" />
                    Server-Side AI Core
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

            {/* Modal Content */}
            <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-6">
              {/* Company Profile & Architecture */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Profil Agensi &amp; Arsitektur Sistem
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-200">
                  <strong>BrickLaunch Studio</strong> mengubah ide produk digital mentah menjadi
                  Launch Kit siap jual melalui kolaborasi 3 agen AI otonom di dalam simulasi kantor
                  virtual 3D WebGL. Seluruh panggilan Google Gemini API dieksekusi ketat di server
                  Next.js (zero client API key exposure) dengan koreografi spasial real-time.
                </p>
              </div>

              {/* Agent Roster */}
              <div>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-sky-300">
                  Tim Agen Otonom (Lego Minifigure Roster)
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#1E293B] ring-2 ring-[#60A5FA]" />
                      <span className="text-sm font-bold text-white">Alex</span>
                    </div>
                    <div className="mt-0.5 text-[11px] font-semibold text-sky-300">
                      AI Manager / Handoff Orchestrator
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
                      Tenang, terstruktur, dan tegas. Memecah brief CEO, menyintesis 3 marketing
                      angle, menjaga gerbang ACC, dan memimpin QA final.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#0284C7] ring-2 ring-sky-300/60" />
                      <span className="text-sm font-bold text-white">Maya</span>
                    </div>
                    <div className="mt-0.5 text-[11px] font-semibold text-sky-300">
                      Market &amp; Psychology Researcher
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
                      Analitis, kritis, dan terobsesi psikologi konsumen. Membongkar pain point
                      audiens serta celah kompetitor berbasis riset.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#D97706] ring-2 ring-amber-300/60" />
                      <span className="text-sm font-bold text-white">Leo</span>
                    </div>
                    <div className="mt-0.5 text-[11px] font-semibold text-amber-300">
                      Conversion Copywriter
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
                      Punchy, kreatif, dan berfokus konversi. Menulis Landing Page, Utas Viral X/Threads,
                      Skrip Video 45d, serta siap revisi live via DM.
                    </p>
                  </div>
                </div>
              </div>

              {/* 7-Step Human-in-the-Loop Workflow */}
              <div>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  7-Tahap Alur Kerja Human-in-the-Loop
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
                        <div className="flex items-center gap-2">
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

            {/* Modal Footer */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-slate-900/70 px-6 py-3">
              <span className="text-[11px] text-slate-400">
                Tip: Klik karakter Lego 3D mana saja untuk langsung DM!
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

      {/* HUMAN-IN-THE-LOOP CEO APPROVAL MODAL (z-50 above everything) */}
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
                  Hasil Riset Pasar &amp; Psikologi Maya
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
                      ACC &amp; Tugaskan Leo
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
