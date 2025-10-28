import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { CatIllustration } from '../components/CatIllustration'
import { Alert } from '../components/ui/Alert'
import { ConnectButton } from '../components/ConnectButton'
import { useDeadlines } from '../hooks/useSolanaRounds'
import { useSolanaAccount } from '../hooks/useSolanaAccount'
import * as demo from '../lib/demo-rounds'

export default function ClaimPage() {
  const { roundId: currentRoundId } = useDeadlines()
  const { publicKey, isConnected } = useSolanaAccount()
  
  // State for managing selected round
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null)
  const [availableRounds, setAvailableRounds] = useState<demo.DemoRound[]>([])
  const [playerRounds, setPlayerRounds] = useState<demo.DemoPlayerRound[]>([])
  
  const [winner, setWinner] = useState<'Milk' | 'Cacao' | null>(null)
  const [claimed, setClaimed] = useState<boolean>(false)
  const [status, setStatus] = useState<string>('')
  const [estimatedPayout, setEstimatedPayout] = useState<bigint>(0n)

  // Load available rounds for player
  useEffect(() => {
    if (!publicKey) return
    
    // Get all rounds player participated in
    const prs = demo.listPlayerRounds(publicKey)
    setPlayerRounds(prs)
    
    // Get round details for each
    const rounds = prs
      .map(pr => demo.getRound(pr.roundId))
      .filter((r): r is demo.DemoRound => r !== undefined)
      .filter(r => r.isFinalized) // Only show finalized rounds
      .sort((a, b) => b.id - a.id) // Newest first
    
    setAvailableRounds(rounds)
    
    // Auto-select first unclaimed round or current round
    const unclaimedRound = prs.find(pr => !pr.claimed && rounds.find(r => r.id === pr.roundId))
    if (unclaimedRound) {
      setSelectedRoundId(unclaimedRound.roundId)
    } else if (currentRoundId) {
      setSelectedRoundId(currentRoundId)
    }
  }, [publicKey, currentRoundId])

  // Update round info when selection changes
  useEffect(() => {
    if (!selectedRoundId) return
    const r = demo.getRound(selectedRoundId)
    setWinner(r?.winnerSide ?? null)
    
    // Calculate estimated payout
    const payout = demo.computePayoutPerWinner(selectedRoundId)
    setEstimatedPayout(payout)
    
    if (publicKey) {
      const pr = demo.getPlayerRound(selectedRoundId, publicKey)
      setClaimed(Boolean(pr?.claimed))
      setStatus('') // Clear status when changing rounds
    }
  }, [selectedRoundId, publicKey])

  const canClaim = useMemo(() => {
    if (!selectedRoundId || !publicKey) return { eligible: false, reason: 'Connect wallet' }
    return demo.canClaim(selectedRoundId, publicKey)
  }, [selectedRoundId, publicKey])

  function iconForWinner(w: typeof winner) {
    return w === 'Milk' ? 'milk' : 'cacao'
  }

  function onClaim() {
    if (!selectedRoundId || !publicKey) return
    try {
      const balanceBefore = demo.getBalance(publicKey)
      demo.claim(selectedRoundId, publicKey)
      const balanceAfter = demo.getBalance(publicKey)
      const gained = balanceAfter - balanceBefore
      
      setClaimed(true)
      setStatus(`Successfully claimed ${demo.formatFoodBalance(gained)}! 🎉`)
      
      // Refresh player rounds to update claim status
      const prs = demo.listPlayerRounds(publicKey)
      setPlayerRounds(prs)
    } catch (e: any) {
      setStatus(e?.message ?? 'Claim failed')
    }
  }
  return (
    <div className="space-y-8">
      {/* Hero adapting with selected colorway */}
      <header className="rounded-2xl bg-gradient-brand px-8 py-10 shadow-float relative overflow-hidden">
        <div className="absolute top-4 right-4 opacity-20">
          <CatIllustration type="winner" size="xl" />
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-4xl font-semibold text-on-brand flex items-center gap-3">
            <CatIllustration type="winner" size="lg" className="animate-wiggle" />
            Claim treats
          </h1>
          <p className="mt-2 max-w-3xl text-base text-on-brand/80">
            Khi round đã settle, người chơi thuộc phe thiểu số sẽ claim phần thưởng. Demo flow cho phép thử Claim khi
            eligible.
          </p>
        </div>
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
                    {publicKey && (
                      <div className="rounded-xl bg-gradient-to-r from-brand/20 to-brand/10 px-4 py-3 border-2 border-brand/40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon name="treasury" className="h-4 w-4 text-brand-strong" />
                            <span className="text-sm font-semibold">Your Balance</span>
                          </div>
                          <span className="font-bold text-fg">{demo.formatFoodBalance(demo.getBalance(publicKey))}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Round Selector */}
                    {availableRounds.length > 0 ? (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">
                          Select Round to Claim ({availableRounds.length} rounds)
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {availableRounds.map((round) => {
                            const pr = playerRounds.find(p => p.roundId === round.id)
                            const isSelected = selectedRoundId === round.id
                            const isClaimed = pr?.claimed
                            
                            return (
                              <button
                                key={round.id}
                                onClick={() => setSelectedRoundId(round.id)}
                                className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                                  isSelected 
                                    ? 'bg-brand text-on-brand border-2 border-brand-strong' 
                                    : 'bg-surface border border-border hover:border-brand/50'
                                } ${isClaimed ? 'opacity-50' : ''}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">Round #{round.id}</span>
                                  {isClaimed && (
                                    <Icon name="success" className="h-3 w-3" />
                                  )}
                                </div>
                                <div className="text-xs opacity-80">
                                  {round.winnerSide === pr?.tribe ? '🎉 Won' : '❌ Lost'}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-surface-subtle border border-border p-4 text-center">
                        <CatIllustration type="sleep" size="md" className="mx-auto mb-2" />
                        <p className="text-sm text-muted">No finalized rounds to claim yet</p>
                        <p className="text-xs text-muted-strong mt-1">Play some rounds first!</p>
                      </div>
                    )}
                    
                    {selectedRoundId && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted">Round ID</span>
                          <span className="text-lg font-semibold text-fg">#{selectedRoundId ?? '—'}</span>
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
                          <span className="text-sm text-muted">Total payout</span>
                          <span className="text-lg font-semibold text-fg">
                            {estimatedPayout > 0n ? demo.formatFoodBalance(estimatedPayout) : '— FOOD'}
                          </span>
                        </div>
                        {estimatedPayout > 0n && (
                          <div className="rounded-xl bg-brand/10 border border-brand/30 p-3">
                            <p className="text-xs text-muted-strong mb-1">
                              <Icon name="info" className="inline h-3 w-3 mr-1" />
                              Payout breakdown:
                            </p>
                            <ul className="text-xs text-muted space-y-0.5 ml-4">
                              <li>• Your stake returned</li>
                              <li>• + Share from losing side (after fees)</li>
                            </ul>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted">Claim status</span>
                          <span className="text-xs uppercase tracking-[0.18em] text-muted">{claimed ? 'Claimed' : 'Not claimed'}</span>
                        </div>
                        <Button size="lg" rightIcon="treasury" disabled={!canClaim.eligible || claimed} onClick={onClaim}>
                          {claimed ? 'Claimed' : 'Claim'}
                        </Button>
                        {claimed && (
                          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                            <div className="flex items-center gap-3">
                              <CatIllustration type="winner" size="md" className="animate-bounce-slow" />
                              <div>
                                <p className="text-sm font-semibold text-green-900">Claimed successfully! 🎉</p>
                                <p className="text-xs text-green-700">Your rewards have been added to your balance</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {(!canClaim.eligible && !claimed) && (
                          <p className="text-xs text-muted-strong">{canClaim.reason ?? 'Not eligible'}</p>
                        )}
                        {status && !claimed ? <p className="text-xs text-muted-strong">{status}</p> : null}
                      </>
                    )}
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
