"use client";

import dynamic from "next/dynamic";
import { BrickLaunchIcon } from "@/components/ui/BrickLaunchLogo";

const VirtualOfficeCanvas = dynamic(
  () =>
    import("@/components/3d/VirtualOfficeCanvas").then(
      (mod) => mod.VirtualOfficeCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#141517] text-sm font-medium text-slate-300">
        <BrickLaunchIcon className="h-12 w-12 animate-pulse" withContainer />
        <span>Memuat BrickLaunch Studio 3D...</span>
      </div>
    ),
  }
);

const CeoCommandHud = dynamic(
  () =>
    import("@/components/ui/CeoCommandHud").then((mod) => mod.CeoCommandHud),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0F172A]">
      <VirtualOfficeCanvas />
      <CeoCommandHud />
    </main>
  );
}
