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
    title: 'Connect wallet',
    description: 'Use an EVM wallet (Metamask, Rainbow, Rabby…) and switch to Base Sepolia as instructed in the dApp.',
    icon: 'wallet' as const,
    tip: 'Need a faucet? Check the faucet guide in Onboarding.',
  },
  {
    title: 'Commit & save salt',
    description: 'Pick a tribe, stake the fixed amount, and let the app generate a secure salt.',
    icon: 'sparkles' as const,
    tip: 'Salt is stored in your local Salt Vault. Back it up for reveal.',
  },
  {
    title: 'Reveal & claim',
    description: 'When Reveal opens, submit your salt to confirm. If you win, click Claim to receive rewards.',
    icon: 'treasury' as const,
    tip: 'Pull-payment design: only you can claim your rewards.',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-16 pb-20">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-brand px-6 py-12 text-on-brand shadow-float md:px-10">
        <div className="absolute right-0 top-0 hidden h-full w-1/2 bg-[url('/assets/patterns/confetti.svg')] opacity-20 md:block" />
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-strong">
              Minority Game · Commit → Reveal → Claim
            </span>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              ChocoChoco — where Milk & Cacao cats battle for treats
            </h1>
            <p className="text-base leading-relaxed text-muted-strong md:text-lg">
              An on-chain game for cat lovers and fairness fans. Commit in secret, reveal publicly, and if you chose the
              minority, you bring home all the treats after the crumb fee to the Cat Treasury.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/join">
                <Button size="lg" rightIcon="sparkles">
                  Start committing
                </Button>
              </Link>
              <Link to="/rounds" className="text-sm font-semibold text-muted-strong underline-offset-4 hover:underline">
                View round history →
              </Link>
            </div>
          </div>
          <Card className="w-full max-w-sm border-white/60 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>v1 Stats</CardTitle>
              <CardDescription>Designed for testnet — low gas, smooth UX.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted">
              <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 shadow-inner">
                <span>Chain</span>
                <span className="font-semibold text-on-brand">Base Sepolia</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 shadow-inner">
                <span>Fixed stake</span>
                <span className="font-semibold text-on-brand">5 FOOD</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 shadow-inner">
                <span>Crumb fee</span>
                <span className="font-semibold text-on-brand">3% → Treasury</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 shadow-inner">
                <span>Claim</span>
                <span className="font-semibold text-on-brand">Pull-payment</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold text-fg">Why ChocoChoco?</h2>
          <p className="text-sm text-muted">Fair play, pastel vibes, and cute cats for newbies and degens.</p>
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
          <h2 className="text-3xl font-semibold text-fg">Newcomer guide</h2>
          <p className="max-w-3xl text-sm text-muted">
            Just a few minutes to experience the full commit → reveal → claim loop. Use this checklist to get started.
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
                  <span className="rounded-full bg-brand/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-brand">
                    Step {idx + 1}
                  </span>
                </div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted">{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-surface-subtle px-4 py-3 text-xs text-muted-strong">
                  <strong className="font-semibold text-fg">Tip:</strong> {step.tip}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/join">
            <Button variant="secondary" leftIcon="sparkles">
              Go to Commit screen
            </Button>
          </Link>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1 rounded-full bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted"
          >
            Onboarding docs (coming soon)
          </button>
        </div>
      </section>
    </div>
  )
}
