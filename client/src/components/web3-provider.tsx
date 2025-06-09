import { WagmiProvider, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    chains: [sepolia],
    //transports: {
    //  [base.id]: http(import.meta.env.VITE_ALCHEMY_RPC_URL),
    //},

    // Required API Keys
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "",

    // Required App Info
    appName: "SongCoin",

    // Optional App Info
    appDescription:
      "SongCoin, the best place to get the attention your content deserves.",
    appUrl: "https://songcoin.fun",
    appIcon: "https://songcoin.fun/logo.png",
  }),
);

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
