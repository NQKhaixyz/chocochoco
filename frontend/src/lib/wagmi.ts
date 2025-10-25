import { createConfig, http } from 'wagmi'
import { baseSepolia, polygonMumbai } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { walletConnect } from 'wagmi/connectors'

// Public env (Vite)
const RPC = (import.meta.env.VITE_RPC_URL as string | undefined) ?? ''
const CHAIN_ID = Number((import.meta.env.VITE_CHAIN_ID as string | undefined) ?? 84532)
export const GAME_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}` | undefined) ??
  ('0x0000000000000000000000000000000000000000' as const)
export const TREASURY = (import.meta.env.VITE_TREASURY_ADDRESS as `0x${string}` | undefined) ??
  ('0x0000000000000000000000000000000000000000' as const)

const wcProjectId = (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined) ?? ''

// Choose default chain by CHAIN_ID; expose both for switching
export const chains = [baseSepolia, polygonMumbai] as const
const selected = chains.find((c) => c.id === CHAIN_ID) ?? baseSepolia

export const config = createConfig({
  chains,
  transports: {
    [baseSepolia.id]: http((selected.id === baseSepolia.id && RPC) || baseSepolia.rpcUrls.public.http[0]),
    [polygonMumbai.id]: http((selected.id === polygonMumbai.id && RPC) || polygonMumbai.rpcUrls.public.http[0]),
  },
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({
      projectId: wcProjectId,
      showQrModal: true,
      metadata: {
        name: 'ChocoChoco',
        description: 'ChocoChoco dapp',
        url: 'https://example.org',
        icons: ['https://avatars.githubusercontent.com/u/127504341?s=200&v=4'],
      },
    }),
  ],
  ssr: false,
})
