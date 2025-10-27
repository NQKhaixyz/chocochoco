import { useWallet } from '@solana/wallet-adapter-react'

/**
 * Solana equivalent of wagmi's useAccount
 * Returns wallet connection status and address
 */
export function useSolanaAccount() {
  const { publicKey, connected, connecting, disconnecting } = useWallet()

  return {
    address: publicKey?.toBase58(),
    isConnected: connected,
    isConnecting: connecting,
    isDisconnecting: disconnecting,
    isReconnecting: false, // Solana wallets don't have this concept
    publicKey,
  }
}
