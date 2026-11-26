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
  overview: {
    position: [9.4, 8.1, 9.6],
    target: [-0.25, 0.65, -0.55],
  },
  workstations: {
    position: [0.6, 4.6, 6.2],
    target: [-2.85, 0.75, -0.2],
  },
  pantry: {
    position: [-0.2, 3.6, 2.3],
    target: [3.65, 1.0, -1.4],
  },
  copier: {
    position: [2.7, 2.85, 0.7],
    target: [0.5, 0.85, -3.2],
  },
};

function CameraRig() {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraPreset = useAgencyStore((s) => s.cameraPreset);
  const transitionNonce = useAgencyStore((s) => s.cameraTransitionNonce);

  const isTransitioningRef = useRef(false);
  const goalPosRef = useRef(new THREE.Vector3(...CAMERA_PRESETS.overview.position));
  const goalTargetRef = useRef(new THREE.Vector3(...CAMERA_PRESETS.overview.target));

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
      minDistance={3.2}
      maxDistance={21}
      maxPolarAngle={Math.PI / 2 - 0.06}
      minPolarAngle={0.18}
      target={CAMERA_PRESETS.overview.target}
      onStart={() => {
        // Yield camera control immediately when user manually orbits or pans
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

  return (
    <>
      <LegoAgent agent={manager} />
      <LegoAgent agent={researcher} />
      <LegoAgent agent={copywriter} />
    </>
  );
}

export function VirtualOfficeCanvas() {
  const [isMounted, setIsMounted] = useState(false);
  const initClientPopups = useAgencyStore((s) => s.initClientPopups);
  const runStandbyTick = useAgencyStore((s) => s.runStandbyTick);

  useEffect(() => {
    setIsMounted(true);
    // Mulai timer 3 menit speech cloud & loop aktivitas standby natural di client
    initClientPopups();
    const initialMove = window.setTimeout(() => runStandbyTick(), 2800);
    const interval = window.setInterval(() => runStandbyTick(), 6500);
    return () => {
      window.clearTimeout(initialMove);
      window.clearInterval(interval);
    };
  }, [initClientPopups, runStandbyTick]);

  if (!isMounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0F172A] text-sm font-medium text-slate-300">
        Memuat BrickLaunch 3D Studio...
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-gradient-to-b from-[#0F172A] via-[#131C31] to-[#0B1120]">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{
          position: CAMERA_PRESETS.overview.position,
          fov: 40,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.06,
        }}
      >
        <color attach="background" args={["#0F172A"]} />
        <fog attach="fog" args={["#0F172A", 20, 42]} />

        {/* Warm architectural studio lighting */}
        <ambientLight intensity={0.45} color="#FFF7ED" />
        <hemisphereLight args={["#FEF3C7", "#1E293B", 0.55]} />

        <directionalLight
          position={[8, 13, 9]}
          intensity={1.75}
          color="#FFF3DF"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={35}
          shadow-camera-left={-9}
          shadow-camera-right={9}
          shadow-camera-top={9}
          shadow-camera-bottom={-9}
          shadow-bias={-0.0004}
        />

        {/* Soft cool rim light from the left window side */}
        <directionalLight position={[-9, 6, 3]} intensity={0.55} color="#BAE6FD" />

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
            opacity={0.42}
            scale={18}
            blur={2.1}
            far={4.5}
          />
        </Suspense>

        <CameraRig />
      </Canvas>
    </div>
  );
}

// Preload all 5 custom Blender GLB studio assets
useGLTF.preload(assetPath("/models/office_room.glb"));
useGLTF.preload(assetPath("/models/workstation_desk.glb"));
useGLTF.preload(assetPath("/models/pantry_bar.glb"));
useGLTF.preload(assetPath("/models/office_copier.glb"));
useGLTF.preload(assetPath("/models/lego_agent.glb"));
