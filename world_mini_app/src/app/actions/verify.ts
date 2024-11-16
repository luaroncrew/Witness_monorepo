"use server";

import {
  EvmChains,
  IndexService,
  SignProtocolClient,
  SpMode,
} from "@ethsign/sp-sdk";
import { VerificationLevel } from "@worldcoin/idkit-core";
import { verifyCloudProof } from "@worldcoin/idkit-core/backend";
import { readFileSync, ReadStream, writeFile } from "fs";
import * as fs from "fs/promises";
import { imageHash } from "image-hash";
import { getServerSession } from "next-auth";
import { PinataSDK } from "pinata-web3";
import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, http } from "viem";
import axios from "axios";

export type VerifyReply = {
  success: boolean;
  code?: string;
  attribute?: string | null;
  detail?: string;
};

interface IVerifyRequest {
  proof: {
    nullifier_hash: string;
    merkle_root: string;
    proof: string;
    verification_level: VerificationLevel;
  };
  signal?: string;
}

type AttestationData = {
  author: string;
  cid: string;
  location: string;
  timestamp: number;
  hash: string;
};

const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`;
const action = process.env.NEXT_PUBLIC_WLD_ACTION as string;

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.polygonAmoy,
  account: privateKeyToAccount(process.env.WITNESS_PRIVATE_KEY as "0x"),
});

export async function verify(
  proof: IVerifyRequest["proof"],
  signal?: string
): Promise<VerifyReply> {
  const verifyRes = await verifyCloudProof(proof, app_id, action, signal);
  if (verifyRes.success) {
    console.log("verifyRes", verifyRes);

    // Check user status
    // Hash image data
    // Query sign protocol to check image uniqueness
    // Store image on ipfs
    // Call sign protocol to create attestation
    // return attestationId
    return { success: true };
  } else {
    return {
      success: false,
      code: verifyRes.code,
      attribute: verifyRes.attribute,
      detail: verifyRes.detail,
    };
  }
}

export async function attestImage(formData: FormData) {
  console.log("attestImage");

  const userSub = await getUserSubOrFail();

  const file = formData.get("file") as File;
  const location = formData.get("location") as string;
  const date = formData.get("date") as string;

  const ipfsRes = await storeToIpfs(file);
  console.log("ipfsRes", ipfsRes);

  const { hash } = (
    await axios.post(`${process.env.IMAGE_HASH_API_URL}/image-hash`, {
      cid: ipfsRes.IpfsHash,
    })
  ).data as { hash: string };

  console.log("imageHashResponse", hash);

  // 3. Query sign protocol to check image uniqueness
  const isUnique = await checkImageUniqueness(hash);

  if (!isUnique) {
    throw new Error("Image is not unique");
  }

  const attestation = await createAttestation({
    author: userSub,
    cid: ipfsRes.IpfsHash,
    location: location,
    timestamp: new Date(date).getTime(),
    hash: hash,
  });
  console.log("attestation", attestation);

  return `onchain_evm_80002_${attestation.attestationId}`;
}

export const getUserSubOrFail = async () => {
  const session = await getServerSession();
  if (!session?.user?.name) {
    throw new Error("Unauthorized");
  }

  return session.user.name;
};

const storeToIpfs = async (file: File) => {
  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY,
  });

  return await pinata.upload.file(file);
};

const checkImageUniqueness = async (hash: string) => {
  const indexService = new IndexService("testnet");

  const res = await indexService.queryAttestationList({
    schemaId: process.env.ATTESTATION_FULL_SCHEMA_ID!,
    attester: process.env.WITNESS_ADDRESS!,
    page: 1,
    mode: "onchain",
    indexingValue: hash,
  });

  return res?.total === 0;
};

export const createAttestation = async (data: AttestationData) => {
  return await client.createAttestation({
    schemaId: process.env.ATTESTATION_SCHEMA_ID!,
    data: data,
    indexingValue: data.hash.toLowerCase(),
  });
};
