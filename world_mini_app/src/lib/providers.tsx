"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { config } from "@/lib/wagmi";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import MiniKitProvider from "./minikit-provider";
import { ErudaProvider } from "./eruda";

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const queryClient = new QueryClient();

  return (
    <SessionProvider session={session}>
      <ErudaProvider>
        <MiniKitProvider>
          <DynamicContextProvider
            theme="auto"
            settings={{
              environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID!,
              walletConnectors: [EthereumWalletConnectors],
            }}
          >
            <WagmiProvider config={config}>
              <QueryClientProvider client={queryClient}>
                <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
              </QueryClientProvider>
            </WagmiProvider>
          </DynamicContextProvider>
        </MiniKitProvider>
      </ErudaProvider>
    </SessionProvider>
  );
}
