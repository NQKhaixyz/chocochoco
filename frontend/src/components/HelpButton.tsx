import React, { useState } from 'react'
import { Button } from './ui/Button'
import { OnboardingTour } from './OnboardingTour'
import { cn } from '../lib/cn'

interface HelpButtonProps {
  className?: string
}

export function HelpButton({ className }: HelpButtonProps) {
  const [showTour, setShowTour] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowTour(true)}
        className={cn("gap-2", className)}
        aria-label="Show tutorial"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <text x="12" y="17" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">?</text>
        </svg>
        <span className="hidden sm:inline">Help</span>
      </Button>

      {showTour && (
        <OnboardingTour
          onComplete={() => setShowTour(false)}
          onSkip={() => setShowTour(false)}
        />
      )}
    </>
  )
}
