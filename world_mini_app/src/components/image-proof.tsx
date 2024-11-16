"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Clock, MapPin } from "lucide-react";

// Simulated function to fetch image data
const fetchImageData = async (hash: string) => {
  // In a real implementation, this would interact with your blockchain or backend
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
  return {
    hash: "0xabcd...xyz",
    imageUrl: "/placeholder.svg?height=300&width=300",
    owner: "0x1234...5678",
    metadata: {
      timestamp: "2023-10-25T12:34:56Z",
      location: "New York, NY",
    },
  };
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

export function ImageProof() {
  const [hash, setHash] = useState("");
  const [imageData, setImageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const data = await fetchImageData(hash);
      setImageData(data);
    } catch (error) {
      console.error("Error fetching image data:", error);
    }
    setIsLoading(false);
  };

  const handleReport = () => {
    // Implement report functionality here
    alert("Image reported as potentially fraudulent.");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image Proof Verifier</h1>
      <div className="flex gap-4 mb-6">
        <Input
          type="text"
          placeholder="Enter image hash"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {imageData && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Image Proof</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img
              src={imageData.imageUrl}
              alt="Verified Image"
              className="w-full h-auto rounded-lg"
            />
            <div>
              <h3 className="text-lg font-semibold mb-1">Image Hash</h3>
              <p className="font-mono bg-neutral-100 p-2 rounded-md mb-4 dark:bg-neutral-800">
                {imageData.hash}
              </p>
              <p className="flex items-center mb-2">
                <Clock className="mr-2 h-4 w-4" />
                {formatDate(imageData.metadata.timestamp)}
              </p>
              <p className="flex items-center mb-4">
                <MapPin className="mr-2 h-4 w-4" />
                {imageData.metadata.location}
              </p>
              <h3 className="text-lg font-semibold mb-1">Owner</h3>
              <p className="font-mono bg-neutral-100 p-2 rounded-md dark:bg-neutral-800">
                {imageData.owner}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              onClick={handleReport}
              className="w-full"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Report as Fraudulent
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
