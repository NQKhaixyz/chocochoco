'use client'
import { useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { getCluster } from '../solana/cluster'

export default function SolanaConnect() {
  const { publicKey } = useWallet()
  const address = useMemo(() => publicKey?.toBase58() ?? '', [publicKey])

  return (
    <div className="rounded-xl border p-4 space-y-2 max-w-xl">
      <div className="text-sm text-gray-600">
        Cluster: <span className="font-mono">{getCluster()}</span>
      </div>
      <WalletMultiButton />
      <div className="text-sm">
        Address: {address ? <span className="font-mono">{address}</span> : '— not connected —'}
      </div>
    </div>
  )
}

