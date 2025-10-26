'use client'
import { ReactNode, useMemo } from 'react'
import { Connection } from '@solana/web3.js'
import { getCluster, rpcUrl } from './cluster'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import '@solana/wallet-adapter-react-ui/styles.css'

export function SolanaProviders({ children }: { children: ReactNode }) {
  const cluster = getCluster()
  const endpoint = rpcUrl(cluster)
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])
  // Optional explicit connection instance
  const connection = useMemo(() => new Connection(endpoint, 'confirmed'), [endpoint])
  void connection // not used directly but ensures type import stays

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

