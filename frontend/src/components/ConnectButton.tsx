import React from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function ConnectButton() {
  const { address, isConnecting, isConnected } = useAccount()
  const { connectors, connectAsync, status: connectStatus, error } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm px-2 py-1 rounded bg-slate-100 border border-slate-200">
          {shorten(address)}
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

  return (
    <div className="flex items-center gap-2">
      {connectors.map((c) => (
        <button
          key={c.uid}
          disabled={!c.available || isConnecting || connectStatus === 'pending'}
          onClick={async () => {
            try {
              await connectAsync({ connector: c })
            } catch {
              /* handled via error */
            }
          }}
          className="text-sm rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-1 disabled:opacity-50"
          title={c.name}
        >
          Connect {c.name}
        </button>
      ))}
      {error ? <span className="text-xs text-red-600">{error.message}</span> : null}
    </div>
  )
}

