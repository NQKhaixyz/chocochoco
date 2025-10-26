import React from 'react'

export default function HowItWorks() {
  return (
    <section className="max-w-4xl mx-auto p-6 space-y-3">
      <h2 className="text-xl font-semibold">How it works</h2>
      <ol className="list-decimal pl-5 space-y-2 text-sm">
        <li>
          Commit: chọn phe + stake, tạo salt cục bộ, gửi <code>commitMeow</code>.
        </li>
        <li>
          Reveal: trong cửa sổ cho phép, gửi <code>revealMeow(choice, salt)</code>.
        </li>
        <li>
          Claim: nếu thuộc phe thiểu số, dùng <code>claimTreat</code> nhận thưởng.
        </li>
      </ol>
      <div className="flex gap-3">
        <a className="underline" href="/DESIGN.md" target="_blank" rel="noreferrer">
          Design
        </a>
        <a className="underline" href="/SPRINT_PLAN.md" target="_blank" rel="noreferrer">
          Sprint Plan
        </a>
      </div>
    </section>
  )
}

