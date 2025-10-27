import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { getRecentDemoRounds, type DemoRound } from '../lib/demo-rounds'

function statusOf(r: DemoRound) {
  const now = Math.floor(Date.now() / 1000)
  if (r.isFinalized) return 'Settled'
  if (now < r.commitEndTime) return 'CommitOpen'
  if (now < r.revealEndTime) return 'RevealOpen'
  if (now < r.finalizeTime) return 'Finalizing'
  return 'Settled'
}

export default function RoundsPage() {
  const [rounds, setRounds] = useState<DemoRound[]>([])

  useEffect(() => {
    const update = () => setRounds(getRecentDemoRounds(10))
    update()
    const iv = setInterval(update, 1000)
    return () => clearInterval(iv)
  }, [])
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Round timeline</CardTitle>
          <CardDescription>
            Recent rounds (demo mode). After wiring events/indexer (E1/F1), data will update in real time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rounds.map((round) => (
            <div
              key={round.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-on-brand">
                  #{round.id}
                </span>
                <span className="text-muted">Status</span>
                <span className="font-semibold text-fg">{statusOf(round)}</span>
              </div>
              {round.winnerSide ? (
                <div className="flex items-center gap-2">
                  <Icon name={round.winnerSide === 'Milk' ? 'milk' : 'cacao'} className="h-4 w-4 text-brand-strong" />
                  <span className="font-semibold text-fg">{round.winnerSide}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted">—</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted">
                  <span>Commit — {Math.max(0, round.commitEndTime - Math.floor(Date.now() / 1000))}s</span>
                  <span>Reveal — {Math.max(0, round.revealEndTime - Math.floor(Date.now() / 1000))}s</span>
                  <span>Milk {round.countMilk} · Cacao {round.countCacao}</span>
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-center">
            <Button variant="outline" size="sm" leftIcon="history" disabled>
              Load more rounds (indexer wiring)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
