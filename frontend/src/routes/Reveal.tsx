import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Icon } from '../components/ui/Icon'
import { useDeadlines } from '../hooks/useSolanaRounds'
import { useSolanaAccount } from '../hooks/useSolanaAccount'
import { getRoundAddress } from '../solana/program'
import { getVault } from '../lib/salt-vault'
import * as demo from '../lib/demo-rounds'

export default function RevealPage() {
  const { roundId, phase } = useDeadlines()
  const { publicKey } = useSolanaAccount()
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
      <Card>
        <CardHeader>
          <CardTitle>Reveal commitment</CardTitle>
          <CardDescription>
            When the round enters Reveal, players provide tribe + salt to verify. This screen will wire
            `useReveal()` (epic C2) and round state from B2.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
          {status ? <p className="text-xs text-muted-strong">{status}</p> : null}
        </CardContent>
      </Card>

      <Card variant="solid">
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
  )
}
