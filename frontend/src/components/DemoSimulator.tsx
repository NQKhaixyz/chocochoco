import React, { useState } from 'react'
import { Icon } from './ui/Icon'
import { cn } from '../lib/cn'
import { 
  demoCommit, 
  demoReveal, 
  getCurrentRound, 
  advanceToNextRound,
  clearAllDemoData 
} from '../lib/demo-rounds'
import { generateSalt } from '../lib/solana-commit'
import { toast } from 'sonner'

type SimulatorProps = {
  onUpdate?: () => void
}

export function DemoSimulator({ onUpdate }: SimulatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [autoPlayers, setAutoPlayers] = useState(10)
  const [milkPercent, setMilkPercent] = useState(40)

  const handleAutoJoin = () => {
    const round = getCurrentRound()
    if (!round) {
      toast.error('No active round found')
      return
    }

    const milkCount = Math.floor(autoPlayers * (milkPercent / 100))
    const cacaoCount = autoPlayers - milkCount

    let committed = 0
    
    // Generate Milk players
    for (let i = 0; i < milkCount; i++) {
      const fakePlayer = `SIM${Date.now()}${i}MILK`
      const salt = generateSalt()
      try {
        demoCommit(round.id, fakePlayer, 'Milk', salt)
        committed++
      } catch (e) {
        console.error('Failed to commit:', e)
      }
    }

    // Generate Cacao players
    for (let i = 0; i < cacaoCount; i++) {
      const fakePlayer = `SIM${Date.now()}${i}CACAO`
      const salt = generateSalt()
      try {
        demoCommit(round.id, fakePlayer, 'Cacao', salt)
        committed++
      } catch (e) {
        console.error('Failed to commit:', e)
      }
    }

    toast.success(`${committed} players committed! (${milkCount} Milk, ${cacaoCount} Cacao)`)
    onUpdate?.()
  }

  const handleAutoReveal = () => {
    const round = getCurrentRound()
    if (!round) {
      toast.error('No active round found')
      return
    }

    // Get all committed players from localStorage
    const state = localStorage.getItem('choco:demo:v1')
    if (!state) return

    const parsed = JSON.parse(state, (key, value) => {
      if (key === 'stakeLamports' && typeof value === 'string') {
        return BigInt(value)
      }
      return value
    })

    const playerRounds = Object.values(parsed.playerRounds) as any[]
    const toReveal = playerRounds.filter(
      (pr: any) => pr.roundId === round.id && !pr.revealed
    )

    let revealed = 0
    toReveal.forEach((pr: any) => {
      try {
        demoReveal(round.id, pr.player, pr.tribe, pr.saltHex)
        revealed++
      } catch (e) {
        console.error('Failed to reveal:', e)
      }
    })

    toast.success(`${revealed} players revealed!`)
    onUpdate?.()
  }

  const handleTimeTravel = (seconds: number) => {
    const round = getCurrentRound()
    if (!round) {
      toast.error('No active round found')
      return
    }

    // Modify timestamps in localStorage
    const state = localStorage.getItem('choco:demo:v1')
    if (!state) return

    const parsed = JSON.parse(state, (key, value) => {
      if (key === 'stakeLamports' && typeof value === 'string') {
        return BigInt(value)
      }
      return value
    })

    // Adjust round times
    if (parsed.rounds[round.id]) {
      const r = parsed.rounds[round.id]
      r.startTime -= seconds
      r.commitEndTime -= seconds
      r.revealEndTime -= seconds
      r.finalizeTime -= seconds
    }

    localStorage.setItem('choco:demo:v1', JSON.stringify(parsed, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString()
      }
      return value
    }))

    toast.success(`Time traveled ${seconds}s forward!`)
    onUpdate?.()
  }

  const handleNextRound = () => {
    advanceToNextRound()
    toast.success('Advanced to next round!')
    onUpdate?.()
  }

  const handleReset = () => {
    if (confirm('Reset all demo data? This cannot be undone.')) {
      clearAllDemoData()
      toast.success('Demo data cleared!')
      onUpdate?.()
      window.location.reload()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
        title="Open Demo Simulator"
      >
        <Icon name="sparkles" className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 rounded-2xl border border-border bg-surface shadow-2xl">
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon name="sparkles" className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold text-fg">Demo Simulator</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-muted hover:text-fg transition"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
        {/* Auto Join Section */}
        <div className="space-y-3 rounded-xl border border-border bg-surface-subtle p-4">
          <h4 className="text-sm font-semibold text-fg flex items-center gap-2">
            <Icon name="user" className="h-4 w-4" />
            Auto Join Players
          </h4>
          
          <div className="space-y-2">
            <label className="text-xs text-muted">Number of Players: {autoPlayers}</label>
            <input
              type="range"
              min="1"
              max="50"
              value={autoPlayers}
              onChange={(e) => setAutoPlayers(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted">Milk %: {milkPercent}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={milkPercent}
              onChange={(e) => setMilkPercent(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>🥛 Milk: {Math.floor(autoPlayers * (milkPercent / 100))}</span>
              <span>🍫 Cacao: {autoPlayers - Math.floor(autoPlayers * (milkPercent / 100))}</span>
            </div>
          </div>

          <button
            onClick={handleAutoJoin}
            className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand hover:bg-brand-strong transition"
          >
            Commit {autoPlayers} Players
          </button>
        </div>

        {/* Auto Reveal Section */}
        <div className="space-y-3 rounded-xl border border-border bg-surface-subtle p-4">
          <h4 className="text-sm font-semibold text-fg flex items-center gap-2">
            <Icon name="sparkles" className="h-4 w-4" />
            Auto Reveal
          </h4>
          <button
            onClick={handleAutoReveal}
            className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
          >
            Reveal All Players
          </button>
        </div>

        {/* Time Travel Section */}
        <div className="space-y-3 rounded-xl border border-border bg-surface-subtle p-4">
          <h4 className="text-sm font-semibold text-fg flex items-center gap-2">
            <Icon name="timer" className="h-4 w-4" />
            Time Travel
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleTimeTravel(30)}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              +30s
            </button>
            <button
              onClick={() => handleTimeTravel(60)}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              +1min
            </button>
            <button
              onClick={() => handleTimeTravel(300)}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              +5min
            </button>
            <button
              onClick={() => handleTimeTravel(600)}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              +10min
            </button>
          </div>
        </div>

        {/* Round Control Section */}
        <div className="space-y-3 rounded-xl border border-border bg-surface-subtle p-4">
          <h4 className="text-sm font-semibold text-fg flex items-center gap-2">
            <Icon name="history" className="h-4 w-4" />
            Round Control
          </h4>
          <button
            onClick={handleNextRound}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Advance to Next Round
          </button>
        </div>

        {/* Reset Section */}
        <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <h4 className="text-sm font-semibold text-red-900 flex items-center gap-2">
            <Icon name="alert" className="h-4 w-4" />
            Danger Zone
          </h4>
          <button
            onClick={handleReset}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            Reset All Demo Data
          </button>
        </div>
      </div>
    </div>
  )
}
