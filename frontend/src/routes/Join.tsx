import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Icon } from '../components/ui/Icon'
import { ConnectButton } from '../components/ConnectButton'
import { CatIllustration } from '../components/CatIllustration'
import { OnboardingTour, useOnboarding } from '../components/OnboardingTour'
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
  const { publicKey, isConnected } = useSolanaAccount()
  const { hasSeenOnboarding, markAsCompleted } = useOnboarding()
  
  // Get player's FOOD balance
  const [foodBalance, setFoodBalance] = useState<bigint>(0n)
  
  const [tribe, setTribe] = useState<Tribe | null>(null)
  const [salt, setSalt] = useState<Uint8Array>(() => randomSalt32())
  const saltHex = useMemo(() => `0x${toHex(salt)}`, [salt])
  const [savedCommitment, setSavedCommitment] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [customStake, setCustomStake] = useState<string>('5.000') // Default 5 FOOD
  
  useEffect(() => {
    if (publicKey) {
      const balance = demo.getBalance(publicKey)
      setFoodBalance(balance)
    }
  }, [publicKey, savedCommitment]) // Update when commitment changes

  const contractReady = hasDeploymentConfigured()
  const commitCountdown = commitSecondsRemaining !== undefined ? formatCountdown(commitSecondsRemaining, { alwaysShowHours: true }) : ZERO_PLACEHOLDER

  const milkPlayers = round ? round.countMilk : undefined
  const cacaoPlayers = round ? round.countCacao : undefined
  const feePercent = round ? (round.feeBps / 100).toFixed(2) : undefined
  const stakeWei = round ? round.stake.toString() : undefined

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

  function commitDisabledReason(): string | null {
    if (!roundId) return 'Round not ready'
    if (!isConnected || !publicKey) return 'Connect wallet in Settings (gear icon)'
    if (!tribe) return 'Choose a tribe'
    if (phase !== 'commit') return 'Commit phase is closed — wait for next round'
    
    // Check if user has enough balance
    try {
      const stakeLamports = BigInt(Math.floor(parseFloat(customStake) * 1_000_000_000))
      if (foodBalance < stakeLamports) {
        return `Insufficient balance. You have ${demo.formatFoodBalance(foodBalance)}`
      }
    } catch {
      return 'Invalid stake amount'
    }
    
    return null
  }

  async function handleCommit() {
    if (!roundId || !publicKey || !tribe) return
    setSaving(true)
    try {
      // Parse custom stake to lamports (9 decimals)
      const stakeLamports = BigInt(Math.floor(parseFloat(customStake) * 1_000_000_000))
      
      const roundPk = getRoundAddress(roundId)
      const entry = await saveVault(roundPk, publicKey, tribe, salt)
      setSavedCommitment(entry.commitmentHex)
      // Register commit in demo state with custom stake
      await demo.commit(roundId, publicKey, tribe, salt, stakeLamports)
      
      // Refresh balance display
      setFoodBalance(demo.getBalance(publicKey))
    } catch (e: any) {
      console.error('Save vault failed', e)
      alert(e?.message || 'Failed to commit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* The hero uses bg-gradient-brand so it adapts with colorway */}
      <header className="relative rounded-2xl bg-gradient-brand px-8 py-10 shadow-float animate-fade-up overflow-hidden">
        <div className="relative z-10">
          <h1 className="font-display text-4xl font-semibold text-on-brand flex items-center gap-3">
            <CatIllustration type="stack" size="lg" className="animate-bounce-slow" />
            Join · Commit to a tribe
          </h1>
          <p className="mt-2 max-w-3xl text-base text-on-brand/80">
            Pick Milk or Cacao, generate a salt, then commit before the deadline. Join the cutest minority game on Solana! 🐱
          </p>
        </div>
        {/* Decorative cats */}
        <div className="absolute -right-4 -bottom-4 opacity-20">
          <CatIllustration type="play" size="xl" />
        </div>
      </header>

      {/* Gradient container that adapts with the selected colorway */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-0.5 shadow-float">
        {/* Decorative ambient cats */}
        <div className="absolute top-20 left-10 opacity-10 pointer-events-none">
          <CatIllustration type="stretch" size="lg" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10 pointer-events-none">
          <CatIllustration type="sitting" size="xl" />
        </div>
        <div className="absolute top-1/2 right-1/4 opacity-5 pointer-events-none">
          <CatIllustration type="yarn" size="xl" />
        </div>
        
        <div className="rounded-3xl border border-border/60 bg-surface-subtle/80 backdrop-blur-xl p-6 relative z-10">
          <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Commit</CardTitle>
                <CardDescription>Choose tribe, keep your salt, then commit before deadline.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isConnected ? (
                  <div className="rounded-xl border border-brand/40 bg-brand/15 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <CatIllustration type="thinking" size="md" />
                        <div>
                          <div className="text-sm font-semibold text-on-brand">Connect wallet to continue</div>
                          <p className="text-xs text-on-brand/80">You can also open Settings (gear icon) to connect.</p>
                        </div>
                      </div>
                      <div className="wallet-adapter-button-trigger flex-shrink-0"><ConnectButton /></div>
                    </div>
                  </div>
                ) : null}
                {isConnected ? (
                <>
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Choose tribe</span>
                  
                  {/* Live player counts - only show after commit phase ends */}
                  {phase !== 'commit' && milkPlayers !== undefined && cacaoPlayers !== undefined ? (
                    <div className="mb-3 rounded-xl border border-border/50 bg-surface-subtle p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon name="milk" className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-semibold text-fg">Milk: {milkPlayers}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-fg">Cacao: {cacaoPlayers}</span>
                          <Icon name="cacao" className="h-4 w-4 text-amber-600" />
                        </div>
                      </div>
                      <div className="flex h-2 overflow-hidden rounded-full bg-surface">
                        <div 
                          className="bg-blue-500 transition-all duration-500"
                          style={{ width: milkPlayers + cacaoPlayers === 0 ? '50%' : `${(milkPlayers / (milkPlayers + cacaoPlayers)) * 100}%` }}
                        />
                        <div 
                          className="bg-amber-600 transition-all duration-500"
                          style={{ width: milkPlayers + cacaoPlayers === 0 ? '50%' : `${(cacaoPlayers / (milkPlayers + cacaoPlayers)) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-center text-xs text-muted">
                        Total: {milkPlayers + cacaoPlayers} players · {milkPlayers + cacaoPlayers === 0 ? 'No players yet' : milkPlayers < cacaoPlayers ? '🍫 Cacao leading' : milkPlayers > cacaoPlayers ? '🥛 Milk leading' : '⚖️ Tied'}
                      </p>
                    </div>
                  ) : phase === 'commit' ? (
                    <div className="mb-3 rounded-xl border border-brand/30 bg-brand/10 p-3">
                      <div className="flex items-center justify-center gap-2">
                        <CatIllustration type="sleep" size="sm" />
                        <p className="text-xs text-muted-strong">
                          <Icon name="shield" className="inline h-3.5 w-3.5 mr-1" />
                          Player counts hidden during commit phase
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {(['Milk', 'Cacao'] as const).map((t) => {
                      const active = tribe === t
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTribe(t)}
                          className={
                            'relative flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition hover:-translate-y-[1px] hover:shadow-lg overflow-hidden' +
                            (active ? ' border-brand bg-brand/20 shadow-md' : ' border-border bg-surface hover:border-brand')
                          }
                        >
                          {/* Cat illustration for each tribe */}
                          {active && (
                            <div className="absolute -right-2 -bottom-2 opacity-20">
                              <CatIllustration type={t === 'Milk' ? 'milk' : 'cacao'} size="lg" />
                            </div>
                          )}
                          <div className="relative z-10">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-fg">{t}</p>
                              {/* Only show joined count after commit phase */}
                              {phase !== 'commit' && t === 'Milk' && milkPlayers !== undefined ? (
                                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                                  {milkPlayers} joined
                                </span>
                              ) : null}
                              {phase !== 'commit' && t === 'Cacao' && cacaoPlayers !== undefined ? (
                                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                  {cacaoPlayers} joined
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted">Stake per slot: {stakeWei ?? 'pending'} lamports</p>
                          </div>
                          <Icon name={t === 'Milk' ? 'milk' : 'cacao'} className="relative z-10 h-6 w-6 text-brand-strong" />
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
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Stake</span>
                      <span className="text-xs text-muted">
                        ≈ {(parseFloat(customStake) || 0).toFixed(3)} FOOD
                      </span>
                    </div>
                    <Input 
                      type="number" 
                      step="0.001"
                      min="0.001"
                      value={customStake} 
                      onChange={(e) => setCustomStake(e.target.value)}
                      trailingIcon="treasury" 
                      placeholder="5.000"
                    />
                    <p className="text-xs text-muted">Amount to stake in FOOD tokens.</p>
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
                {!canCommit && commitDisabledReason() ? (
                  <p className="text-xs text-muted-strong">{commitDisabledReason()}</p>
                ) : null}
                {savedCommitment ? (
                  <div className="rounded-xl border border-brand/40 bg-brand/15 p-3">
                    <div className="flex items-center gap-2">
                      <CatIllustration type="winner" size="sm" className="animate-wiggle" />
                      <div className="flex-1">
                        <div className="mb-1 font-semibold text-on-brand flex items-center gap-2">
                          Salt Vault saved
                          <Icon name="success" className="h-4 w-4" />
                        </div>
                        <div className="text-xs text-muted break-all">Commitment: {savedCommitment}</div>
                      </div>
                    </div>
                  </div>
                ) : null}
                {!contractReady ? (
                  <p className="text-xs text-rose-600">Missing VITE_PROGRAM_ID. Configure Solana program env to enable live data.</p>
                ) : null}
                {error ? <p className="text-xs text-rose-500">Unable to load round data: {error.message}</p> : null}
                </>
                ) : null}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card variant="solid">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Round snapshot
                    <CatIllustration type="play" size="sm" className="animate-float" />
                  </CardTitle>
                  <CardDescription>Live data pulled via useDeadlines hook.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-strong">
                  {isConnected && publicKey && (
                    <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-brand/20 to-brand/10 px-4 py-3 border-2 border-brand/40">
                      <div className="flex items-center gap-2">
                        <Icon name="treasury" className="h-4 w-4 text-brand-strong" />
                        <span className="font-semibold">Your Balance</span>
                      </div>
                      <span className="font-bold text-fg">{demo.formatFoodBalance(foodBalance)}</span>
                    </div>
                  )}
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
                    {phase === 'commit' ? (
                      <span className="font-semibold text-muted">Hidden 🔒</span>
                    ) : (
                      <span className="font-semibold text-fg">Milk {milkPlayers ?? ZERO_PLACEHOLDER} · Cacao {cacaoPlayers ?? ZERO_PLACEHOLDER}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
                    <span>Fee (bps)</span>
                    <span className="font-semibold text-fg">{round ? `${round.feeBps} bps (${feePercent}% )` : ZERO_PLACEHOLDER}</span>
                  </div>
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Implementation checklist</CardTitle>
                  <CardDescription>Scope tracked for commit flow.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcoming.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-pill border border-border bg-surface px-5 py-4 text-sm shadow-soft"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 text-brand-strong">
                          <Icon name={item.icon} className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-fg">{item.label}</span>
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-strong">{item.status}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Onboarding Tour for first-time users */}
      {!hasSeenOnboarding && (
        <OnboardingTour
          onComplete={markAsCompleted}
          onSkip={markAsCompleted}
        />
      )}
    </div>
  )
}
