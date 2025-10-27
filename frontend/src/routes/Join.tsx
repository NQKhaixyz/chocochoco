import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Icon } from '../components/ui/Icon'
import { useDeadlines } from '../hooks/useSolanaRounds'
import { formatCountdown } from '../lib/time-format'
import { hasDeploymentConfigured } from '../lib/chocochoco-contract'
import { useSolanaAccount } from '../hooks/useSolanaAccount'
import { randomSalt32, toHex, type Tribe } from '../lib/solana-commit'
import { getRoundAddress } from '../solana/program'
import { getVault, saveVault } from '../lib/salt-vault'
import * as demo from '../lib/demo-rounds'

const upcoming = [
  { label: 'Salt vault', status: 'Designing vault UX', icon: 'sparkles' as const },
  { label: 'Countdown commit', status: 'Using Solana hooks', icon: 'timer' as const },
  { label: 'Commit transaction', status: 'Hook Solana writeContract', icon: 'treasury' as const },
]

const ZERO_PLACEHOLDER = '—'

export default function JoinPage() {
  const { round, roundId, commitSecondsRemaining, phase, isLoading, error } = useDeadlines()
  const { publicKey } = useSolanaAccount()
  
  const contractReady = hasDeploymentConfigured()
  const commitCountdown = commitSecondsRemaining !== undefined ? formatCountdown(commitSecondsRemaining, { alwaysShowHours: true }) : ZERO_PLACEHOLDER

  const milkPlayers = round ? round.countMilk : undefined
  const cacaoPlayers = round ? round.countCacao : undefined
  const feePercent = round ? (round.feeBps / 100).toFixed(2) : undefined
  const stakeWei = round ? round.stake.toString() : undefined

  const [tribe, setTribe] = useState<Tribe | null>(null)
  const [salt, setSalt] = useState<Uint8Array>(() => randomSalt32())
  const saltHex = useMemo(() => `0x${toHex(salt)}`, [salt])
  const [savedCommitment, setSavedCommitment] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!roundId || !publicKey) return
    const roundPk = getRoundAddress(roundId)
    const cached = getVault(roundPk, publicKey)
    if (cached) {
      setTribe(cached.tribe)
      try {
        const hex = cached.saltHex.replace(/^0x/, '')
        const bytes = new Uint8Array(hex.length / 2)
        for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(2 * i, 2 * i + 2), 16)
        setSalt(bytes)
      } catch {
        // ignore
      }
      setSavedCommitment(cached.commitmentHex)
    }
  }, [roundId, publicKey])

  const canCommit = !!(roundId && publicKey && tribe && phase === 'commit')

  async function handleCommit() {
    if (!roundId || !publicKey || !tribe) return
    setSaving(true)
    try {
      const roundPk = getRoundAddress(roundId)
      const entry = await saveVault(roundPk, publicKey, tribe, salt)
      setSavedCommitment(entry.commitmentHex)
      // Register commit in demo state so Reveal/Claim can find it
      await demo.commit(roundId, publicKey, tribe, salt)
    } catch (e) {
      console.error('Save vault failed', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* The hero uses bg-gradient-brand so it adapts with colorway */}
      <header className="rounded-2xl bg-gradient-brand px-8 py-10 shadow-float animate-fade-up">
        <h1 className="font-display text-4xl font-semibold text-on-brand">Join · Commit to a tribe</h1>
        <p className="mt-2 max-w-3xl text-base text-on-brand/80">
          Pick Milk or Cacao, generate a salt, then commit before the deadline. This scaffold plugs in design tokens and
          will be wired with Solana hooks.
        </p>
      </header>

      {/* Gradient container that adapts with the selected colorway */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-0.5 shadow-float">
        <div className="rounded-3xl border border-border/60 bg-surface-subtle/80 backdrop-blur-xl p-6">
          <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Commit</CardTitle>
                <CardDescription>Choose tribe, keep your salt, then commit before deadline.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Choose tribe</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(['Milk', 'Cacao'] as const).map((t) => {
                      const active = tribe === t
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTribe(t)}
                          className={
                            'flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition hover:-translate-y-[1px]' +
                            (active ? ' border-brand bg-brand/20' : ' border-border bg-surface hover:border-brand')
                          }
                        >
                          <div>
                            <p className="text-sm font-semibold text-fg">{t}</p>
                            <p className="text-xs text-muted">Stake per slot: {stakeWei ?? 'pending'} lamports</p>
                          </div>
                          <Icon name={t === 'Milk' ? 'milk' : 'cacao'} className="h-6 w-6 text-brand-strong" />
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Salt (generated)</span>
                    <Input value={saltHex} readOnly trailingIcon="sparkles" />
                    <p className="text-xs text-muted">Salt is saved in the Salt Vault for Reveal.</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Stake</span>
                    <Input placeholder="5.000 FOOD (configurable)" trailingIcon="treasury" readOnly />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
                  <span className="text-muted-strong">Commit deadline</span>
                  <span className="rounded-pill bg-brand/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-brand">
                    {commitCountdown}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
                  <Button size="lg" rightIcon="sparkles" onClick={handleCommit} disabled={!canCommit} loading={saving}>
                    Commit (save vault)
                  </Button>
                  <Button size="lg" variant="secondary" onClick={() => setSalt(randomSalt32())}>
                    Generate another salt
                  </Button>
                </div>
                {savedCommitment ? (
                  <div className="rounded-xl border border-brand/40 bg-brand/15 p-3 text-xs">
                    <div className="mb-1 font-semibold text-on-brand">Salt Vault saved</div>
                    <div className="text-muted">Commitment: {savedCommitment}</div>
                  </div>
                ) : null}
                {!contractReady ? (
                  <p className="text-xs text-rose-600">Missing VITE_PROGRAM_ID. Configure Solana program env to enable live data.</p>
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
                    <span className="font-semibold text-fg">Milk {milkPlayers ?? ZERO_PLACEHOLDER} · Cacao {cacaoPlayers ?? ZERO_PLACEHOLDER}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
                    <span>Fee (bps)</span>
                    <span className="font-semibold text-fg">{round ? `${round.feeBps} bps (${feePercent}% )` : ZERO_PLACEHOLDER}</span>
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
        </div>
      </div>
    </div>
  )
}
