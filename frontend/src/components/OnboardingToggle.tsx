import React from 'react'
import { useOnboarding } from '../onboarding/useOnboarding'

export default function OnboardingToggle() {
  const { enabled, set } = useOnboarding()
  return (
    <button
      onClick={() => set(!enabled)}
      className="shrink-0 inline-flex items-center gap-2 whitespace-nowrap px-2 md:px-3 py-1 rounded-xl border shadow-soft"
      title="Toggle tips"
      aria-pressed={enabled}
    >
      <span aria-hidden>💡</span>
      <span className="hidden md:inline">{enabled ? 'Tips: On' : 'Tips: Off'}</span>
    </button>
  )
}
