import Link from "next/link";
import { Separator } from "./ui/separator";

export default async function VotesList({
  investigatedAttestations,
}: {
  investigatedAttestations: any[];
}) {
  return (
    <div className="space-y-2 px-2">
      {investigatedAttestations?.map((attesation, i) => (
        <>
          <Link
            href={"/vote/" + attesation.attestationId}
            className="text-white block break-words"
            key={attesation.attestationId}
          >
            {attesation.attestationId} - {attesation.author}
          </Link>
          {i !== investigatedAttestations.length - 1 && <Separator />}
        </>
      ))}
    </div>
  );
}
