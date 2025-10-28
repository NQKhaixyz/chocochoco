import React, { useState, useEffect, useRef } from 'react'
import { Button } from './ui/Button'
import { Icon } from './ui/Icon'
import { cn } from '../lib/cn'

export interface TooltipStep {
  id: string
  targetSelector: string
  title: string
  description: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  icon?: 'sparkles' | 'shield' | 'treasury' | 'history' | 'success' | 'trophy'
}

interface FeatureTooltipProps {
  steps: TooltipStep[]
  onComplete: () => void
  storageKey: string
}

export function FeatureTooltip({ steps, onComplete, storageKey }: FeatureTooltipProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const currentStep = steps[currentStepIndex]
  const isLastStep = currentStepIndex === steps.length - 1

  useEffect(() => {
    // Check if user has already seen these tooltips
    const hasSeen = localStorage.getItem(storageKey)
    if (hasSeen === 'true') {
      return
    }

    // Wait a bit for the page to render
    const timer = setTimeout(() => {
      setIsVisible(true)
      updatePosition()
    }, 500)

    return () => clearTimeout(timer)
  }, [storageKey])

  useEffect(() => {
    if (isVisible && currentStep) {
      updatePosition()
    }
  }, [currentStepIndex, isVisible, currentStep])

  const updatePosition = () => {
    if (!currentStep) return

    const targetElement = document.querySelector(currentStep.targetSelector)
    if (!targetElement || !tooltipRef.current) return

    const targetRect = targetElement.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const placement = currentStep.placement || 'bottom'

    let top = 0
    let left = 0

    switch (placement) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 16
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
        break
      case 'bottom':
        top = targetRect.bottom + 16
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
        break
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
        left = targetRect.left - tooltipRect.width - 16
        break
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
        left = targetRect.right + 16
        break
    }

    // Keep tooltip within viewport
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipRect.height - 16))
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16))

    setPosition({ top, left })

    // Add highlight to target element
    targetElement.classList.add('feature-tooltip-highlight')
  }

  const handleNext = () => {
    // Remove highlight from current target
    if (currentStep) {
      const targetElement = document.querySelector(currentStep.targetSelector)
      if (targetElement) {
        targetElement.classList.remove('feature-tooltip-highlight')
      }
    }

    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsVisible(false)
    localStorage.setItem(storageKey, 'true')
    
    // Remove all highlights
    steps.forEach((step) => {
      const targetElement = document.querySelector(step.targetSelector)
      if (targetElement) {
        targetElement.classList.remove('feature-tooltip-highlight')
      }
    })

    setTimeout(onComplete, 300)
  }

  if (!isVisible || !currentStep) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-50 max-w-md rounded-xl border border-brand/30 bg-surface p-6 shadow-float transition-all duration-300",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute right-2 top-2 rounded-full p-1 transition hover:bg-surface-subtle"
          aria-label="Close tooltip"
        >
          <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          {currentStep.icon && (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand/20">
              <Icon name={currentStep.icon} className="h-5 w-5 text-brand-strong" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-bold text-fg">{currentStep.title}</h3>
            <p className="mb-4 text-sm text-muted-strong leading-relaxed">
              {currentStep.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted">
                {currentStepIndex + 1} of {steps.length}
              </span>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                >
                  Skip
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  rightIcon={isLastStep ? 'success' : undefined}
                >
                  {isLastStep ? 'Got it!' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-brand/30 bg-surface" />
      </div>
    </>
  )
}

// CSS for highlighting target elements
export const FEATURE_TOOLTIP_STYLES = `
  .feature-tooltip-highlight {
    position: relative;
    z-index: 45;
    animation: tooltip-pulse 2s infinite;
  }

  @keyframes tooltip-pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(var(--brand-rgb), 0.4);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(var(--brand-rgb), 0);
    }
  }
`
