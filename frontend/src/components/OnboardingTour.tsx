import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { CatIllustration } from './CatIllustration'
import { Icon } from './ui/Icon'
import { cn } from '../lib/cn'

interface OnboardingStep {
  title: string
  description: string
  catType: 'winner' | 'thinking' | 'play' | 'excited' | 'victorious'
  icon: 'sparkles' | 'shield' | 'treasury' | 'history' | 'success'
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to ChocoChoco! 🎮',
    description: 'A strategic minority game on Solana where being unique pays off! Choose your tribe wisely and win rewards.',
    catType: 'excited',
    icon: 'sparkles',
  },
  {
    title: 'How to Play 🎯',
    description: 'Pick between Milk or Cacao tribes and commit your choice with a secret salt. The minority tribe wins the pot!',
    catType: 'thinking',
    icon: 'shield',
  },
  {
    title: 'Commit Phase 🔒',
    description: 'During commit phase, choose your tribe and stake tokens. Your choice stays hidden until reveal phase.',
    catType: 'play',
    icon: 'shield',
  },
  {
    title: 'Reveal & Win 🎉',
    description: 'After commit ends, reveal your choice. If you\'re in the minority tribe, you win a share of the total pot!',
    catType: 'winner',
    icon: 'treasury',
  },
  {
    title: 'Track Your Progress 📊',
    description: 'Check your stats, earnings, and climb the leaderboard. Become a top player and earn special badges!',
    catType: 'victorious',
    icon: 'success',
  },
]

interface OnboardingTourProps {
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const step = ONBOARDING_STEPS[currentStep]
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1

  if (!step) return null

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(onComplete, 300)
  }

  const handleSkipClick = () => {
    setIsVisible(false)
    setTimeout(onSkip, 300)
  }

  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-300",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      <div className={cn(
        "relative max-w-2xl w-full overflow-hidden rounded-3xl border border-brand/30 bg-surface shadow-float transition-transform duration-300",
        isVisible ? "scale-100" : "scale-95"
      )}>
        {/* Skip button */}
        <button
          onClick={handleSkipClick}
          className="absolute right-4 top-4 z-10 rounded-full p-2 transition hover:bg-surface-subtle"
          aria-label="Skip tutorial"
        >
          <svg className="h-6 w-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8 md:p-12">
          {/* Cat Illustration */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-brand/10 blur-2xl" />
              <CatIllustration type={step.catType} size="xl" className="relative animate-bounce-slow" />
            </div>
          </div>

          {/* Step indicator */}
          <div className="mb-6 flex justify-center gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentStep
                    ? "w-8 bg-brand"
                    : index < currentStep
                    ? "w-2 bg-brand/50"
                    : "w-2 bg-surface-subtle"
                )}
              />
            ))}
          </div>

          {/* Icon and Title */}
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/20">
              <Icon name={step.icon} className="h-6 w-6 text-brand-strong" />
            </div>
            <h2 className="text-3xl font-bold text-fg">{step.title}</h2>
          </div>

          {/* Description */}
          <p className="mb-8 text-center text-lg text-muted-strong leading-relaxed">
            {step.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              leftIcon="history"
            >
              Back
            </Button>

            <span className="text-sm text-muted">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>

            <Button
              variant="primary"
              onClick={handleNext}
              rightIcon={isLastStep ? 'success' : 'sparkles'}
            >
              {isLastStep ? 'Start Playing' : 'Next'}
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand/5 blur-3xl" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/5 blur-3xl" />
      </div>
    </div>
  )
}

// Hook to check if user has seen onboarding
export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true)

  useEffect(() => {
    const seen = localStorage.getItem('chocochoco:onboarding:completed')
    setHasSeenOnboarding(seen === 'true')
  }, [])

  const markAsCompleted = () => {
    localStorage.setItem('chocochoco:onboarding:completed', 'true')
    setHasSeenOnboarding(true)
  }

  const resetOnboarding = () => {
    localStorage.removeItem('chocochoco:onboarding:completed')
    setHasSeenOnboarding(false)
  }

  return {
    hasSeenOnboarding,
    markAsCompleted,
    resetOnboarding,
  }
}
