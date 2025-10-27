import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function ConnectButton() {
  const { publicKey, connected, disconnect } = useWallet()

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm px-2 py-1 rounded bg-slate-100 border border-slate-200">
          {shorten(publicKey.toBase58())}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-sm rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-3 py-1"
        >
          Disconnect
        </button>
      </div>
    )
  }

  // Use Solana wallet adapter button
  return (
    <div className="wallet-adapter-button-trigger">
      <WalletMultiButton />
    </div>
  )
}
