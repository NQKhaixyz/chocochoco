import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { Alert } from '../components/ui/Alert'
import { useDeadlines } from '../hooks/useSolanaRounds'
import { useSolanaAccount } from '../hooks/useSolanaAccount'
import * as demo from '../lib/demo-rounds'

export default function ClaimPage() {
  const { roundId } = useDeadlines()
  const { publicKey } = useSolanaAccount()
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
      <Card>
        <CardHeader>
          <CardTitle>Claim treats</CardTitle>
          <CardDescription>
            Khi round đã settle, người chơi thuộc phe thiểu số sẽ claim phần thưởng. Demo flow cho phép thử Claim khi eligible.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-5 rounded-2xl border border-border bg-surface px-6 py-5">
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
            {status ? <p className="text-xs text-muted-strong">{status}</p> : null}
          </div>
          <div className="space-y-4">
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
        </CardContent>
      </Card>
      <Card variant="solid">
        <CardHeader>
          <CardTitle>Lịch sử claim gần nhất</CardTitle>
          <CardDescription>Demo: danh sách claim thật sẽ hiển thị khi nối indexer.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
            >
              <span>0xPlayer…{idx}</span>
              <span className="text-fg">+— FOOD</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
