import React from 'react'
import { useChainId, useChains, useSwitchChain } from 'wagmi'

export function NetworkSelect() {
  const chainId = useChainId()
  const chains = useChains()
  const { switchChain, isPending } = useSwitchChain()

  return (
    <select
      className="text-sm border border-slate-300 bg-white rounded px-2 py-1"
      value={chainId}
      onChange={(e) => {
        const id = Number(e.target.value)
        switchChain({ chainId: id })
      }}
      disabled={isPending}
    >
      {chains.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  )
}

