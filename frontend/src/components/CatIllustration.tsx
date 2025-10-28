import React from 'react'
import { cn } from '../lib/cn'

type CatType = 
  | 'stack' // Stack of cats
  | 'sleep' // Sleeping cat
  | 'play' // Playing cat
  | 'milk' // Cat with milk
  | 'cacao' // Cat with cacao
  | 'winner' // Celebrating cat
  | 'thinking' // Thinking cat
  | 'sitting' // Cat sitting peacefully
  | 'stretch' // Cat stretching
  | 'paw' // Cat waving paw
  | 'box' // Cat in box
  | 'yarn' // Cat with yarn ball

interface CatIllustrationProps {
  type: CatType
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48'
}

export function CatIllustration({ type, className, size = 'md' }: CatIllustrationProps) {
  return (
    <div className={cn('relative inline-flex items-center justify-center', sizeClasses[size], className)}>
      {type === 'stack' && <CatStack />}
      {type === 'sleep' && <CatSleep />}
      {type === 'play' && <CatPlay />}
      {type === 'milk' && <CatMilk />}
      {type === 'cacao' && <CatCacao />}
      {type === 'winner' && <CatWinner />}
      {type === 'thinking' && <CatThinking />}
      {type === 'sitting' && <CatSitting />}
      {type === 'stretch' && <CatStretch />}
      {type === 'paw' && <CatPaw />}
      {type === 'box' && <CatBox />}
      {type === 'yarn' && <CatYarn />}
    </div>
  )
}

function CatStack() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      {/* Bottom cat - orange */}
      <ellipse cx="50" cy="75" rx="20" ry="8" fill="#FDB462" opacity="0.3" />
      <ellipse cx="50" cy="70" rx="18" ry="14" fill="#FDB462" />
      <circle cx="45" cy="68" r="2" fill="#2C2C2C" />
      <circle cx="55" cy="68" r="2" fill="#2C2C2C" />
      <circle cx="50" cy="72" r="1.5" fill="#FF9999" />
      {/* Ears */}
      <path d="M 40 62 L 38 56 L 44 60 Z" fill="#FDB462" />
      <path d="M 60 62 L 62 56 L 56 60 Z" fill="#FDB462" />
      
      {/* Middle cat - white */}
      <ellipse cx="50" cy="55" rx="16" ry="12" fill="#FFFFFF" />
      <circle cx="46" cy="53" r="1.8" fill="#2C2C2C" />
      <circle cx="54" cy="53" r="1.8" fill="#2C2C2C" />
      <circle cx="50" cy="56" r="1.2" fill="#FFB6C1" />
      {/* Ears */}
      <path d="M 42 48 L 40 43 L 45 47 Z" fill="#FFFFFF" />
      <path d="M 58 48 L 60 43 L 55 47 Z" fill="#FFFFFF" />
      
      {/* Top cat - gray */}
      <ellipse cx="50" cy="38" rx="14" ry="10" fill="#BEBEBE" />
      <circle cx="46" cy="36" r="1.5" fill="#2C2C2C" />
      <circle cx="54" cy="36" r="1.5" fill="#2C2C2C" />
      <circle cx="50" cy="39" r="1" fill="#FF9999" />
      {/* Ears */}
      <path d="M 43 32 L 41 28 L 46 31 Z" fill="#BEBEBE" />
      <path d="M 57 32 L 59 28 L 54 31 Z" fill="#BEBEBE" />
      
      {/* Sparkles */}
      <circle cx="25" cy="30" r="2" fill="#FFD700" opacity="0.6" />
      <circle cx="75" cy="45" r="1.5" fill="#FFD700" opacity="0.6" />
      <circle cx="30" cy="60" r="1.5" fill="#FFD700" opacity="0.6" />
    </svg>
  )
}

function CatSleep() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <ellipse cx="50" cy="65" rx="25" ry="10" fill="#FDB462" opacity="0.3" />
      <ellipse cx="50" cy="55" rx="22" ry="16" fill="#FDB462" />
      {/* Sleeping eyes */}
      <path d="M 42 52 Q 45 54 48 52" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      <path d="M 52 52 Q 55 54 58 52" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="58" r="1.5" fill="#FF9999" />
      {/* Ears */}
      <path d="M 35 48 L 32 40 L 40 46 Z" fill="#FDB462" />
      <path d="M 65 48 L 68 40 L 60 46 Z" fill="#FDB462" />
      {/* Tail curled */}
      <path d="M 70 55 Q 80 50 85 55 Q 88 60 85 65" stroke="#FDB462" strokeWidth="4" fill="none" />
      {/* Zzz */}
      <text x="75" y="35" fontSize="8" fill="#BEBEBE" opacity="0.6">Z</text>
      <text x="80" y="28" fontSize="10" fill="#BEBEBE" opacity="0.6">Z</text>
      <text x="85" y="20" fontSize="12" fill="#BEBEBE" opacity="0.6">Z</text>
    </svg>
  )
}

function CatPlay() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="20" ry="8" fill="#BEBEBE" opacity="0.3" />
      {/* Body */}
      <ellipse cx="50" cy="60" rx="18" ry="14" fill="#BEBEBE" />
      {/* Happy eyes */}
      <path d="M 43 57 Q 45 59 47 57" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      <path d="M 53 57 Q 55 59 57 57" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      {/* Happy mouth */}
      <path d="M 45 62 Q 50 65 55 62" stroke="#2C2C2C" strokeWidth="1" fill="none" />
      <circle cx="50" cy="61" r="1.2" fill="#FF9999" />
      {/* Ears */}
      <path d="M 38 52 L 35 45 L 42 50 Z" fill="#BEBEBE" />
      <path d="M 62 52 L 65 45 L 58 50 Z" fill="#BEBEBE" />
      {/* Paws up */}
      <ellipse cx="35" cy="58" rx="4" ry="6" fill="#BEBEBE" transform="rotate(-20 35 58)" />
      <ellipse cx="65" cy="58" rx="4" ry="6" fill="#BEBEBE" transform="rotate(20 65 58)" />
      {/* Ball */}
      <circle cx="50" cy="40" r="6" fill="#FFD700" />
      <path d="M 48 40 Q 50 35 52 40" stroke="#FFA500" strokeWidth="1" fill="none" />
      <path d="M 50 38 Q 55 40 50 42" stroke="#FFA500" strokeWidth="1" fill="none" />
    </svg>
  )
}

function CatMilk() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#FFFFFF" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#FFFFFF" />
      <circle cx="46" cy="58" r="2" fill="#2C2C2C" />
      <circle cx="54" cy="58" r="2" fill="#2C2C2C" />
      <circle cx="50" cy="62" r="1.5" fill="#FFB6C1" />
      {/* Ears */}
      <path d="M 40 52 L 37 45 L 43 50 Z" fill="#FFFFFF" />
      <path d="M 60 52 L 63 45 L 57 50 Z" fill="#FFFFFF" />
      {/* Milk bottle */}
      <rect x="62" y="48" width="12" height="18" rx="2" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="1" />
      <rect x="64" y="45" width="8" height="4" rx="1" fill="#90CAF9" />
      <circle cx="68" cy="56" r="1.5" fill="#FFFFFF" />
      {/* Hearts */}
      <path d="M 25 45 Q 23 43 21 45 Q 19 47 21 50 L 25 54 L 29 50 Q 31 47 29 45 Q 27 43 25 45 Z" fill="#FFB6C1" opacity="0.6" />
    </svg>
  )
}

function CatCacao() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#8B4513" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#8B4513" />
      <circle cx="46" cy="58" r="2" fill="#2C2C2C" />
      <circle cx="54" cy="58" r="2" fill="#2C2C2C" />
      <circle cx="50" cy="62" r="1.5" fill="#FF9999" />
      {/* Ears */}
      <path d="M 40 52 L 37 45 L 43 50 Z" fill="#8B4513" />
      <path d="M 60 52 L 63 45 L 57 50 Z" fill="#8B4513" />
      {/* Cacao mug */}
      <rect x="62" y="50" width="14" height="16" rx="2" fill="#D2691E" />
      <ellipse cx="69" cy="50" rx="7" ry="2" fill="#8B4513" />
      <path d="M 76 54 Q 82 54 82 58 Q 82 62 76 62" stroke="#8B4513" strokeWidth="2" fill="none" />
      {/* Steam */}
      <path d="M 66 44 Q 65 40 66 36" stroke="#BEBEBE" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M 72 44 Q 73 40 72 36" stroke="#BEBEBE" strokeWidth="1" fill="none" opacity="0.6" />
    </svg>
  )
}

function CatWinner() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="20" ry="8" fill="#FDB462" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="18" ry="14" fill="#FDB462" />
      {/* Happy closed eyes */}
      <path d="M 43 57 Q 45 59 47 57" stroke="#2C2C2C" strokeWidth="2" fill="none" />
      <path d="M 53 57 Q 55 59 57 57" stroke="#2C2C2C" strokeWidth="2" fill="none" />
      {/* Big smile */}
      <path d="M 43 63 Q 50 68 57 63" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="62" r="1.5" fill="#FF9999" />
      {/* Ears */}
      <path d="M 38 52 L 35 44 L 42 50 Z" fill="#FDB462" />
      <path d="M 62 52 L 65 44 L 58 50 Z" fill="#FDB462" />
      {/* Crown */}
      <path d="M 38 48 L 40 42 L 42 46 L 44 40 L 46 46 L 48 42 L 50 46 L 52 42 L 54 46 L 56 40 L 58 46 L 60 42 L 62 48 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
      {/* Sparkles */}
      <circle cx="30" cy="45" r="2" fill="#FFD700" />
      <circle cx="70" cy="45" r="2" fill="#FFD700" />
      <circle cx="50" cy="35" r="2.5" fill="#FFD700" />
      <path d="M 25 55 L 27 57 L 25 59 L 23 57 Z" fill="#FFD700" />
      <path d="M 75 55 L 77 57 L 75 59 L 73 57 Z" fill="#FFD700" />
    </svg>
  )
}

function CatThinking() {
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#BEBEBE" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#BEBEBE" />
      {/* Thoughtful eyes looking up */}
      <circle cx="45" cy="56" r="2" fill="#2C2C2C" />
      <circle cx="55" cy="56" r="2" fill="#2C2C2C" />
      <circle cx="44" cy="55" r="0.8" fill="#FFFFFF" />
      <circle cx="54" cy="55" r="0.8" fill="#FFFFFF" />
      {/* Small mouth */}
      <ellipse cx="50" cy="62" rx="2" ry="1.5" fill="#2C2C2C" opacity="0.3" />
      <circle cx="50" cy="61" r="1" fill="#FF9999" />
      {/* Ears */}
      <path d="M 40 52 L 37 45 L 43 50 Z" fill="#BEBEBE" />
      <path d="M 60 52 L 63 45 L 57 50 Z" fill="#BEBEBE" />
      {/* Paw on chin */}
      <ellipse cx="60" cy="62" rx="5" ry="3" fill="#BEBEBE" transform="rotate(30 60 62)" />
      {/* Thought bubble */}
      <circle cx="70" cy="40" r="8" fill="#FFFFFF" stroke="#BEBEBE" strokeWidth="1" />
      <circle cx="68" cy="48" r="3" fill="#FFFFFF" stroke="#BEBEBE" strokeWidth="1" />
      <circle cx="65" cy="52" r="2" fill="#FFFFFF" stroke="#BEBEBE" strokeWidth="1" />
      {/* Question mark in bubble */}
      <text x="66" y="44" fontSize="10" fill="#BEBEBE" fontWeight="bold">?</text>
    </svg>
  )
}

// Cat Sitting - Peaceful sitting cat
function CatSitting() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body */}
      <ellipse cx="50" cy="65" rx="18" ry="22" fill="#F4A460" />
      {/* Head */}
      <circle cx="50" cy="45" r="14" fill="#F4A460" />
      {/* Ears */}
      <path d="M 40 38 L 35 28 L 43 35 Z" fill="#F4A460" />
      <path d="M 60 38 L 65 28 L 57 35 Z" fill="#F4A460" />
      <path d="M 38 33 L 36 30 L 40 34 Z" fill="#FFB6C1" />
      <path d="M 62 33 L 64 30 L 60 34 Z" fill="#FFB6C1" />
      {/* Eyes - peaceful closed eyes */}
      <path d="M 43 44 Q 45 46 47 44" stroke="#333" strokeWidth="1.5" fill="none" />
      <path d="M 53 44 Q 55 46 57 44" stroke="#333" strokeWidth="1.5" fill="none" />
      {/* Nose */}
      <circle cx="50" cy="48" r="1.5" fill="#FF69B4" />
      {/* Mouth - content smile */}
      <path d="M 46 50 Q 50 52 54 50" stroke="#333" strokeWidth="1" fill="none" />
      {/* Tail - wrapped around */}
      <path d="M 68 70 Q 75 65 72 55" stroke="#F4A460" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Front paws */}
      <ellipse cx="42" cy="85" rx="4" ry="6" fill="#F4A460" />
      <ellipse cx="58" cy="85" rx="4" ry="6" fill="#F4A460" />
    </svg>
  )
}

// Cat Stretch - Stretching cat
function CatStretch() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body - elongated */}
      <ellipse cx="55" cy="60" rx="25" ry="12" fill="#FFB347" />
      {/* Head - lowered */}
      <circle cx="30" cy="65" r="12" fill="#FFB347" />
      {/* Ears */}
      <path d="M 23 58 L 18 50 L 26 56 Z" fill="#FFB347" />
      <path d="M 37 58 L 42 50 L 34 56 Z" fill="#FFB347" />
      {/* Eyes */}
      <circle cx="27" cy="64" r="1.5" fill="#333" />
      <circle cx="33" cy="64" r="1.5" fill="#333" />
      {/* Nose */}
      <circle cx="30" cy="68" r="1" fill="#FF69B4" />
      {/* Front paws - stretched forward */}
      <ellipse cx="20" cy="75" rx="3" ry="7" fill="#FFB347" transform="rotate(20 20 75)" />
      <ellipse cx="28" cy="77" rx="3" ry="7" fill="#FFB347" transform="rotate(15 28 77)" />
      {/* Back paws */}
      <ellipse cx="75" cy="68" rx="4" ry="6" fill="#FFB347" />
      <ellipse cx="82" cy="68" rx="4" ry="6" fill="#FFB347" />
      {/* Tail - raised */}
      <path d="M 80 55 Q 85 40 88 35" stroke="#FFB347" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Stretch lines */}
      <path d="M 12 72 L 16 74" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 10 76 L 15 78" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// Cat Paw - Cat waving paw
function CatPaw() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body */}
      <ellipse cx="50" cy="65" rx="16" ry="20" fill="#DDA0DD" />
      {/* Head */}
      <circle cx="50" cy="42" r="13" fill="#DDA0DD" />
      {/* Ears */}
      <path d="M 41 34 L 36 24 L 44 32 Z" fill="#DDA0DD" />
      <path d="M 59 34 L 64 24 L 56 32 Z" fill="#DDA0DD" />
      <path d="M 39 30 L 37 26 L 41 30 Z" fill="#FFB6C1" />
      <path d="M 61 30 L 63 26 L 59 30 Z" fill="#FFB6C1" />
      {/* Eyes - happy */}
      <circle cx="45" cy="41" r="2" fill="#333" />
      <circle cx="55" cy="41" r="2" fill="#333" />
      <circle cx="46" cy="40" r="1" fill="#FFF" />
      <circle cx="56" cy="40" r="1" fill="#FFF" />
      {/* Nose */}
      <circle cx="50" cy="46" r="1.5" fill="#FF69B4" />
      {/* Mouth - happy smile */}
      <path d="M 46 48 Q 50 51 54 48" stroke="#333" strokeWidth="1.2" fill="none" />
      {/* Waving paw - raised */}
      <ellipse cx="70" cy="35" rx="6" ry="10" fill="#DDA0DD" transform="rotate(-30 70 35)" />
      {/* Paw details */}
      <ellipse cx="68" cy="30" rx="2" ry="3" fill="#FFB6C1" />
      <ellipse cx="72" cy="30" rx="2" ry="3" fill="#FFB6C1" />
      {/* Motion lines */}
      <path d="M 78 28 Q 82 26 85 28" stroke="#DDA0DD" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 80 34 Q 84 32 87 34" stroke="#DDA0DD" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Other paw */}
      <ellipse cx="38" cy="78" rx="4" ry="6" fill="#DDA0DD" />
    </svg>
  )
}

// Cat Box - Cat in a box
function CatBox() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Box */}
      <rect x="25" y="50" width="50" height="35" fill="#D2B48C" stroke="#8B4513" strokeWidth="2" />
      <path d="M 25 50 L 30 45 L 80 45 L 75 50 Z" fill="#DEB887" stroke="#8B4513" strokeWidth="2" />
      {/* Box flaps */}
      <path d="M 30 45 L 35 40 L 40 45" stroke="#8B4513" strokeWidth="1.5" fill="none" />
      <path d="M 70 45 L 65 40 L 60 45" stroke="#8B4513" strokeWidth="1.5" fill="none" />
      {/* Cat head peeking out */}
      <circle cx="50" cy="50" r="15" fill="#FF8C69" />
      {/* Ears */}
      <path d="M 39 43 L 34 33 L 42 40 Z" fill="#FF8C69" />
      <path d="M 61 43 L 66 33 L 58 40 Z" fill="#FF8C69" />
      <path d="M 38 39 L 36 35 L 40 39 Z" fill="#FFB6C1" />
      <path d="M 62 39 L 64 35 L 60 39 Z" fill="#FFB6C1" />
      {/* Eyes - curious */}
      <circle cx="44" cy="49" r="2.5" fill="#333" />
      <circle cx="56" cy="49" r="2.5" fill="#333" />
      <circle cx="45" cy="48" r="1.2" fill="#FFF" />
      <circle cx="57" cy="48" r="1.2" fill="#FFF" />
      {/* Nose */}
      <circle cx="50" cy="53" r="1.5" fill="#FF69B4" />
      {/* Mouth */}
      <path d="M 47 55 Q 50 56 53 55" stroke="#333" strokeWidth="1" fill="none" />
      {/* Paws on box edge */}
      <ellipse cx="35" cy="50" rx="4" ry="3" fill="#FF8C69" />
      <ellipse cx="65" cy="50" rx="4" ry="3" fill="#FF8C69" />
      {/* Hearts - loving the box */}
      <path d="M 20 35 Q 18 30 15 32 Q 12 30 10 35 Q 10 40 20 45 Q 30 40 30 35 Q 30 30 27 32 Q 24 30 20 35 Z" fill="#FF69B4" opacity="0.6" transform="scale(0.3) translate(130, 50)" />
    </svg>
  )
}

// Cat Yarn - Cat playing with yarn ball
function CatYarn() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Yarn ball */}
      <circle cx="65" cy="70" r="12" fill="#FF69B4" />
      {/* Yarn texture */}
      <path d="M 55 70 Q 60 65 65 70 Q 70 75 75 70" stroke="#FF1493" strokeWidth="1.5" fill="none" />
      <path d="M 60 62 Q 65 67 70 62" stroke="#FF1493" strokeWidth="1" fill="none" />
      <path d="M 58 76 Q 65 72 72 76" stroke="#FF1493" strokeWidth="1" fill="none" />
      {/* Yarn string */}
      <path d="M 75 65 Q 80 60 82 55 Q 78 50 72 48" stroke="#FF69B4" strokeWidth="2" fill="none" />
      {/* Cat body */}
      <ellipse cx="45" cy="55" rx="14" ry="18" fill="#C0C0C0" />
      {/* Head */}
      <circle cx="40" cy="35" r="11" fill="#C0C0C0" />
      {/* Ears */}
      <path d="M 33 28 L 28 18 L 36 26 Z" fill="#C0C0C0" />
      <path d="M 47 28 L 52 18 L 44 26 Z" fill="#C0C0C0" />
      {/* Eyes - playful */}
      <circle cx="36" cy="34" r="2" fill="#333" />
      <circle cx="44" cy="34" r="2" fill="#333" />
      <circle cx="37" cy="33" r="1" fill="#FFF" />
      <circle cx="45" cy="33" r="1" fill="#FFF" />
      {/* Nose */}
      <circle cx="40" cy="38" r="1.3" fill="#FF69B4" />
      {/* Mouth - excited */}
      <path d="M 37 40 Q 40 42 43 40" stroke="#333" strokeWidth="1" fill="none" />
      {/* Paw reaching for yarn */}
      <ellipse cx="58" cy="60" rx="5" ry="8" fill="#C0C0C0" transform="rotate(-30 58 60)" />
      {/* Paw details */}
      <ellipse cx="60" cy="58" rx="2" ry="3" fill="#FFF" />
      {/* Tail - excited */}
      <path d="M 55 65 Q 68 68 70 58" stroke="#C0C0C0" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Motion sparkles */}
      <circle cx="75" cy="55" r="1.5" fill="#FFD700" />
      <circle cx="80" cy="62" r="1" fill="#FFD700" />
    </svg>
  )
}
