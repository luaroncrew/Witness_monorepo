import { http, createConfig } from "wagmi";
import { mainnet, polygonAmoy } from "wagmi/chains";

export const config = createConfig({
  chains: [mainnet, polygonAmoy],
  multiInjectedProviderDiscovery: false,
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [polygonAmoy.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
