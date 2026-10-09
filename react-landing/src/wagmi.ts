import { connectorsForWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { baseSepolia, bscTestnet, optimismSepolia, polygonAmoy, sepolia } from 'wagmi/chains';

// The testnets RecoilPay runs on. The component asks the wallet to switch to
// whichever one an intent needs.
const chains = [baseSepolia, optimismSepolia, sepolia, polygonAmoy, bscTestnet] as const;

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

// With a WalletConnect project id, RainbowKit's full wallet list (mobile
// wallets included). Without one, browser wallets only.
export const wagmiConfig = projectId
  ? getDefaultConfig({ appName: 'Lumen', projectId, chains })
  : createConfig({
      chains,
      connectors: connectorsForWallets([{ groupName: 'Browser wallets', wallets: [injectedWallet] }], {
        appName: 'Lumen',
        projectId: 'not-used-without-walletconnect',
      }),
      transports: Object.fromEntries(chains.map((c) => [c.id, http()])) as Record<(typeof chains)[number]['id'], ReturnType<typeof http>>,
    });
