import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'

const ENABLE_ADMIN = (import.meta.env.VITE_ENABLE_ADMIN as string | undefined) === 'true'

export default function AdminPage() {
  if (!ENABLE_ADMIN) {
    return (
      <Alert
        variant="warning"
        title="Admin panel is disabled"
        description="Thêm VITE_ENABLE_ADMIN=true vào .env để bật route này trong môi trường dev."
      />
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Round parameters</CardTitle>
          <CardDescription>Cấu hình cho vòng tiếp theo (setParamsForNext).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Fixed stake</span>
            <Input placeholder="5 FOOD" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Commit duration</span>
            <Input placeholder="1800s" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Reveal duration</span>
            <Input placeholder="1200s" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Fee (bps)</span>
            <Input placeholder="300" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-strong">Tie mode</span>
            <Input placeholder="0 = refund" />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button size="lg" leftIcon="shield" disabled>
          Save params (wiring soon)
        </Button>
      </div>
      <Alert
        variant="danger"
        title="Cảnh báo"
        description="Tính năng admin sẽ gắn với quyền owner và yêu cầu confirm trước khi gửi giao dịch."
      />
    </div>
  )
}

