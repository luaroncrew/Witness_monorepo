"use server";

import {
  EvmChains,
  IndexService,
  SignProtocolClient,
  SpMode,
} from "@ethsign/sp-sdk";
import { VerificationLevel } from "@worldcoin/idkit-core";
import { verifyCloudProof } from "@worldcoin/idkit-core/backend";
import { readFileSync } from "fs";
import * as fs from "fs/promises";
import { imageHash } from "image-hash";
import { getServerSession } from "next-auth";
import { PinataSDK } from "pinata-web3";
import { privateKeyToAccount } from "viem/accounts";

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
  timestamp: number;
  location: string;
  cid: string;
  hash: string;
};

const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`;
const action = process.env.NEXT_PUBLIC_WLD_ACTION as string;

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.sepolia,
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

export async function testData(formData: FormData) {
  const file = formData.get("file") as File;

  // 1. Check user status

  // 2. Hash image data
  // const fileData = await file.arrayBuffer();
  // const buffer = Buffer.from(fileData);
  // const hash = imageHash(buffer, 16, true, (error, data) => {
  //   if (error) {
  //     throw new Error("Error hashing image");
  //   }
  //   console.log("1");
  //   console.log(data);

  //   return data;
  // });
  // console.log("2");

  // 3. Query sign protocol to check image uniqueness
  const isUnique = await checkImageUniqueness("0.524648296074651");

  if (!isUnique) {
    throw new Error("Image is not unique");
  }

  // 4. Store image on ipfs
  const ipfsRes = await storeToIpfs(file);
  console.log("ipfsRes", ipfsRes);

  // 5. Call sign protocol to create attestation
  const attestation = await createAttestation({
    author: "WID",
    timestamp: new Date("1998-07-12").getTime(),
    location: "Paris",
    cid: ipfsRes.IpfsHash,
    hash: Math.random().toString(),
  });
  console.log("attestation", attestation);

  return attestation.attestationId;
}

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
    schemaId: process.env.ATESTATION_FULL_SCHEMA_ID!,
    attester: process.env.WITNESS_ADDRESS!,
    page: 1,
    mode: "onchain",
    indexingValue: hash,
  });

  return !res;
};

const createAttestation = async (data: AttestationData) => {
  return await client.createAttestation({
    schemaId: process.env.ATESTATION_SCHEMA_ID!,
    data,
    indexingValue: data.hash.toLowerCase(),
  });
};
