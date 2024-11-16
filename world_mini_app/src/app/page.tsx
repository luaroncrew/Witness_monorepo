"use client";

import { AttestationCreationSection } from "@/components/attestation-creation-section";
import { WitnessHeader } from "@/components/header";

export default function Home() {
  return (
    <div className="p-4 md:px-20 md:py-8 bg-black min-h-screen overflow-hidden relative">
      <img
        src="background-lynx.svg"
        className="absolute left-1/3 bottom-12 md:bottom-0 scale-150 md:scale-0"
        alt="lynx"
      />
      <div className="relative z-index-1">
        <WitnessHeader />
        <AttestationCreationSection />
      </div>
    </div>
  );
}
