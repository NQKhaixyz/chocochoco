import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'

const highlights = [
  {
    title: 'Minority wins, cats purr',
    description: 'Commit to Milk or Cacao, reveal fair-and-square, and let the smaller tribe scoop the rewards.',
    icon: 'sparkles' as const,
  },
  {
    title: 'Gas-friendly & transparent',
    description: 'Commit–reveal ensures anti-MEV fairness, while pull-based claims keep gas predictable.',
    icon: 'shield' as const,
  },
  {
    title: 'Powered by pastel vibes',
    description: 'A cozy, confectionery interface designed for newcomers without sacrificing pro tooling.',
    icon: 'cat' as const,
  },
]

const newbieSteps = [
  {
    title: 'Kết nối ví',
    description: 'Dùng ví EVM (Metamask, Rainbow, Rabby…) và chuyển sang Base Sepolia theo hướng dẫn của dApp.',
    icon: 'wallet' as const,
    tip: 'Cần faucet? Xem hướng dẫn faucet trực tiếp trong mục Onboarding.',
  },
  {
    title: 'Commit & lưu salt',
    description: 'Chọn phe yêu thích, stake số tiền cố định và để hệ thống tạo salt bảo mật cho bạn.',
    icon: 'sparkles' as const,
    tip: 'Salt sẽ được lưu vào Salt Vault nội bộ. Đừng quên backup để có thể reveal.',
  },
  {
    title: 'Reveal & claim',
    description: 'Khi tới phase Reveal, nhập lại salt để xác nhận lựa chọn. Nếu thắng, bấm Claim để nhận phần thưởng.',
    icon: 'treasury' as const,
    tip: 'Hệ thống thiết kế pull-payment nên chỉ bạn mới có thể tự claim phần của mình.',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-16 pb-20">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-brand px-6 py-12 text-slate-900 shadow-float md:px-10">
        <div className="absolute right-0 top-0 hidden h-full w-1/2 bg-[url('/assets/patterns/confetti.svg')] opacity-20 md:block" />
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-strong">
              Minority Game · Commit → Reveal → Claim
            </span>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              ChocoChoco — nơi mèo Milk & Cacao tranh nhau phần bánh ngọt
            </h1>
            <p className="text-base leading-relaxed text-slate-800 md:text-lg">
              Một trò chơi on-chain dành cho cộng đồng yêu mèo và yêu fairness. Commit bí mật, reveal công khai, và nếu
              chọn phe thiểu số bạn sẽ mang về tất cả treat sau khi trừ crumb fee cho Cat Treasury.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/join">
                <Button size="lg" rightIcon="sparkles">
                  Bắt đầu commit
                </Button>
              </Link>
              <Link to="/rounds" className="text-sm font-semibold text-slate-800 underline-offset-4 hover:underline">
                Xem lịch sử round →
              </Link>
            </div>
          </div>
          <Card className="w-full max-w-sm border-white/60 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Thông số v1</CardTitle>
              <CardDescription>Thiết kế dành cho testnet — gas thấp, trải nghiệm mượt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 shadow-inner">
                <span>Chain</span>
                <span className="font-semibold text-slate-900">Base Sepolia</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 shadow-inner">
                <span>Stake cố định</span>
                <span className="font-semibold text-slate-900">5 FOOD</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 shadow-inner">
                <span>Crumb fee</span>
                <span className="font-semibold text-slate-900">3% → Treasury</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 shadow-inner">
                <span>Claim</span>
                <span className="font-semibold text-slate-900">Pull-payment</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold text-fg">Tại sao chọn ChocoChoco?</h2>
          <p className="text-sm text-muted">Fair-play, pastel vibes, và mèo đáng yêu cho cả newbie lẫn degen.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="border-border/60 bg-surface-subtle">
              <CardHeader className="flex flex-col gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/40 text-brand-strong">
                  <Icon name={item.icon} className="h-5 w-5" />
                </span>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-fg">Hướng dẫn cho người mới</h2>
          <p className="max-w-3xl text-sm text-muted">
            Chỉ mất vài phút để trải nghiệm trọn vòng commit → reveal → claim. Dưới đây là checklist giúp bạn tự tin nhập
            cuộc ngay lần đầu.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {newbieSteps.map((step, idx) => (
            <Card key={step.title} className="border-border bg-surface">
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-pastel-mint/60 text-brand-strong">
                    <Icon name={step.icon} className="h-4 w-4" />
                  </span>
                  <span className="rounded-full bg-brand/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900">
                    Bước {idx + 1}
                  </span>
                </div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted">{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-surface-subtle px-4 py-3 text-xs text-muted-strong">
                  <strong className="font-semibold text-fg">Gợi ý:</strong> {step.tip}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/join">
            <Button variant="secondary" leftIcon="sparkles">
              Đi tới màn Commit
            </Button>
          </Link>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1 rounded-full bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted"
          >
            Tài liệu onboarding (coming soon)
          </button>
        </div>
      </section>
    </div>
  )
}
