"use client";

import dynamic from "next/dynamic";

// Three.js-r boro bundle (~200KB+) initial load-e lagbe na —
// client-e lazy-load hobe, server-e skip (ssr: false).
// Next.js 15-e ssr:false SHUDHU client component-e cholbe,
// tai ei wrapper — server page theke import kora jay.
const HeroScene = dynamic(() => import("@/components/HeroScene"), {
  ssr: false,
});

export default function HeroSceneLoader() {
  return <HeroScene />;
}
