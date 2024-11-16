"use server";
import { DAO_CONTRACT_ABI } from "@/constants/abi";
import { CHAIN } from "@/constants/chain";
import {
  DataLocationOnChain,
  decodeOnChainData,
  IndexService,
} from "@ethsign/sp-sdk";

import { VerificationLevel } from "@worldcoin/idkit-core";
import { verifyCloudProof } from "@worldcoin/minikit-js";
import {
  Abi,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getUserSubOrFail } from "./verify";

interface IVerifyRequest {
  proof: {
    nullifier_hash: string;
    merkle_root: string;
    proof: string;
    verification_level: VerificationLevel;
  };
  signal?: string;
}

const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`;
const action = process.env.NEXT_PUBLIC_WLD_ACTION as string;

const schemaData = `[{"name":"author","type":"string"},{"name":"cid","type":"string"},{"name":"location","type":"string"},{"name":"timestamp","type":"uint256"},{"name":"hash","type":"string"}]`;

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(),
});

export async function getAttestationDataById(attestationId: string) {
  const indexService = new IndexService("testnet");
  try {
    const attestation = await indexService.queryAttestation(attestationId);

    if (!attestation) {
      return null;
    }

    const data = decodeOnChainData(
      attestation.data,
      DataLocationOnChain.ONCHAIN,
      JSON.parse(schemaData)
    );

    return { ...data, timestamp: Number(data.timestamp), attestationId };
  } catch (error) {
    return null;
  }
}

export async function castVote(attestationId: string, ban: boolean) {
  const userSub = await getUserSubOrFail();
  const account = privateKeyToAccount(process.env.WITNESS_PRIVATE_KEY as "0x");

  const walletClient = createWalletClient({
    account,
    chain: CHAIN,
    transport: http(),
  });

  const txData = encodeFunctionData({
    abi: DAO_CONTRACT_ABI,
    functionName: "castVote",
    args: [attestationId, userSub, ban],
  });

  await walletClient.sendTransaction({
    to: process.env.WITNESS_DAO_ADDRESS as "0x",
    data: txData,
  });

  return { success: true };
}

export async function reportAttestation(attestationId: string) {
  console.log("reportAttestation", attestationId);

  const userSub = await getUserSubOrFail();

  const account = privateKeyToAccount(process.env.WITNESS_PRIVATE_KEY as "0x");

  const walletClient = createWalletClient({
    account,
    chain: CHAIN,
    transport: http(),
  });

  const txData = encodeFunctionData({
    abi: DAO_CONTRACT_ABI,
    functionName: "reportImage",
    args: [attestationId.replace(/^onchain_evm_80002_/, ""), userSub],
  });

  console.log("txData", txData);

  await walletClient.sendTransaction({
    to: process.env.WITNESS_DAO_ADDRESS as "0x",
    data: txData,
  });

  console.log("reportAttestation success");

  return { success: true };
}

export const getInvestigatedAttestations = async () => {
  const indexService = new IndexService("testnet");

  const attestationList = await indexService.queryAttestationList({
    schemaId: process.env.ATTESTATION_FULL_SCHEMA_ID!,
    attester: process.env.WITNESS_ADDRESS!,
    page: 1,
    mode: "onchain",
  });

  return attestationList?.rows.map((attestation) => {
    const data = decodeOnChainData(
      attestation.data,
      DataLocationOnChain.ONCHAIN,
      JSON.parse(schemaData)
    );

    return {
      ...data,
      timestamp: Number(data.timestamp),
      attestationId: attestation.id,
    };
  });
};
