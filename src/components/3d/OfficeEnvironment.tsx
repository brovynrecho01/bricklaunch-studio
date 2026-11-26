"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ALL_AGENT_IDS, OFFICE_ZONES, useAgencyStore } from "@/store/useAgencyStore";
import { assetPath } from "@/lib/assetPath";
import {
  agentLivePositions,
  CONNECTING_DOOR_POS,
  CONNECTING_DOOR_TRIGGER_RADIUS,
} from "./agentLivePositions";

const HIDDEN_PANTRY_SHELL_NODES = new Set([
  "Arch_Wall_Left",
  "Arch_Ceiling_Soffit",
  "Arch_Floor_Slab",
  "Arch_Floor_Tiles",
  "Arch_Partition_Frame",
  "Arch_Partition_Glass",
  "Arch_Partition_Sill",
  "Arch_Baseboard",
]);

function enableShadows(root: THREE.Object3D) {
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

function WorkstationDesk({
  position,
  accentColor,
  isActive,
}: {
  position: [number, number, number];
  accentColor: string;
  isActive: boolean;
}) {
  const gltf = useGLTF(assetPath("/models/workstation_desk.glb"));

  const deskScene = useMemo(() => {
    const clone = gltf.scene.clone(true);

    const oakTopMat = new THREE.MeshStandardMaterial({
      color: "#D4A373",
      roughness: 0.42,
      metalness: 0.04,
    });
    const frameMetalMat = new THREE.MeshStandardMaterial({
      color: "#1E293B",
      roughness: 0.36,
      metalness: 0.65,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: "#CBD5E1",
      roughness: 0.2,
      metalness: 0.85,
    });
    const rubberMat = new THREE.MeshStandardMaterial({
      color: "#0F172A",
      roughness: 0.85,
      metalness: 0.05,
    });

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.name.includes("Tabletop")) {
          mesh.material = oakTopMat;
        } else if (mesh.name.includes("MetalGlides")) {
          mesh.material = chromeMat;
        } else if (mesh.name.includes("RubberPads")) {
          mesh.material = rubberMat;
        } else {
          mesh.material = frameMetalMat;
        }
      }
    });

    return clone;
  }, [gltf.scene]);

  return (
    <group position={position}>
      <primitive object={deskScene} />

      {/* Sleek studio workstation laptop perched on the 0.75m tabletop */}
      <group position={[0, 0.755, -0.04]}>
        <mesh castShadow receiveShadow position={[0, 0.01, 0]}>
          <boxGeometry args={[0.42, 0.018, 0.28]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.75} />
        </mesh>
        <group position={[0, 0.145, 0.125]} rotation={[-0.22, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.27, 0.014]} />
            <meshStandardMaterial color="#1E293B" roughness={0.28} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, -0.009]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.38, 0.23]} />
            <meshStandardMaterial
              color={isActive ? accentColor : "#0F172A"}
              emissive={isActive ? accentColor : "#1E293B"}
              emissiveIntensity={isActive ? 0.95 : 0.18}
              roughness={0.15}
            />
          </mesh>
        </group>

        <mesh receiveShadow position={[0, 0.002, 0.01]}>
          <boxGeometry args={[0.78, 0.004, 0.36]} />
          <meshStandardMaterial color="#1E293B" roughness={0.88} />
        </mesh>
      </group>

      {/* Modern studio ergonomic office chair positioned behind desk at z = -0.68 */}
      <group position={[0, 0, -0.68]}>
        <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.26, 0.28, 0.04, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.45} metalness={0.65} />
        </mesh>
        <mesh castShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.032, 0.038, 0.28, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
          <boxGeometry args={[0.48, 0.06, 0.44]} />
          <meshStandardMaterial color="#334155" roughness={0.78} metalness={0.05} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.62, -0.2]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.44, 0.48, 0.055]} />
          <meshStandardMaterial color="#1E293B" roughness={0.72} metalness={0.08} />
        </mesh>
        <mesh position={[0, 0.66, -0.232]}>
          <boxGeometry args={[0.24, 0.035, 0.01]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={isActive ? 0.5 : 0.12}
          />
        </mesh>
      </group>

      {/* Active workstation floor accent ring */}
      {isActive && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -0.15]}>
          <ringGeometry args={[0.92, 0.98, 48]} />
          <meshBasicMaterial
            color={accentColor}
            transparent
            opacity={0.42}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

function OfficeCopier() {
  const gltf = useGLTF(assetPath("/models/office_copier.glb"));
  const workflowPhase = useAgencyStore((s) => s.workflowPhase);
  const paperRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Mesh>(null);

  const copierScene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    enableShadows(clone);
    return clone;
  }, [gltf.scene]);

  const isPrinting = workflowPhase === "PRINTING_DELIVERABLE";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (paperRef.current) {
      if (isPrinting) {
        paperRef.current.visible = true;
        const cycle = (t * 1.4) % 1;
        paperRef.current.position.x = -0.35 - cycle * 0.22;
        paperRef.current.position.y = 0.78 + Math.sin(cycle * Math.PI) * 0.02;
      } else {
        paperRef.current.visible = false;
      }
    }
    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = isPrinting ? 1.5 + Math.sin(t * 12) * 0.8 : 0.45;
    }
  });

  return (
    <group
      position={[
        OFFICE_ZONES.COPIER_PRINTER_ZONE[0],
        0.07,
        OFFICE_ZONES.COPIER_PRINTER_ZONE[2],
      ]}
    >
      <primitive object={copierScene} />

      <mesh ref={beaconRef} position={[0.25, 1.12, 0.36]}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshStandardMaterial
          color={isPrinting ? "#A855F7" : "#10B981"}
          emissive={isPrinting ? "#A855F7" : "#10B981"}
          emissiveIntensity={0.6}
        />
      </mesh>

      <mesh ref={paperRef} position={[-0.45, 0.78, 0.05]} visible={false} castShadow>
        <boxGeometry args={[0.28, 0.012, 0.22]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#E9D5FF"
          emissiveIntensity={0.35}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function PantryBar() {
  const gltf = useGLTF(assetPath("/models/pantry_bar.glb"));

  const pantryScene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if (HIDDEN_PANTRY_SHELL_NODES.has(child.name)) {
        child.visible = false;
      }
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [gltf.scene]);

  // Placed in East Wing back-right ([8.5, 0, -2.2]) facing +Z into the East Wing lounge
  return (
    <group position={OFFICE_ZONES.PANTRY_COFFEE_ZONE} rotation={[0, 0, 0]}>
      <group position={[0, 0, -0.35]} scale={0.78}>
        <primitive object={pantryScene} />

        {/* Compact studio espresso machine accent on quartz countertop */}
        <group position={[0.22, 0.91, -1.42]}>
          <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
            <boxGeometry args={[0.34, 0.32, 0.28]} />
            <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.75} />
          </mesh>
          <mesh castShadow position={[0, 0.27, 0.15]}>
            <boxGeometry args={[0.24, 0.07, 0.09]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.18} metalness={0.85} />
          </mesh>
          <mesh position={[0.1, 0.28, 0.195]}>
            <sphereGeometry args={[0.014, 12, 12]} />
            <meshStandardMaterial
              color="#34D399"
              emissive="#34D399"
              emissiveIntensity={1.6}
            />
          </mesh>
        </group>

        <pointLight
          position={[-0.4, 1.4, -1.0]}
          color="#FDE68A"
          intensity={1.8}
          distance={5.5}
          decay={2}
        />
      </group>
    </group>
  );
}

/**
 * Architectural Glass/Oak Partition Wall at X = 0 + Animated Proximity Hinged Doorway at [0, 0, -0.5].
 * Automatically swings smoothly open (Math.PI / 2.2) whenever any of the 7 agents comes within 2.2m.
 */
function ConnectingPartitionAndDoor() {
  const doorPivotRef = useRef<THREE.Group>(null);
  const sensorLedRef = useRef<THREE.Mesh>(null);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const door = doorPivotRef.current;
    if (!door) return;

    let agentNearby = false;
    for (const id of ALL_AGENT_IDS) {
      const pos = agentLivePositions[id];
      const dist = Math.hypot(
        pos.x - CONNECTING_DOOR_POS[0],
        pos.z - CONNECTING_DOOR_POS[2]
      );
      if (dist <= CONNECTING_DOOR_TRIGGER_RADIUS) {
        agentNearby = true;
        break;
      }
    }

    const targetAngle = agentNearby ? Math.PI / 2.2 : 0;
    door.rotation.y = THREE.MathUtils.lerp(
      door.rotation.y,
      targetAngle,
      Math.min(1, delta * 6.5)
    );

    if (sensorLedRef.current) {
      const mat = sensorLedRef.current.material as THREE.MeshStandardMaterial;
      mat.color.set(agentNearby ? "#34D399" : "#F59E0B");
      mat.emissive.set(agentNearby ? "#34D399" : "#F59E0B");
      mat.emissiveIntensity = agentNearby ? 1.8 : 0.65;
    }
  });

  // Doorway opening: Z in [-1.35, +0.35] (width = 1.7m centered at Z = -0.5), height = 2.45m
  return (
    <group position={[0, 0, 0]}>
      {/* Floor threshold plate at doorway [0, 0, -0.5] */}
      <mesh receiveShadow position={[0, 0.008, -0.5]}>
        <boxGeometry args={[0.36, 0.016, 1.76]} />
        <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.7} />
      </mesh>

      {/* Back Glass Partition Segment: Z from -4.95 to -1.35 (length 3.6m) */}
      <group position={[0, 0, -3.15]}>
        {/* Lower solid oak wainscoting */}
        <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
          <boxGeometry args={[0.14, 0.9, 3.6]} />
          <meshStandardMaterial color="#B08968" roughness={0.5} metalness={0.05} />
        </mesh>
        {/* Upper translucent architectural glass */}
        <mesh position={[0, 2.25, 0]}>
          <boxGeometry args={[0.04, 2.7, 3.5]} />
          <meshPhysicalMaterial
            color="#E0F2FE"
            transparent
            opacity={0.24}
            roughness={0.08}
            metalness={0.1}
          />
        </mesh>
        {/* Top dark aluminum header beam */}
        <mesh castShadow position={[0, 3.65, 0]}>
          <boxGeometry args={[0.16, 0.14, 3.64]} />
          <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.75} />
        </mesh>
        {/* Vertical center mullion */}
        <mesh castShadow position={[0, 1.85, 0]}>
          <boxGeometry args={[0.12, 3.6, 0.08]} />
          <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.75} />
        </mesh>
      </group>

      {/* Doorway Frame Posts & Transom Header around Z = [-1.35, +0.35] */}
      {/* North/Back Jamb Post (Hinge Side at Z = -1.35) */}
      <mesh castShadow receiveShadow position={[0, 1.85, -1.35]}>
        <boxGeometry args={[0.18, 3.7, 0.1]} />
        <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.75} />
      </mesh>
      {/* South/Front Jamb Post (Latch Side at Z = +0.35) */}
      <mesh castShadow receiveShadow position={[0, 1.85, 0.35]}>
        <boxGeometry args={[0.18, 3.7, 0.1]} />
        <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.75} />
      </mesh>
      {/* Doorway Header Lintel at Y = 2.48 */}
      <mesh castShadow position={[0, 2.5, -0.5]}>
        <boxGeometry args={[0.2, 0.14, 1.8]} />
        <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.75} />
      </mesh>
      {/* Glass Transom above Doorway */}
      <mesh position={[0, 3.1, -0.5]}>
        <boxGeometry args={[0.04, 1.05, 1.66]} />
        <meshPhysicalMaterial
          color="#E0F2FE"
          transparent
          opacity={0.22}
          roughness={0.08}
        />
      </mesh>
      {/* Top Beam across Doorway */}
      <mesh castShadow position={[0, 3.65, -0.5]}>
        <boxGeometry args={[0.18, 0.14, 1.8]} />
        <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.75} />
      </mesh>
      {/* Auto-Door Proximity Sensor LED Bar */}
      <mesh ref={sensorLedRef} position={[0, 2.52, -0.5]}>
        <boxGeometry args={[0.22, 0.04, 0.45]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.65} />
      </mesh>

      {/* ANIMATED HINGED GLASS/OAK OFFICE DOOR (pivots at hinge Z = -1.30) */}
      <group ref={doorPivotRef} position={[0, 0, -1.3]}>
        {/* Offset leaf by +0.80 along +Z so it spans cleanly from hinge (-1.30) to latch (+0.30) */}
        <group position={[0, 1.21, 0.8]}>
          {/* Solid Oak Door Stile Frame (Left/Hinge, Right/Latch, Top, Bottom) */}
          <mesh castShadow receiveShadow position={[0, 0, -0.74]}>
            <boxGeometry args={[0.075, 2.42, 0.12]} />
            <meshStandardMaterial color="#B08968" roughness={0.42} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0, 0.74]}>
            <boxGeometry args={[0.075, 2.42, 0.12]} />
            <meshStandardMaterial color="#B08968" roughness={0.42} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 1.14, 0]}>
            <boxGeometry args={[0.075, 0.14, 1.6]} />
            <meshStandardMaterial color="#B08968" roughness={0.42} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, -1.04, 0]}>
            <boxGeometry args={[0.075, 0.34, 1.6]} />
            <meshStandardMaterial color="#B08968" roughness={0.42} />
          </mesh>

          {/* Frosted Tempered Glass Center Panel */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.028, 1.94, 1.36]} />
            <meshPhysicalMaterial
              color="#BAE6FD"
              transparent
              opacity={0.34}
              roughness={0.12}
              metalness={0.05}
            />
          </mesh>

          {/* Subtle BrickLaunch Orange Accent Band on Glass */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.032, 0.08, 1.36]} />
            <meshStandardMaterial
              color="#F04A1A"
              emissive="#F04A1A"
              emissiveIntensity={0.28}
              roughness={0.25}
            />
          </mesh>

          {/* Brushed Chrome Vertical Push/Pull Handles on Both Sides */}
          <mesh castShadow position={[0.07, -0.05, 0.62]}>
            <cylinderGeometry args={[0.015, 0.015, 0.5, 12]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh castShadow position={[-0.07, -0.05, 0.62]}>
            <cylinderGeometry args={[0.015, 0.015, 0.5, 12]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* Front Half-Height Architectural Partition: Z from +0.35 to +4.85 (keeps full visibility!) */}
      <group position={[0, 0, 2.6]}>
        <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
          <boxGeometry args={[0.14, 0.9, 4.5]} />
          <meshStandardMaterial color="#B08968" roughness={0.5} metalness={0.05} />
        </mesh>
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[0.04, 0.7, 4.42]} />
          <meshPhysicalMaterial
            color="#E0F2FE"
            transparent
            opacity={0.22}
            roughness={0.08}
          />
        </mesh>
        <mesh castShadow position={[0, 1.62, 0]}>
          <boxGeometry args={[0.14, 0.06, 4.52]} />
          <meshStandardMaterial color="#1E293B" roughness={0.35} metalness={0.75} />
        </mesh>
        {/* Front End Post */}
        <mesh castShadow position={[0, 0.84, 2.25]}>
          <boxGeometry args={[0.16, 1.68, 0.1]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.75} />
        </mesh>
      </group>
    </group>
  );
}

export function OfficeEnvironment() {
  const roomGltf = useGLTF(assetPath("/models/office_room.glb"));
  const agents = useAgencyStore((s) => s.agents);

  const { westRoomScene, eastRoomScene } = useMemo(() => {
    const west = roomGltf.scene.clone(true);
    const east = roomGltf.scene.clone(true);
    enableShadows(west);
    enableShadows(east);
    return { westRoomScene: west, eastRoomScene: east };
  }, [roomGltf.scene]);

  return (
    <group>
      {/* WEST WING: Executive, Intelligence & Creative (12m x 10m centered at [-6, 0, 0]) */}
      <group position={[-6, 0, 0]} scale={[12 / 4.4, 1.32, 10 / 4.4]}>
        <primitive object={westRoomScene} />
      </group>

      {/* EAST WING: Finance, Operations, QC & Pantry (12m x 10m centered at [6, 0, 0])
          Rotated -90 deg so its outer walls form the continuous Back Wall (Z=-5) and East Wall (X=+12)
          while X=0 opens cleanly into our Connecting Glass Partition & Animated Doorway! */}
      <group
        position={[6, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[10 / 4.4, 1.32, 12 / 4.4]}
      >
        <primitive object={eastRoomScene} />
      </group>

      {/* Central Dividing Partition at X = 0 + Proximity Auto-Open Doorway at [0, 0, -0.5] */}
      <ConnectingPartitionAndDoor />

      {/* WEST WING WORKSTATIONS (Alex, Maya, Leo, Sora) */}
      <WorkstationDesk
        position={OFFICE_ZONES.MANAGER_DESK}
        accentColor="#60A5FA"
        isActive={
          agents.manager.status === "WORKING" ||
          agents.manager.status === "WAITING_APPROVAL"
        }
      />
      <WorkstationDesk
        position={OFFICE_ZONES.RESEARCHER_DESK}
        accentColor="#38BDF8"
        isActive={agents.researcher.status === "WORKING"}
      />
      <WorkstationDesk
        position={OFFICE_ZONES.COPYWRITER_DESK}
        accentColor="#FBBF24"
        isActive={agents.copywriter.status === "WORKING"}
      />
      <WorkstationDesk
        position={OFFICE_ZONES.SOCIAL_DESK}
        accentColor="#F472B6"
        isActive={agents.social.status === "WORKING"}
      />

      {/* EAST WING WORKSTATIONS (Raka, Nadia, Bima) */}
      <WorkstationDesk
        position={OFFICE_ZONES.FINANCE_DESK}
        accentColor="#34D399"
        isActive={agents.finance.status === "WORKING"}
      />
      <WorkstationDesk
        position={OFFICE_ZONES.HR_DESK}
        accentColor="#A78BFA"
        isActive={agents.hr.status === "WORKING"}
      />
      <WorkstationDesk
        position={OFFICE_ZONES.QC_DESK}
        accentColor="#F87171"
        isActive={agents.qc.status === "WORKING"}
      />

      {/* EAST WING PANTRY COFFEE BAR ([8.5, 0, -2.2]) */}
      <PantryBar />

      {/* WEST WING OFFICE COPIER / PRINTER ZONE ([-4.2, 0, -3.5]) */}
      <OfficeCopier />
    </group>
  );
}
