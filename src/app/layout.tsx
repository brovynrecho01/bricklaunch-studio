import type { Metadata, Viewport } from "next";
import "./globals.css";
import { assetPath } from "@/lib/assetPath";

export const viewport: Viewport = {
  themeColor: "#141517",
};

export const metadata: Metadata = {
  title: "BrickLaunch Studio — Autonomous 3D AI Product Launch Agency",
  description:
    "From Raw Idea to Launch-Ready Digital Product — Orchestrated by Autonomous Agents.",
  icons: {
    icon: [
      { url: assetPath("/brand/bricklaunch-icon.svg"), type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: [{ url: assetPath("/brand/bricklaunch-icon.svg"), type: "image/svg+xml" }],
    apple: [{ url: assetPath("/brand/bricklaunch-icon.svg"), type: "image/svg+xml" }],
  },
  openGraph: {
    title: "BrickLaunch Studio — Autonomous 3D AI Product Launch Agency",
    description:
      "From Raw Idea to Launch-Ready Digital Product — Orchestrated by Autonomous Agents.",
    type: "website",
    images: [
      {
        url: assetPath("/brand/bricklaunch-logo-horizontal.svg"),
        width: 420,
        height: 100,
        alt: "BrickLaunch Studio Horizontal Brand Lockup",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrickLaunch Studio",
    description:
      "From Raw Idea to Launch-Ready Digital Product — Orchestrated by Autonomous Agents.",
    images: [assetPath("/brand/bricklaunch-logo-horizontal.svg")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased bg-[#0F172A] text-white selection:bg-[#F04A1A]/30 selection:text-orange-100"
      >
        {children}
      </body>
    </html>
  );
}
