import { getAttestationDataById } from "@/app/actions/dao";
import { ImageProof } from "@/components/image-proof";

export default async function ImageProofPage({
  params,
}: {
  params: { attestationId?: string[] };
}) {
  const attestationData = params.attestationId?.length
    ? await getAttestationDataById(params.attestationId[0])
    : null;

  return (
    <ImageProof
      attestationId={params.attestationId?.[0]}
      attestationData={attestationData}
    />
  );
}
