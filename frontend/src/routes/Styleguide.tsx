import React from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'
import { Alert } from '../components/ui/Alert'
import { ToastPreview } from '../components/ui/Toast'
import { Icon, type IconName } from '../components/ui/Icon'

const palette: Array<{ label: string; tokens: string[] }> = [
  { label: 'Brand', tokens: ['brand', 'brand-strong'] },
  { label: 'Accent', tokens: ['accent', 'accent-strong'] },
  { label: 'Core', tokens: ['bg', 'surface', 'card', 'fg', 'muted'] },
  { label: 'Pastel', tokens: ['pastel-pink', 'pastel-mint', 'pastel-yellow', 'pastel-blue', 'pastel-lilac'] },
  { label: 'Status', tokens: ['win', 'lose'] },
]

const iconNames: IconName[] = ['cat', 'milk', 'cacao', 'treasury', 'wallet', 'timer', 'sparkles', 'success', 'info', 'alert']

export default function Styleguide() {
  return (
    <div className="space-y-16 pb-20">
      <header className="space-y-4 rounded-2xl bg-gradient-brand px-8 py-10 shadow-float">
        <p className="inline-flex items-center gap-2 rounded-full bg-surface/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-strong">
          A4 · Design System
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">ChocoChoco Pastel Kit</h1>
        <p className="max-w-3xl text-base text-muted-strong">
          Tokens, components và typography dành cho UI pastel mèo mèo. Trang này là nguồn tham chiếu nhanh cho đội FE,
          đảm bảo các màn hình Join/Reveal/Claim dùng chung một bộ visual xuyên suốt.
        </p>
      </header>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-fg">1. Colors & Tokens</h2>
          <p className="text-sm text-muted">
            Tất cả màu sắc được expose thông qua CSS variables (`--token`). Áp dụng bằng Tailwind class như
            <code className="ml-1 rounded-md bg-surface px-1 py-0.5 text-xs text-fg">bg-brand</code>.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {palette.map((group) => (
            <div key={group.label} className="rounded-2xl border border-border/60 bg-surface-subtle p-5 shadow-soft">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted">{group.label}</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {group.tokens.map((token) => (
                  <div key={token} className="space-y-2">
                    <div
                      className="h-20 w-full rounded-xl border border-border shadow-inner"
                      style={{ background: `var(--${token})` }}
                    />
                    <p className="text-xs font-semibold text-muted-strong">{token}</p>
                    <p className="text-[11px] text-muted uppercase tracking-[0.18em]">var(--{token})</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-fg">2. Typography Scale</h2>
          <p className="text-sm text-muted">
            Fluid scale dựa trên `--step-*`. Heading dùng font `Baloo 2`, body dùng `Plus Jakarta Sans`.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="text-2xl font-semibold text-muted-strong">Headings</h3>
            <div className="space-y-3">
              <h1 className="text-4xl">H1 / Display - var(--step-5)</h1>
              <h2 className="text-3xl">H2 / Section - var(--step-4)</h2>
              <h3 className="text-2xl">H3 / Card Title - var(--step-3)</h3>
              <h4 className="text-xl">H4 / Section label - var(--step-2)</h4>
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="text-2xl font-semibold text-muted-strong">Body & Meta</h3>
            <p className="text-base">
              Body default sử dụng `var(--step-0)` với line-height relaxed để dễ đọc. Ví dụ: Người chơi chọn phe Milk,
              stake 5 FOOD, commit trước deadline.
            </p>
            <p className="text-sm text-muted">
              Caption nhỏ (`--step--1`). Dùng cho nhãn phụ, mô tả field hoặc timestamp.
            </p>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-strong">Label · Tracking 0.24em</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-fg">3. Icon Kit</h2>
          <p className="text-sm text-muted">
            Powered by <span className="font-semibold text-brand-strong">lucide-react</span>. Import thông qua
            <code className="ml-1 rounded-md bg-surface px-1 py-0.5 text-xs text-fg">Icon name="cat"</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 rounded-2xl border border-border bg-surface-subtle p-6 shadow-soft">
          {iconNames.map((name) => (
            <div
              key={name}
              className="flex w-28 flex-col items-center gap-2 rounded-2xl bg-surface px-4 py-3 shadow-inner"
            >
              <Icon name={name} className="h-6 w-6 text-brand-strong" />
              <span className="text-xs uppercase tracking-[0.16em] text-muted">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-fg">4. Buttons</h2>
          <p className="text-sm text-muted">
            Variants: primary, secondary, outline, ghost, danger. Kích thước: sm, md, lg, pill.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button leftIcon="sparkles">Primary</Button>
          <Button variant="secondary" rightIcon="wallet">
            Secondary
          </Button>
          <Button variant="outline" leftIcon="timer">
            Outline
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger" leftIcon="alert">
            Danger
          </Button>
          <Button size="pill" rightIcon="cat">
            Pill Call-to-action
          </Button>
          <Button loading>Đang xử lý…</Button>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-fg">5. Form Controls</h2>
          <p className="text-sm text-muted">Input hỗ trợ trạng thái default / success / error + icon dẫn đường.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-strong">Commit Salt</label>
            <Input placeholder="0x..." leadingIcon="sparkles" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-strong">Stake Amount</label>
            <Input placeholder="5.000 FOOD" trailingIcon="treasury" state="success" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-strong">Reveal Salt</label>
            <Input placeholder="0x12345..." state="error" trailingIcon="alert" />
            <p className="text-xs text-rose-600">Salt sai hoặc chưa được lưu. Vui lòng kiểm tra lại.</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-fg">6. Cards</h2>
          <p className="text-sm text-muted">Card glass default; tùy chọn solid/outline cho dashboard hoặc admin.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Round #42</CardTitle>
              <CardDescription>Commit window mở đến 18:45 UTC</CardDescription>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Stake</p>
                <p className="text-2xl font-semibold text-fg">5 FOOD</p>
              </div>
              <Button size="sm" variant="secondary" rightIcon="timer">
                Join now
              </Button>
            </CardContent>
            <CardFooter className="justify-between text-xs text-muted">
              <span>Milk: 12</span>
              <span>Cacao: 9</span>
            </CardFooter>
          </Card>

          <Card variant="solid">
            <CardHeader>
              <CardTitle>Kèo Đang Reveal</CardTitle>
              <CardDescription>Phe thiểu số sẽ ăn cả pool sau khi trừ fee 3%.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3 text-sm">
                <span className="text-muted">Reveal deadline</span>
                <span className="font-semibold text-fg">23 phút</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3 text-sm">
                <span className="text-muted">Crumb fee</span>
                <span className="font-semibold text-fg">3%</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                Xem chi tiết
              </Button>
            </CardFooter>
          </Card>

          <Card variant="outline" className="border-dashed">
            <CardHeader>
              <CardTitle>Admin</CardTitle>
              <CardDescription>Cập nhật tham số vòng tiếp theo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Stake cố định</span>
                <span className="text-sm font-semibold text-fg">5 FOOD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Fee</span>
                <span className="text-sm font-semibold text-fg">300 bps</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="sm" leftIcon="shield">
                Lưu cấu hình
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-fg">7. Alerts</h2>
          <p className="text-sm text-muted">
            Alert dùng cho trạng thái hệ thống. Có thể gắn action (button) hoặc nội dung tùy chỉnh ở children.
          </p>
        </div>
        <div className="space-y-4">
          <Alert
            title="Deadline sắp đóng"
            description="Còn 3 phút để commit. Sau thời gian này sẽ chuyển sang phase Reveal."
            action={<Button size="sm">Commit ngay</Button>}
          />
          <Alert variant="success" title="Cats are happy!" description="Bạn vừa claim thành công 8.2 FOOD." />
          <Alert variant="warning" title="Salt chưa được backup" description="Hãy tải file backup salt trước khi rời trang." />
          <Alert variant="danger" title="Reveal thất bại" description="BadReveal · tribe hoặc salt không khớp với commit." />
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-fg">8. Toast</h2>
          <p className="text-sm text-muted">
            ToastPreview chỉ minh họa giao diện. Khi tích hợp thực tế có thể wrap bằng sonner hoặc wagmi notifications.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <ToastPreview title="Commit thành công" description="Tx #0xabc… đã được xác nhận." timeAgo="vừa xong" />
          <ToastPreview
            variant="success"
            title="Claim thành công"
            description="Bạn đã nhận 12.4 FOOD."
            timeAgo="10 giây trước"
          />
          <ToastPreview
            variant="warning"
            title="Reveal pending"
            description="Đang chờ xác nhận…"
            timeAgo="35 giây trước"
          />
          <ToastPreview
            variant="danger"
            title="Tx thất bại"
            description="CommitClosed · Vòng đã chuyển sang Reveal."
            timeAgo="1 phút trước"
          />
        </div>
      </section>
    </div>
  )
}

