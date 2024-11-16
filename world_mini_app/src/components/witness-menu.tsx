import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const WitnessMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="z-30">
        <Menu size={24} color="white" />
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black text-white z-20">
          <div className="flex flex-col items-center justify-center h-full space-y-12">
            <Link href="/" className="text-3xl font-bold">
              Attest
            </Link>
            <Link href="/proof" className="text-3xl font-bold">
              Proof
            </Link>
            <Link href="/vote" className="text-3xl font-bold">
              Vote
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
