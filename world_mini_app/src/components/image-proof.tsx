"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Clock, MapPin } from "lucide-react";
import { WitnessHeader } from "./header";
import { getAttestationDataById, reportAttestation } from "@/app/actions/dao";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export function ImageProof({
  attestationId,
  attestationData,
}: {
  attestationId?: string;
  attestationData: Object | null;
}) {
  const [attestationIdQuery, setAttestationIdQuery] = useState("");
  const [imageData, setImageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setImageData(attestationData);
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const data = await getAttestationDataById(attestationIdQuery);
      console.log("data", data);

      setImageData(data);
    } catch (error) {
      console.error("Error fetching image data:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4 text-white bg-black min-h-screen">
      <WitnessHeader />
      <h1 className="text-2xl font-bold my-4">Image Proof Verifier</h1>
      <div className="flex gap-4 mb-6">
        <Input
          type="text"
          placeholder="Enter image hash"
          value={attestationIdQuery}
          onChange={(e) => setAttestationIdQuery(e.target.value)}
          className="flex-grow text-black"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-yellow-600"
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {imageData && (
        <div className="w-full max-w-2xl mx-auto bg-black text-white">
          <h2 className="text-2xl font-bold mb-1">Image Proof</h2>
          <p className="font-mono bg-neutral-800 p-2 rounded-md break-words mb-4">
            {imageData.attestationId}
          </p>
          <div className="space-y-4">
            <img
              src={"https://ipfs.io/ipfs/" + imageData.cid}
              alt="Verified Image"
              className="w-full h-auto rounded-lg"
            />
            <div>
              <h3 className="text-lg font-semibold mb-1">Image Hash</h3>
              <p className="font-mono bg-neutral-800 p-2 rounded-md mb-4 break-words">
                {imageData.hash}
              </p>
              <p className="flex items-center mb-2">
                <Clock className="mr-2 h-4 w-4" />
                {formatDate(imageData.timestamp)}
              </p>
              <p className="flex items-center mb-4">
                <MapPin className="mr-2 h-4 w-4" />
                {imageData.location}
              </p>
              <h3 className="text-lg font-semibold mb-1">Author</h3>
              <p className="font-mono bg-neutral-800 p-2 rounded-md break-words">
                {imageData.author}
              </p>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={() => attestationId && reportAttestation(attestationId)}
            className="w-full mt-6"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Report as Fraudulent
          </Button>
        </div>
      )}
    </div>
  );
}
