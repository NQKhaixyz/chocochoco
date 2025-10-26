/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAIN_ID: string
  readonly VITE_RPC_URL: string
  readonly VITE_CONTRACT_ADDRESS: string
  readonly VITE_TREASURY_ADDRESS: string
  readonly VITE_GAME_ADDRESS: string
  readonly VITE_SOLANA_CLUSTER: string
  readonly VITE_PROGRAM_ID: string
  readonly VITE_STAKE_LAMPORTS: string
  readonly VITE_BASE_SEPOLIA_RPC: string
  readonly VITE_POLYGON_MUMBAI_RPC: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_SUBGRAPH_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
