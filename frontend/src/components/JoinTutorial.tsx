import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Icon } from './ui/Icon'
import { CatIllustration } from './CatIllustration'
import { cn } from '../lib/cn'

const TUTORIAL_STORAGE_KEY = 'chocochoco-join-tutorial-seen'

interface TutorialStep {
  title: string
  description: string
  icon: 'milk' | 'cacao' | 'timer' | 'shield' | 'trophy' | 'sparkles'
  catType: 'milk' | 'cacao' | 'thinking' | 'excited' | 'winner' | 'play'
}

const tutorialSteps: TutorialStep[] = [
  {
    title: '🎮 Welcome to ChocoChoco!',
    description: 'Join the ultimate tribe battle game! Choose between Team Milk 🥛 or Team Cacao 🍫 and compete for rewards.',
    icon: 'sparkles',
    catType: 'excited',
  },
  {
    title: '1️⃣ Choose Your Tribe',
    description: 'Select either Milk or Cacao tribe. Pick wisely - you\'re betting on which tribe will have the minority!',
    icon: 'milk',
    catType: 'thinking',
  },
  {
    title: '2️⃣ Set Your Stake',
    description: 'Enter how many FOOD tokens you want to stake. The default is 5 FOOD, but you can adjust it based on your strategy.',
    icon: 'trophy',
    catType: 'milk',
  },
  {
    title: '3️⃣ Commit Your Choice',
    description: 'Click "Commit to Round" to lock in your choice. Your selection is kept secret until the Reveal phase!',
    icon: 'shield',
    catType: 'play',
  },
  {
    title: '4️⃣ Wait for Reveal',
    description: 'After commit phase ends, reveal your choice. Then winners (minority tribe) can claim their rewards!',
    icon: 'timer',
    catType: 'winner',
  },
]

interface JoinTutorialProps {
  onClose?: () => void
}

export function JoinTutorial({ onClose }: JoinTutorialProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [shouldAutoShow, setShouldAutoShow] = useState(false)

  useEffect(() => {
    // Check if user has seen the tutorial
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_STORAGE_KEY)
    if (!hasSeenTutorial) {
      setShouldAutoShow(true)
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true')
    onClose?.()
  }

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  const step = tutorialSteps[currentStep]
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true)
          setCurrentStep(0)
        }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        title="Show Tutorial"
      >
        <Icon name="info" className="h-6 w-6 text-white" />
      </button>
    )
  }

  if (!step) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-up"
        onClick={handleClose}
      />

      {/* Tutorial Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="pointer-events-auto w-full max-w-2xl rounded-3xl border-2 border-brand/30 bg-surface shadow-2xl animate-fade-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative overflow-hidden rounded-t-3xl bg-gradient-brand p-6">
            <div className="absolute -right-8 -top-8 opacity-20">
              <CatIllustration type={step.catType} size="xl" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <Icon name={step.icon} className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                  <p className="text-sm text-white/80">
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
              >
                <Icon name="close" className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <CatIllustration 
                  type={step.catType} 
                  size="xl" 
                  className="animate-bounce-slow"
                />
              </div>
            </div>

            <p className="text-center text-lg text-fg leading-relaxed">
              {step.description}
            </p>

            {/* Step Indicators */}
            <div className="mt-6 flex justify-center gap-2">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === currentStep 
                      ? "w-8 bg-brand" 
                      : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border p-6">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  leftIcon="settings"
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
              )}
              {currentStep === 0 && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                >
                  Skip Tutorial
                </Button>
              )}
            </div>

            <Button
              variant="primary"
              rightIcon={currentStep < tutorialSteps.length - 1 ? "settings" : "success"}
              onClick={handleNext}
            >
              {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Get Started!'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export function useJoinTutorial() {
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true)

  useEffect(() => {
    const seen = localStorage.getItem(TUTORIAL_STORAGE_KEY)
    setHasSeenTutorial(!!seen)
  }, [])

  const resetTutorial = () => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY)
    setHasSeenTutorial(false)
  }

  return {
    hasSeenTutorial,
    resetTutorial,
  }
}
