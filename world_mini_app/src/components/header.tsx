"use client";
import Image from "next/image";
import { WitnessMenu } from "./witness-menu";

export const WitnessHeader = () => {
  return (
    <header className="relative flex flex-row justify-between items-center">
      {/* logo + name */}
      <div className="flex flex-row justify-center">
        <Image
          src="/lynx.png"
          alt="witness-logo"
          className="w-6 h-6 md:h-10 md:w-10"
          width={24}
          height={24}
        />
        <h1 className="text-xl md:text-4xl font-bold text-white w-full mx-2">
          Authenticity Witness
        </h1>
      </div>
      <WitnessMenu />
    </header>
  );
};
