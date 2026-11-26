"use client";

import React from "react";

interface BrandIconProps {
  className?: string;
  withContainer?: boolean;
}

/**
 * BrickLaunch Studio — Favicon & App Icon Mark
 * Sesuai ortografis: piramida 3 tingkat lego brick + panah peluncuran diagonal & serpihan energi.
 */
export function BrickLaunchIcon({
  className = "h-8 w-8",
  withContainer = false,
}: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="BrickLaunch Studio Mark"
    >
      <defs>
        <linearGradient id="bl-icon-orange" x1="0%" y1="15%" x2="100%" y2="85%">
          <stop offset="0%" stopColor="#FF521B" />
          <stop offset="55%" stopColor="#E84118" />
          <stop offset="100%" stopColor="#B93110" />
        </linearGradient>
        <linearGradient id="bl-icon-arrow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF5B22" />
          <stop offset="100%" stopColor="#D93813" />
        </linearGradient>
      </defs>

      {withContainer && (
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="14"
          fill="#141517"
          stroke="#2A2D32"
          strokeWidth="1.5"
        />
      )}

      {/* Bottom Row: 3 Interlocking Lego Bricks */}
      <rect x="11.5" y="42.5" width="3.2" height="2" rx="0.5" fill="#FF521B" />
      <rect x="19.3" y="42.5" width="3.2" height="2" rx="0.5" fill="#FF521B" />
      <rect x="9.5" y="44.2" width="14.5" height="9.2" rx="1" fill="url(#bl-icon-orange)" />

      <rect x="27" y="42.5" width="3.2" height="2" rx="0.5" fill="#E84118" />
      <rect x="34.8" y="42.5" width="3.2" height="2" rx="0.5" fill="#E84118" />
      <rect x="25.2" y="44.2" width="14.5" height="9.2" rx="1" fill="url(#bl-icon-orange)" />

      <rect x="42.6" y="42.5" width="3.2" height="2" rx="0.5" fill="#C93512" />
      <rect x="49.5" y="42.5" width="3.2" height="2" rx="0.5" fill="#B93110" />
      <rect x="41" y="44.2" width="13.5" height="9.2" rx="1" fill="url(#bl-icon-orange)" />

      {/* Middle Row */}
      <rect x="18.2" y="31.5" width="3.2" height="2" rx="0.5" fill="#FF521B" />
      <rect x="26" y="31.5" width="3.2" height="2" rx="0.5" fill="#F04619" />
      <rect x="16.5" y="33.2" width="14.2" height="9.2" rx="1" fill="url(#bl-icon-orange)" />

      <polygon points="32,33.2 40.5,33.2 32,41.6" fill="#E33E16" />
      <polygon points="34.5,42.4 45.5,42.4 45.5,36.2 42.5,34.4" fill="#C63512" />

      {/* Top Row */}
      <rect x="24.8" y="21.2" width="3.2" height="1.9" rx="0.5" fill="#FF521B" />
      <rect x="31.2" y="21.2" width="3.2" height="1.9" rx="0.5" fill="#F04619" />
      <path d="M23.2 22.8 H36.2 L32.2 31.8 H23.2 Z" fill="url(#bl-icon-orange)" />

      {/* Launch Arrow & Energy Shards */}
      <path
        d="M36.8 25.5 L44.8 17.5 L40.6 13.8 L54.6 10.6 L51.4 24.6 L47.7 20.5 L40 28.4 Z"
        fill="url(#bl-icon-arrow)"
      />
      <polygon points="33.8,29.5 36.8,26.8 39.2,29.2 36.2,32.0" fill="#FF5B22" />
      <polygon points="34.8,19.8 41.8,18.2 36.4,23.5" fill="#FF521B" />
      <polygon points="48.2,25.5 49.4,34.0 43.2,32.5" fill="#D93813" />
    </svg>
  );
}

interface HorizontalLogoProps {
  compact?: boolean;
}

/**
 * BrickLaunch Studio — Horizontal Header Lockup
 * Sesuai ortografis header: Icon mark di kiri + tipografi "Brick" (putih) "Launch" (oranye) + "STUDIO" rata kanan di bawah.
 */
export function BrickLaunchHorizontalLogo({ compact = false }: HorizontalLogoProps) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#141517] shadow-lg shadow-[#E84118]/15 ${
          compact ? "h-9 w-9 p-0.5" : "h-11 w-11 p-1"
        }`}
      >
        <BrickLaunchIcon className="h-full w-full" />
      </div>

      <div className="flex flex-col leading-none">
        <div
          className={`font-extrabold tracking-tight ${
            compact ? "text-base sm:text-lg" : "text-xl sm:text-2xl"
          }`}
        >
          <span className="text-white">Brick</span>
          <span className="text-[#F04A1A]">Launch</span>
        </div>
        <span
          className={`self-end font-normal text-white/90 ${
            compact
              ? "mt-0.5 text-[8px] tracking-[0.34em]"
              : "mt-1 text-[9.5px] tracking-[0.38em]"
          }`}
        >
          STUDIO
        </span>
      </div>
    </div>
  );
}
