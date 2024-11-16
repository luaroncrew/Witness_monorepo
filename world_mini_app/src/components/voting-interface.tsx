"'use client'"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin } from "lucide-react"
import Image from "next/image"

// This would typically come from your dApp's state or API
const reportedImage = {
  id: "img1",
  url: "/placeholder.svg?height=300&width=400",
  timestamp: "2023-05-15T14:30:00Z",
  location: "New York, NY",
  ownerAddress: "0x1234...5678",
  hash: "0xabc...def"
}

const otherImages = [
  { id: "img2", url: "/placeholder.svg?height=100&width=150", timestamp: "2023-05-10T10:15:00Z", location: "Los Angeles, CA" },
  { id: "img3", url: "/placeholder.svg?height=100&width=150", timestamp: "2023-05-05T09:45:00Z", location: "Chicago, IL" },
  { id: "img4", url: "/placeholder.svg?height=100&width=150", timestamp: "2023-04-30T16:20:00Z", location: "Houston, TX" },
]

export function VotingInterfaceComponent() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Reported Image</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Image
              src={reportedImage.url}
              alt="Reported image"
              width={400}
              height={300}
              className="rounded-lg"
            />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Image Hash</h3>
            <p className="font-mono bg-neutral-100 p-2 rounded-md mb-4 dark:bg-neutral-800">{reportedImage.hash}</p>
            <p className="flex items-center mb-2">
              <Clock className="mr-2 h-4 w-4" />
              {formatDate(reportedImage.timestamp)}
            </p>
            <p className="flex items-center mb-4">
              <MapPin className="mr-2 h-4 w-4" />
              {reportedImage.location}
            </p>
            <h3 className="text-lg font-semibold mb-2">Owner</h3>
            <p className="font-mono bg-neutral-100 p-2 rounded-md dark:bg-neutral-800">{reportedImage.ownerAddress}</p>
            <div className="flex justify-center space-x-4 mt-4 self-end">
              <Button variant="destructive">Ban</Button>
              <Button variant="outline">Don't Ban</Button>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      <div>
        <h2 className="text-2xl font-bold mb-4">Other Images by This Owner</h2>
        <ScrollArea className="h-[300px] rounded-md p-4">
          {otherImages.map((image, index) => (
            <div key={image.id}>
              <div className="flex space-x-4 py-4">
                <Image
                  src={image.url}
                  alt={`Image ${image.id}`}
                  width={150}
                  height={100}
                  className="rounded-lg"
                />
                <div>
                  <p className="flex items-center mb-2">
                    <Clock className="mr-2 h-4 w-4" />
                    {formatDate(image.timestamp)}
                  </p>
                  <p className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {image.location}
                  </p>
                </div>
              </div>
              {index < otherImages.length - 1 && <Separator />}
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  )
}