// Mobile-first responsive utilities and patterns

import { useEffect, useState } from 'react'

/**
 * Hook to detect mobile viewport
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Initial check
    checkIsMobile()

    // Listen to resize
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [breakpoint])

  return isMobile
}

/**
 * Hook for touch device detection
 */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouch
}

/**
 * Responsive container classes
 */
export const responsiveContainer = {
  base: 'w-full mx-auto px-4 sm:px-6 lg:px-8',
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
}

/**
 * Touch-friendly button minimum size (44x44px per Apple HIG)
 */
export const touchTarget = 'min-h-[44px] min-w-[44px]'

/**
 * Responsive grid patterns
 */
export const responsiveGrid = {
  cards2: 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
  cards3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
  cards4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6',
  stats: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4',
}

/**
 * Responsive text sizes
 */
export const responsiveText = {
  hero: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  heading: 'text-2xl sm:text-3xl md:text-4xl',
  title: 'text-xl sm:text-2xl md:text-3xl',
  subtitle: 'text-lg sm:text-xl md:text-2xl',
  body: 'text-base sm:text-lg',
  small: 'text-sm sm:text-base',
}

/**
 * Responsive spacing
 */
export const responsiveSpacing = {
  section: 'py-8 sm:py-12 md:py-16 lg:py-20',
  card: 'p-4 sm:p-6 md:p-8',
  gap: 'gap-4 sm:gap-6 md:gap-8',
}

/**
 * Mobile drawer/modal utilities
 */
export const mobileDrawer = {
  overlay: 'fixed inset-0 bg-black/50 z-40',
  drawer: 'fixed inset-x-0 bottom-0 bg-card rounded-t-2xl p-6 z-50 max-h-[90vh] overflow-y-auto',
  handle: 'w-12 h-1 bg-border rounded-full mx-auto mb-4',
}

/**
 * Hide scrollbar while keeping scroll functionality
 */
export const hideScrollbar = 'scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

/**
 * Safe area insets for mobile devices (iPhone notch, etc.)
 */
export const safeArea = {
  top: 'pt-safe',
  bottom: 'pb-safe',
  left: 'pl-safe',
  right: 'pr-safe',
  all: 'p-safe',
}
