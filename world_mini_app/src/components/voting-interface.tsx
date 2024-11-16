"use client";

import { Button } from "@/components/ui/button";

import { Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { WitnessHeader } from "./header";
import { castVote } from "@/app/actions/dao";

export function VotingInterfaceComponent({
  attestationId,
  attestationData,
}: {
  attestationId: string;
  attestationData: any;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleVote = async (ban: boolean) => {
    await castVote(attestationId, ban);
  };

  return (
    <div className="container mx-auto p-4 text-white bg-black">
      <WitnessHeader />
      <div className="mb-8">
        <h2 className="text-2xl font-bold my-4">Reported Image</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <img
              src={"https://ipfs.io/ipfs/" + attestationData.cid}
              alt="Reported image"
              width={400}
              height={300}
              className="rounded-lg"
            />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Image Hash</h3>
            <p className="font-mono bg-neutral-800 p-2 rounded-md mb-4">
              {attestationData.hash}
            </p>
            <p className="flex items-center mb-2">
              <Clock className="mr-2 h-4 w-4" />
              {formatDate(attestationData.timestamp)}
            </p>
            <p className="flex items-center mb-4">
              <MapPin className="mr-2 h-4 w-4" />
              {attestationData.location}
            </p>
            <h3 className="text-lg font-semibold mb-2">Owner</h3>
            <p className="font-mono bg-neutral-800 p-2 rounded-md break-words">
              {attestationData.author}
            </p>
            <div className="flex justify-center space-x-4 mt-4 self-end">
              <Button variant="destructive" onClick={() => handleVote(true)}>
                Ban
              </Button>
              <Button
                variant="outline"
                className="text-black"
                onClick={() => handleVote(false)}
              >
                Don't Ban
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
