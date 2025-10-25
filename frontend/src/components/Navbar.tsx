import React from 'react'
import { ConnectButton } from './ConnectButton'
import { NetworkSelect } from './NetworkSelect'

export function Navbar() {
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="font-semibold text-lg">ChocoChoco</div>
        <div className="flex items-center gap-3">
          <NetworkSelect />
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}

