import { getAttestationDataById } from "@/app/actions/dao";
import { VotingInterfaceComponent } from "@/components/voting-interface";

export default async function Voting({
  params,
}: {
  params: { attestationId: string };
}) {
  const attestationData = await getAttestationDataById(params.attestationId);

  return (
    <VotingInterfaceComponent
      attestationId={params.attestationId}
      attestationData={attestationData}
    />
  );
}
