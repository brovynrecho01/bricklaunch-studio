import { create } from "zustand";
import {
  IS_STATIC_DEMO_MODE,
  runStaticDemoApproveAngle,
  runStaticDemoChat,
  runStaticDemoStartBrief,
} from "@/lib/staticDemoEngine";

export type Vec3 = [number, number, number];

/** 3 menit (180.000 ms) durasi tampil popup obrolan agent sebelum otomatis menghilang */
export const CHAT_POPUP_TTL_MS = 3 * 60 * 1000;

/**
 * Office World Coordinates (12m x 10m floor centered at [0, 0, 0])
 */
export const OFFICE_ZONES = {
  PANTRY_COFFEE_ZONE: [4.0, 0, -1.5] as Vec3,
  MANAGER_DESK: [-3.5, 0, -2.5] as Vec3,
  RESEARCHER_DESK: [-4.0, 0, 1.5] as Vec3,
  COPYWRITER_DESK: [-1.0, 0, 1.5] as Vec3,
  COPIER_PRINTER_ZONE: [0.5, 0, -3.5] as Vec3,
} as const;

export type OfficeZoneKey = keyof typeof OFFICE_ZONES;

export type AgentId = "manager" | "researcher" | "copywriter";
export type ChatSender = "ceo" | AgentId;
export type ChatRecipient = "ceo" | "all" | AgentId;
export type ChatTarget = "all" | AgentId;
export type StandbyActivity = "pantry" | "desk_sit" | "roam";

export type AgentStatus =
  | "IDLE_PANTRY"
  | "WALKING_TO_DESK"
  | "WORKING"
  | "WALKING_TO_COPIER"
  | "HANDOFF"
  | "WAITING_APPROVAL";

export type WorkflowPhase =
  | "IDLE"
  | "RESEARCHING"
  | "AWAITING_CEO_APPROVAL"
  | "COPYWRITING"
  | "PRINTING_DELIVERABLE"
  | "COMPLETED";

export type CameraPreset = "overview" | "workstations" | "pantry" | "copier";

export interface MarketingAngle {
  id: string;
  title: string;
  hook: string;
  targetAudience: string;
}

export interface ResearchSource {
  title: string;
  url: string;
}

export interface FinalDeliverable {
  landingPageCopy: string;
  launchThread: string;
  shortVideoScript: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
}

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  senderName: string;
  senderRole: string;
  to: ChatRecipient;
  text: string;
  timestamp: string;
  accentColor: string;
}

export interface AgentState {
  id: AgentId;
  name: string;
  role: string;
  fullTitle: string;
  torsoColor: string;
  accentColor: string;
  deskZone: OfficeZoneKey;
  status: AgentStatus;
  standbyActivity: StandbyActivity;
  targetPosition: Vec3;
  targetRotationY: number;
  bubbleText: string;
  bubbleTo: ChatRecipient | null;
  /** Epoch ms kapan speech cloud 3D otomatis menghilang (null = tersembunyi) */
  bubbleExpiresAt: number | null;
}

const AGENT_PANTRY_SPOTS: Record<AgentId, { pos: Vec3; rotY: number }> = {
  manager: {
    pos: [OFFICE_ZONES.PANTRY_COFFEE_ZONE[0] - 1.05, 0, OFFICE_ZONES.PANTRY_COFFEE_ZONE[2] - 1.15],
    rotY: Math.PI / 2,
  },
  researcher: {
    pos: [OFFICE_ZONES.PANTRY_COFFEE_ZONE[0] - 1.45, 0, OFFICE_ZONES.PANTRY_COFFEE_ZONE[2] + 0.05],
    rotY: Math.PI / 2,
  },
  copywriter: {
    pos: [OFFICE_ZONES.PANTRY_COFFEE_ZONE[0] - 1.05, 0, OFFICE_ZONES.PANTRY_COFFEE_ZONE[2] + 1.2],
    rotY: Math.PI / 2,
  },
};

const AGENT_DESK_SPOTS: Record<AgentId, { pos: Vec3; rotY: number }> = {
  manager: {
    pos: [OFFICE_ZONES.MANAGER_DESK[0], 0, OFFICE_ZONES.MANAGER_DESK[2] - 0.68],
    rotY: 0,
  },
  researcher: {
    pos: [OFFICE_ZONES.RESEARCHER_DESK[0], 0, OFFICE_ZONES.RESEARCHER_DESK[2] - 0.68],
    rotY: 0,
  },
  copywriter: {
    pos: [OFFICE_ZONES.COPYWRITER_DESK[0], 0, OFFICE_ZONES.COPYWRITER_DESK[2] - 0.68],
    rotY: 0,
  },
};

/** Titik jalan-jalan bebas hambatan di dalam studio 12m x 10m */
const ROAM_WAYPOINTS: Array<{ pos: Vec3; rotY: number; note: string }> = [
  { pos: [0.3, 0, -0.3], rotY: 0.4, note: "Jalan santai keliling ruang studio" },
  { pos: [1.5, 0, 2.3], rotY: -0.9, note: "Meregangkan kaki sambil cari inspirasi" },
  { pos: [-1.8, 0, -0.7], rotY: 1.2, note: "Mengecek suasana area meja kerja" },
  { pos: [-4.9, 0, -0.4], rotY: -Math.PI / 2, note: "Melihat pemandangan lewat jendela kantor" },
  { pos: [1.4, 0, -1.9], rotY: -0.5, note: "Jalan santai di koridor dekat copier" },
  { pos: [-2.4, 0, 3.2], rotY: 0.2, note: "Jalan sore santai di area depan studio" },
  { pos: [0.8, 0, 3.3], rotY: -2.5, note: "Brainstorming sambil jalan-jalan" },
];

const MANAGER_HANDOFF_SPOT = {
  pos: [OFFICE_ZONES.MANAGER_DESK[0], 0, OFFICE_ZONES.MANAGER_DESK[2] + 0.88] as Vec3,
  rotY: Math.PI,
};

const COPIER_OPERATE_SPOT = {
  pos: [OFFICE_ZONES.COPIER_PRINTER_ZONE[0], 0, OFFICE_ZONES.COPIER_PRINTER_ZONE[2] + 0.95] as Vec3,
  rotY: Math.PI,
};

const SENDER_META: Record<
  ChatSender,
  { name: string; role: string; color: string }
> = {
  ceo: { name: "Kamu (CEO)", role: "Founder", color: "#F59E0B" },
  manager: { name: "Alex", role: "AI Manager", color: "#475569" },
  researcher: { name: "Maya", role: "Market Researcher", color: "#0284C7" },
  copywriter: { name: "Leo", role: "Copywriter", color: "#D97706" },
};

/**
 * Mode standby awal yang natural:
 * - Alex duduk di meja manager sambil cek dashboard
 * - Maya ngopi santai di Pantry Bar
 * - Leo jalan-jalan santai di tengah ruangan studio
 */
const createInitialAgents = (): Record<AgentId, AgentState> => ({
  manager: {
    id: "manager",
    name: "Alex",
    role: "AI Manager",
    fullTitle: "Alex — AI Manager / Handoff Orchestrator",
    torsoColor: "#1E293B",
    accentColor: "#60A5FA",
    deskZone: "MANAGER_DESK",
    status: "WORKING",
    standbyActivity: "desk_sit",
    targetPosition: AGENT_DESK_SPOTS.manager.pos,
    targetRotationY: AGENT_DESK_SPOTS.manager.rotY,
    bubbleText: "Duduk di meja manager cek roadmap — siap terima brief CEO!",
    bubbleTo: "all",
    bubbleExpiresAt: null,
  },
  researcher: {
    id: "researcher",
    name: "Maya",
    role: "Market Researcher",
    fullTitle: "Maya — Market Researcher",
    torsoColor: "#0284C7",
    accentColor: "#38BDF8",
    deskZone: "RESEARCHER_DESK",
    status: "IDLE_PANTRY",
    standbyActivity: "pantry",
    targetPosition: AGENT_PANTRY_SPOTS.researcher.pos,
    targetRotationY: AGENT_PANTRY_SPOTS.researcher.rotY,
    bubbleText: "Lagi seduh kopi di Pantry sambil pantau tren pasar.",
    bubbleTo: "manager",
    bubbleExpiresAt: null,
  },
  copywriter: {
    id: "copywriter",
    name: "Leo",
    role: "Conversion Copywriter",
    fullTitle: "Leo — Conversion Copywriter",
    torsoColor: "#D97706",
    accentColor: "#FBBF24",
    deskZone: "COPYWRITER_DESK",
    status: "IDLE_PANTRY",
    standbyActivity: "roam",
    targetPosition: ROAM_WAYPOINTS[0].pos,
    targetRotationY: ROAM_WAYPOINTS[0].rotY,
    bubbleText: "Jalan-jalan cari inspirasi hook baru di ruangan!",
    bubbleTo: "researcher",
    bubbleExpiresAt: null,
  },
});

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "chat-init-1",
    sender: "manager",
    senderName: "Alex",
    senderRole: "AI Manager",
    to: "all",
    text: "Halo Bos CEO! Gue lagi duduk di meja cek jadwal, Maya di Pantry, Leo lagi jalan-jalan cari ide. Kapan pun siap deploy brief atau ngobrol, tinggal panggil ya!",
    timestamp: "ONLINE",
    accentColor: "#475569",
  },
  {
    id: "chat-init-2",
    sender: "researcher",
    senderName: "Maya",
    senderRole: "Market Researcher",
    to: "copywriter",
    text: "Leo, kopimu udah gue siapin di Pantry kalau habis keliling ruangan.",
    timestamp: "ONLINE",
    accentColor: "#0284C7",
  },
  {
    id: "chat-init-3",
    sender: "copywriter",
    senderName: "Leo",
    senderRole: "Conversion Copywriter",
    to: "researcher",
    text: "Mantap May! Habis muter sebentar gue mampir Pantry ya.",
    timestamp: "ONLINE",
    accentColor: "#D97706",
  },
];

const formatNow = () =>
  new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const makeLog = (agent: string, action: string): TelemetryLog => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  timestamp: formatNow(),
  agent,
  action,
});

const makeChat = (
  sender: ChatSender,
  to: ChatRecipient,
  text: string
): ChatMessage => {
  const meta = SENDER_META[sender];
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender,
    senderName: meta.name,
    senderRole: meta.role,
    to,
    text,
    timestamp: formatNow(),
    accentColor: meta.color,
  };
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const nextExpiry = () => Date.now() + CHAT_POPUP_TTL_MS;

export interface AgencyStore {
  // Multi-Agent Spatial State
  agents: Record<AgentId, AgentState>;
  activeSpeakerId: AgentId | null;

  // Workflow & Deliverables State
  workflowPhase: WorkflowPhase;
  ceoBrief: string;
  researchSummary: string;
  researchSources: ResearchSource[];
  managerReport: string;
  marketingAngles: MarketingAngle[];
  selectedAngleId: string | null;
  finalDeliverable: FinalDeliverable | null;
  handoffSummary: string;
  telemetryLogs: TelemetryLog[];

  // Multi-Agent Chat & Command Window State
  chatMessages: ChatMessage[];
  chatTarget: ChatTarget;
  isChatOpen: boolean;
  /** Epoch ms kapan popup HUD obrolan otomatis menghilang setelah 3 menit */
  chatPopupExpiresAt: number | null;
  isChatting: boolean;

  // UI & Camera State
  cameraPreset: CameraPreset;
  cameraTransitionNonce: number;
  isDrawerOpen: boolean;
  activeDeliverableTab: keyof FinalDeliverable;
  isCommandExpanded: boolean;
  isProcessing: boolean;
  error: string | null;

  // Actions
  setCameraPreset: (preset: CameraPreset) => void;
  setDrawerOpen: (open: boolean) => void;
  setActiveDeliverableTab: (tab: keyof FinalDeliverable) => void;
  setChatOpen: (open: boolean) => void;
  touchChatPopup: () => void;
  initClientPopups: () => void;
  setCommandExpanded: (expanded: boolean) => void;
  collapseAllPanels: () => void;
  setChatTarget: (target: ChatTarget) => void;
  clearError: () => void;
  addTelemetryLog: (agent: string, action: string) => void;
  addChatMessage: (sender: ChatSender, to: ChatRecipient, text: string) => void;
  updateAgent: (id: AgentId, patch: Partial<AgentState>) => void;
  runStandbyTick: () => void;
  startBrief: (brief: string) => Promise<void>;
  approveAngle: (angleId: string) => Promise<void>;
  sendCeoChat: (target: ChatTarget, message: string) => Promise<void>;
  triggerAgentBanter: () => Promise<void>;
  resetStudio: () => void;
}

let standbyRotationCursor = 0;

export const useAgencyStore = create<AgencyStore>((set, get) => ({
  agents: createInitialAgents(),
  activeSpeakerId: null,
  workflowPhase: "IDLE",
  ceoBrief: "",
  researchSummary: "",
  researchSources: [],
  managerReport: "",
  marketingAngles: [],
  selectedAngleId: null,
  finalDeliverable: null,
  handoffSummary: "",
  telemetryLogs: [
    {
      id: "studio-init",
      timestamp: "ONLINE",
      agent: "STUDIO CORE",
      action:
        "BrickLaunch Studio aktif. Alex di meja kerja, Maya di Pantry, dan Leo berjalan santai di ruangan.",
    },
  ],
  chatMessages: INITIAL_CHAT_MESSAGES,
  chatTarget: "all",
  isChatOpen: false,
  chatPopupExpiresAt: null,
  isChatting: false,
  cameraPreset: "overview",
  cameraTransitionNonce: 0,
  isDrawerOpen: false,
  activeDeliverableTab: "landingPageCopy",
  isCommandExpanded: true,
  isProcessing: false,
  error: null,

  setCameraPreset: (preset) =>
    set((state) => ({
      cameraPreset: preset,
      cameraTransitionNonce: state.cameraTransitionNonce + 1,
    })),

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setActiveDeliverableTab: (tab) => set({ activeDeliverableTab: tab }),

  setChatOpen: (open) =>
    set({
      isChatOpen: open,
      chatPopupExpiresAt: open ? nextExpiry() : null,
    }),

  touchChatPopup: () =>
    set((state) =>
      state.isChatOpen ? { chatPopupExpiresAt: nextExpiry() } : state
    ),

  initClientPopups: () => {
    const exp = nextExpiry();
    set((state) => ({
      agents: {
        manager: { ...state.agents.manager, bubbleExpiresAt: exp },
        researcher: { ...state.agents.researcher, bubbleExpiresAt: exp },
        copywriter: { ...state.agents.copywriter, bubbleExpiresAt: exp },
      },
    }));
  },

  setCommandExpanded: (expanded) => set({ isCommandExpanded: expanded }),

  collapseAllPanels: () =>
    set({
      isChatOpen: false,
      chatPopupExpiresAt: null,
      isDrawerOpen: false,
      isCommandExpanded: false,
    }),

  setChatTarget: (target) =>
    set({
      chatTarget: target,
      isChatOpen: true,
      chatPopupExpiresAt: nextExpiry(),
    }),

  clearError: () => set({ error: null }),

  addTelemetryLog: (agent, action) =>
    set((state) => ({
      telemetryLogs: [makeLog(agent, action), ...state.telemetryLogs].slice(0, 60),
    })),

  addChatMessage: (sender, to, text) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, makeChat(sender, to, text)].slice(-50),
      chatPopupExpiresAt: state.isChatOpen ? nextExpiry() : state.chatPopupExpiresAt,
    })),

  updateAgent: (id, patch) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: {
          ...state.agents[id],
          ...patch,
        },
      },
    })),

  /**
   * Aktivitas ambient natural selama mode standby (IDLE / COMPLETED):
   * Secara bergantian ada yang duduk di meja kantor, ada yang jalan-jalan keliling ruangan,
   * dan ada yang istirahat ngopi di Pantry Bar.
   */
  runStandbyTick: () => {
    const state = get();
    if (
      state.isProcessing ||
      state.isChatting ||
      (state.workflowPhase !== "IDLE" && state.workflowPhase !== "COMPLETED")
    ) {
      return;
    }

    const order: AgentId[] = ["copywriter", "researcher", "manager"];
    const agentId = order[standbyRotationCursor % order.length];
    standbyRotationCursor += 1;

    const currentAgent = state.agents[agentId];
    const otherActivities = order
      .filter((id) => id !== agentId)
      .map((id) => state.agents[id].standbyActivity);

    // Pilih aktivitas yang membuat ruangan selalu bervariasi (duduk meja, jalan, pantry)
    const candidateActivities: StandbyActivity[] = ["desk_sit", "roam", "pantry"];
    const missing = candidateActivities.filter((act) => !otherActivities.includes(act));
    const pool = missing.length > 0 ? missing : candidateActivities;
    const nextActivity =
      pool.find((act) => act !== currentAgent.standbyActivity) ||
      pool[Math.floor(Math.random() * pool.length)];

    if (nextActivity === "desk_sit") {
      const deskNotes: Record<AgentId, string> = {
        manager: "Duduk di meja manager merapikan strategi peluncuran.",
        researcher: "Duduk di meja riset memantau tren kompetitor.",
        copywriter: "Duduk di meja kerja mencatat ide headline baru.",
      };
      state.updateAgent(agentId, {
        status: "WORKING",
        standbyActivity: "desk_sit",
        targetPosition: AGENT_DESK_SPOTS[agentId].pos,
        targetRotationY: AGENT_DESK_SPOTS[agentId].rotY,
        bubbleText: deskNotes[agentId],
        bubbleTo: null,
      });
    } else if (nextActivity === "pantry") {
      const pantryNotes: Record<AgentId, string> = {
        manager: "Istirahat sejenak ngopi espresso di Pantry Bar.",
        researcher: "Refill cold brew di Pantry Bar sambil santai.",
        copywriter: "Nyeruput kopi hangat di Pantry cari mood nulis.",
      };
      state.updateAgent(agentId, {
        status: "IDLE_PANTRY",
        standbyActivity: "pantry",
        targetPosition: AGENT_PANTRY_SPOTS[agentId].pos,
        targetRotationY: AGENT_PANTRY_SPOTS[agentId].rotY,
        bubbleText: pantryNotes[agentId],
        bubbleTo: null,
      });
    } else {
      // Pilih titik jalan-jalan yang tidak terlalu dekat dengan agent lain
      const others = order
        .filter((id) => id !== agentId)
        .map((id) => state.agents[id].targetPosition);

      const safeWaypoints = ROAM_WAYPOINTS.filter((wp) =>
        others.every(
          (pos) => Math.hypot(wp.pos[0] - pos[0], wp.pos[2] - pos[2]) > 1.35
        )
      );
      const chosen =
        (safeWaypoints.length > 0 ? safeWaypoints : ROAM_WAYPOINTS)[
          Math.floor(
            Math.random() *
              (safeWaypoints.length > 0 ? safeWaypoints.length : ROAM_WAYPOINTS.length)
          )
        ];

      state.updateAgent(agentId, {
        status: "IDLE_PANTRY",
        standbyActivity: "roam",
        targetPosition: chosen.pos,
        targetRotationY: chosen.rotY,
        bubbleText: chosen.note,
        bubbleTo: null,
      });
    }
  },

  sendCeoChat: async (target, message) => {
    const trimmed = message.trim();
    if (!trimmed || get().isChatting) return;

    const { addChatMessage, addTelemetryLog, updateAgent } = get();
    set({
      isChatting: true,
      error: null,
      isChatOpen: true,
      chatPopupExpiresAt: nextExpiry(),
    });

    addChatMessage("ceo", target, trimmed);
    addTelemetryLog(
      "CEO",
      `Mengirim pesan ke ${
        target === "all"
          ? "Semua Tim"
          : target === "manager"
            ? "Alex"
            : target === "researcher"
              ? "Maya"
              : "Leo"
      }: "${trimmed}"`
    );

    try {
      const state = get();
      const selectedAngle = state.marketingAngles.find(
        (a) => a.id === state.selectedAngleId
      );

      let data: {
        turns?: Array<{
          speaker: AgentId;
          to: ChatRecipient;
          text: string;
          moveTo?: "stay" | "pantry" | "desk" | "manager_handoff" | "copier";
        }>;
        deliverablePatch?: {
          landingPageCopy?: string;
          launchThread?: string;
          shortVideoScript?: string;
          revisedSection?: keyof FinalDeliverable;
          revisionSummary?: string;
        } | null;
        error?: string;
      };

      if (IS_STATIC_DEMO_MODE) {
        data = await runStaticDemoChat({
          mode: "CEO_MESSAGE",
          target,
          message: trimmed,
          ceoBrief: state.ceoBrief,
          finalDeliverable: state.finalDeliverable,
        });
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "CEO_MESSAGE",
            target,
            message: trimmed,
            history: state.chatMessages.slice(-6).map((m) => ({
              sender: m.senderName,
              to: m.to,
              text: m.text,
            })),
            studioContext: {
              workflowPhase: state.workflowPhase,
              ceoBrief: state.ceoBrief,
              researchSummary: state.researchSummary,
              selectedAngle: selectedAngle || null,
              selectedAngleTitle: selectedAngle?.title,
              finalDeliverable: state.finalDeliverable,
            },
          }),
        });

        data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || `Gagal mengirim pesan (${res.status})`);
        }
      }

      const turns: Array<{
        speaker: AgentId;
        to: ChatRecipient;
        text: string;
        moveTo?: "stay" | "pantry" | "desk" | "manager_handoff" | "copier";
      }> = Array.isArray(data.turns) ? data.turns : [];

      const patchData: {
        landingPageCopy?: string;
        launchThread?: string;
        shortVideoScript?: string;
        revisedSection?: keyof FinalDeliverable;
        revisionSummary?: string;
      } | null = data.deliverablePatch || null;

      // Jika CEO meminta revisi Launch Kit: jalankan animasi Leo WORKING -> WALKING_TO_COPIER & perbarui deliverable!
      if (patchData && get().finalDeliverable) {
        const exp = nextExpiry();
        updateAgent("copywriter", {
          status: "WORKING",
          standbyActivity: "desk_sit",
          targetPosition: AGENT_DESK_SPOTS.copywriter.pos,
          targetRotationY: AGENT_DESK_SPOTS.copywriter.rotY,
          bubbleText: "Siap Bos! Lagi merevisi draf Launch Kit sekarang...",
          bubbleTo: "ceo",
          bubbleExpiresAt: exp,
        });
        addTelemetryLog(
          "Leo (Copywriter)",
          "Menerima permintaan revisi CEO. Memperbarui naskah di Meja Copywriting."
        );

        await wait(900);

        set({ workflowPhase: "PRINTING_DELIVERABLE", activeSpeakerId: "copywriter" });
        updateAgent("copywriter", {
          status: "WALKING_TO_COPIER",
          standbyActivity: "roam",
          targetPosition: COPIER_OPERATE_SPOT.pos,
          targetRotationY: COPIER_OPERATE_SPOT.rotY,
          bubbleText: "Revisi beres! Mencetak ulang versi terbaru di Copier...",
          bubbleTo: "ceo",
          bubbleExpiresAt: nextExpiry(),
        });
        addTelemetryLog(
          "Leo (Copywriter)",
          "Mencetak ulang Launch Kit hasil revisi di Zona Copier."
        );

        await wait(1400);

        const prev = get().finalDeliverable!;
        const updatedDeliverable: FinalDeliverable = {
          landingPageCopy: patchData.landingPageCopy ?? prev.landingPageCopy,
          launchThread: patchData.launchThread ?? prev.launchThread,
          shortVideoScript: patchData.shortVideoScript ?? prev.shortVideoScript,
        };
        const revisedTab: keyof FinalDeliverable =
          patchData.revisedSection ||
          (patchData.shortVideoScript
            ? "shortVideoScript"
            : patchData.launchThread
              ? "launchThread"
              : "landingPageCopy");

        set({
          finalDeliverable: updatedDeliverable,
          activeDeliverableTab: revisedTab,
          workflowPhase: "COMPLETED",
          isDrawerOpen: true,
          handoffSummary:
            patchData.revisionSummary ||
            "Revisi selesai dicetak Leo! File Launch Kit (.md) terbaru siap diunduh.",
        });
        addTelemetryLog(
          "Leo (Copywriter)",
          patchData.revisionSummary ||
            "Launch Kit terbaru hasil revisi sudah selesai dicetak & siap diunduh (.md)."
        );
      }

      for (let i = 0; i < turns.length; i++) {
        const turn = turns[i];
        if (i > 0) await wait(450);

        const exp = nextExpiry();
        set({ activeSpeakerId: turn.speaker, chatPopupExpiresAt: exp });

        const patch: Partial<AgentState> = {
          bubbleText: turn.text,
          bubbleTo: turn.to,
          bubbleExpiresAt: exp,
        };

        if (!patchData && !get().isProcessing && turn.moveTo && turn.moveTo !== "stay") {
          if (turn.moveTo === "desk") {
            patch.status = "WORKING";
            patch.standbyActivity = "desk_sit";
            patch.targetPosition = AGENT_DESK_SPOTS[turn.speaker].pos;
            patch.targetRotationY = AGENT_DESK_SPOTS[turn.speaker].rotY;
          } else if (turn.moveTo === "pantry") {
            patch.status = "IDLE_PANTRY";
            patch.standbyActivity = "pantry";
            patch.targetPosition = AGENT_PANTRY_SPOTS[turn.speaker].pos;
            patch.targetRotationY = AGENT_PANTRY_SPOTS[turn.speaker].rotY;
          } else if (turn.moveTo === "manager_handoff" && turn.speaker !== "manager") {
            patch.status = "HANDOFF";
            patch.standbyActivity = "roam";
            patch.targetPosition = MANAGER_HANDOFF_SPOT.pos;
            patch.targetRotationY = MANAGER_HANDOFF_SPOT.rotY;
          } else if (turn.moveTo === "copier") {
            patch.status = "WALKING_TO_COPIER";
            patch.standbyActivity = "roam";
            patch.targetPosition = COPIER_OPERATE_SPOT.pos;
            patch.targetRotationY = COPIER_OPERATE_SPOT.rotY;
          }
        }

        updateAgent(turn.speaker, patch);
        addChatMessage(turn.speaker, turn.to, turn.text);
        addTelemetryLog(SENDER_META[turn.speaker].name, turn.text);
      }

      set({ isChatting: false });
      window.setTimeout(() => {
        if (!get().isChatting && !get().isProcessing) {
          set({ activeSpeakerId: null });
        }
      }, 2000);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghubungi agent untuk obrolan.";
      addTelemetryLog("SYSTEM ALERT", msg);
      set({ isChatting: false, activeSpeakerId: null, error: msg });
    }
  },

  triggerAgentBanter: async () => {
    if (get().isChatting) return;
    const { addChatMessage, addTelemetryLog, updateAgent } = get();
    set({
      isChatting: true,
      error: null,
      isChatOpen: true,
      chatPopupExpiresAt: nextExpiry(),
    });

    try {
      const state = get();
      const selectedAngle = state.marketingAngles.find(
        (a) => a.id === state.selectedAngleId
      );

      let data: {
        turns?: Array<{
          speaker: AgentId;
          to: ChatRecipient;
          text: string;
        }>;
        error?: string;
      };

      if (IS_STATIC_DEMO_MODE) {
        data = await runStaticDemoChat({
          mode: "AGENT_BANTER",
          target: "all",
          ceoBrief: state.ceoBrief,
          finalDeliverable: state.finalDeliverable,
        });
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "AGENT_BANTER",
            history: state.chatMessages.slice(-6).map((m) => ({
              sender: m.senderName,
              to: m.to,
              text: m.text,
            })),
            studioContext: {
              workflowPhase: state.workflowPhase,
              ceoBrief: state.ceoBrief,
              researchSummary: state.researchSummary,
              selectedAngle: selectedAngle || null,
              selectedAngleTitle: selectedAngle?.title,
              finalDeliverable: state.finalDeliverable,
            },
          }),
        });

        data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || `Gagal memicu obrolan agent (${res.status})`);
        }
      }

      const turns: Array<{
        speaker: AgentId;
        to: ChatRecipient;
        text: string;
      }> = Array.isArray(data.turns) ? data.turns : [];

      for (let i = 0; i < turns.length; i++) {
        const turn = turns[i];
        if (i > 0) await wait(550);
        const exp = nextExpiry();
        set({ activeSpeakerId: turn.speaker, chatPopupExpiresAt: exp });
        updateAgent(turn.speaker, {
          bubbleText: turn.text,
          bubbleTo: turn.to,
          bubbleExpiresAt: exp,
        });
        addChatMessage(turn.speaker, turn.to, turn.text);
        addTelemetryLog(SENDER_META[turn.speaker].name, turn.text);
      }

      set({ isChatting: false });
      window.setTimeout(() => {
        if (!get().isChatting && !get().isProcessing) {
          set({ activeSpeakerId: null });
        }
      }, 2000);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal memulai obrolan antar-agent.";
      addTelemetryLog("SYSTEM ALERT", msg);
      set({ isChatting: false, activeSpeakerId: null, error: msg });
    }
  },

  startBrief: async (brief: string) => {
    const trimmed = brief.trim();
    if (!trimmed || get().isProcessing) return;

    const { updateAgent, addTelemetryLog, addChatMessage } = get();

    set({
      ceoBrief: trimmed,
      workflowPhase: "RESEARCHING",
      researchSummary: "",
      researchSources: [],
      managerReport: "",
      marketingAngles: [],
      selectedAngleId: null,
      finalDeliverable: null,
      handoffSummary: "",
      isProcessing: true,
      error: null,
      isDrawerOpen: true,
    });

    addTelemetryLog("CEO", `Brief produk baru dikirim: "${trimmed}"`);
    addChatMessage("ceo", "all", `Tim, gas eksekusi brief produk baru kita: "${trimmed}"`);

    // Kirim request Gemini SEGERA secara paralel (atau Static Demo Engine pada GitHub Pages)
    const orchestratePromise = IS_STATIC_DEMO_MODE
      ? runStaticDemoStartBrief(trimmed).then((payload) => ({
          ok: true,
          status: 200,
          json: async () => payload,
        }))
      : fetch("/api/orchestrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "START_BRIEF",
            ceoBrief: trimmed,
          }),
        });

    // 1. Alex menuju & duduk di Manager Desk
    set({ activeSpeakerId: "manager" });
    const alexDispatchMsg = `Siap Bos! Maya, tolong langsung bedah pain point audiens & celah kompetitor untuk "${trimmed}" ya.`;
    updateAgent("manager", {
      status: "WALKING_TO_DESK",
      standbyActivity: "desk_sit",
      targetPosition: AGENT_DESK_SPOTS.manager.pos,
      targetRotationY: AGENT_DESK_SPOTS.manager.rotY,
      bubbleText: alexDispatchMsg,
      bubbleTo: "researcher",
      bubbleExpiresAt: nextExpiry(),
    });
    addChatMessage("manager", "researcher", alexDispatchMsg);
    addTelemetryLog("Alex (Manager)", "Menuju Meja Manager untuk memecah brief.");

    await wait(550);

    updateAgent("manager", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      bubbleText: "Memetakan ruang lingkup brief & memantau riset Maya...",
      bubbleTo: "researcher",
      bubbleExpiresAt: nextExpiry(),
    });

    // 2. Maya membalas & menuju Researcher Desk
    set({ activeSpeakerId: "researcher" });
    const mayaReplyMsg =
      "Oke Alex! Gue langsung ke meja riset buat scan keluhan pasar dan celah kompetitornya.";
    updateAgent("researcher", {
      status: "WALKING_TO_DESK",
      standbyActivity: "desk_sit",
      targetPosition: AGENT_DESK_SPOTS.researcher.pos,
      targetRotationY: AGENT_DESK_SPOTS.researcher.rotY,
      bubbleText: mayaReplyMsg,
      bubbleTo: "manager",
      bubbleExpiresAt: nextExpiry(),
    });
    addChatMessage("researcher", "manager", mayaReplyMsg);
    addTelemetryLog(
      "Alex (Manager)",
      "Mendelegasikan riset celah kompetitor & pain point audiens ke Maya."
    );

    await wait(550);

    updateAgent("researcher", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      bubbleText: "Sedang menyusun intelijen pasar & psikologi pembeli...",
      bubbleTo: "manager",
      bubbleExpiresAt: nextExpiry(),
    });
    addTelemetryLog(
      "Maya (Researcher)",
      "Menjalankan sintesis riset pasar Gemini di Workstation."
    );

    try {
      const res = await orchestratePromise;

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Orkestrasi gagal (${res.status})`);
      }

      // 3. Maya serah terima ke Meja Manager
      set({ activeSpeakerId: "researcher" });
      const mayaHandoffLine =
        data.mayaHandoffLine ||
        "Alex, hasil riset pasarnya sudah jadi! Ini rangkuman celah kompetitor buat kamu olah.";
      updateAgent("researcher", {
        status: "HANDOFF",
        standbyActivity: "roam",
        targetPosition: MANAGER_HANDOFF_SPOT.pos,
        targetRotationY: MANAGER_HANDOFF_SPOT.rotY,
        bubbleText: mayaHandoffLine,
        bubbleTo: "manager",
        bubbleExpiresAt: nextExpiry(),
      });
      addChatMessage("researcher", "manager", mayaHandoffLine);
      addTelemetryLog(
        "Maya (Researcher)",
        "Riset selesai. Berjalan ke Meja Manager untuk serah terima dossier."
      );

      await wait(1400);

      // 4. Maya kembali ke Pantry, Alex menunggu ACC CEO
      set({ activeSpeakerId: "manager" });
      const alexApprovalLine =
        data.alexApprovalLine ||
        "Mantap Maya! Bos CEO, 3 Marketing Angle sudah siap — silakan pilih satu buat kita serahkan ke Leo.";

      updateAgent("researcher", {
        status: "IDLE_PANTRY",
        standbyActivity: "pantry",
        targetPosition: AGENT_PANTRY_SPOTS.researcher.pos,
        targetRotationY: AGENT_PANTRY_SPOTS.researcher.rotY,
        bubbleText: "Dossier sudah di Alex — lanjut ngopi dulu di Pantry!",
        bubbleTo: "copywriter",
        bubbleExpiresAt: nextExpiry(),
      });

      updateAgent("manager", {
        status: "WAITING_APPROVAL",
        standbyActivity: "desk_sit",
        targetPosition: AGENT_DESK_SPOTS.manager.pos,
        targetRotationY: AGENT_DESK_SPOTS.manager.rotY,
        bubbleText: alexApprovalLine,
        bubbleTo: "ceo",
        bubbleExpiresAt: nextExpiry(),
      });

      addChatMessage("manager", "ceo", alexApprovalLine);
      addTelemetryLog(
        "Alex (Manager)",
        `Menyusun ${data.marketingAngles?.length || 3} marketing angle. Menunggu persetujuan CEO.`
      );

      set({
        workflowPhase: "AWAITING_CEO_APPROVAL",
        researchSummary: data.researchSummary || "",
        researchSources: Array.isArray(data.researchSources) ? data.researchSources : [],
        managerReport: data.managerReport || "",
        marketingAngles: Array.isArray(data.marketingAngles) ? data.marketingAngles : [],
        isProcessing: false,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menjalankan fase riset.";
      addTelemetryLog("SYSTEM ALERT", message);

      const resetAgents = createInitialAgents();
      set({
        agents: resetAgents,
        activeSpeakerId: null,
        workflowPhase: "IDLE",
        isProcessing: false,
        error: message,
      });
    }
  },

  approveAngle: async (angleId: string) => {
    const state = get();
    if (state.isProcessing) return;

    const selectedAngle = state.marketingAngles.find((a) => a.id === angleId);
    if (!selectedAngle) return;

    const { updateAgent, addTelemetryLog, addChatMessage } = state;

    set({
      selectedAngleId: angleId,
      workflowPhase: "COPYWRITING",
      isProcessing: true,
      error: null,
    });

    addTelemetryLog("CEO", `Menyetujui Angle: "${selectedAngle.title}"`);
    addChatMessage(
      "ceo",
      "manager",
      `Oke Alex, kita pakai angle "${selectedAngle.title}". Tolong langsung delegasikan ke Leo ya!`
    );

    // Kirim request copywriting SEGERA secara paralel (atau Static Demo Engine pada GitHub Pages)
    const copyPromise = IS_STATIC_DEMO_MODE
      ? runStaticDemoApproveAngle(get().ceoBrief, selectedAngle).then((payload) => ({
          ok: true,
          status: 200,
          json: async () => payload,
        }))
      : fetch("/api/orchestrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "APPROVE_ANGLE",
            ceoBrief: get().ceoBrief,
            researchSummary: get().researchSummary,
            selectedAngle,
          }),
        });

    set({ activeSpeakerId: "manager" });
    const alexToLeo = `Leo, CEO setuju pakai angle "${selectedAngle.title}"! Sini ambil brief-nya, bikin landing page, thread, sama skrip 45 detik ya.`;
    updateAgent("manager", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      bubbleText: alexToLeo,
      bubbleTo: "copywriter",
      bubbleExpiresAt: nextExpiry(),
    });
    addChatMessage("manager", "copywriter", alexToLeo);

    await wait(450);

    set({ activeSpeakerId: "copywriter" });
    const leoAck =
      "Siap Lex! Gue samperin mejamu buat ambil brief, habis itu langsung duduk nulis di meja gue!";
    updateAgent("copywriter", {
      status: "HANDOFF",
      standbyActivity: "roam",
      targetPosition: MANAGER_HANDOFF_SPOT.pos,
      targetRotationY: MANAGER_HANDOFF_SPOT.rotY,
      bubbleText: leoAck,
      bubbleTo: "manager",
      bubbleExpiresAt: nextExpiry(),
    });
    addChatMessage("copywriter", "manager", leoAck);
    addTelemetryLog(
      "Leo (Copywriter)",
      "Berjalan menuju Meja Manager untuk serah terima brief kreatif."
    );

    await wait(850);

    updateAgent("copywriter", {
      status: "WALKING_TO_DESK",
      standbyActivity: "desk_sit",
      targetPosition: AGENT_DESK_SPOTS.copywriter.pos,
      targetRotationY: AGENT_DESK_SPOTS.copywriter.rotY,
      bubbleText: "OTW meja copywriting — siap rakit copy yang nendang!",
      bubbleTo: "all",
      bubbleExpiresAt: nextExpiry(),
    });

    await wait(650);

    updateAgent("copywriter", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      bubbleText: "Lagi nulis landing page, thread viral & skrip video 45 detik...",
      bubbleTo: "ceo",
      bubbleExpiresAt: nextExpiry(),
    });
    updateAgent("manager", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      bubbleText: "Memantau sprint copywriting Leo...",
      bubbleTo: "copywriter",
      bubbleExpiresAt: nextExpiry(),
    });
    addTelemetryLog(
      "Leo (Copywriter)",
      "Menulis copy landing page, utas 5-bagian X/Threads, dan skrip video 45 detik."
    );

    try {
      const res = await copyPromise;

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Gagal membuat copywriting (${res.status})`);
      }

      set({ workflowPhase: "PRINTING_DELIVERABLE", activeSpeakerId: "copywriter" });
      const leoPrintLine =
        data.leoPrintLine ||
        `Lex, semua materi buat "${selectedAngle.title}" udah kelar! Lagi gue print di mesin fotokopi nih.`;

      updateAgent("copywriter", {
        status: "WALKING_TO_COPIER",
        standbyActivity: "roam",
        targetPosition: COPIER_OPERATE_SPOT.pos,
        targetRotationY: COPIER_OPERATE_SPOT.rotY,
        bubbleText: leoPrintLine,
        bubbleTo: "manager",
        bubbleExpiresAt: nextExpiry(),
      });
      addChatMessage("copywriter", "manager", leoPrintLine);
      addTelemetryLog(
        "Leo (Copywriter)",
        "Copy selesai! Berjalan ke Zona Copier untuk mencetak paket Launch Kit."
      );

      await wait(2400);

      updateAgent("copywriter", {
        status: "HANDOFF",
        standbyActivity: "roam",
        targetPosition: MANAGER_HANDOFF_SPOT.pos,
        targetRotationY: MANAGER_HANDOFF_SPOT.rotY,
        bubbleText: "Nih Lex, hasil cetakan Launch Kit-nya masih anget!",
        bubbleTo: "manager",
        bubbleExpiresAt: nextExpiry(),
      });
      addTelemetryLog(
        "Leo (Copywriter)",
        "Launch Kit tercetak diserahkan ke Alex di Meja Manager."
      );

      await wait(1400);

      set({ activeSpeakerId: "manager" });
      const finalNote =
        data.handoffSummary ||
        `Launch Kit untuk "${selectedAngle.title}" sudah beres dan siap diunduh Bos CEO!`;

      // Kembali ke aktivitas natural yang beragam (Alex di meja, Leo ke pantry)
      updateAgent("manager", {
        status: "WORKING",
        standbyActivity: "desk_sit",
        targetPosition: AGENT_DESK_SPOTS.manager.pos,
        targetRotationY: AGENT_DESK_SPOTS.manager.rotY,
        bubbleText: "Launch Kit beres! Kembali standby di meja manager.",
        bubbleTo: "ceo",
        bubbleExpiresAt: nextExpiry(),
      });
      updateAgent("copywriter", {
        status: "IDLE_PANTRY",
        standbyActivity: "pantry",
        targetPosition: AGENT_PANTRY_SPOTS.copywriter.pos,
        targetRotationY: AGENT_PANTRY_SPOTS.copywriter.rotY,
        bubbleText: "Mission accomplished! Kopi ronde dua di Pantry!",
        bubbleTo: "researcher",
        bubbleExpiresAt: nextExpiry(),
      });

      addChatMessage("manager", "ceo", finalNote);
      addTelemetryLog("Alex (Manager)", finalNote);

      set({
        workflowPhase: "COMPLETED",
        finalDeliverable: data.finalDeliverable || null,
        handoffSummary: finalNote,
        isProcessing: false,
        isDrawerOpen: true,
      });

      await wait(2400);
      set({ activeSpeakerId: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghasilkan Launch Kit.";
      addTelemetryLog("SYSTEM ALERT", message);

      updateAgent("manager", {
        status: "WAITING_APPROVAL",
        standbyActivity: "desk_sit",
        targetPosition: AGENT_DESK_SPOTS.manager.pos,
        targetRotationY: AGENT_DESK_SPOTS.manager.rotY,
        bubbleText: "Siap coba ulang persetujuan angle, Bos!",
        bubbleTo: "ceo",
        bubbleExpiresAt: nextExpiry(),
      });
      updateAgent("copywriter", {
        status: "IDLE_PANTRY",
        standbyActivity: "pantry",
        targetPosition: AGENT_PANTRY_SPOTS.copywriter.pos,
        targetRotationY: AGENT_PANTRY_SPOTS.copywriter.rotY,
        bubbleText: "Standby di Pantry Bar",
        bubbleTo: null,
        bubbleExpiresAt: nextExpiry(),
      });

      set({
        workflowPhase: "AWAITING_CEO_APPROVAL",
        activeSpeakerId: null,
        isProcessing: false,
        error: message,
      });
    }
  },

  resetStudio: () => {
    const exp = nextExpiry();
    const fresh = createInitialAgents();
    fresh.manager.bubbleExpiresAt = exp;
    fresh.researcher.bubbleExpiresAt = exp;
    fresh.copywriter.bubbleExpiresAt = exp;

    set({
      agents: fresh,
      activeSpeakerId: null,
      workflowPhase: "IDLE",
      ceoBrief: "",
      researchSummary: "",
      researchSources: [],
      managerReport: "",
      marketingAngles: [],
      selectedAngleId: null,
      finalDeliverable: null,
      handoffSummary: "",
      isProcessing: false,
      isChatting: false,
      error: null,
      chatMessages: INITIAL_CHAT_MESSAGES,
      telemetryLogs: [
        makeLog(
          "STUDIO CORE",
          "Studio direset. Alex duduk di meja, Maya di Pantry, dan Leo keliling ruangan."
        ),
      ],
    });
  },
}));
