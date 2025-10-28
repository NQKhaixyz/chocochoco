import React from 'react'
import { cn } from '../lib/cn'

interface FloatingCat {
  id: number
  left: string
  top: string
  delay: number
  duration: number
  size: number
}

const floatingCats: FloatingCat[] = [
  { id: 1, left: '10%', top: '15%', delay: 0, duration: 8, size: 32 },
  { id: 2, left: '75%', top: '25%', delay: 2, duration: 10, size: 24 },
  { id: 3, left: '45%', top: '60%', delay: 4, duration: 12, size: 28 },
  { id: 4, left: '85%', top: '70%', delay: 1, duration: 9, size: 20 },
  { id: 5, left: '20%', top: '80%', delay: 3, duration: 11, size: 26 },
]

export function AnimatedBackground() {
  return (
    <>
      {/* Main animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient layer with animation */}
        <div 
          className={cn(
            "absolute inset-0 opacity-90",
            "bg-gradient-to-br",
            // Light mode gradients
            "from-pastel-pink via-pastel-mint to-pastel-blue",
            // Dark mode gradients
            "dark:from-slate-900 dark:via-purple-950 dark:to-slate-900",
            "animate-gradient-shift"
          )}
          style={{
            backgroundSize: '200% 200%',
          }}
        />
        
        {/* Secondary overlay gradient for depth */}
        <div 
          className={cn(
            "absolute inset-0 opacity-50",
            "bg-gradient-to-tr",
            "from-pastel-yellow via-transparent to-pastel-lilac",
            "dark:from-indigo-950/50 dark:via-transparent dark:to-pink-950/50",
            "animate-gradient-shift-reverse"
          )}
          style={{
            backgroundSize: '200% 200%',
          }}
        />

        {/* Animated orbs for more dynamic effect */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pastel-pink/30 dark:bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pastel-mint/30 dark:bg-teal-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pastel-blue/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Floating cats */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {floatingCats.map((cat) => (
          <div
            key={cat.id}
            className="absolute opacity-20 dark:opacity-10 animate-float-cat"
            style={{
              left: cat.left,
              top: cat.top,
              animationDelay: `${cat.delay}s`,
              animationDuration: `${cat.duration}s`,
            }}
          >
            <SimpleCat size={cat.size} />
          </div>
        ))}
      </div>
    </>
  )
}

// Simple SVG cat for floating animation
function SimpleCat({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <ellipse cx="50" cy="60" rx="18" ry="22" fill="currentColor" className="text-brand/60" />
      {/* Head */}
      <circle cx="50" cy="40" r="15" fill="currentColor" className="text-brand/60" />
      {/* Ears */}
      <path d="M 38 33 L 33 20 L 42 30 Z" fill="currentColor" className="text-brand/60" />
      <path d="M 62 33 L 67 20 L 58 30 Z" fill="currentColor" className="text-brand/60" />
      {/* Eyes - closed peaceful */}
      <path d="M 43 38 Q 45 40 47 38" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent/70" />
      <path d="M 53 38 Q 55 40 57 38" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent/70" />
      {/* Tail */}
      <path d="M 65 65 Q 75 60 78 70" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" className="text-brand/60" />
    </svg>
  )
}
