"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CameraPreset, useAgencyStore } from "@/store/useAgencyStore";
import { OfficeEnvironment } from "./OfficeEnvironment";
import { LegoAgent } from "./LegoAgent";
import { assetPath } from "@/lib/assetPath";

const CAMERA_PRESETS: Record<
  CameraPreset,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  campus: {
    position: [0.4, 15.2, 20.6],
    target: [0, 0.5, -0.25],
  },
  west_wing: {
    position: [-5.6, 7.2, 10.6],
    target: [-6.4, 0.7, 0.0],
  },
  east_wing: {
    position: [5.8, 7.2, 10.6],
    target: [6.2, 0.7, 0.1],
  },
  pantry: {
    position: [6.2, 4.1, 3.0],
    target: [8.5, 1.0, -2.0],
  },
};

function CameraRig() {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraPreset = useAgencyStore((s) => s.cameraPreset);
  const transitionNonce = useAgencyStore((s) => s.cameraTransitionNonce);

  const isTransitioningRef = useRef(false);
  const goalPosRef = useRef(new THREE.Vector3(...CAMERA_PRESETS.campus.position));
  const goalTargetRef = useRef(new THREE.Vector3(...CAMERA_PRESETS.campus.target));

  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraPreset];
    goalPosRef.current.set(...preset.position);
    goalTargetRef.current.set(...preset.target);
    isTransitioningRef.current = true;
  }, [cameraPreset, transitionNonce]);

  useFrame((_, rawDelta) => {
    if (!isTransitioningRef.current || !controlsRef.current) return;
    const alpha = 1 - Math.exp(-5.5 * Math.min(rawDelta, 0.05));

    camera.position.lerp(goalPosRef.current, alpha);
    controlsRef.current.target.lerp(goalTargetRef.current, alpha);
    controlsRef.current.update();

    if (
      camera.position.distanceTo(goalPosRef.current) < 0.04 &&
      controlsRef.current.target.distanceTo(goalTargetRef.current) < 0.04
    ) {
      isTransitioningRef.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.07}
      minDistance={3.5}
      maxDistance={36}
      maxPolarAngle={Math.PI / 2 - 0.06}
      minPolarAngle={0.18}
      target={CAMERA_PRESETS.campus.target}
      onStart={() => {
        isTransitioningRef.current = false;
      }}
    />
  );
}

class EnvironmentBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function AgentsLayer() {
  const manager = useAgencyStore((s) => s.agents.manager);
  const researcher = useAgencyStore((s) => s.agents.researcher);
  const copywriter = useAgencyStore((s) => s.agents.copywriter);
  const social = useAgencyStore((s) => s.agents.social);
  const finance = useAgencyStore((s) => s.agents.finance);
  const hr = useAgencyStore((s) => s.agents.hr);
  const qc = useAgencyStore((s) => s.agents.qc);

  return (
    <>
      <LegoAgent agent={manager} />
      <LegoAgent agent={researcher} />
      <LegoAgent agent={copywriter} />
      <LegoAgent agent={social} />
      <LegoAgent agent={finance} />
      <LegoAgent agent={hr} />
      <LegoAgent agent={qc} />
    </>
  );
}

export function VirtualOfficeCanvas() {
  const [isMounted, setIsMounted] = useState(false);
  const initClientPopups = useAgencyStore((s) => s.initClientPopups);
  const runStandbyTick = useAgencyStore((s) => s.runStandbyTick);

  useEffect(() => {
    setIsMounted(true);
    initClientPopups();
    const initialMove = window.setTimeout(() => runStandbyTick(), 2600);
    const interval = window.setInterval(() => runStandbyTick(), 6500);
    return () => {
      window.clearTimeout(initialMove);
      window.clearInterval(interval);
    };
  }, [initClientPopups, runStandbyTick]);

  if (!isMounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0F172A] text-sm font-medium text-slate-300">
        Memuat Kampus Dual-Wing BrickLaunch Studio...
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-gradient-to-b from-[#0F172A] via-[#131C31] to-[#0B1120]">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{
          position: CAMERA_PRESETS.campus.position,
          fov: 40,
          near: 0.1,
          far: 120,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.06,
        }}
      >
        <color attach="background" args={["#0F172A"]} />
        <fog attach="fog" args={["#0F172A", 30, 68]} />

        {/* Warm architectural lighting scaled across the full 24m x 10m Dual-Wing Campus */}
        <ambientLight intensity={0.48} color="#FFF7ED" />
        <hemisphereLight args={["#FEF3C7", "#1E293B", 0.58]} />

        <directionalLight
          position={[8, 16, 12]}
          intensity={1.75}
          color="#FFF3DF"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={48}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={11}
          shadow-camera-bottom={-11}
          shadow-bias={-0.0004}
        />

        {/* Soft cool rim light illuminating both wings */}
        <directionalLight position={[-12, 8, 5]} intensity={0.55} color="#BAE6FD" />

        <Suspense fallback={null}>
          <EnvironmentBoundary>
            <Suspense fallback={null}>
              <Environment preset="city" environmentIntensity={0.42} />
            </Suspense>
          </EnvironmentBoundary>

          <OfficeEnvironment />
          <AgentsLayer />

          <ContactShadows
            position={[0, 0.005, 0]}
            opacity={0.38}
            scale={30}
            blur={2.2}
            far={4.5}
          />
        </Suspense>

        <CameraRig />
      </Canvas>
    </div>
  );
}

useGLTF.preload(assetPath("/models/office_room.glb"));
useGLTF.preload(assetPath("/models/workstation_desk.glb"));
useGLTF.preload(assetPath("/models/pantry_bar.glb"));
useGLTF.preload(assetPath("/models/office_copier.glb"));
useGLTF.preload(assetPath("/models/lego_agent.glb"));
