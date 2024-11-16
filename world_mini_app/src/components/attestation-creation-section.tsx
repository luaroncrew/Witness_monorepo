import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { attestImage } from "@/app/actions/verify";
import Link from "next/link";

export const AttestationCreationSection = () => {
  // state of the file upload
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [date, setDate] = useState<Date>();
  const [attestationId, setAttestationId] = useState<string | null>(null);

  // state for the file metadata
  const locationInput = useRef<null | HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendFile = async () => {
    if (
      !fileInputRef.current?.files?.[0] ||
      locationInput.current?.value === "" ||
      !date
    ) {
      return;
    }

    const formData = new FormData();
    const file = fileInputRef.current?.files[0];

    formData.append("file", file);
    formData.append("location", locationInput.current!.value);
    formData.append("date", date.toISOString());
    const attestationId = await attestImage(formData);
    setAttestationId(attestationId);
  };

  return (
    <>
      <div className="relative flex flex-col items-center mt-20 md:mt-36 z-10">
        {attestationId ? (
          <div>
            <p className="text-white font-bold mb-2">
              Share your attestation with this link:{" "}
            </p>
            <Link href={`/proof/${attestationId}`}>
              <div className="text-yellow-600 underline bg-neutral-800 p-2 rounded-md">{`${process.env.NEXT_PUBLIC_BASE_URL}/vote/${attestationId}`}</div>
            </Link>
          </div>
        ) : (
          <>
            <div>
              <div className="flex flex-col items-center justify-center w-full">
                <p className="text-2xl font-bold text-white mb-4">
                  Upload a file to verify
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center h-64 border-2 border-white
                     border-dashed rounded-lg cursor-pointer bg-[#272727] hover:bg-black w-full"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                  <img
                    src="lynx.png"
                    alt="lynx-image"
                    className="max-w-20 max-h-20 opacity-50 mx-6"
                  />
                  {isFileUploaded ? (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Image uploaded successfully!
                    </p>
                  ) : (
                    <>
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SVG, PNG, JPG or GIF
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="dropzone-file"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onInput={() =>
                    setIsFileUploaded(!!fileInputRef.current?.files?.[0])
                  }
                />
              </label>
            </div>
          </>
        )}
      </div>
      {isFileUploaded && !attestationId && (
        <div className="flex justify-start flex-col gap-y-3 max-w-72 mx-auto mt-12 md:mt-20">
          <Label htmlFor="location" className="flex flex-col gap-y-1">
            <span className="text-white">Location</span>
            <Input type="text" placeholder="Location" ref={locationInput} />
          </Label>
          <Label htmlFor="timestamp" className="flex flex-col gap-y-1">
            <span className="text-white">Time</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </Label>
          <Button
            variant="secondary"
            onClick={sendFile}
            className="bg-yellow-600 mt-4 hover:bg-yellow-600 hover:bg-opacity-90"
          >
            Create Attestation
          </Button>
        </div>
      )}
    </>
  );
};
