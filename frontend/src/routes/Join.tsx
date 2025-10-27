import React from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Icon } from '../components/ui/Icon'
// import { useDeadlines } from '../hooks/useChocoRounds'
import { formatCountdown } from '../lib/time-format'
import { hasDeploymentConfigured } from '../lib/chocochoco-contract'

const upcoming = [
  { label: 'Salt vault', status: 'Designing vault UX', icon: 'sparkles' as const },
  { label: 'Countdown commit', status: 'Wire useDeadlines()', icon: 'timer' as const },
  { label: 'Commit transaction', status: 'Hook wagmi/writeContract', icon: 'treasury' as const },
]

const ZERO_PLACEHOLDER = '—'

export default function JoinPage() {
  // TODO: Migrate to Solana hooks
  // const { round, roundId, commitSecondsRemaining, phase, isLoading, error } = useDeadlines()
  const round = undefined as any
  const roundId = undefined as any
  const commitSecondsRemaining = undefined as any
  const phase = 'loading' as const
  const isLoading = true
  const error = null as any
  
  const contractReady = hasDeploymentConfigured()
  const commitCountdown = commitSecondsRemaining !== undefined ? formatCountdown(commitSecondsRemaining, { alwaysShowHours: true }) : ZERO_PLACEHOLDER

  const milkPlayers = round ? round.countMilk : undefined
  const cacaoPlayers = round ? round.countCacao : undefined
  const feePercent = round ? (round.feeBps / 100).toFixed(2) : undefined
  const stakeWei = round ? round.stake.toString() : undefined

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Join · Commit to a tribe</CardTitle>
          <CardDescription>
            Pick Milk or Cacao, generate a salt, then commit before the deadline. This scaffold plugs in design tokens and will be wired with wagmi hooks in epic C1 + B5.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Choose tribe</span>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['Milk', 'Cacao'] as const).map((tribe) => (
                <button
                  key={tribe}
                  type="button"
                  className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 text-left transition hover:-translate-y-[1px] hover:border-brand"
                  disabled
                >
                  <div>
                    <p className="text-sm font-semibold text-fg">{tribe}</p>
                    <p className="text-xs text-muted">
                      Stake per seat: {stakeWei ?? 'pending'} wei
                    </p>
                  </div>
                  <Icon name={tribe === 'Milk' ? 'milk' : 'cacao'} className="h-6 w-6 text-brand-strong" />
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Salt (auto)</span>
              <Input placeholder="0x…" trailingIcon="sparkles" readOnly />
              <p className="text-xs text-muted">Salt will be stored in the local Salt Vault for reveal.</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Stake</span>
              <Input placeholder="5.000 FOOD (configurable)" trailingIcon="treasury" readOnly />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
            <span className="text-muted-strong">Commit deadline</span>
            <span className="rounded-pill bg-brand/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900">
              {commitCountdown}
            </span>
          </div>
          <Button size="lg" rightIcon="sparkles" disabled>
            Commit (wiring soon)
          </Button>
          {!contractReady ? (
            <p className="text-xs text-rose-600">
              Missing VITE_PROGRAM_ID. Configure Solana program env to enable live data.
            </p>
          ) : null}
          {error ? <p className="text-xs text-rose-500">Unable to load round data: {error.message}</p> : null}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card variant="solid">
          <CardHeader>
            <CardTitle>Round snapshot</CardTitle>
            <CardDescription>Live data pulled via useDeadlines hook.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-strong">
            <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
              <span>Round ID</span>
              <span className="font-semibold text-fg">#{roundId !== undefined ? roundId.toString() : ZERO_PLACEHOLDER}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
              <span>Phase</span>
              <span className="font-semibold text-fg">{isLoading ? 'Loading…' : phase}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
              <span>Total players</span>
              <span className="font-semibold text-fg">
                Milk {milkPlayers ?? ZERO_PLACEHOLDER} · Cacao {cacaoPlayers ?? ZERO_PLACEHOLDER}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
              <span>Fee (bps)</span>
              <span className="font-semibold text-fg">
                {round ? `${round.feeBps} bps (${feePercent}% )` : ZERO_PLACEHOLDER}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card variant="outline" className="border-dashed">
          <CardHeader>
            <CardTitle>Implementation checklist</CardTitle>
            <CardDescription>Scope tracked for commit flow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcoming.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <Icon name={item.icon} className="h-4 w-4 text-brand-strong" />
                  <span className="font-semibold text-fg">{item.label}</span>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-muted">{item.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
