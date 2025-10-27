import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'

const mockRounds = [
  { id: 42, status: 'RevealOpen', commitEndsIn: '—', revealEndsIn: '—', milk: 12, cacao: 9 },
  { id: 41, status: 'Settled', winner: 'Milk', payout: '8.2 FOOD' },
  { id: 40, status: 'Settled', winner: 'Cacao', payout: '6.7 FOOD' },
]

export default function RoundsPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Round timeline</CardTitle>
          <CardDescription>
            Danh sách round gần nhất. Sau khi hook event/indexer (E1/F1), dữ liệu sẽ realtime cập nhật.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockRounds.map((round) => (
            <div
              key={round.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-900">
                  #{round.id}
                </span>
                <span className="text-muted">Status</span>
                <span className="font-semibold text-fg">{round.status}</span>
              </div>
              {'winner' in round ? (
                <div className="flex items-center gap-2">
                  <Icon name={round.winner === 'Milk' ? 'milk' : 'cacao'} className="h-4 w-4 text-brand-strong" />
                  <span className="font-semibold text-fg">{round.winner}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted">{round.payout}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted">
                  <span>Commit — {round.commitEndsIn}</span>
                  <span>Reveal — {round.revealEndsIn}</span>
                  <span>
                    Milk {round.milk} · Cacao {round.cacao}
                  </span>
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-center">
            <Button variant="outline" size="sm" leftIcon="history" disabled>
              Tải thêm round (đang nối indexer)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

