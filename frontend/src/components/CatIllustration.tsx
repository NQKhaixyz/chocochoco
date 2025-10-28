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
  // Emotions
  | 'happy' // Happy cat with big smile
  | 'sad' // Sad cat with tears
  | 'angry' // Angry cat with steam
  | 'surprised' // Surprised cat with wide eyes
  | 'tired' // Exhausted cat
  | 'excited' // Super excited cat
  | 'victorious' // Victory pose cat
  // Actions
  | 'eating' // Cat eating from bowl
  | 'grooming' // Cat grooming itself
  | 'hunting' // Cat in hunting pose
  | 'walking' // Cat walking
  | 'jumping' // Cat jumping
  | 'running' // Cat running
  // Accessories
  | 'hat' // Cat with hat
  | 'glasses' // Cat with glasses
  | 'scarf' // Cat with scarf
  | 'crown' // Cat with crown (different from winner)
  | 'bowtie' // Cat with bowtie
  | 'bandana' // Cat with bandana
  // Seasonal
  | 'christmas' // Cat with Santa hat
  | 'halloween' // Cat with witch hat
  | 'birthday' // Cat with party hat
  | 'valentine' // Cat with hearts
  // Rarity tiers with effects
  | 'legendary' // Legendary cat with aura
  | 'epic' // Epic cat with glow
  | 'rare' // Rare cat with sparkles
  | 'common' // Common cat (simple)

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
      {/* Emotions */}
      {type === 'happy' && <CatHappy />}
      {type === 'sad' && <CatSad />}
      {type === 'angry' && <CatAngry />}
      {type === 'surprised' && <CatSurprised />}
      {type === 'tired' && <CatTired />}
      {type === 'excited' && <CatExcited />}
      {type === 'victorious' && <CatVictorious />}
      {/* Actions */}
      {type === 'eating' && <CatEating />}
      {type === 'grooming' && <CatGrooming />}
      {type === 'hunting' && <CatHunting />}
      {type === 'walking' && <CatWalking />}
      {type === 'jumping' && <CatJumping />}
      {type === 'running' && <CatRunning />}
      {/* Accessories */}
      {type === 'hat' && <CatHat />}
      {type === 'glasses' && <CatGlasses />}
      {type === 'scarf' && <CatScarf />}
      {type === 'crown' && <CatCrown />}
      {type === 'bowtie' && <CatBowtie />}
      {type === 'bandana' && <CatBandana />}
      {/* Seasonal */}
      {type === 'christmas' && <CatChristmas />}
      {type === 'halloween' && <CatHalloween />}
      {type === 'birthday' && <CatBirthday />}
      {type === 'valentine' && <CatValentine />}
      {/* Rarity */}
      {type === 'legendary' && <CatLegendary />}
      {type === 'epic' && <CatEpic />}
      {type === 'rare' && <CatRare />}
      {type === 'common' && <CatCommon />}
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

// Emotion Cats

// Cat Happy - Very happy cat with big smile
function CatHappy() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="20" ry="8" fill="#FFB347" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="18" ry="14" fill="#FFB347" />
      {/* Happy closed eyes */}
      <path d="M 42 56 Q 45 59 48 56" stroke="#2C2C2C" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 52 56 Q 55 59 58 56" stroke="#2C2C2C" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Big happy smile */}
      <path d="M 40 62 Q 50 70 60 62" stroke="#2C2C2C" strokeWidth="2" fill="none" />
      <circle cx="50" cy="61" r="1.5" fill="#FF69B4" />
      {/* Ears */}
      <path d="M 38 52 L 34 42 L 42 50 Z" fill="#FFB347" />
      <path d="M 62 52 L 66 42 L 58 50 Z" fill="#FFB347" />
      {/* Hearts floating */}
      <path d="M 25 40 Q 23 37 20 39 Q 17 37 15 40 Q 15 45 25 50 Q 35 45 35 40 Q 35 37 32 39 Q 29 37 25 40 Z" fill="#FF69B4" opacity="0.8" transform="scale(0.4) translate(40, 30)" />
      <path d="M 25 40 Q 23 37 20 39 Q 17 37 15 40 Q 15 45 25 50 Q 35 45 35 40 Q 35 37 32 39 Q 29 37 25 40 Z" fill="#FF69B4" opacity="0.8" transform="scale(0.3) translate(160, 20)" />
    </svg>
  )
}

// Cat Sad - Sad cat with tears
function CatSad() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#A9A9A9" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#A9A9A9" />
      {/* Sad eyes */}
      <path d="M 42 56 Q 45 54 48 56" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      <path d="M 52 56 Q 55 54 58 56" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      <circle cx="45" cy="57" r="1.5" fill="#2C2C2C" />
      <circle cx="55" cy="57" r="1.5" fill="#2C2C2C" />
      {/* Tears */}
      <ellipse cx="43" cy="62" rx="1.5" ry="3" fill="#87CEEB" opacity="0.7" />
      <ellipse cx="57" cy="62" rx="1.5" ry="3" fill="#87CEEB" opacity="0.7" />
      <circle cx="43" cy="66" r="1" fill="#87CEEB" opacity="0.5" />
      <circle cx="57" cy="66" r="1" fill="#87CEEB" opacity="0.5" />
      {/* Sad mouth */}
      <path d="M 43 66 Q 50 63 57 66" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="64" r="1.2" fill="#FF9999" />
      {/* Ears drooping */}
      <path d="M 40 54 L 35 48 L 42 52 Z" fill="#A9A9A9" />
      <path d="M 60 54 L 65 48 L 58 52 Z" fill="#A9A9A9" />
    </svg>
  )
}

// Cat Angry - Angry cat with steam
function CatAngry() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#DC143C" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#DC143C" />
      {/* Angry eyebrows */}
      <path d="M 40 54 L 48 56" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" />
      <path d="M 60 54 L 52 56" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" />
      {/* Angry eyes */}
      <circle cx="43" cy="58" r="2" fill="#2C2C2C" />
      <circle cx="57" cy="58" r="2" fill="#2C2C2C" />
      {/* Angry mouth */}
      <path d="M 43 65 Q 50 62 57 65" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="63" r="1.2" fill="#FF9999" />
      {/* Ears - alert */}
      <path d="M 40 52 L 36 42 L 43 50 Z" fill="#DC143C" />
      <path d="M 60 52 L 64 42 L 57 50 Z" fill="#DC143C" />
      {/* Steam/anger marks */}
      <path d="M 30 45 Q 28 40 30 35" stroke="#FF6347" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 70 45 Q 72 40 70 35" stroke="#FF6347" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="25" cy="50" r="2" fill="#FF6347" opacity="0.6" />
      <circle cx="75" cy="50" r="2" fill="#FF6347" opacity="0.6" />
    </svg>
  )
}

// Cat Surprised - Surprised cat with wide eyes
function CatSurprised() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#FFA07A" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#FFA07A" />
      {/* Wide surprised eyes */}
      <circle cx="43" cy="56" r="4" fill="#2C2C2C" />
      <circle cx="57" cy="56" r="4" fill="#2C2C2C" />
      <circle cx="44" cy="55" r="2" fill="#FFF" />
      <circle cx="58" cy="55" r="2" fill="#FFF" />
      {/* Surprised mouth - O shape */}
      <circle cx="50" cy="64" r="3" fill="#2C2C2C" opacity="0.8" />
      <circle cx="50" cy="61" r="1.2" fill="#FF69B4" />
      {/* Ears - perked up */}
      <path d="M 40 50 L 36 38 L 43 48 Z" fill="#FFA07A" />
      <path d="M 60 50 L 64 38 L 57 48 Z" fill="#FFA07A" />
      {/* Surprise lines */}
      <path d="M 25 55 L 20 55" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
      <path d="M 75 55 L 80 55" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
      <path d="M 30 45 L 25 40" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
      <path d="M 70 45 L 75 40" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Cat Tired - Exhausted cat
function CatTired() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="20" ry="10" fill="#D3D3D3" opacity="0.3" />
      <ellipse cx="50" cy="58" rx="18" ry="15" fill="#D3D3D3" />
      {/* Tired eyes - half closed */}
      <path d="M 42 54 L 48 54" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" />
      <path d="M 52 54 L 58 54" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" />
      <circle cx="45" cy="56" r="1" fill="#2C2C2C" opacity="0.5" />
      <circle cx="55" cy="56" r="1" fill="#2C2C2C" opacity="0.5" />
      {/* Tired mouth */}
      <ellipse cx="50" cy="62" rx="3" ry="2" fill="#2C2C2C" opacity="0.3" />
      <circle cx="50" cy="61" r="1.2" fill="#FF9999" />
      {/* Ears - drooping */}
      <path d="M 40 50 L 36 45 L 42 49 Z" fill="#D3D3D3" />
      <path d="M 60 50 L 64 45 L 58 49 Z" fill="#D3D3D3" />
      {/* Sweat drops */}
      <ellipse cx="35" cy="56" rx="1.5" ry="2.5" fill="#87CEEB" opacity="0.6" />
      {/* Bags under eyes */}
      <ellipse cx="45" cy="57" rx="2" ry="1" fill="#999" opacity="0.3" />
      <ellipse cx="55" cy="57" rx="2" ry="1" fill="#999" opacity="0.3" />
    </svg>
  )
}

// Cat Excited - Super excited cat
function CatExcited() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="20" ry="8" fill="#FF6B9D" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="18" ry="14" fill="#FF6B9D" />
      {/* Excited star eyes */}
      <path d="M 43 56 L 44 53 L 45 56 L 48 57 L 45 58 L 44 61 L 43 58 L 40 57 Z" fill="#FFD700" />
      <path d="M 57 56 L 58 53 L 59 56 L 62 57 L 59 58 L 58 61 L 57 58 L 54 57 Z" fill="#FFD700" />
      {/* Big excited smile */}
      <path d="M 40 62 Q 50 68 60 62" stroke="#2C2C2C" strokeWidth="2" fill="none" />
      <ellipse cx="50" cy="64" rx="6" ry="3" fill="#FF69B4" opacity="0.3" />
      <circle cx="50" cy="61" r="1.5" fill="#FF69B4" />
      {/* Ears - perked */}
      <path d="M 38 52 L 33 40 L 42 50 Z" fill="#FF6B9D" />
      <path d="M 62 52 L 67 40 L 58 50 Z" fill="#FF6B9D" />
      {/* Sparkles everywhere */}
      <circle cx="25" cy="50" r="2" fill="#FFD700" />
      <circle cx="75" cy="50" r="2" fill="#FFD700" />
      <path d="M 30 35 L 31 32 L 32 35 L 35 36 L 32 37 L 31 40 L 30 37 L 27 36 Z" fill="#FFD700" />
      <path d="M 70 35 L 71 32 L 72 35 L 75 36 L 72 37 L 71 40 L 70 37 L 67 36 Z" fill="#FFD700" />
    </svg>
  )
}

// Cat Victorious - Victory pose
function CatVictorious() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="75" rx="20" ry="8" fill="#FFB347" opacity="0.3" />
      <ellipse cx="50" cy="63" rx="18" ry="14" fill="#FFB347" />
      {/* Proud eyes */}
      <path d="M 42 58 Q 45 60 48 58" stroke="#2C2C2C" strokeWidth="2" fill="none" />
      <path d="M 52 58 Q 55 60 58 58" stroke="#2C2C2C" strokeWidth="2" fill="none" />
      {/* Confident smile */}
      <path d="M 42 64 Q 50 68 58 64" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="63" r="1.5" fill="#FF69B4" />
      {/* Ears */}
      <path d="M 38 54 L 34 44 L 42 52 Z" fill="#FFB347" />
      <path d="M 62 54 L 66 44 L 58 52 Z" fill="#FFB347" />
      {/* Arms raised in victory - V shape */}
      <ellipse cx="30" cy="60" rx="5" ry="10" fill="#FFB347" transform="rotate(-45 30 60)" />
      <ellipse cx="70" cy="60" rx="5" ry="10" fill="#FFB347" transform="rotate(45 70 60)" />
      {/* Trophy or medal */}
      <circle cx="50" cy="48" r="6" fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
      <path d="M 47 48 L 50 45 L 53 48 L 50 51 Z" fill="#FFA500" />
      <text x="48" y="51" fontSize="6" fill="#FFF" fontWeight="bold">1</text>
    </svg>
  )
}

// Action Cats

// Cat Eating - Cat eating from bowl
function CatEating() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="75" rx="20" ry="8" fill="#F4A460" opacity="0.3" />
      <ellipse cx="50" cy="62" rx="18" ry="14" fill="#F4A460" />
      {/* Head lowered */}
      <circle cx="50" cy="48" r="13" fill="#F4A460" />
      {/* Ears */}
      <path d="M 41 41 L 36 32 L 44 39 Z" fill="#F4A460" />
      <path d="M 59 41 L 64 32 L 56 39 Z" fill="#F4A460" />
      {/* Eyes - focused on food */}
      <circle cx="45" cy="47" r="1.5" fill="#2C2C2C" />
      <circle cx="55" cy="47" r="1.5" fill="#2C2C2C" />
      {/* Bowl */}
      <ellipse cx="50" cy="75" rx="15" ry="6" fill="#FF69B4" />
      <ellipse cx="50" cy="75" rx="12" ry="4" fill="#FFB6C1" />
      {/* Food in bowl */}
      <circle cx="47" cy="74" r="2" fill="#8B4513" />
      <circle cx="53" cy="74" r="2" fill="#8B4513" />
      <circle cx="50" cy="76" r="1.5" fill="#8B4513" />
      {/* Whiskers */}
      <path d="M 38 50 L 32 49" stroke="#2C2C2C" strokeWidth="0.5" />
      <path d="M 38 52 L 32 53" stroke="#2C2C2C" strokeWidth="0.5" />
      <path d="M 62 50 L 68 49" stroke="#2C2C2C" strokeWidth="0.5" />
      <path d="M 62 52 L 68 53" stroke="#2C2C2C" strokeWidth="0.5" />
    </svg>
  )
}

// Cat Grooming - Cat grooming itself
function CatGrooming() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="75" rx="20" ry="8" fill="#C0C0C0" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="18" ry="16" fill="#C0C0C0" />
      {/* Head turned to side */}
      <circle cx="55" cy="45" r="12" fill="#C0C0C0" />
      {/* Ears */}
      <path d="M 47 38 L 43 29 L 50 36 Z" fill="#C0C0C0" />
      <path d="M 63 38 L 67 29 L 60 36 Z" fill="#C0C0C0" />
      {/* Eye closed - cleaning */}
      <path d="M 52 44 Q 54 46 56 44" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      {/* Paw raised to face */}
      <ellipse cx="60" cy="50" rx="5" ry="8" fill="#C0C0C0" transform="rotate(-30 60 50)" />
      <ellipse cx="62" cy="48" rx="2" ry="3" fill="#FFB6C1" />
      {/* Tail curled */}
      <path d="M 68 65 Q 78 60 80 70 Q 78 80 70 78" stroke="#C0C0C0" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Sparkles - clean */}
      <circle cx="40" cy="50" r="1.5" fill="#87CEEB" />
      <circle cx="45" cy="45" r="1" fill="#87CEEB" />
      <circle cx="35" cy="55" r="1" fill="#87CEEB" />
    </svg>
  )
}

// Cat Hunting - Cat in hunting pose
function CatHunting() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body - crouched low */}
      <ellipse cx="50" cy="68" rx="22" ry="10" fill="#8B4513" />
      {/* Head - lowered, focused */}
      <circle cx="35" cy="60" r="11" fill="#8B4513" />
      {/* Ears - alert */}
      <path d="M 28 53 L 23 43 L 31 51 Z" fill="#8B4513" />
      <path d="M 42 53 L 47 43 L 39 51 Z" fill="#8B4513" />
      {/* Eyes - focused, dilated pupils */}
      <ellipse cx="31" cy="59" rx="3" ry="4" fill="#000" />
      <ellipse cx="39" cy="59" rx="3" ry="4" fill="#000" />
      <circle cx="31" cy="58" r="1" fill="#FFD700" />
      <circle cx="39" cy="58" r="1" fill="#FFD700" />
      {/* Wiggling butt indicator */}
      <path d="M 68 68 Q 70 65 72 68 Q 70 71 68 68" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 70 68 Q 72 65 74 68 Q 72 71 70 68" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* Tail - low and twitching */}
      <path d="M 70 70 Q 80 72 88 68 Q 90 66 88 64" stroke="#8B4513" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Front paws ready to pounce */}
      <ellipse cx="25" cy="75" rx="3" ry="6" fill="#8B4513" />
      <ellipse cx="32" cy="75" rx="3" ry="6" fill="#8B4513" />
    </svg>
  )
}

// Cat Walking - Cat walking
function CatWalking() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body */}
      <ellipse cx="50" cy="55" rx="20" ry="12" fill="#DDA0DD" />
      {/* Head */}
      <circle cx="35" cy="50" r="11" fill="#DDA0DD" />
      {/* Ears */}
      <path d="M 28 43 L 23 33 L 31 41 Z" fill="#DDA0DD" />
      <path d="M 42 43 L 47 33 L 39 41 Z" fill="#DDA0DD" />
      {/* Eyes */}
      <circle cx="31" cy="49" r="1.5" fill="#2C2C2C" />
      <circle cx="39" cy="49" r="1.5" fill="#2C2C2C" />
      {/* Nose */}
      <circle cx="35" cy="53" r="1" fill="#FF69B4" />
      {/* Walking legs - alternating */}
      <ellipse cx="38" cy="68" rx="3" ry="7" fill="#DDA0DD" />
      <ellipse cx="48" cy="65" rx="3" ry="9" fill="#DDA0DD" />
      <ellipse cx="52" cy="68" rx="3" ry="7" fill="#DDA0DD" />
      <ellipse cx="62" cy="65" rx="3" ry="9" fill="#DDA0DD" />
      {/* Tail - up and curved */}
      <path d="M 68 55 Q 75 45 78 38" stroke="#DDA0DD" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Motion lines */}
      <path d="M 20 60 L 25 60" stroke="#DDA0DD" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M 22 65 L 27 65" stroke="#DDA0DD" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

// Cat Jumping - Cat jumping
function CatJumping() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body - stretched in air */}
      <ellipse cx="50" cy="45" rx="16" ry="20" fill="#FF8C69" transform="rotate(-20 50 45)" />
      {/* Head */}
      <circle cx="55" cy="30" r="11" fill="#FF8C69" />
      {/* Ears */}
      <path d="M 48 23 L 44 14 L 51 21 Z" fill="#FF8C69" />
      <path d="M 62 23 L 66 14 L 59 21 Z" fill="#FF8C69" />
      {/* Eyes - focused */}
      <circle cx="52" cy="29" r="2" fill="#2C2C2C" />
      <circle cx="58" cy="29" r="2" fill="#2C2C2C" />
      <circle cx="53" cy="28" r="1" fill="#FFF" />
      <circle cx="59" cy="28" r="1" fill="#FFF" />
      {/* Legs - extended */}
      <ellipse cx="42" cy="58" rx="4" ry="10" fill="#FF8C69" transform="rotate(-30 42 58)" />
      <ellipse cx="50" cy="60" rx="4" ry="12" fill="#FF8C69" transform="rotate(-15 50 60)" />
      <ellipse cx="60" cy="55" rx="4" ry="10" fill="#FF8C69" transform="rotate(20 60 55)" />
      <ellipse cx="68" cy="52" rx="4" ry="12" fill="#FF8C69" transform="rotate(30 68 52)" />
      {/* Tail - streaming behind */}
      <path d="M 40 50 Q 25 55 20 60" stroke="#FF8C69" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Motion arcs */}
      <path d="M 25 70 Q 35 60 45 65" stroke="#FFD700" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
      <path d="M 30 75 Q 40 65 50 70" stroke="#FFD700" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

// Cat Running - Cat running
function CatRunning() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body - elongated, leaning forward */}
      <ellipse cx="45" cy="55" rx="24" ry="11" fill="#98D8C8" />
      {/* Head - forward */}
      <circle cx="25" cy="52" r="10" fill="#98D8C8" />
      {/* Ears - flattened back */}
      <path d="M 20 45 L 16 40 L 22 44 Z" fill="#98D8C8" />
      <path d="M 30 45 L 34 40 L 28 44 Z" fill="#98D8C8" />
      {/* Eyes - determined */}
      <circle cx="22" cy="51" r="1.5" fill="#2C2C2C" />
      <circle cx="28" cy="51" r="1.5" fill="#2C2C2C" />
      {/* Running legs - blurred motion */}
      <ellipse cx="38" cy="68" rx="3" ry="8" fill="#98D8C8" opacity="0.7" />
      <ellipse cx="45" cy="66" rx="3" ry="10" fill="#98D8C8" opacity="0.8" />
      <ellipse cx="52" cy="68" rx="3" ry="8" fill="#98D8C8" opacity="0.7" />
      <ellipse cx="59" cy="66" rx="3" ry="10" fill="#98D8C8" />
      {/* Tail - straight back for speed */}
      <path d="M 65 55 Q 80 55 88 53" stroke="#98D8C8" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Speed lines */}
      <path d="M 15 45 L 5 43" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M 15 50 L 5 50" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M 15 55 L 5 57" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

// Accessory Cats

// Cat Hat - Cat with hat
function CatHat() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#F5DEB3" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#F5DEB3" />
      {/* Eyes */}
      <circle cx="45" cy="58" r="2" fill="#2C2C2C" />
      <circle cx="55" cy="58" r="2" fill="#2C2C2C" />
      <circle cx="46" cy="57" r="1" fill="#FFF" />
      <circle cx="56" cy="57" r="1" fill="#FFF" />
      {/* Nose and mouth */}
      <circle cx="50" cy="62" r="1.5" fill="#FF69B4" />
      <path d="M 46 64 Q 50 66 54 64" stroke="#2C2C2C" strokeWidth="1" fill="none" />
      {/* Ears */}
      <path d="M 40 52 L 37 44 L 43 50 Z" fill="#F5DEB3" />
      <path d="M 60 52 L 63 44 L 57 50 Z" fill="#F5DEB3" />
      {/* Fancy hat */}
      <ellipse cx="50" cy="45" rx="14" ry="4" fill="#8B4789" />
      <path d="M 38 45 L 40 30 L 60 30 L 62 45" fill="#9B5B9F" stroke="#8B4789" strokeWidth="1" />
      <ellipse cx="50" cy="30" rx="10" ry="3" fill="#8B4789" />
      {/* Hat decoration */}
      <rect x="46" y="35" width="8" height="3" fill="#FFD700" />
    </svg>
  )
}

// Cat Glasses - Cat with glasses
function CatGlasses() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#CD853F" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#CD853F" />
      {/* Ears */}
      <path d="M 40 52 L 37 44 L 43 50 Z" fill="#CD853F" />
      <path d="M 60 52 L 63 44 L 57 50 Z" fill="#CD853F" />
      {/* Glasses */}
      <circle cx="43" cy="56" r="5" fill="none" stroke="#2C2C2C" strokeWidth="2" />
      <circle cx="57" cy="56" r="5" fill="none" stroke="#2C2C2C" strokeWidth="2" />
      <path d="M 48 56 L 52 56" stroke="#2C2C2C" strokeWidth="2" />
      <path d="M 38 56 L 35 54" stroke="#2C2C2C" strokeWidth="1.5" />
      <path d="M 62 56 L 65 54" stroke="#2C2C2C" strokeWidth="1.5" />
      {/* Eyes behind glasses */}
      <circle cx="43" cy="56" r="2" fill="#2C2C2C" />
      <circle cx="57" cy="56" r="2" fill="#2C2C2C" />
      <circle cx="44" cy="55" r="0.8" fill="#FFF" />
      <circle cx="58" cy="55" r="0.8" fill="#FFF" />
      {/* Nose and mouth */}
      <circle cx="50" cy="62" r="1.5" fill="#FF69B4" />
      <path d="M 46 64 Q 50 66 54 64" stroke="#2C2C2C" strokeWidth="1" fill="none" />
    </svg>
  )
}

// Cat Scarf - Cat with scarf
function CatScarf() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#E0E0E0" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#E0E0E0" />
      {/* Eyes */}
      <circle cx="45" cy="55" r="2" fill="#2C2C2C" />
      <circle cx="55" cy="55" r="2" fill="#2C2C2C" />
      <circle cx="46" cy="54" r="1" fill="#FFF" />
      <circle cx="56" cy="54" r="1" fill="#FFF" />
      {/* Ears */}
      <path d="M 40 48 L 37 40 L 43 46 Z" fill="#E0E0E0" />
      <path d="M 60 48 L 63 40 L 57 46 Z" fill="#E0E0E0" />
      {/* Scarf wrapped around neck */}
      <ellipse cx="50" cy="65" rx="18" ry="8" fill="#FF6B6B" />
      <path d="M 32 65 Q 30 70 32 75 L 35 82 L 38 75 Q 36 70 38 65" fill="#FF6B6B" />
      {/* Scarf stripes */}
      <rect x="40" y="63" width="20" height="2" fill="#FFF" opacity="0.6" />
      <rect x="40" y="67" width="20" height="2" fill="#FFF" opacity="0.6" />
      {/* Nose and smile */}
      <circle cx="50" cy="59" r="1.5" fill="#FF69B4" />
      <path d="M 46 61 Q 50 63 54 61" stroke="#2C2C2C" strokeWidth="1" fill="none" />
    </svg>
  )
}

// Cat Crown - Cat with crown
function CatCrown() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#FFE4B5" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#FFE4B5" />
      {/* Proud eyes */}
      <circle cx="45" cy="58" r="2" fill="#2C2C2C" />
      <circle cx="55" cy="58" r="2" fill="#2C2C2C" />
      <circle cx="46" cy="57" r="1" fill="#FFF" />
      <circle cx="56" cy="57" r="1" fill="#FFF" />
      {/* Ears */}
      <path d="M 40 52 L 37 44 L 43 50 Z" fill="#FFE4B5" />
      <path d="M 60 52 L 63 44 L 57 50 Z" fill="#FFE4B5" />
      {/* Royal crown */}
      <path d="M 35 48 L 38 40 L 40 46 L 43 38 L 45 46 L 48 36 L 50 46 L 52 36 L 55 46 L 57 38 L 60 46 L 62 40 L 65 48 L 35 48 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="1" />
      <ellipse cx="50" cy="48" rx="15" ry="3" fill="#FFD700" />
      {/* Crown jewels */}
      <circle cx="43" cy="42" r="2" fill="#FF1493" />
      <circle cx="50" cy="40" r="2.5" fill="#9370DB" />
      <circle cx="57" cy="42" r="2" fill="#FF1493" />
      {/* Nose and smile */}
      <circle cx="50" cy="62" r="1.5" fill="#FF69B4" />
      <path d="M 45 64 Q 50 67 55 64" stroke="#2C2C2C" strokeWidth="1" fill="none" />
    </svg>
  )
}

// Cat Bowtie - Cat with bowtie
function CatBowtie() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#2F4F4F" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#2F4F4F" />
      {/* Sophisticated eyes */}
      <circle cx="45" cy="57" r="2" fill="#2C2C2C" />
      <circle cx="55" cy="57" r="2" fill="#2C2C2C" />
      <circle cx="46" cy="56" r="0.8" fill="#FFF" />
      <circle cx="56" cy="56" r="0.8" fill="#FFF" />
      {/* Ears */}
      <path d="M 40 52 L 37 44 L 43 50 Z" fill="#2F4F4F" />
      <path d="M 60 52 L 63 44 L 57 50 Z" fill="#2F4F4F" />
      {/* Bowtie */}
      <path d="M 38 68 L 42 70 L 38 72 L 42 74 L 38 76 L 48 72 L 38 68" fill="#DC143C" />
      <path d="M 62 68 L 58 70 L 62 72 L 58 74 L 62 76 L 52 72 L 62 68" fill="#DC143C" />
      <ellipse cx="50" cy="72" rx="3" ry="4" fill="#DC143C" />
      {/* Nose and smile */}
      <circle cx="50" cy="61" r="1.5" fill="#FF69B4" />
      <path d="M 46 63 Q 50 65 54 63" stroke="#2C2C2C" strokeWidth="1" fill="none" />
    </svg>
  )
}

// Cat Bandana - Cat with bandana
function CatBandana() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#DAA520" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#DAA520" />
      {/* Cool eyes */}
      <circle cx="45" cy="57" r="2" fill="#2C2C2C" />
      <circle cx="55" cy="57" r="2" fill="#2C2C2C" />
      <circle cx="46" cy="56" r="1" fill="#FFF" />
      <circle cx="56" cy="56" r="1" fill="#FFF" />
      {/* Ears */}
      <path d="M 40 52 L 37 44 L 43 50 Z" fill="#DAA520" />
      <path d="M 60 52 L 63 44 L 57 50 Z" fill="#DAA520" />
      {/* Bandana on head */}
      <path d="M 35 50 Q 35 46 38 45 L 62 45 Q 65 46 65 50" fill="#FF4500" />
      <path d="M 65 50 Q 68 48 72 50 L 75 54 L 70 52" fill="#FF4500" />
      {/* Bandana pattern */}
      <circle cx="42" cy="47" r="1.5" fill="#FFF" opacity="0.8" />
      <circle cx="50" cy="47" r="1.5" fill="#FFF" opacity="0.8" />
      <circle cx="58" cy="47" r="1.5" fill="#FFF" opacity="0.8" />
      {/* Nose and smile */}
      <circle cx="50" cy="61" r="1.5" fill="#FF69B4" />
      <path d="M 46 63 Q 50 65 54 63" stroke="#2C2C2C" strokeWidth="1" fill="none" />
    </svg>
  )
}

// Seasonal Cats

// Cat Christmas - Cat with Santa hat
function CatChristmas() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#FFFFFF" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#FFFFFF" />
      {/* Happy eyes */}
      <path d="M 43 57 Q 45 59 47 57" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      <path d="M 53 57 Q 55 59 57 57" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      {/* Ears */}
      <path d="M 40 52 L 37 44 L 43 50 Z" fill="#FFFFFF" />
      <path d="M 60 52 L 63 44 L 57 50 Z" fill="#FFFFFF" />
      {/* Santa hat */}
      <path d="M 35 48 L 38 32 L 62 32 L 65 48" fill="#DC143C" />
      <ellipse cx="50" cy="48" rx="15" ry="3" fill="#FFF" />
      <circle cx="50" cy="28" r="5" fill="#FFF" />
      {/* Nose and smile */}
      <circle cx="50" cy="62" r="1.5" fill="#FF69B4" />
      <path d="M 44 64 Q 50 68 56 64" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      {/* Snowflakes */}
      <path d="M 25 45 L 27 47 L 25 49 L 23 47 Z" fill="#87CEEB" />
      <path d="M 75 55 L 77 57 L 75 59 L 73 57 Z" fill="#87CEEB" />
    </svg>
  )
}

// Cat Halloween - Cat with witch hat
function CatHalloween() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#2C2C2C" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#2C2C2C" />
      {/* Mysterious eyes */}
      <circle cx="45" cy="58" r="3" fill="#FF8C00" />
      <circle cx="55" cy="58" r="3" fill="#FF8C00" />
      <circle cx="45" cy="57" r="1" fill="#FFD700" />
      <circle cx="55" cy="57" r="1" fill="#FFD700" />
      {/* Ears */}
      <path d="M 40 52 L 37 44 L 43 50 Z" fill="#2C2C2C" />
      <path d="M 60 52 L 63 44 L 57 50 Z" fill="#2C2C2C" />
      {/* Witch hat */}
      <ellipse cx="50" cy="45" rx="16" ry="3" fill="#663399" />
      <path d="M 40 45 L 45 20 L 55 20 L 60 45" fill="#663399" />
      <rect x="44" y="38" width="12" height="4" fill="#FF8C00" />
      {/* Nose */}
      <circle cx="50" cy="62" r="1.5" fill="#FF69B4" />
      {/* Spooky moon */}
      <circle cx="75" cy="35" r="8" fill="#FFD700" opacity="0.6" />
    </svg>
  )
}

// Cat Birthday - Cat with party hat
function CatBirthday() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#FFB6C1" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#FFB6C1" />
      {/* Excited eyes */}
      <circle cx="45" cy="57" r="2.5" fill="#2C2C2C" />
      <circle cx="55" cy="57" r="2.5" fill="#2C2C2C" />
      <circle cx="46" cy="56" r="1.2" fill="#FFF" />
      <circle cx="56" cy="56" r="1.2" fill="#FFF" />
      {/* Ears */}
      <path d="M 40 52 L 37 44 L 43 50 Z" fill="#FFB6C1" />
      <path d="M 60 52 L 63 44 L 57 50 Z" fill="#FFB6C1" />
      {/* Party hat */}
      <path d="M 42 48 L 50 25 L 58 48 Z" fill="#9370DB" stroke="#FFD700" strokeWidth="1" />
      <ellipse cx="50" cy="48" rx="8" ry="2" fill="#FF69B4" />
      <circle cx="50" cy="25" r="3" fill="#FFD700" />
      {/* Confetti */}
      <circle cx="30" cy="40" r="1.5" fill="#FF1493" />
      <circle cx="70" cy="45" r="1.5" fill="#00CED1" />
      <rect x="25" y="50" width="3" height="3" fill="#FFD700" transform="rotate(45 26.5 51.5)" />
      <rect x="72" y="52" width="3" height="3" fill="#FF69B4" transform="rotate(30 73.5 53.5)" />
      {/* Nose and smile */}
      <circle cx="50" cy="62" r="1.5" fill="#FF69B4" />
      <path d="M 43 64 Q 50 69 57 64" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

// Cat Valentine - Cat with hearts
function CatValentine() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#FFB6C1" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#FFB6C1" />
      {/* Love eyes - hearts */}
      <path d="M 40 56 Q 38 54 36 56 Q 34 54 32 56 Q 32 60 40 64 Q 48 60 48 56 Q 48 54 46 56 Q 44 54 40 56 Z" fill="#FF1493" transform="scale(0.25) translate(120, 130)" />
      <path d="M 40 56 Q 38 54 36 56 Q 34 54 32 56 Q 32 60 40 64 Q 48 60 48 56 Q 48 54 46 56 Q 44 54 40 56 Z" fill="#FF1493" transform="scale(0.25) translate(180, 130)" />
      {/* Ears */}
      <path d="M 40 52 L 37 44 L 43 50 Z" fill="#FFB6C1" />
      <path d="M 60 52 L 63 44 L 57 50 Z" fill="#FFB6C1" />
      {/* Blush */}
      <ellipse cx="38" cy="60" rx="4" ry="3" fill="#FF69B4" opacity="0.4" />
      <ellipse cx="62" cy="60" rx="4" ry="3" fill="#FF69B4" opacity="0.4" />
      {/* Nose and smile */}
      <circle cx="50" cy="62" r="1.5" fill="#FF69B4" />
      <path d="M 43 64 Q 50 69 57 64" stroke="#2C2C2C" strokeWidth="1.5" fill="none" />
      {/* Floating hearts */}
      <path d="M 20 40 Q 18 37 15 39 Q 12 37 10 40 Q 10 45 20 50 Q 30 45 30 40 Q 30 37 27 39 Q 24 37 20 40 Z" fill="#FF1493" opacity="0.8" transform="scale(0.4) translate(20, 50)" />
      <path d="M 20 40 Q 18 37 15 39 Q 12 37 10 40 Q 10 45 20 50 Q 30 45 30 40 Q 30 37 27 39 Q 24 37 20 40 Z" fill="#FF1493" opacity="0.8" transform="scale(0.5) translate(110, 20)" />
      <path d="M 20 40 Q 18 37 15 39 Q 12 37 10 40 Q 10 45 20 50 Q 30 45 30 40 Q 30 37 27 39 Q 24 37 20 40 Z" fill="#FF1493" opacity="0.6" transform="scale(0.3) translate(180, 80)" />
    </svg>
  )
}

// Rarity Cats

// Cat Legendary - Legendary cat with aura
function CatLegendary() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Legendary aura - outer glow */}
      <circle cx="50" cy="55" r="35" fill="url(#legendaryGradient)" opacity="0.3" />
      <defs>
        <radialGradient id="legendaryGradient">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#FF1493" />
        </radialGradient>
      </defs>
      {/* Body */}
      <ellipse cx="50" cy="60" rx="18" ry="14" fill="#FFD700" />
      {/* Head */}
      <circle cx="50" cy="45" r="14" fill="#FFD700" />
      {/* Majestic eyes */}
      <circle cx="45" cy="44" r="3" fill="#FFF" />
      <circle cx="55" cy="44" r="3" fill="#FFF" />
      <circle cx="45" cy="44" r="1.5" fill="#FF1493" />
      <circle cx="55" cy="44" r="1.5" fill="#FF1493" />
      {/* Ears with cosmic tips */}
      <path d="M 40 38 L 35 26 L 43 36 Z" fill="#FFD700" />
      <path d="M 60 38 L 65 26 L 57 36 Z" fill="#FFD700" />
      <circle cx="35" cy="26" r="3" fill="#FF1493" opacity="0.7" />
      <circle cx="65" cy="26" r="3" fill="#FF1493" opacity="0.7" />
      {/* Crown of stars */}
      <path d="M 50 30 L 52 26 L 54 30 L 58 30 L 55 33 L 56 37 L 52 35 L 48 37 L 49 33 L 46 30 Z" fill="#FFF" />
      <path d="M 40 32 L 41 29 L 42 32 L 45 32 L 42 34 L 43 37 L 40 35 L 37 37 L 38 34 L 35 32 Z" fill="#FFF" opacity="0.8" />
      <path d="M 60 32 L 61 29 L 62 32 L 65 32 L 62 34 L 63 37 L 60 35 L 57 37 L 58 34 L 55 32 Z" fill="#FFF" opacity="0.8" />
      {/* Nose */}
      <circle cx="50" cy="49" r="1.5" fill="#FF69B4" />
      {/* Sparkles */}
      <circle cx="25" cy="50" r="2" fill="#FFD700" />
      <circle cx="75" cy="50" r="2" fill="#FF1493" />
      <circle cx="30" cy="35" r="1.5" fill="#FFF" />
      <circle cx="70" cy="35" r="1.5" fill="#FFF" />
    </svg>
  )
}

// Cat Epic - Epic cat with glow
function CatEpic() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Epic glow */}
      <ellipse cx="50" cy="60" rx="28" ry="20" fill="#9370DB" opacity="0.3" />
      <ellipse cx="50" cy="60" rx="24" ry="16" fill="#9370DB" opacity="0.2" />
      {/* Body */}
      <ellipse cx="50" cy="60" rx="18" ry="14" fill="#9370DB" />
      {/* Head */}
      <circle cx="50" cy="45" r="13" fill="#9370DB" />
      {/* Glowing eyes */}
      <circle cx="45" cy="44" r="3" fill="#E0B0FF" />
      <circle cx="55" cy="44" r="3" fill="#E0B0FF" />
      <circle cx="45" cy="43" r="1.5" fill="#FFF" />
      <circle cx="55" cy="43" r="1.5" fill="#FFF" />
      {/* Ears */}
      <path d="M 40 38 L 36 28 L 43 36 Z" fill="#9370DB" />
      <path d="M 60 38 L 64 28 L 57 36 Z" fill="#9370DB" />
      {/* Epic marks */}
      <path d="M 38 40 Q 36 38 38 36" stroke="#E0B0FF" strokeWidth="1.5" fill="none" />
      <path d="M 62 40 Q 64 38 62 36" stroke="#E0B0FF" strokeWidth="1.5" fill="none" />
      {/* Nose */}
      <circle cx="50" cy="49" r="1.5" fill="#FF69B4" />
      {/* Glowing particles */}
      <circle cx="30" cy="45" r="1.5" fill="#E0B0FF" opacity="0.7" />
      <circle cx="70" cy="45" r="1.5" fill="#E0B0FF" opacity="0.7" />
      <circle cx="35" cy="55" r="1" fill="#E0B0FF" opacity="0.5" />
      <circle cx="65" cy="55" r="1" fill="#E0B0FF" opacity="0.5" />
    </svg>
  )
}

// Cat Rare - Rare cat with sparkles
function CatRare() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#4169E1" opacity="0.3" />
      {/* Body */}
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#4169E1" />
      {/* Head */}
      <circle cx="50" cy="45" r="13" fill="#4169E1" />
      {/* Eyes */}
      <circle cx="45" cy="44" r="2.5" fill="#87CEEB" />
      <circle cx="55" cy="44" r="2.5" fill="#87CEEB" />
      <circle cx="45" cy="43" r="1" fill="#FFF" />
      <circle cx="55" cy="43" r="1" fill="#FFF" />
      {/* Ears */}
      <path d="M 40 38 L 37 30 L 43 36 Z" fill="#4169E1" />
      <path d="M 60 38 L 63 30 L 57 36 Z" fill="#4169E1" />
      {/* Nose */}
      <circle cx="50" cy="49" r="1.5" fill="#FF69B4" />
      {/* Sparkles */}
      <path d="M 30 40 L 31 37 L 32 40 L 35 41 L 32 42 L 31 45 L 30 42 L 27 41 Z" fill="#87CEEB" />
      <path d="M 70 40 L 71 37 L 72 40 L 75 41 L 72 42 L 71 45 L 70 42 L 67 41 Z" fill="#87CEEB" />
      <circle cx="35" cy="55" r="1.5" fill="#87CEEB" />
      <circle cx="65" cy="55" r="1.5" fill="#87CEEB" />
      <circle cx="50" cy="30" r="1" fill="#87CEEB" />
    </svg>
  )
}

// Cat Common - Common cat (simple)
function CatCommon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="50" cy="70" rx="18" ry="8" fill="#A0A0A0" opacity="0.3" />
      {/* Body */}
      <ellipse cx="50" cy="60" rx="16" ry="13" fill="#A0A0A0" />
      {/* Head */}
      <circle cx="50" cy="45" r="12" fill="#A0A0A0" />
      {/* Simple eyes */}
      <circle cx="45" cy="44" r="2" fill="#2C2C2C" />
      <circle cx="55" cy="44" r="2" fill="#2C2C2C" />
      {/* Ears */}
      <path d="M 40 38 L 37 30 L 43 36 Z" fill="#A0A0A0" />
      <path d="M 60 38 L 63 30 L 57 36 Z" fill="#A0A0A0" />
      {/* Nose */}
      <circle cx="50" cy="48" r="1.3" fill="#FF69B4" />
      {/* Simple mouth */}
      <path d="M 46 50 Q 50 52 54 50" stroke="#2C2C2C" strokeWidth="1" fill="none" />
    </svg>
  )
}
