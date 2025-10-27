import React from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { Alert } from '../components/ui/Alert'

export default function ClaimPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Claim treats</CardTitle>
          <CardDescription>
            Khi round đã settle, người chơi thuộc phe thiểu số sẽ claim phần thưởng. Hook `useClaim()` sẽ gắn với
            wagmi-write ở epic C3.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-5 rounded-2xl border border-border bg-surface px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Round ID</span>
              <span className="text-lg font-semibold text-fg">#—</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Phe thắng</span>
              <span className="inline-flex items-center gap-2 rounded-pill bg-brand/40 px-3 py-1 text-sm font-semibold text-slate-900">
                <Icon name="milk" className="h-4 w-4" />
                Milk
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Ước tính payout</span>
              <span className="text-lg font-semibold text-fg">— FOOD</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Claim status</span>
              <span className="text-xs uppercase tracking-[0.18em] text-muted">Chưa claim</span>
            </div>
            <Button size="lg" rightIcon="treasury" disabled>
              Claim (đang wiring hook)
            </Button>
          </div>
          <div className="space-y-4">
            <Alert
              variant="info"
              title="Pull-payment"
              description="Contract không tự động chuyển thưởng. Người thắng tự bấm claim để nhận FOOD."
            />
            <Alert
              variant="warning"
              title="Double claim?"
              description="UI sẽ disable nút claim nếu sự kiện TreatClaimed đã được phát."
            />
          </div>
        </CardContent>
      </Card>
      <Card variant="solid">
        <CardHeader>
          <CardTitle>Lịch sử claim gần nhất</CardTitle>
          <CardDescription>Từ event TreatClaimed (epic B3/E1).</CardDescription>
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

