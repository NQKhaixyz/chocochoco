import React from 'react'

export default function Features() {
  const items = [
    { t: 'Secure Commit', d: 'Hash off-chain with salt; commit tx is safe.' },
    { t: 'Timed Reveal', d: 'Countdown synced to block timestamp.' },
    { t: 'Minority Wins', d: 'Payout to the minority + cat vibes 🐱' },
  ]
  return (
    <section className="max-w-5xl mx-auto p-6 grid md:grid-cols-3 gap-4">
      {items.map((f) => (
        <div key={f.t} className="rounded-2xl border bg-card p-4 shadow-soft">
          <div className="text-lg font-semibold">{f.t}</div>
          <p className="text-sm text-muted mt-1">{f.d}</p>
        </div>
      ))}
    </section>
  )
}
