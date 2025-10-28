import React from 'react'
import { cn } from '../../lib/cn'
import { CatIllustration } from '../CatIllustration'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  withCat?: boolean
  message?: string
}

export function LoadingSpinner({ size = 'md', className, withCat = true, message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  }

  const catSizes = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
    xl: 'xl' as const,
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      {withCat ? (
        <div className="relative">
          {/* Spinning ring */}
          <div className={cn(
            'absolute inset-0 rounded-full border-4 border-brand/20 border-t-brand animate-spin',
            sizeClasses[size]
          )} />
          
          {/* Cat in center */}
          <div className="flex items-center justify-center">
            <CatIllustration 
              type="thinking" 
              size={catSizes[size]} 
              className="animate-pulse"
            />
          </div>
        </div>
      ) : (
        <div className={cn(
          'rounded-full border-4 border-brand/20 border-t-brand animate-spin',
          sizeClasses[size]
        )} />
      )}
      
      {message && (
        <p className="text-sm text-muted-strong animate-pulse">{message}</p>
      )}
    </div>
  )
}

// Specialized loading component for full-page loading
export function PageLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <LoadingSpinner size="xl" message="Loading ChocoChoco..." />
    </div>
  )
}

// Small inline loading indicator
export function InlineSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent', className)} />
  )
}
