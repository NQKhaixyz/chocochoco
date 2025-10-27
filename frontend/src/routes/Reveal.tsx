import React from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Icon } from '../components/ui/Icon'

export default function RevealPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Reveal commitment</CardTitle>
          <CardDescription>
            Khi round chuyển sang phase Reveal, người chơi cần cung cấp tribe + salt để xác thực. Phần này sẽ gắn hook
            `useReveal()` (epic C2) và trạng thái round từ B2.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Tribe đã commit</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {(['Milk', 'Cacao'] as const).map((tribe) => (
                  <label
                    key={tribe}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm transition hover:border-brand"
                  >
                    <span className="font-semibold text-fg">{tribe}</span>
                    <input type="radio" name="tribe" className="hidden" disabled />
                    <Icon name={tribe === 'Milk' ? 'milk' : 'cacao'} className="h-5 w-5 text-brand-strong" />
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Salt</span>
              <Input placeholder="Dán salt đã lưu…" state="default" />
              <p className="text-xs text-muted">Nếu mất salt? Dùng Salt Vault → Restore.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
            <span className="text-muted-strong">Reveal deadline</span>
            <span className="rounded-pill bg-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900">
              07:12 phút · còn 2 lượt reveal
            </span>
          </div>
          <Button size="lg" variant="secondary" leftIcon="timer" disabled>
            Reveal (đang wiring hook)
          </Button>
        </CardContent>
      </Card>

      <Card variant="solid">
        <CardHeader>
          <CardTitle>Reveal status</CardTitle>
          <CardDescription>Sau khi reveal thành công sẽ hiện badge ở đây.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {['Bạn', 'Milk team', 'Cacao team'].map((label) => (
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

