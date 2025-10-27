import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { Alert } from '../components/ui/Alert'
import { ConnectButton } from '../components/ConnectButton'
import { useDeadlines } from '../hooks/useSolanaRounds'
import { useSolanaAccount } from '../hooks/useSolanaAccount'
import * as demo from '../lib/demo-rounds'

export default function ClaimPage() {
  const { roundId } = useDeadlines()
  const { publicKey, isConnected } = useSolanaAccount()
  const [winner, setWinner] = useState<'Milk' | 'Cacao' | null>(null)
  const [claimed, setClaimed] = useState<boolean>(false)
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    if (!roundId) return
    const r = demo.getRound(roundId)
    setWinner(r?.winnerSide ?? null)
    if (publicKey) {
      const pr = demo.getPlayerRound(roundId, publicKey)
      setClaimed(Boolean(pr?.claimed))
    }
  }, [roundId, publicKey])

  const canClaim = useMemo(() => {
    if (!roundId || !publicKey) return { eligible: false, reason: 'Connect wallet' }
    return demo.canClaim(roundId, publicKey)
  }, [roundId, publicKey])

  function iconForWinner(w: typeof winner) {
    return w === 'Milk' ? 'milk' : 'cacao'
  }

  function onClaim() {
    if (!roundId || !publicKey) return
    try {
      demo.claim(roundId, publicKey)
      setClaimed(true)
      setStatus('Claimed successfully')
    } catch (e: any) {
      setStatus(e?.message ?? 'Claim failed')
    }
  }
  return (
    <div className="space-y-8">
      {/* Hero adapting with selected colorway */}
      <header className="rounded-2xl bg-gradient-brand px-8 py-10 shadow-float">
        <h1 className="font-display text-4xl font-semibold text-on-brand">Claim treats</h1>
        <p className="mt-2 max-w-3xl text-base text-on-brand/80">
          Khi round đã settle, người chơi thuộc phe thiểu số sẽ claim phần thưởng. Demo flow cho phép thử Claim khi
          eligible.
        </p>
      </header>

      {/* Gradient container with glass content */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-0.5 shadow-float">
        <div className="rounded-3xl border border-border/60 bg-surface-subtle/80 backdrop-blur-xl p-6">
          <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Claim</CardTitle>
                <CardDescription>Eligible winners can claim their FOOD payout.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isConnected ? (
                  <div className="rounded-xl border border-brand/40 bg-brand/15 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-on-brand">Connect wallet to claim</div>
                      <div className="wallet-adapter-button-trigger"><ConnectButton /></div>
                    </div>
                    <p className="mt-1 text-xs text-on-brand/80">You can also open Settings (gear icon) to connect.</p>
                  </div>
                ) : null}
                {isConnected ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Round ID</span>
                      <span className="text-lg font-semibold text-fg">#{roundId ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Phe thắng</span>
                      {winner ? (
                        <span className="inline-flex items-center gap-2 rounded-pill bg-brand/40 px-3 py-1 text-sm font-semibold text-on-brand">
                          <Icon name={iconForWinner(winner)} className="h-4 w-4" />
                          {winner}
                        </span>
                      ) : (
                        <span className="text-xs uppercase tracking-[0.18em] text-muted">—</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Ước tính payout</span>
                      <span className="text-lg font-semibold text-fg">— FOOD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Claim status</span>
                      <span className="text-xs uppercase tracking-[0.18em] text-muted">{claimed ? 'Claimed' : 'Not claimed'}</span>
                    </div>
                    <Button size="lg" rightIcon="treasury" disabled={!canClaim.eligible || claimed} onClick={onClaim}>
                      {claimed ? 'Claimed' : 'Claim'}
                    </Button>
                    {(!canClaim.eligible || claimed) && (
                      <p className="text-xs text-muted-strong">{claimed ? 'Already claimed' : canClaim.reason ?? 'Not eligible'}</p>
                    )}
                    {status ? <p className="text-xs text-muted-strong">{status}</p> : null}
                  </>
                ) : null}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Status & History</CardTitle>
                  <CardDescription>Reveal progress and latest claims.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Reveal status</p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {['You', 'Milk team', 'Cacao team'].map((label) => (
                        <div
                          key={label}
                          className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
                        >
                          <span className="text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
                          <span className="text-sm font-semibold text-fg">—</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Lịch sử claim gần nhất</p>
                    <div className="grid gap-3 text-sm text-muted">
                      {[1, 2, 3].map((idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
                        >
                          <span>0xPlayer…{idx}</span>
                          <span className="text-fg">+— FOOD</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Alert
                variant="info"
                title="Pull-payment"
                description="Contract does not auto-transfer rewards. Winners must click claim to receive FOOD."
              />
              <Alert
                variant="warning"
                title="Double claim?"
                description="The UI disables claim if already claimed or not eligible."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
