import * as THREE from "three";
import type { AgentId } from "@/store/useAgencyStore";

/**
 * Shared mutable world-position registry updated per-frame by each LegoAgent
 * so the Connecting Door can evaluate 2.2m proximity at 60fps with zero React re-renders.
 */
export const agentLivePositions: Record<AgentId, THREE.Vector3> = {
  manager: new THREE.Vector3(-9.2, 0, -3.18),
  researcher: new THREE.Vector3(7.4, 0, -1.2),
  copywriter: new THREE.Vector3(-6.2, 0, 0.2),
  social: new THREE.Vector3(-3.0, 0, -0.4),
  finance: new THREE.Vector3(3.0, 0, 1.12),
  hr: new THREE.Vector3(8.5, 0, -1.1),
  qc: new THREE.Vector3(9.2, 0, 1.12),
};

export const CONNECTING_DOOR_POS: [number, number, number] = [0, 0, -0.5];
export const CONNECTING_DOOR_TRIGGER_RADIUS = 2.2;
