import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Icon } from '../components/ui/Icon'
import { ConnectButton } from '../components/ConnectButton'
import { useDeadlines } from '../hooks/useSolanaRounds'
import { useSolanaAccount } from '../hooks/useSolanaAccount'
import { getRoundAddress } from '../solana/program'
import { getVault } from '../lib/salt-vault'
import * as demo from '../lib/demo-rounds'

export default function RevealPage() {
  const { roundId, phase } = useDeadlines()
  const { publicKey, isConnected } = useSolanaAccount()
  const [tribe, setTribe] = useState<'Milk' | 'Cacao' | null>(null)
  const [salt, setSalt] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    if (!roundId || !publicKey) return
    const roundPk = getRoundAddress(roundId)
    const entry = getVault(roundPk, publicKey)
    if (entry) {
      setTribe(entry.tribe)
      setSalt(entry.saltHex)
    }
  }, [roundId, publicKey])

  const canReveal = !!(roundId && publicKey && tribe && salt && phase === 'reveal')

  function revealDisabledReason(): string | null {
    if (!roundId) return 'Round not ready'
    if (!isConnected || !publicKey) return 'Connect wallet in Settings (gear icon)'
    if (!tribe || !salt) return 'No saved commit — complete Join first'
    if (phase !== 'reveal') return 'Waiting for reveal phase'
    return null
  }

  async function onReveal() {
    if (!roundId || !publicKey) return
    try {
      await demo.reveal(roundId, publicKey)
      setStatus('Revealed successfully')
    } catch (e: any) {
      setStatus(e?.message ?? 'Reveal failed')
    }
  }
  return (
    <div className="space-y-8">
      {/* Hero adapting with selected colorway */}
      <header className="rounded-2xl bg-gradient-brand px-8 py-10 shadow-float">
        <h1 className="font-display text-4xl font-semibold text-on-brand">Reveal commitment</h1>
        <p className="mt-2 max-w-3xl text-base text-on-brand/80">
          Provide tribe + salt to verify your commit when the round enters Reveal.
        </p>
      </header>

      {/* Gradient container with glass content */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-0.5 shadow-float">
        <div className="rounded-3xl border border-border/60 bg-surface-subtle/80 backdrop-blur-xl p-6">
          <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Reveal</CardTitle>
                <CardDescription>Use saved tribe + salt from Join to reveal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isConnected ? (
                  <div className="rounded-xl border border-accent-strong/40 bg-accent/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-on-accent">Connect wallet to reveal</div>
                      <div className="wallet-adapter-button-trigger"><ConnectButton /></div>
                    </div>
                    <p className="mt-1 text-xs text-on-accent/80">Use Settings (gear icon) or the button here.</p>
                  </div>
                ) : null}
                {isConnected ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Committed tribe</span>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {(['Milk', 'Cacao'] as const).map((t) => {
                            const active = tribe === t
                            return (
                              <label
                                key={t}
                                className={
                                  'flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ' +
                                  (active ? 'border-brand bg-brand/20' : 'border-border bg-surface hover:border-brand')
                                }
                              >
                                <span className="font-semibold text-fg">{t}</span>
                                <input type="radio" name="tribe" className="hidden" disabled />
                                <Icon name={t === 'Milk' ? 'milk' : 'cacao'} className="h-5 w-5 text-brand-strong" />
                              </label>
                            )
                          })}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Salt</span>
                        <Input placeholder="Paste saved salt…" state="default" value={salt} readOnly />
                        <p className="text-xs text-muted">Lost your salt? Use Salt Vault → Restore.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
                      <span className="text-muted-strong">Reveal deadline</span>
                      <span className="rounded-pill bg-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-accent">
                        07:12 min · 2 reveals remaining
                      </span>
                    </div>
                    <Button size="lg" variant="secondary" leftIcon="timer" disabled={!canReveal} onClick={onReveal}>
                      Reveal
                    </Button>
                    {!canReveal && revealDisabledReason() ? (
                      <p className="text-xs text-muted-strong">{revealDisabledReason()}</p>
                    ) : null}
                  </>
                ) : null}
                {status ? <p className="text-xs text-muted-strong">{status}</p> : null}
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Reveal status</CardTitle>
                <CardDescription>After a successful reveal a badge appears here.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {['You', 'Milk team', 'Cacao team'].map((label) => (
                  <div
                    key={label}
                    className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
                  >
                    <span className="text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
                    <span className="text-sm font-semibold text-fg">—</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
