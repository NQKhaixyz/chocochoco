import React from 'react'
import SoundToggle from './SoundToggle'
import OnboardingToggle from './OnboardingToggle'
import ZoomControl from './ZoomControl'

export function Navbar() {
  return (
    <header className="sticky top-0 bg-card backdrop-blur border-b border-border">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-8 py-3 flex items-center justify-between">
        <a href="/" className="font-semibold text-lg flex items-center gap-2">
          <img src="/assets/icons/cat.svg" alt="ChocoCat" className="h-6 w-6" />
          ChocoChoco
        </a>
        <div className="flex items-center gap-3">
          <a href="/leaderboard" className="text-sm text-slate-600 hover:text-slate-900">
            Leaderboard
          </a>
          <ZoomControl />
          <SoundToggle />
          <OnboardingToggle />
        </div>
      </div>
    </header>
  )
}
