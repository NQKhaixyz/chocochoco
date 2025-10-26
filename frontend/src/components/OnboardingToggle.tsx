import React from 'react'
import { useOnboarding } from '../onboarding/useOnboarding'

export default function OnboardingToggle() {
  const { enabled, set } = useOnboarding()
  return (
    <button onClick={() => set(!enabled)} className="px-3 py-1 rounded-xl border shadow-soft" title="Toggle tips">
      {enabled ? '🟢 Tips: On' : '⚪ Tips: Off'}
    </button>
  )
}

