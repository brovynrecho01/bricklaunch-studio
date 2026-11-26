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
 * Dual-Wing Connected Office Coordinates (Total 24m x 10m across X-axis: [-12..+12], Z: [-5..+5])
 * - West Wing (Executive, Intelligence & Creative): center [-6, 0, 0]
 * - East Wing (Finance, Operations, QC & Pantry): center [6, 0, 0]
 * - Connecting Doorway: [0, 0, -0.5]
 */
export const OFFICE_ZONES = {
  // West Wing
  MANAGER_DESK: [-9.2, 0, -2.5] as Vec3,
  RESEARCHER_DESK: [-9.5, 0, 1.8] as Vec3,
  COPYWRITER_DESK: [-6.2, 0, 1.8] as Vec3,
  SOCIAL_DESK: [-3.0, 0, 1.8] as Vec3,
  COPIER_PRINTER_ZONE: [-4.2, 0, -3.5] as Vec3,

  // Connecting Doorway
  CONNECTING_DOORWAY: [0, 0, -0.5] as Vec3,

  // East Wing
  FINANCE_DESK: [3.0, 0, 1.8] as Vec3,
  HR_DESK: [6.2, 0, 1.8] as Vec3,
  QC_DESK: [9.2, 0, 1.8] as Vec3,
  PANTRY_COFFEE_ZONE: [8.5, 0, -2.2] as Vec3,
} as const;

export type OfficeZoneKey = keyof typeof OFFICE_ZONES;

export type AgentId =
  | "manager"
  | "researcher"
  | "copywriter"
  | "social"
  | "finance"
  | "hr"
  | "qc";

export const ALL_AGENT_IDS: AgentId[] = [
  "manager",
  "researcher",
  "copywriter",
  "social",
  "finance",
  "hr",
  "qc",
];

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
  | "QC_REVIEW"
  | "PRINTING_DELIVERABLE"
  | "COMPLETED";

export type CameraPreset = "campus" | "west_wing" | "east_wing" | "pantry";

export interface MarketingAngle {
  id: string;
  title: string;
  hook: string;
  targetAudience: string;
  whyItConverts?: string;
}

export interface ResearchSource {
  title: string;
  url: string;
}

export interface QcCertificate {
  score: number;
  status: string;
  copyVsPricing: string;
  socialVsFunnel: string;
  sopVsSla: string;
  divisionScores?: {
    maya?: number;
    leo?: number;
    sora?: number;
    raka?: number;
    nadia?: number;
  };
  strengths?: string[];
  refinementNotes?: string[];
  auditorSignOff: string;
}

export interface FinalDeliverable {
  landingPageCopy: string;
  launchThread: string;
  shortVideoScript: string;
  socialMediaPlan: string;
  financePlan: string;
  hrOpsChecklist: string;
  qcAuditReport: string;
  qcCertificate?: QcCertificate;
}

export type DeliverableKey =
  | "landingPageCopy"
  | "launchThread"
  | "shortVideoScript"
  | "socialMediaPlan"
  | "financePlan"
  | "hrOpsChecklist"
  | "qcAuditReport";

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
  division: string;
  wing: "West Wing" | "East Wing";
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
  bubbleExpiresAt: number | null;
}

/** Posisi berdiri non-overlapping di depan East Wing Pantry Bar ([8.5, 0, -2.2]) menghadap -Z ke counter */
const AGENT_PANTRY_SPOTS: Record<AgentId, { pos: Vec3; rotY: number }> = {
  manager: { pos: [7.1, 0, -1.0], rotY: Math.PI },
  researcher: { pos: [8.0, 0, -0.85], rotY: Math.PI },
  copywriter: { pos: [9.0, 0, -0.85], rotY: Math.PI },
  social: { pos: [9.9, 0, -1.0], rotY: Math.PI },
  finance: { pos: [7.5, 0, -0.15], rotY: Math.PI },
  hr: { pos: [8.5, 0, -0.1], rotY: Math.PI },
  qc: { pos: [9.5, 0, -0.15], rotY: Math.PI },
};

/** Posisi duduk di kursi ergonomis masing-masing meja kerja (z = deskZ - 0.68) */
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
  social: {
    pos: [OFFICE_ZONES.SOCIAL_DESK[0], 0, OFFICE_ZONES.SOCIAL_DESK[2] - 0.68],
    rotY: 0,
  },
  finance: {
    pos: [OFFICE_ZONES.FINANCE_DESK[0], 0, OFFICE_ZONES.FINANCE_DESK[2] - 0.68],
    rotY: 0,
  },
  hr: {
    pos: [OFFICE_ZONES.HR_DESK[0], 0, OFFICE_ZONES.HR_DESK[2] - 0.68],
    rotY: 0,
  },
  qc: {
    pos: [OFFICE_ZONES.QC_DESK[0], 0, OFFICE_ZONES.QC_DESK[2] - 0.68],
    rotY: 0,
  },
};

/** Titik jalan-jalan bebas hambatan di West Wing & East Wing (memicu jalan lintas pintu otomatis!) */
const ROAM_WAYPOINTS: Array<{ pos: Vec3; rotY: number; note: string }> = [
  // West Wing Open Corridors
  { pos: [-7.2, 0, -0.5], rotY: 0.4, note: "Jalan santai di koridor West Wing" },
  { pos: [-2.2, 0, -0.5], rotY: 1.5, note: "Menuju pintu penghubung menuju East Wing" },
  { pos: [-10.6, 0, -0.2], rotY: -Math.PI / 2, note: "Menikmati pemandangan jendela West Wing" },
  { pos: [-6.0, 0, 3.6], rotY: -0.4, note: "Jalan santai di area depan Creative Wing" },
  // East Wing Open Corridors
  { pos: [2.2, 0, -0.5], rotY: -1.5, note: "Melintasi pintu kaca menuju koridor East Wing" },
  { pos: [5.4, 0, -0.5], rotY: 0.6, note: "Koordinasi santai di lorong Operations & QC" },
  { pos: [4.8, 0, 3.6], rotY: -0.3, note: "Jalan santai di area depan East Wing" },
  { pos: [10.6, 0, -0.4], rotY: -1.6, note: "Mengecek sudut timur dekat Pantry & QC" },
];

const MANAGER_HANDOFF_SPOT = {
  pos: [OFFICE_ZONES.MANAGER_DESK[0], 0, OFFICE_ZONES.MANAGER_DESK[2] + 0.88] as Vec3,
  rotY: Math.PI,
};

const QC_HANDOFF_SPOT = {
  pos: [OFFICE_ZONES.QC_DESK[0], 0, OFFICE_ZONES.QC_DESK[2] + 0.88] as Vec3,
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
  manager: { name: "Alex", role: "AI Manager", color: "#60A5FA" },
  researcher: { name: "Maya", role: "Market Researcher", color: "#0284C7" },
  copywriter: { name: "Leo", role: "Copywriter", color: "#D97706" },
  social: { name: "Sora", role: "Social Media Specialist", color: "#DB2777" },
  finance: { name: "Raka", role: "Finance Strategist", color: "#059669" },
  hr: { name: "Nadia", role: "Human Resources", color: "#7C3AED" },
  qc: { name: "Bima", role: "Product QC", color: "#DC2626" },
};

const createInitialAgents = (): Record<AgentId, AgentState> => ({
  manager: {
    id: "manager",
    name: "Alex",
    role: "AI Manager",
    division: "Management",
    wing: "West Wing",
    fullTitle: "Alex — AI Manager / Handoff Orchestrator",
    torsoColor: "#1E293B",
    accentColor: "#60A5FA",
    deskZone: "MANAGER_DESK",
    status: "WORKING",
    standbyActivity: "desk_sit",
    targetPosition: AGENT_DESK_SPOTS.manager.pos,
    targetRotationY: AGENT_DESK_SPOTS.manager.rotY,
    bubbleText: "Cek kesiapan West & East Wing — siap terima brief CEO!",
    bubbleTo: "all",
    bubbleExpiresAt: null,
  },
  researcher: {
    id: "researcher",
    name: "Maya",
    role: "Market Researcher",
    division: "Market Research",
    wing: "West Wing",
    fullTitle: "Maya — Market & Psychology Researcher",
    torsoColor: "#0284C7",
    accentColor: "#38BDF8",
    deskZone: "RESEARCHER_DESK",
    status: "IDLE_PANTRY",
    standbyActivity: "pantry",
    targetPosition: AGENT_PANTRY_SPOTS.researcher.pos,
    targetRotationY: AGENT_PANTRY_SPOTS.researcher.rotY,
    bubbleText: "Nyebrang ke East Wing Pantry buat seduh kopi dulu!",
    bubbleTo: "hr",
    bubbleExpiresAt: null,
  },
  copywriter: {
    id: "copywriter",
    name: "Leo",
    role: "Copywriter",
    division: "Copywriting",
    wing: "West Wing",
    fullTitle: "Leo — Conversion Copywriter",
    torsoColor: "#D97706",
    accentColor: "#FBBF24",
    deskZone: "COPYWRITER_DESK",
    status: "IDLE_PANTRY",
    standbyActivity: "roam",
    targetPosition: ROAM_WAYPOINTS[0].pos,
    targetRotationY: ROAM_WAYPOINTS[0].rotY,
    bubbleText: "Jalan-jalan di koridor West Wing cari hook segar!",
    bubbleTo: "social",
    bubbleExpiresAt: null,
  },
  social: {
    id: "social",
    name: "Sora",
    role: "Social Media",
    division: "Social Media",
    wing: "West Wing",
    fullTitle: "Sora — Social Media Specialist",
    torsoColor: "#DB2777",
    accentColor: "#F472B6",
    deskZone: "SOCIAL_DESK",
    status: "IDLE_PANTRY",
    standbyActivity: "roam",
    targetPosition: ROAM_WAYPOINTS[1].pos,
    targetRotationY: ROAM_WAYPOINTS[1].rotY,
    bubbleText: "Mau lewat pintu kaca ke East Wing ngobrol sama Raka!",
    bubbleTo: "finance",
    bubbleExpiresAt: null,
  },
  finance: {
    id: "finance",
    name: "Raka",
    role: "Finance",
    division: "Finance",
    wing: "East Wing",
    fullTitle: "Raka — Finance & Pricing Strategist",
    torsoColor: "#059669",
    accentColor: "#34D399",
    deskZone: "FINANCE_DESK",
    status: "WORKING",
    standbyActivity: "desk_sit",
    targetPosition: AGENT_DESK_SPOTS.finance.pos,
    targetRotationY: AGENT_DESK_SPOTS.finance.rotY,
    bubbleText: "Merapikan tabel unit economics & pricing tier di East Wing.",
    bubbleTo: "manager",
    bubbleExpiresAt: null,
  },
  hr: {
    id: "hr",
    name: "Nadia",
    role: "Human Resources",
    division: "Human Resources",
    wing: "East Wing",
    fullTitle: "Nadia — Human Resources & Team Ops",
    torsoColor: "#7C3AED",
    accentColor: "#A78BFA",
    deskZone: "HR_DESK",
    status: "IDLE_PANTRY",
    standbyActivity: "pantry",
    targetPosition: AGENT_PANTRY_SPOTS.hr.pos,
    targetRotationY: AGENT_PANTRY_SPOTS.hr.rotY,
    bubbleText: "Ngopi bareng Maya di Pantry East Wing jaga semangat tim!",
    bubbleTo: "researcher",
    bubbleExpiresAt: null,
  },
  qc: {
    id: "qc",
    name: "Bima",
    role: "Product QC",
    division: "Quality Control",
    wing: "East Wing",
    fullTitle: "Bima — Product QC & Launch Auditor",
    torsoColor: "#DC2626",
    accentColor: "#F87171",
    deskZone: "QC_DESK",
    status: "WORKING",
    standbyActivity: "desk_sit",
    targetPosition: AGENT_DESK_SPOTS.qc.pos,
    targetRotationY: AGENT_DESK_SPOTS.qc.rotY,
    bubbleText: "Sertifikat Audit Pre-Launch QC siap di East Wing — standar ketat!",
    bubbleTo: "all",
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
    text: "Selamat datang di Kampus Dual-Wing BrickLaunch Studio (24m × 10m)! West Wing untuk Creative & Eksekutif, East Wing untuk Finance, HR, QC & Pantry — terhubung pintu otomatis di tengah!",
    timestamp: "ONLINE",
    accentColor: "#60A5FA",
  },
  {
    id: "chat-init-2",
    sender: "social",
    senderName: "Sora",
    senderRole: "Social Media Specialist",
    to: "finance",
    text: "Raka, enak banget sekarang lega dua sayap! Gue tinggal lewat pintu tengah kalau mau sinkron promo sama Finance.",
    timestamp: "ONLINE",
    accentColor: "#DB2777",
  },
  {
    id: "chat-init-3",
    sender: "qc",
    senderName: "Bima",
    senderRole: "Product QC",
    to: "all",
    text: "Siap semuanya! Begitu produksi selesai, serahkan ke meja QC gue di East Wing untuk penerbitan Sertifikat Audit + Master Launch Kit 7-BAB.",
    timestamp: "ONLINE",
    accentColor: "#DC2626",
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

function ownerForDeliverableSection(section: DeliverableKey): AgentId {
  switch (section) {
    case "socialMediaPlan":
      return "social";
    case "financePlan":
      return "finance";
    case "hrOpsChecklist":
      return "hr";
    case "qcAuditReport":
      return "qc";
    default:
      return "copywriter";
  }
}

export interface AgencyStore {
  agents: Record<AgentId, AgentState>;
  activeSpeakerId: AgentId | null;

  workflowPhase: WorkflowPhase;
  ceoBrief: string;
  executiveBrief: string;
  researchSummary: string;
  researchSources: ResearchSource[];
  managerReport: string;
  marketingAngles: MarketingAngle[];
  selectedAngleId: string | null;
  finalDeliverable: FinalDeliverable | null;
  handoffSummary: string;
  telemetryLogs: TelemetryLog[];

  chatMessages: ChatMessage[];
  chatTarget: ChatTarget;
  isChatOpen: boolean;
  chatPopupExpiresAt: number | null;
  isChatting: boolean;

  cameraPreset: CameraPreset;
  cameraTransitionNonce: number;
  isDrawerOpen: boolean;
  activeDeliverableTab: DeliverableKey;
  isCommandExpanded: boolean;
  isProcessing: boolean;
  error: string | null;

  setCameraPreset: (preset: CameraPreset) => void;
  setDrawerOpen: (open: boolean) => void;
  setActiveDeliverableTab: (tab: DeliverableKey) => void;
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
  executiveBrief: "",
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
        "Kampus Dual-Wing 24m × 10m aktif: West Wing (Alex, Maya, Leo, Sora, Copier) ↔ Pintu Otomatis ↔ East Wing (Raka, Nadia, Bima, Pantry).",
    },
  ],
  chatMessages: INITIAL_CHAT_MESSAGES,
  chatTarget: "all",
  isChatOpen: false,
  chatPopupExpiresAt: null,
  isChatting: false,
  cameraPreset: "campus",
  cameraTransitionNonce: 0,
  isDrawerOpen: false,
  activeDeliverableTab: "qcAuditReport",
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
    set((state) => {
      const updated = { ...state.agents };
      for (const id of ALL_AGENT_IDS) {
        updated[id] = { ...updated[id], bubbleExpiresAt: exp };
      }
      return { agents: updated };
    });
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
      telemetryLogs: [makeLog(agent, action), ...state.telemetryLogs].slice(0, 80),
    })),

  addChatMessage: (sender, to, text) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, makeChat(sender, to, text)].slice(-60),
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

  runStandbyTick: () => {
    const state = get();
    if (
      state.isProcessing ||
      state.isChatting ||
      (state.workflowPhase !== "IDLE" && state.workflowPhase !== "COMPLETED")
    ) {
      return;
    }

    const agentId = ALL_AGENT_IDS[standbyRotationCursor % ALL_AGENT_IDS.length];
    standbyRotationCursor += 1;

    const currentAgent = state.agents[agentId];
    const counts: Record<StandbyActivity, number> = { desk_sit: 0, roam: 0, pantry: 0 };
    for (const id of ALL_AGENT_IDS) {
      if (id !== agentId) counts[state.agents[id].standbyActivity] += 1;
    }

    const targets: Record<StandbyActivity, number> = { desk_sit: 3, roam: 2, pantry: 2 };
    const deficits = (["desk_sit", "roam", "pantry"] as StandbyActivity[]).filter(
      (act) => counts[act] < targets[act] && act !== currentAgent.standbyActivity
    );
    const nextActivity =
      deficits.length > 0
        ? deficits[Math.floor(Math.random() * deficits.length)]
        : ((["desk_sit", "roam", "pantry"] as StandbyActivity[]).find(
            (a) => a !== currentAgent.standbyActivity
          ) || "desk_sit");

    if (nextActivity === "desk_sit") {
      const deskNotes: Record<AgentId, string> = {
        manager: "Duduk di meja manager West Wing merapikan strategi.",
        researcher: "Duduk di meja riset memantau tren kompetitor.",
        copywriter: "Duduk di meja copy mencatat ide headline baru.",
        social: "Menyusun ide konten TikTok & Reels di meja Social Media.",
        finance: "Menghitung proyeksi margin & pricing di East Wing.",
        hr: "Merapikan SOP tim & kesiapan operasional di meja HR.",
        qc: "Menyiapkan checklist audit Pre-Launch QC di East Wing.",
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
        manager: "Melintasi pintu ke Pantry East Wing ambil espresso.",
        researcher: "Refill cold brew di Pantry Bar East Wing.",
        copywriter: "Nyeruput kopi di Pantry cari inspirasi copywriting.",
        social: "Rehat sejenak di Pantry sambil cek tren Reels.",
        finance: "Kopi sore di Pantry biar hitungan cashflow makin presisi.",
        hr: "Check-in santai bareng rekan lintas sayap di Pantry.",
        qc: "Istirahat mata sejenak di Pantry sebelum audit berikutnya.",
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
      const others = ALL_AGENT_IDS.filter((id) => id !== agentId).map(
        (id) => state.agents[id].targetPosition
      );

      const safeWaypoints = ROAM_WAYPOINTS.filter((wp) =>
        others.every(
          (pos) => Math.hypot(wp.pos[0] - pos[0], wp.pos[2] - pos[2]) > 1.35
        )
      );
      const pool = safeWaypoints.length > 0 ? safeWaypoints : ROAM_WAYPOINTS;
      const chosen = pool[Math.floor(Math.random() * pool.length)];

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

    const targetLabel = target === "all" ? "Semua 7 Divisi" : SENDER_META[target].name;
    addChatMessage("ceo", target, trimmed);
    addTelemetryLog("CEO", `Mengirim pesan ke ${targetLabel}: "${trimmed}"`);

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
        deliverablePatch?: Partial<FinalDeliverable> & {
          revisedSection?: DeliverableKey;
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

      const turns = Array.isArray(data.turns) ? data.turns : [];
      const patchData = data.deliverablePatch || null;

      if (patchData && get().finalDeliverable) {
        const revisedTab: DeliverableKey =
          patchData.revisedSection ||
          (patchData.qcAuditReport
            ? "qcAuditReport"
            : patchData.hrOpsChecklist
              ? "hrOpsChecklist"
              : patchData.financePlan
                ? "financePlan"
                : patchData.socialMediaPlan
                  ? "socialMediaPlan"
                  : patchData.shortVideoScript
                    ? "shortVideoScript"
                    : patchData.launchThread
                      ? "launchThread"
                      : "landingPageCopy");

        const ownerId = ownerForDeliverableSection(revisedTab);
        const ownerMeta = SENDER_META[ownerId];

        updateAgent(ownerId, {
          status: "WORKING",
          standbyActivity: "desk_sit",
          targetPosition: AGENT_DESK_SPOTS[ownerId].pos,
          targetRotationY: AGENT_DESK_SPOTS[ownerId].rotY,
          bubbleText: `Siap Bos! Lagi merevisi bagian ${ownerMeta.role} sekarang...`,
          bubbleTo: "ceo",
          bubbleExpiresAt: nextExpiry(),
        });
        addTelemetryLog(
          `${ownerMeta.name} (${ownerMeta.role})`,
          `Menerima permintaan revisi CEO. Memperbarui deliverable di meja kerja.`
        );

        await wait(900);

        set({ workflowPhase: "PRINTING_DELIVERABLE", activeSpeakerId: ownerId });
        updateAgent(ownerId, {
          status: "WALKING_TO_COPIER",
          standbyActivity: "roam",
          targetPosition: COPIER_OPERATE_SPOT.pos,
          targetRotationY: COPIER_OPERATE_SPOT.rotY,
          bubbleText: "Revisi beres & lolos QC! Mencetak ulang Master Launch Kit 7-BAB di Copier...",
          bubbleTo: "ceo",
          bubbleExpiresAt: nextExpiry(),
        });
        addTelemetryLog(
          `${ownerMeta.name} (${ownerMeta.role})`,
          "Menuju Copier West Wing untuk mencetak ulang Master Launch Kit 7-BAB (.md)."
        );

        await wait(1400);

        const prev = get().finalDeliverable!;
        const updatedDeliverable: FinalDeliverable = {
          landingPageCopy: patchData.landingPageCopy ?? prev.landingPageCopy,
          launchThread: patchData.launchThread ?? prev.launchThread,
          shortVideoScript: patchData.shortVideoScript ?? prev.shortVideoScript,
          socialMediaPlan: patchData.socialMediaPlan ?? prev.socialMediaPlan,
          financePlan: patchData.financePlan ?? prev.financePlan,
          hrOpsChecklist: patchData.hrOpsChecklist ?? prev.hrOpsChecklist,
          qcAuditReport: patchData.qcAuditReport ?? prev.qcAuditReport,
          qcCertificate: patchData.qcCertificate ?? prev.qcCertificate,
        };

        set({
          finalDeliverable: updatedDeliverable,
          activeDeliverableTab: revisedTab,
          workflowPhase: "COMPLETED",
          isDrawerOpen: true,
          handoffSummary:
            patchData.revisionSummary ||
            `Revisi selesai dicetak oleh ${ownerMeta.name}! Master Launch Kit 7-BAB (.md) terbaru siap diunduh.`,
        });
        addTelemetryLog(
          `${ownerMeta.name} (${ownerMeta.role})`,
          patchData.revisionSummary ||
            "Master Launch Kit 7-BAB hasil revisi sudah selesai dicetak & siap diunduh (.md)."
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

      const turns = Array.isArray(data.turns) ? data.turns : [];

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
      executiveBrief: "",
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

    addTelemetryLog("CEO", `Brief produk baru dikirim ke kampus Dual-Wing (7 divisi): "${trimmed}"`);
    addChatMessage("ceo", "all", `Tim 7 divisi, gas eksekusi brief produk baru kita: "${trimmed}"`);

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

    set({ activeSpeakerId: "manager" });
    const alexDispatchMsg = `Siap Bos! Maya riset pasar di West Wing, Raka validasi margin & Nadia cek kapasitas tim di East Wing untuk "${trimmed}"!`;
    updateAgent("manager", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      targetPosition: AGENT_DESK_SPOTS.manager.pos,
      targetRotationY: AGENT_DESK_SPOTS.manager.rotY,
      bubbleText: alexDispatchMsg,
      bubbleTo: "all",
      bubbleExpiresAt: nextExpiry(),
    });
    addChatMessage("manager", "all", alexDispatchMsg);
    addTelemetryLog(
      "Alex (Manager)",
      "Mendelegasikan riset (Maya — West Wing), validasi margin (Raka — East Wing), & kesiapan tim (Nadia — East Wing)."
    );

    await wait(500);

    set({ activeSpeakerId: "researcher" });
    updateAgent("researcher", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      targetPosition: AGENT_DESK_SPOTS.researcher.pos,
      targetRotationY: AGENT_DESK_SPOTS.researcher.rotY,
      bubbleText: "Siap Alex! Balik lewat pintu kaca ke meja riset West Wing!",
      bubbleTo: "manager",
      bubbleExpiresAt: nextExpiry(),
    });
    updateAgent("finance", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      targetPosition: AGENT_DESK_SPOTS.finance.pos,
      targetRotationY: AGENT_DESK_SPOTS.finance.rotY,
      bubbleText: "Menghitung benchmark harga & potensi ROI awal...",
      bubbleTo: "manager",
      bubbleExpiresAt: nextExpiry(),
    });
    updateAgent("hr", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      targetPosition: AGENT_DESK_SPOTS.hr.pos,
      targetRotationY: AGENT_DESK_SPOTS.hr.rotY,
      bubbleText: "Mengatur alokasi beban kerja & jadwal sprint 7 divisi...",
      bubbleTo: "manager",
      bubbleExpiresAt: nextExpiry(),
    });
    addChatMessage(
      "researcher",
      "manager",
      "Oke Alex! Gue langsung balik ke meja riset bedah psikologi pembeli bareng Raka dan Nadia."
    );

    try {
      const res = await orchestratePromise;
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Orkestrasi gagal (${res.status})`);
      }

      set({ activeSpeakerId: "researcher" });
      const mayaHandoffLine =
        data.mayaHandoffLine ||
        "Alex, dossier riset pasarnya sudah jadi! Raka & Nadia juga sudah kasih masukan kesiapan.";
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
        "Riset selesai. Menyerahkan dossier ke Meja Manager (West Wing)."
      );

      await wait(1200);

      set({ activeSpeakerId: "manager" });
      const alexApprovalLine =
        data.alexApprovalLine ||
        "Bos CEO, 3 Marketing Angle siap dipilih — setelah ACC seluruh 7 divisi langsung produksi & audit QC Bima!";

      updateAgent("researcher", {
        status: "IDLE_PANTRY",
        standbyActivity: "pantry",
        targetPosition: AGENT_PANTRY_SPOTS.researcher.pos,
        targetRotationY: AGENT_PANTRY_SPOTS.researcher.rotY,
        bubbleText: "Dossier beres — jalan lewat pintu ke Pantry East Wing!",
        bubbleTo: null,
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
        `Menyusun ${data.marketingAngles?.length || 3} marketing angle. Menunggu ACC CEO.`
      );

      set({
        workflowPhase: "AWAITING_CEO_APPROVAL",
        executiveBrief: data.executiveBrief || "",
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

      set({
        agents: createInitialAgents(),
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
      `Oke Alex, kita pakai angle "${selectedAngle.title}". Kerahkan 7 divisi produksi Master Launch Kit 7-BAB & wajib lolos Sertifikat QC Bima!`
    );

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
    const alexBriefAll = `Tim Dual-Wing! Angle "${selectedAngle.title}" di-ACC! Leo & Sora gas di West Wing, Raka & Nadia di East Wing — lalu wajib lolos audit QC Bima!`;
    updateAgent("manager", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      bubbleText: alexBriefAll,
      bubbleTo: "all",
      bubbleExpiresAt: nextExpiry(),
    });
    addChatMessage("manager", "all", alexBriefAll);

    await wait(500);

    set({ activeSpeakerId: "copywriter" });
    updateAgent("copywriter", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      targetPosition: AGENT_DESK_SPOTS.copywriter.pos,
      targetRotationY: AGENT_DESK_SPOTS.copywriter.rotY,
      bubbleText: "Menulis BAB 3: Landing Page, Thread Viral & Skrip Video 45d!",
      bubbleTo: "social",
      bubbleExpiresAt: nextExpiry(),
    });
    updateAgent("social", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      targetPosition: AGENT_DESK_SPOTS.social.pos,
      targetRotationY: AGENT_DESK_SPOTS.social.rotY,
      bubbleText: "Menyusun BAB 4: Kalender Sosmed 7 Hari & Community Growth!",
      bubbleTo: "copywriter",
      bubbleExpiresAt: nextExpiry(),
    });
    updateAgent("finance", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      targetPosition: AGENT_DESK_SPOTS.finance.pos,
      targetRotationY: AGENT_DESK_SPOTS.finance.rotY,
      bubbleText: "Menyusun BAB 5: Pricing Tier, Unit Economics & Proyeksi Bulan 1!",
      bubbleTo: "manager",
      bubbleExpiresAt: nextExpiry(),
    });
    updateAgent("hr", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      targetPosition: AGENT_DESK_SPOTS.hr.pos,
      targetRotationY: AGENT_DESK_SPOTS.hr.rotY,
      bubbleText: "Menyusun BAB 6: Launch SOP, Buyer SLA & Customer Onboarding!",
      bubbleTo: "qc",
      bubbleExpiresAt: nextExpiry(),
    });
    updateAgent("qc", {
      status: "WORKING",
      standbyActivity: "desk_sit",
      targetPosition: AGENT_DESK_SPOTS.qc.pos,
      targetRotationY: AGENT_DESK_SPOTS.qc.rotY,
      bubbleText: "Standby di Meja QC East Wing — siap audit 7-BAB sebelum rilis!",
      bubbleTo: "all",
      bubbleExpiresAt: nextExpiry(),
    });

    addTelemetryLog(
      "Produksi Dual-Wing",
      "West Wing (Leo, Sora) & East Wing (Raka, Nadia) mengeksekusi Master Launch Kit 7-BAB serentak."
    );

    try {
      const res = await copyPromise;
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Gagal membuat Launch Kit (${res.status})`);
      }

      // FASE PRE-LAUNCH QC GATE: Leo berjalan MELINTASI PINTU PENGHUBUNG dari West Wing ke Meja QC Bima di East Wing!
      set({ workflowPhase: "QC_REVIEW", activeSpeakerId: "qc" });
      updateAgent("copywriter", {
        status: "HANDOFF",
        standbyActivity: "roam",
        targetPosition: QC_HANDOFF_SPOT.pos,
        targetRotationY: QC_HANDOFF_SPOT.rotY,
        bubbleText: "Bima! Gue nyebrang lewat pintu tengah bawa draf 7-BAB buat diaudit QC!",
        bubbleTo: "qc",
        bubbleExpiresAt: nextExpiry(),
      });

      const bimaQcLine =
        data.qcSignoffLine ||
        "Diterima Leo! Gue sedang verifikasi Copy vs Pricing, Kalender Sosmed vs Funnel, dan SOP vs SLA sebelum terbitkan Sertifikat QC...";
      updateAgent("qc", {
        status: "WORKING",
        standbyActivity: "desk_sit",
        targetPosition: AGENT_DESK_SPOTS.qc.pos,
        targetRotationY: AGENT_DESK_SPOTS.qc.rotY,
        bubbleText: bimaQcLine,
        bubbleTo: "manager",
        bubbleExpiresAt: nextExpiry(),
      });
      addChatMessage("qc", "manager", bimaQcLine);
      addTelemetryLog(
        "Leo -> Bima (Lintas Pintu)",
        "Leo melintasi pintu penghubung West -> East Wing menyerahkan draf 7-BAB ke Meja QC Bima."
      );

      await wait(2400);

      // QC LOLOS -> Leo melintasi pintu kembali ke Copier West Wing untuk mencetak Master Launch Kit 7-BAB
      set({ workflowPhase: "PRINTING_DELIVERABLE", activeSpeakerId: "copywriter" });
      const leoPrintLine =
        data.leoPrintLine ||
        `Sertifikat QC Bima PASSED! Gue balik lewat pintu tengah ke Copier West Wing buat cetak Master Launch Kit 7-BAB!`;

      updateAgent("qc", {
        status: "WORKING",
        standbyActivity: "desk_sit",
        bubbleText: "PASSED — APPROVED FOR LAUNCH! Sertifikat QC resmi diterbitkan.",
        bubbleTo: "ceo",
        bubbleExpiresAt: nextExpiry(),
      });
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
        "Bima (QC Product)",
        "PRODUCT QC CERTIFICATE: PASSED — APPROVED FOR LAUNCH! Izin cetak diterbitkan."
      );
      addTelemetryLog(
        "Leo (Copywriter)",
        "Melintasi pintu kembali ke Copier West Wing untuk mencetak Master Launch Kit 7-BAB (.md)."
      );

      await wait(2400);

      set({ activeSpeakerId: "manager" });
      const finalNote =
        data.handoffSummary ||
        `Master Launch Kit 7-BAB untuk "${selectedAngle.title}" telah LOLOS Sertifikat Audit QC Bima dan selesai dicetak (.md)!`;

      updateAgent("copywriter", {
        status: "IDLE_PANTRY",
        standbyActivity: "pantry",
        targetPosition: AGENT_PANTRY_SPOTS.copywriter.pos,
        targetRotationY: AGENT_PANTRY_SPOTS.copywriter.rotY,
        bubbleText: "Master Launch Kit 7-BAB beres — rayain kopi di Pantry East Wing!",
        bubbleTo: "social",
        bubbleExpiresAt: nextExpiry(),
      });
      updateAgent("social", {
        status: "IDLE_PANTRY",
        standbyActivity: "pantry",
        targetPosition: AGENT_PANTRY_SPOTS.social.pos,
        targetRotationY: AGENT_PANTRY_SPOTS.social.rotY,
        bubbleText: "BAB 4 kalender konten siap tayang! Ikut ngopi di East Wing!",
        bubbleTo: "copywriter",
        bubbleExpiresAt: nextExpiry(),
      });
      updateAgent("manager", {
        status: "WORKING",
        standbyActivity: "desk_sit",
        targetPosition: AGENT_DESK_SPOTS.manager.pos,
        targetRotationY: AGENT_DESK_SPOTS.manager.rotY,
        bubbleText: "Misi 7-Divisi sukses & lolos Sertifikat QC! Siap diunduh CEO.",
        bubbleTo: "ceo",
        bubbleExpiresAt: nextExpiry(),
      });

      addChatMessage("manager", "ceo", finalNote);
      addTelemetryLog("Alex (Manager)", finalNote);

      set({
        workflowPhase: "COMPLETED",
        finalDeliverable: data.finalDeliverable || null,
        activeDeliverableTab: "qcAuditReport",
        handoffSummary: finalNote,
        isProcessing: false,
        isDrawerOpen: true,
      });

      window.setTimeout(() => {
        if (!get().isChatting && !get().isProcessing) {
          set({ activeSpeakerId: null });
        }
      }, 2400);
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
    for (const id of ALL_AGENT_IDS) {
      fresh[id].bubbleExpiresAt = exp;
    }

    set({
      agents: fresh,
      activeSpeakerId: null,
      workflowPhase: "IDLE",
      ceoBrief: "",
      executiveBrief: "",
      researchSummary: "",
      researchSources: [],
      managerReport: "",
      marketingAngles: [],
      selectedAngleId: null,
      finalDeliverable: null,
      activeDeliverableTab: "qcAuditReport",
      handoffSummary: "",
      isProcessing: false,
      isChatting: false,
      error: null,
      chatMessages: INITIAL_CHAT_MESSAGES,
      telemetryLogs: [
        makeLog(
          "STUDIO CORE",
          "Kampus Dual-Wing 7 divisi direset. Semua agent kembali ke rutinitas standby natural."
        ),
      ],
    });
  },
}));
