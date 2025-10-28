import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { CatIllustration } from '../components/CatIllustration'
import { cn } from '../lib/cn'

const highlights = [
  {
    title: 'Minority wins, cats purr',
    description: 'Commit to Milk or Cacao, reveal fair-and-square, and let the smaller tribe scoop the rewards.',
    icon: 'sparkles' as const,
    catType: 'winner' as const,
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    title: 'Gas-friendly & transparent',
    description: 'Commit–reveal ensures anti-MEV fairness, while pull-based claims keep gas predictable.',
    icon: 'shield' as const,
    catType: 'sitting' as const,
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    title: 'Powered by pastel vibes',
    description: 'A cozy, confectionery interface designed for newcomers without sacrificing pro tooling.',
    icon: 'cat' as const,
    catType: 'victorious' as const,
    color: 'from-green-500/20 to-emerald-500/20',
  },
]

const newbieSteps = [
  {
    title: 'Connect wallet',
    description: 'Use a Solana wallet (Phantom, Solflare...) and make sure you have some SOL for gas fees.',
    icon: 'wallet' as const,
    tip: 'Need SOL? Check the faucet guide in Settings.',
    catType: 'thinking' as const,
  },
  {
    title: 'Commit & save salt',
    description: 'Pick a tribe, stake FOOD tokens, and let the app generate a secure salt for you.',
    icon: 'sparkles' as const,
    tip: 'Salt is stored in your local Salt Vault. Back it up for reveal.',
    catType: 'play' as const,
  },
  {
    title: 'Reveal & claim',
    description: 'When Reveal opens, submit your salt to confirm. If you win, click Claim to receive rewards.',
    icon: 'treasury' as const,
    tip: 'Pull-payment design: only you can claim your rewards.',
    catType: 'excited' as const,
  },
]

export default function HomePage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-brand px-6 py-16 text-on-brand shadow-float animate-fade-up md:px-12 md:py-20">
        {/* Decorative cats */}
        <div className="absolute -left-10 top-10 opacity-30 animate-bounce-slow hidden lg:block">
          <CatIllustration type="milk" size="xl" />
        </div>
        <div className="absolute -right-10 bottom-10 opacity-30 animate-bounce-slow animation-delay-1000 hidden lg:block">
          <CatIllustration type="cacao" size="xl" />
        </div>
        <div className="absolute top-1/2 left-1/4 opacity-10 hidden md:block">
          <CatIllustration type="stretch" size="lg" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.2fr,1fr] lg:gap-16">
            {/* Left: Hero content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-strong shadow-sm">
                  <Icon name="sparkles" className="h-4 w-4" />
                  Minority Game · Commit → Reveal → Claim
                </span>
                <h1 className="font-display text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
                  ChocoChoco 🐱
                </h1>
                <p className="text-xl leading-relaxed md:text-2xl font-medium opacity-95">
                  Where Milk & Cacao cats battle for treats
                </p>
                <p className="text-base leading-relaxed text-on-brand/80 md:text-lg max-w-2xl">
                  An on-chain game for cat lovers and fairness fans. Commit in secret, reveal publicly, and if you chose the
                  minority, you bring home all the treats after the crumb fee to the Cat Treasury.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/join">
                  <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow" rightIcon="sparkles">
                    Start Playing Now
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button size="lg" variant="secondary" leftIcon="trophy">
                    View Leaderboard
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <Link to="/rounds" className="group flex items-center gap-2 text-sm font-semibold text-on-brand/90 hover:text-on-brand transition">
                  <Icon name="history" className="h-4 w-4" />
                  Round History
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link to="/tokens" className="group flex items-center gap-2 text-sm font-semibold text-on-brand/90 hover:text-on-brand transition">
                  <Icon name="wallet" className="h-4 w-4" />
                  Token Dashboard
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            {/* Right: Stats card */}
            <div className="flex items-center">
              <Card className="w-full border-white/60 bg-white/95 backdrop-blur shadow-2xl animate-fade-up animation-delay-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Game Stats</CardTitle>
                      <CardDescription>Powered by Solana</CardDescription>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="relative">
                        <CatIllustration type="winner" size="sm" />
                      </div>
                      <div className="relative">
                        <CatIllustration type="victorious" size="sm" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-4 shadow-sm border border-blue-200/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                        <Icon name="shield" className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-700">Chain</span>
                    </div>
                    <span className="font-bold text-blue-700">Solana</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 px-5 py-4 shadow-sm border border-purple-200/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                        <Icon name="treasury" className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-700">Default Stake</span>
                    </div>
                    <span className="font-bold text-purple-700">5 FOOD</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 px-5 py-4 shadow-sm border border-amber-200/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                        <Icon name="sparkles" className="h-5 w-5 text-amber-600" />
                      </div>
                      <span className="font-medium text-gray-700">Platform Fee</span>
                    </div>
                    <span className="font-bold text-amber-700">3% → Treasury</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-green-50 to-green-100 px-5 py-4 shadow-sm border border-green-200/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                        <Icon name="success" className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-700">Claim Type</span>
                    </div>
                    <span className="font-bold text-green-700">Pull-payment</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-10 animate-fade-up animation-delay-500">
        <div className="space-y-4 text-center">
          <h2 className="font-display text-4xl font-bold text-fg md:text-5xl">Why ChocoChoco?</h2>
          <p className="text-lg text-muted mx-auto max-w-2xl">
            Fair play, pastel vibes, and cute cats for newbies and degens alike.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {highlights.map((item, idx) => (
            <Card 
              key={item.title} 
              className={cn(
                "group relative overflow-hidden border-border/60 bg-surface-subtle hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                "animate-fade-up"
              )}
              style={{ animationDelay: `${600 + idx * 150}ms` }}
            >
              {/* Gradient background */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                item.color
              )} />
              
              <CardHeader className="relative flex flex-col gap-4 pb-6">
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/20 text-brand-strong shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Icon name={item.icon} className="h-6 w-6" />
                  </span>
                  <div className="group-hover:animate-bounce-slow">
                    <CatIllustration type={item.catType} size="md" />
                  </div>
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed text-muted">
                    {item.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How to Play Section */}
      <section className="space-y-10 animate-fade-up animation-delay-800">
        <div className="space-y-4 text-center">
          <h2 className="font-display text-4xl font-bold text-fg md:text-5xl">Newcomer Guide</h2>
          <p className="max-w-3xl mx-auto text-lg text-muted">
            Just a few minutes to experience the full commit → reveal → claim loop. Follow these simple steps to get started.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {newbieSteps.map((step, idx) => (
            <Card 
              key={step.title} 
              className={cn(
                "group relative border-border bg-surface hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                "animate-fade-up"
              )}
              style={{ animationDelay: `${900 + idx * 150}ms` }}
            >
              <CardHeader className="gap-4 pb-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/20 text-brand-strong shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Icon name={step.icon} className="h-6 w-6" />
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="group-hover:animate-bounce-slow">
                      <CatIllustration type={step.catType} size="md" />
                    </div>
                    <span className="rounded-full bg-brand px-4 py-2 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-sm">
                      Step {idx + 1}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-2xl">{step.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed text-muted">
                    {step.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-muted-strong">
                  <div className="flex items-start gap-2">
                    <Icon name="info" className="h-4 w-4 text-brand-strong flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-fg">Tip:</strong> {step.tip}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          <Link to="/join">
            <Button size="lg" variant="primary" leftIcon="sparkles" className="shadow-lg hover:shadow-xl transition-shadow">
              Go to Commit Screen
            </Button>
          </Link>
          <Link to="/profile">
            <Button size="lg" variant="secondary" leftIcon="user">
              Setup Profile
            </Button>
          </Link>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand-strong to-brand px-8 py-16 text-center text-white shadow-float animate-fade-up animation-delay-1000">
        {/* Decorative elements */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        
        {/* Floating cats */}
        <div className="absolute left-10 top-10 opacity-20 animate-bounce-slow hidden lg:block">
          <CatIllustration type="happy" size="lg" />
        </div>
        <div className="absolute right-10 bottom-10 opacity-20 animate-bounce-slow animation-delay-1000 hidden lg:block">
          <CatIllustration type="excited" size="lg" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-3xl space-y-8">
          <div className="flex justify-center">
            <div className="flex -space-x-4">
              <div className="relative animate-bounce-slow">
                <CatIllustration type="winner" size="xl" />
              </div>
              <div className="relative animate-bounce-slow animation-delay-300">
                <CatIllustration type="victorious" size="xl" />
              </div>
              <div className="relative animate-bounce-slow animation-delay-600">
                <CatIllustration type="legendary" size="xl" />
              </div>
            </div>
          </div>
          
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Ready to Join the Battle?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Pick your tribe, commit your choice, and compete with other players for delicious rewards! 
            The minority always wins in ChocoChoco.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/join">
              <Button size="lg" className="bg-white text-brand hover:bg-white/90 shadow-xl" rightIcon="sparkles">
                Start Playing Now
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" variant="ghost" className="border-2 border-white/30 text-white hover:bg-white/10" leftIcon="trophy">
                View Top Players
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
