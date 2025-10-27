'use client'
import React, { useState } from 'react'
import { useOnboarding } from './useOnboarding'

const steps = [
  { id: 'commit', selector: '#commit-panel', text: 'Step 1: Choose a tribe + stake, then Commit.' },
  { id: 'reveal', selector: '#reveal-panel', text: 'Step 2: When Reveal opens, submit choice + salt.' },
  { id: 'claim', selector: '#result-panel', text: 'Step 3: If you win (minority), claim payout.' },
]

export default function CoachMarks() {
  const { enabled, set } = useOnboarding()
  const [i, setI] = useState(0)
  if (!enabled) return null
  const step = steps[i]
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto rounded-2xl border border-border bg-card shadow-soft p-3 max-w-xl w-[90%] animate-pop">
        <div className="text-sm">{step.text}</div>
        <div className="mt-2 flex justify-between text-xs">
          <button className="px-2 py-1 rounded border" onClick={() => set(false)}>
            Turn off tips
          </button>
          <div className="space-x-2">
            <button className="px-2 py-1 rounded border" disabled={i === 0} onClick={() => setI(i - 1)}>
              Prev
            </button>
            <button
              className="px-2 py-1 rounded border bg-brand"
              onClick={() => (i < steps.length - 1 ? setI(i + 1) : set(false))}
            >
              {i < steps.length - 1 ? 'Next' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
