import React from 'react'

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-animated-gradient" />
      
      {/* Rotating gradient overlay for depth */}
      <div className="bg-gradient-rotating" />
      
      {/* Floating cats */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingCat delay={0} duration={20} startX={10} startY={20} size="md" />
        <FloatingCat delay={5} duration={25} startX={70} startY={60} size="lg" />
        <FloatingCat delay={10} duration={22} startX={40} startY={80} size="sm" />
        <FloatingCat delay={3} duration={28} startX={85} startY={30} size="md" />
        <FloatingCat delay={7} duration={24} startX={25} startY={50} size="sm" />
        <FloatingCat delay={12} duration={26} startX={60} startY={15} size="lg" />
      </div>
      
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/5 via-transparent to-bg/10" />
    </div>
  )
}

interface FloatingCatProps {
  delay: number
  duration: number
  startX: number
  startY: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-8 h-8 md:w-10 md:h-10',
  md: 'w-12 h-12 md:w-16 md:h-16',
  lg: 'w-16 h-16 md:w-20 md:h-20',
}

function FloatingCat({ delay, duration, startX, startY, size = 'md' }: FloatingCatProps) {
  // Random cat poses for variety
  const poseIndex = Math.floor((startX + startY) % 3)
  
  return (
    <div
      className={`absolute opacity-12 dark:opacity-8 ${sizeClasses[size]}`}
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >
      {poseIndex === 0 && <CatSitting />}
      {poseIndex === 1 && <CatWalking />}
      {poseIndex === 2 && <CatStretching />}
    </div>
  )
}

function CatSitting() {
  return (
    <svg viewBox="0 0 60 60" fill="none" className="w-full h-full">
      {/* Body */}
      <ellipse cx="30" cy="35" rx="12" ry="10" fill="currentColor" className="text-brand-strong" />
      {/* Head */}
      <circle cx="30" cy="25" r="8" fill="currentColor" className="text-brand-strong" />
      {/* Ears */}
      <path d="M 24 20 L 20 12 L 27 18 Z" fill="currentColor" className="text-brand-strong" />
      <path d="M 36 20 L 40 12 L 33 18 Z" fill="currentColor" className="text-brand-strong" />
      {/* Tail */}
      <path 
        d="M 40 35 Q 48 32 50 38" 
        stroke="currentColor" 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round"
        className="text-brand-strong"
      />
    </svg>
  )
}

function CatWalking() {
  return (
    <svg viewBox="0 0 60 60" fill="none" className="w-full h-full">
      {/* Body elongated */}
      <ellipse cx="32" cy="32" rx="14" ry="8" fill="currentColor" className="text-accent-strong" />
      {/* Head */}
      <circle cx="22" cy="30" r="7" fill="currentColor" className="text-accent-strong" />
      {/* Ears */}
      <path d="M 18 25 L 15 18 L 21 23 Z" fill="currentColor" className="text-accent-strong" />
      <path d="M 26 25 L 29 18 L 23 23 Z" fill="currentColor" className="text-accent-strong" />
      {/* Legs */}
      <line x1="28" y1="38" x2="28" y2="44" stroke="currentColor" strokeWidth="2" className="text-accent-strong" />
      <line x1="36" y1="38" x2="36" y2="44" stroke="currentColor" strokeWidth="2" className="text-accent-strong" />
      {/* Tail up */}
      <path 
        d="M 44 30 Q 50 25 52 20" 
        stroke="currentColor" 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round"
        className="text-accent-strong"
      />
    </svg>
  )
}

function CatStretching() {
  return (
    <svg viewBox="0 0 60 60" fill="none" className="w-full h-full">
      {/* Body stretched */}
      <ellipse cx="35" cy="34" rx="18" ry="7" fill="currentColor" className="text-brand" />
      {/* Head lowered */}
      <circle cx="18" cy="36" r="7" fill="currentColor" className="text-brand" />
      {/* Ears */}
      <path d="M 14 31 L 10 24 L 16 29 Z" fill="currentColor" className="text-brand" />
      <path d="M 22 31 L 26 24 L 20 29 Z" fill="currentColor" className="text-brand" />
      {/* Front paws stretched */}
      <line x1="12" y1="42" x2="10" y2="48" stroke="currentColor" strokeWidth="2" className="text-brand" />
      <line x1="20" y1="42" x2="22" y2="48" stroke="currentColor" strokeWidth="2" className="text-brand" />
      {/* Tail raised */}
      <path 
        d="M 52 30 Q 56 22 58 18" 
        stroke="currentColor" 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round"
        className="text-brand"
      />
    </svg>
  )
}

