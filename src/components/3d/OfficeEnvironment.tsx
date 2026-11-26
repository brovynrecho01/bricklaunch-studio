"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { OFFICE_ZONES, useAgencyStore } from "@/store/useAgencyStore";
import { assetPath } from "@/lib/assetPath";

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
        {/* Laptop base */}
        <mesh castShadow receiveShadow position={[0, 0.01, 0]}>
          <boxGeometry args={[0.42, 0.018, 0.28]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.75} />
        </mesh>
        {/* Angled display facing the agent sitting/standing at -Z */}
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

        {/* Minimalist desk mat */}
        <mesh receiveShadow position={[0, 0.002, 0.01]}>
          <boxGeometry args={[0.78, 0.004, 0.36]} />
          <meshStandardMaterial color="#1E293B" roughness={0.88} />
        </mesh>
      </group>

      {/* Modern studio ergonomic office chair positioned behind desk at z = -0.68 */}
      <group position={[0, 0, -0.68]}>
        {/* 5-star caster base */}
        <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.26, 0.28, 0.04, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.45} metalness={0.65} />
        </mesh>
        {/* Gas lift cylinder */}
        <mesh castShadow position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.032, 0.038, 0.28, 12]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Cushioned seat pan */}
        <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
          <boxGeometry args={[0.48, 0.06, 0.44]} />
          <meshStandardMaterial color="#334155" roughness={0.78} metalness={0.05} />
        </mesh>
        {/* Contoured backrest */}
        <mesh castShadow receiveShadow position={[0, 0.62, -0.2]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.44, 0.48, 0.055]} />
          <meshStandardMaterial color="#1E293B" roughness={0.72} metalness={0.08} />
        </mesh>
        {/* Subtle accent stripe on backrest */}
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

      {/* Printing status beacon light on top of control console */}
      <mesh ref={beaconRef} position={[0.25, 1.12, 0.36]}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshStandardMaterial
          color={isPrinting ? "#A855F7" : "#10B981"}
          emissive={isPrinting ? "#A855F7" : "#10B981"}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Animated printed Launch Kit sheet sliding into catch tray */}
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

  return (
    <group position={OFFICE_ZONES.PANTRY_COFFEE_ZONE} rotation={[0, -Math.PI / 2, 0]}>
      {/* Offset local Z so cabinetry front aligns neatly with PANTRY_COFFEE_ZONE */}
      <group position={[0, 0, 1.35]} scale={0.78}>
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

        {/* Warm under-cabinet pantry glow */}
        <pointLight
          position={[-0.4, 1.4, -1.25]}
          color="#FDE68A"
          intensity={1.6}
          distance={4.5}
          decay={2}
        />
      </group>
    </group>
  );
}

export function OfficeEnvironment() {
  const roomGltf = useGLTF(assetPath("/models/office_room.glb"));
  const agents = useAgencyStore((s) => s.agents);

  const officeRoomScene = useMemo(() => {
    const clone = roomGltf.scene.clone(true);
    enableShadows(clone);
    return clone;
  }, [roomGltf.scene]);

  return (
    <group>
      {/* 12m x 10m office floor centered at [0, 0, 0] (raw room floor is 4.4m x 4.4m) */}
      <group position={[0, 0, 0]} scale={[12 / 4.4, 1.32, 10 / 4.4]}>
        <primitive object={officeRoomScene} />
      </group>

      {/* 3 Workstation Desks */}
      <WorkstationDesk
        position={OFFICE_ZONES.MANAGER_DESK}
        accentColor="#38BDF8"
        isActive={
          agents.manager.status === "WORKING" ||
          agents.manager.status === "WAITING_APPROVAL"
        }
      />
      <WorkstationDesk
        position={OFFICE_ZONES.RESEARCHER_DESK}
        accentColor="#0284C7"
        isActive={agents.researcher.status === "WORKING"}
      />
      <WorkstationDesk
        position={OFFICE_ZONES.COPYWRITER_DESK}
        accentColor="#F59E0B"
        isActive={agents.copywriter.status === "WORKING"}
      />

      {/* Pantry Coffee Bar */}
      <PantryBar />

      {/* Office Copier / Printer Zone */}
      <OfficeCopier />
    </group>
  );
}
