"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  AgentState,
  AgentStatus,
  ChatRecipient,
  useAgencyStore,
} from "@/store/useAgencyStore";
import { assetPath } from "@/lib/assetPath";

interface LegoAgentProps {
  agent: AgentState;
}

const TROUSER_COLORS: Record<string, string> = {
  manager: "#0F172A",
  researcher: "#1E3A5F",
  copywriter: "#292524",
};

const RECIPIENT_LABELS: Record<ChatRecipient, string> = {
  ceo: "CEO",
  all: "Semua Tim",
  manager: "Alex",
  researcher: "Maya",
  copywriter: "Leo",
};

const STATUS_META: Record<
  AgentStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  IDLE_PANTRY: {
    label: "SANTAI DI PANTRY",
    dotClass: "bg-emerald-400",
    badgeClass: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
  },
  WALKING_TO_DESK: {
    label: "OTW MEJA KERJA",
    dotClass: "bg-sky-400 animate-pulse",
    badgeClass: "bg-sky-500/20 text-sky-200 border-sky-400/30",
  },
  WORKING: {
    label: "DUDUK DI MEJA",
    dotClass: "bg-amber-400 animate-pulse",
    badgeClass: "bg-amber-500/20 text-amber-200 border-amber-400/30",
  },
  WALKING_TO_COPIER: {
    label: "PRINT LAUNCH KIT",
    dotClass: "bg-violet-400 animate-pulse",
    badgeClass: "bg-violet-500/20 text-violet-200 border-violet-400/30",
  },
  HANDOFF: {
    label: "SERAH TERIMA",
    dotClass: "bg-cyan-400 animate-pulse",
    badgeClass: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30",
  },
  WAITING_APPROVAL: {
    label: "TUNGGU ACC CEO",
    dotClass: "bg-rose-400 animate-ping",
    badgeClass: "bg-rose-500/25 text-rose-100 border-rose-400/40",
  },
};

function findPart(root: THREE.Object3D, candidates: string[]): THREE.Object3D | null {
  for (const name of candidates) {
    const found = root.getObjectByName(name);
    if (found) return found;
  }
  return null;
}

function wrapInPivot(
  parent: THREE.Object3D,
  objects: Array<THREE.Object3D | null>,
  pivotPos: [number, number, number]
): THREE.Group {
  const pivot = new THREE.Group();
  pivot.position.set(pivotPos[0], pivotPos[1], pivotPos[2]);

  const inner = new THREE.Group();
  inner.position.set(-pivotPos[0], -pivotPos[1], -pivotPos[2]);

  for (const obj of objects) {
    if (obj) {
      inner.add(obj);
    }
  }

  pivot.add(inner);
  parent.add(pivot);
  return pivot;
}

function shortestAngleDiff(from: number, to: number): number {
  let diff = ((to - from + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

export function LegoAgent({ agent }: LegoAgentProps) {
  const gltf = useGLTF(assetPath("/models/lego_agent.glb"));
  const activeSpeakerId = useAgencyStore((s) => s.activeSpeakerId);
  const setChatTarget = useAgencyStore((s) => s.setChatTarget);
  const [isHovered, setIsHovered] = React.useState(false);
  const [nowMs, setNowMs] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const isSpeaking = activeSpeakerId === agent.id;
  // Tampil selama 3 menit (bubbleExpiresAt) sejak pesan terakhir, atau saat aktif bicara / hover / tunggu ACC CEO
  const hasActiveCloud =
    agent.bubbleExpiresAt === null ? true : nowMs < agent.bubbleExpiresAt;
  const showCloudPopup =
    hasActiveCloud || isSpeaking || isHovered || agent.status === "WAITING_APPROVAL";
  const isExpandedCloud =
    isSpeaking || isHovered || agent.status === "WAITING_APPROVAL";

  const rootGroupRef = useRef<THREE.Group>(null);
  const bodyBounceRef = useRef<THREE.Group>(null);
  const currentPosRef = useRef(new THREE.Vector3(...agent.targetPosition));
  const currentYawRef = useRef(agent.targetRotationY);
  const targetVecRef = useRef(new THREE.Vector3(...agent.targetPosition));

  // Set posisi awal sekali saat mount agar re-render timer 1 detik tidak me-reset animasi jalan
  React.useEffect(() => {
    if (rootGroupRef.current) {
      rootGroupRef.current.position.copy(currentPosRef.current);
      rootGroupRef.current.rotation.y = currentYawRef.current;
    }
  }, []);

  const rig = useMemo(() => {
    const clone = gltf.scene.clone(true);

    const torsoColor = new THREE.Color(agent.torsoColor);
    const trouserColor = new THREE.Color(TROUSER_COLORS[agent.id] || "#1E293B");

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const mat = Array.isArray(mesh.material)
          ? mesh.material.map((m) => m.clone())
          : mesh.material.clone();
        mesh.material = mat;

        const lower = mesh.name.toLowerCase();
        const isTorsoOrSleeve =
          lower.includes("torso") || lower.includes("arm_l") || lower.includes("arm_r");
        const isTrouser = lower.includes("leg_") || lower.includes("hips");

        const applyTint = (m: THREE.Material) => {
          if (m instanceof THREE.MeshStandardMaterial) {
            m.roughness = 0.24;
            m.metalness = 0.04;
            if (isTorsoOrSleeve) {
              m.color.copy(torsoColor);
            } else if (isTrouser) {
              m.color.copy(trouserColor);
            }
          }
        };

        if (Array.isArray(mat)) {
          mat.forEach(applyTint);
        } else {
          applyTint(mat);
        }
      }
    });

    const legL = findPart(clone, ["Minifig_Leg_L", "agent_leg_L"]);
    const legR = findPart(clone, ["Minifig_Leg_R", "agent_leg_R"]);
    const armL = findPart(clone, ["Minifig_Arm_L", "agent_arm_L"]);
    const armR = findPart(clone, ["Minifig_Arm_R", "agent_arm_R"]);
    const handL = findPart(clone, ["Minifig_Hand_L", "agent_hand_L"]);
    const handR = findPart(clone, ["Minifig_Hand_R", "agent_hand_R"]);

    const legLPivot = wrapInPivot(clone, [legL], [0.17, 0.64, 0.0]);
    const legRPivot = wrapInPivot(clone, [legR], [-0.17, 0.64, 0.0]);
    const armLPivot = wrapInPivot(clone, [armL, handL], [0.32, 1.15, 0.0]);
    const armRPivot = wrapInPivot(clone, [armR, handR], [-0.32, 1.15, 0.0]);

    // Espresso mug held during IDLE_PANTRY
    const coffeeGroup = new THREE.Group();
    coffeeGroup.position.set(-0.1, -0.5, 0.25);

    const cupMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.07, 0.16, 16),
      new THREE.MeshStandardMaterial({
        color: "#F8FAFC",
        roughness: 0.18,
        metalness: 0.05,
      })
    );
    cupMesh.castShadow = true;

    const coffeeTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.072, 0.072, 0.015, 16),
      new THREE.MeshStandardMaterial({
        color: "#3B1F0F",
        roughness: 0.15,
      })
    );
    coffeeTop.position.y = 0.075;

    const cupHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.048, 0.014, 8, 16),
      new THREE.MeshStandardMaterial({
        color: "#F8FAFC",
        roughness: 0.18,
      })
    );
    cupHandle.position.set(0.08, 0, 0);

    coffeeGroup.add(cupMesh, coffeeTop, cupHandle);
    armRPivot.add(coffeeGroup);

    // Dossier prop held during HANDOFF
    const dossierGroup = new THREE.Group();
    dossierGroup.position.set(0.08, -0.45, 0.28);
    dossierGroup.rotation.set(0.35, 0, 0);

    const paperMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.025, 0.36),
      new THREE.MeshStandardMaterial({
        color: "#FFFFFF",
        emissive: "#38BDF8",
        emissiveIntensity: 0.12,
        roughness: 0.35,
      })
    );
    paperMesh.castShadow = true;
    dossierGroup.add(paperMesh);
    armLPivot.add(dossierGroup);

    return {
      scene: clone,
      legLPivot,
      legRPivot,
      armLPivot,
      armRPivot,
      coffeeGroup,
      dossierGroup,
    };
  }, [gltf.scene, agent.id, agent.torsoColor]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const root = rootGroupRef.current;
    const bounce = bodyBounceRef.current;
    if (!root || !bounce) return;

    targetVecRef.current.set(
      agent.targetPosition[0],
      agent.targetPosition[1],
      agent.targetPosition[2]
    );

    const dx = targetVecRef.current.x - currentPosRef.current.x;
    const dz = targetVecRef.current.z - currentPosRef.current.z;
    const dist = Math.hypot(dx, dz);

    const isMoving = dist > 0.06;

    if (isMoving) {
      const lerpAlpha = 1 - Math.exp(-3.1 * delta);
      const stepFactor = Math.min(lerpAlpha, (3.2 * delta) / Math.max(dist, 0.001));
      currentPosRef.current.lerp(targetVecRef.current, Math.max(stepFactor, lerpAlpha * 0.45));

      const moveYaw = Math.atan2(dx, dz);
      currentYawRef.current +=
        shortestAngleDiff(currentYawRef.current, moveYaw) * Math.min(1, delta * 9);
    } else {
      currentPosRef.current.lerp(targetVecRef.current, Math.min(1, delta * 10));
      currentYawRef.current +=
        shortestAngleDiff(currentYawRef.current, agent.targetRotationY) *
        Math.min(1, delta * 7);
    }

    root.position.copy(currentPosRef.current);
    root.rotation.y = currentYawRef.current;

    const { legLPivot, legRPivot, armLPivot, armRPivot, coffeeGroup, dossierGroup } = rig;
    const smooth = Math.min(1, delta * 12);

    let targetLegL = 0;
    let targetLegR = 0;
    let targetArmL = 0;
    let targetArmR = 0;
    let targetArmRZ = 0;
    let targetBounceY = 0;

    const isSeatedAtDesk =
      !isMoving &&
      (agent.status === "WORKING" ||
        agent.status === "WAITING_APPROVAL" ||
        agent.standbyActivity === "desk_sit");

    if (isMoving) {
      const stride = Math.sin(t * 11.5);
      targetLegL = stride * 0.62;
      targetLegR = -stride * 0.62;
      targetArmL = -stride * 0.48;
      targetArmR = stride * 0.48;
      targetBounceY = Math.abs(stride) * 0.045;
    } else if (agent.status === "WAITING_APPROVAL") {
      // Alex duduk di kursi meja manager sambil melambaikan tangan ke CEO
      targetLegL = -Math.PI / 2;
      targetLegR = -Math.PI / 2;
      targetArmR = -2.25;
      targetArmRZ = Math.sin(t * 6) * 0.22;
      targetArmL = -0.55;
      targetBounceY = -0.14 + Math.abs(Math.sin(t * 3)) * 0.015;
    } else if (isSeatedAtDesk) {
      // Pose duduk Lego natural di kursi kantor + mengetik di laptop
      targetLegL = -Math.PI / 2;
      targetLegR = -Math.PI / 2;
      targetArmL = -1.05 + Math.sin(t * 14) * 0.14;
      targetArmR = -1.05 + Math.cos(t * 14) * 0.14;
      targetBounceY = -0.14 + Math.sin(t * 3.0) * 0.006;
    } else if (agent.status === "IDLE_PANTRY" && agent.standbyActivity === "pantry") {
      // Santai pegang kopi di Pantry Bar
      const phaseOffset =
        agent.id === "researcher" ? 2.1 : agent.id === "copywriter" ? 4.2 : 0;
      const sip = Math.max(0, Math.sin(t * 1.1 + phaseOffset));
      targetArmR = -0.82 - sip * 0.25;
      targetArmL = isSpeaking
        ? -0.65 + Math.sin(t * 9) * 0.18
        : -0.1 + Math.sin(t * 1.4) * 0.05;
      targetBounceY = isSpeaking ? Math.abs(Math.sin(t * 6)) * 0.02 : Math.sin(t * 1.8) * 0.006;
    } else if (agent.standbyActivity === "roam") {
      // Berdiri santai di sela jalan-jalan keliling ruangan
      targetArmL = isSpeaking ? -0.55 + Math.sin(t * 8) * 0.15 : -0.08 + Math.sin(t * 1.6) * 0.06;
      targetArmR = -0.08 - Math.sin(t * 1.6) * 0.06;
      targetBounceY = Math.sin(t * 2.0) * 0.008;
    } else if (agent.status === "WALKING_TO_COPIER") {
      targetArmR = -0.95 + Math.sin(t * 7) * 0.14;
      targetArmL = -0.65 + Math.cos(t * 5) * 0.08;
      targetBounceY = Math.sin(t * 4) * 0.01;
    } else if (agent.status === "HANDOFF") {
      targetArmL = -0.92;
      targetArmR = -0.55;
    }

    legLPivot.rotation.x = THREE.MathUtils.lerp(legLPivot.rotation.x, targetLegL, smooth);
    legRPivot.rotation.x = THREE.MathUtils.lerp(legRPivot.rotation.x, targetLegR, smooth);
    armLPivot.rotation.x = THREE.MathUtils.lerp(armLPivot.rotation.x, targetArmL, smooth);
    armRPivot.rotation.x = THREE.MathUtils.lerp(armRPivot.rotation.x, targetArmR, smooth);
    armRPivot.rotation.z = THREE.MathUtils.lerp(armRPivot.rotation.z, targetArmRZ, smooth);
    bounce.position.y = THREE.MathUtils.lerp(bounce.position.y, targetBounceY, smooth);

    coffeeGroup.visible =
      agent.status === "IDLE_PANTRY" && agent.standbyActivity === "pantry" && !isMoving;
    dossierGroup.visible = agent.status === "HANDOFF";
  });

  const statusMeta = STATUS_META[agent.status];
  const displayStatusLabel =
    agent.status === "IDLE_PANTRY" && agent.standbyActivity === "roam"
      ? "JALAN SANTAI"
      : statusMeta.label;

  return (
    <group
      ref={rootGroupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onPointerOut={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setChatTarget(agent.id);
      }}
    >
      <group ref={bodyBounceRef} scale={0.73}>
        <primitive object={rig.scene} />
      </group>

      {/* Floor halo when working or actively speaking */}
      {(agent.status !== "IDLE_PANTRY" || isSpeaking) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <ringGeometry args={[0.34, 0.46, 32]} />
          <meshBasicMaterial
            color={isSpeaking ? "#FBBF24" : agent.accentColor}
            transparent
            opacity={isSpeaking ? 0.8 : 0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 3D Floating Speech Cloud Popup — tetap ter-mount agar React 19 tidak unmount root secara sinkron; sembunyi mulus setelah 3 menit */}
      <Html
        position={[0, 1.92, 0]}
        center
        distanceFactor={15}
        zIndexRange={[18, 6]}
        style={{ pointerEvents: showCloudPopup ? "auto" : "none" }}
      >
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => {
            if (showCloudPopup) setChatTarget(agent.id);
          }}
          title={`Klik untuk chat langsung dengan ${agent.name}`}
          aria-hidden={!showCloudPopup}
          className={`relative select-none transition-all duration-300 ${
            !showCloudPopup
              ? "w-48 scale-90 opacity-0 pointer-events-none"
              : isExpandedCloud
                ? "w-60 scale-105 opacity-100 cursor-pointer"
                : "w-48 scale-100 opacity-95 hover:opacity-100 cursor-pointer"
          }`}
        >
          {/* Main Cloud Bubble */}
          <div
            className={`rounded-3xl border px-3 py-2 text-left shadow-xl backdrop-blur-md transition-all ${
              isSpeaking
                ? "border-amber-300/90 bg-white/95 text-slate-900 shadow-amber-400/25 ring-4 ring-amber-400/25"
                : "border-white/30 bg-slate-950/86 text-white"
            }`}
          >
            {/* Header: Name + Recipient Pill */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/60"
                  style={{ backgroundColor: agent.accentColor }}
                />
                <span
                  className={`truncate text-xs font-bold tracking-tight ${
                    isSpeaking ? "text-slate-900" : "text-white"
                  }`}
                >
                  {agent.name}
                </span>
                {isExpandedCloud && (
                  <span
                    className={`truncate text-[9px] font-medium ${
                      isSpeaking ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    · {agent.role}
                  </span>
                )}
              </div>

              {agent.bubbleTo && isExpandedCloud && (
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold ${
                    isSpeaking
                      ? "bg-amber-100 text-amber-800"
                      : "bg-white/10 text-sky-200"
                  }`}
                >
                  → {RECIPIENT_LABELS[agent.bubbleTo]}
                </span>
              )}
            </div>

            {/* Live Cloud Message Text */}
            <p
              className={`mt-1 text-[10.5px] leading-snug font-medium ${
                isExpandedCloud ? "line-clamp-3" : "line-clamp-1"
              } ${isSpeaking ? "text-slate-800" : "text-slate-200"}`}
            >
              &ldquo;{agent.bubbleText}&rdquo;
            </p>

            {/* Footer Status Pill */}
            {(isExpandedCloud || agent.status !== "IDLE_PANTRY") && (
              <div className="mt-1.5 flex items-center justify-between gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] font-bold tracking-wider ${
                    isSpeaking
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : statusMeta.badgeClass
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isSpeaking ? "bg-amber-500 animate-ping" : statusMeta.dotClass
                    }`}
                  />
                  {isSpeaking ? "SEDANG BICARA" : displayStatusLabel}
                </span>
              </div>
            )}
          </div>

          {/* Cloud Speech Pointer Tail */}
          <div className="flex flex-col items-center -mt-0.5">
            <div
              className={`h-2 w-2 rotate-45 -mt-1 border-r border-b ${
                isSpeaking
                  ? "border-amber-300/90 bg-white/95"
                  : "border-white/25 bg-slate-950/80"
              }`}
            />
            <div
              className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                isSpeaking ? "bg-white/95" : "bg-slate-950/80"
              }`}
            />
          </div>
        </div>
      </Html>
    </group>
  );
}
