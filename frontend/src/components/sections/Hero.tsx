import React from 'react'

export default function Hero() {
  return (
    <section className="max-w-5xl mx-auto p-6 py-16 text-center space-y-6">
      <div className="inline-flex items-center gap-2">
        <img src="/assets/icons/cat.svg" className="h-8 w-8" alt="" />
        <h1 className="text-3xl md:text-4xl font-bold">ChocoChoco — Commit, Reveal &amp; Claim</h1>
      </div>
      <p className="text-lg text-muted">
        Pick <span className="font-semibold">Milk</span> or <span className="font-semibold">Cacao</span>. The
        <span className="underline"> minority</span> wins! ⏱️ Reveal on time, 🏆 claim rewards.
      </p>
      <div className="flex justify-center gap-3">
        <a href="/app" className="px-5 py-3 rounded-xl bg-brand text-on-brand shadow-soft hover:opacity-90">
          Play on Testnet
        </a>
        <a href="/README.md" className="px-5 py-3 rounded-xl border border-border bg-card hover:opacity-90">
          Read the Docs
        </a>
      </div>
    </section>
  )
}
