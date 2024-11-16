import { getInvestigatedAttestations } from "../actions/dao";
import { WitnessHeader } from "@/components/header";
import VotesList from "@/components/votes-list";

export default async function Vote() {
  const investigatedAttestations = await getInvestigatedAttestations();
  return (
    <div className="p-4">
      <WitnessHeader />
      <h2 className="text-white text-2xl font-bold my-4">Open votes</h2>
      {investigatedAttestations && (
        <VotesList investigatedAttestations={investigatedAttestations} />
      )}
    </div>
  );
}
