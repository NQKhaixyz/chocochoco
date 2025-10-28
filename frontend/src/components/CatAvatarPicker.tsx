import React, { useState } from 'react'
import { CatIllustration } from './CatIllustration'
import { Button } from './ui/Button'
import { cn } from '../lib/cn'

type CatType = 
  | 'stack' | 'sleep' | 'play' | 'milk' | 'cacao' | 'winner' | 'thinking' 
  | 'sitting' | 'stretch' | 'paw' | 'box' | 'yarn'
  | 'happy' | 'sad' | 'angry' | 'surprised' | 'tired' | 'excited' | 'victorious'
  | 'eating' | 'grooming' | 'hunting' | 'walking' | 'jumping' | 'running'
  | 'hat' | 'glasses' | 'scarf' | 'crown' | 'bowtie' | 'bandana'
  | 'christmas' | 'halloween' | 'birthday' | 'valentine'
  | 'legendary' | 'epic' | 'rare' | 'common'

interface CatAvatarPickerProps {
  selectedCat?: CatType
  onSelect: (catType: CatType) => void
  onClose?: () => void
}

const catCategories = {
  'Basic': ['stack', 'sleep', 'play', 'milk', 'cacao', 'winner', 'thinking', 'sitting', 'stretch', 'paw', 'box', 'yarn'] as CatType[],
  'Emotions': ['happy', 'sad', 'angry', 'surprised', 'tired', 'excited', 'victorious'] as CatType[],
  'Actions': ['eating', 'grooming', 'hunting', 'walking', 'jumping', 'running'] as CatType[],
  'Accessories': ['hat', 'glasses', 'scarf', 'crown', 'bowtie', 'bandana'] as CatType[],
  'Seasonal': ['christmas', 'halloween', 'birthday', 'valentine'] as CatType[],
  'Rarity': ['common', 'rare', 'epic', 'legendary'] as CatType[],
}

const catNames: Record<CatType, string> = {
  stack: 'Cat Stack',
  sleep: 'Sleeping',
  play: 'Playing',
  milk: 'Milk Lover',
  cacao: 'Cacao Lover',
  winner: 'Winner',
  thinking: 'Thinking',
  sitting: 'Sitting',
  stretch: 'Stretching',
  paw: 'Waving',
  box: 'In a Box',
  yarn: 'Yarn Player',
  happy: 'Happy',
  sad: 'Sad',
  angry: 'Angry',
  surprised: 'Surprised',
  tired: 'Tired',
  excited: 'Excited',
  victorious: 'Victorious',
  eating: 'Eating',
  grooming: 'Grooming',
  hunting: 'Hunting',
  walking: 'Walking',
  jumping: 'Jumping',
  running: 'Running',
  hat: 'With Hat',
  glasses: 'With Glasses',
  scarf: 'With Scarf',
  crown: 'Royal',
  bowtie: 'Gentleman',
  bandana: 'Cool Cat',
  christmas: 'Christmas',
  halloween: 'Halloween',
  birthday: 'Birthday',
  valentine: 'Valentine',
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

export function CatAvatarPicker({ selectedCat, onSelect, onClose }: CatAvatarPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof catCategories>('Basic')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-surface shadow-float">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-surface-subtle/80 backdrop-blur-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-fg">Choose Your Cat Avatar</h2>
              <p className="mt-1 text-sm text-muted">Select a cat that represents you!</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-full p-2 transition hover:bg-surface-subtle"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(catCategories) as Array<keyof typeof catCategories>).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  activeCategory === category
                    ? 'bg-brand text-on-brand shadow-md'
                    : 'bg-surface-subtle text-muted hover:bg-surface hover:text-fg'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Cat Grid */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {catCategories[activeCategory].map((catType) => (
              <button
                key={catType}
                onClick={() => onSelect(catType)}
                className={cn(
                  'group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition',
                  selectedCat === catType
                    ? 'border-brand bg-brand/10 shadow-lg'
                    : 'border-border bg-surface-subtle hover:border-brand/50 hover:bg-surface hover:shadow-md'
                )}
              >
                <div className="relative h-20 w-20">
                  <CatIllustration type={catType} size="lg" />
                  {selectedCat === catType && (
                    <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-on-brand shadow-md">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-muted-strong transition group-hover:text-fg">
                  {catNames[catType]}
                </span>

                {/* Rarity indicator */}
                {activeCategory === 'Rarity' && (
                  <div
                    className={cn(
                      'absolute right-2 top-2 h-2 w-2 rounded-full',
                      catType === 'legendary' && 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]',
                      catType === 'epic' && 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]',
                      catType === 'rare' && 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]',
                      catType === 'common' && 'bg-gray-400'
                    )}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-border bg-surface-subtle/80 backdrop-blur-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              {selectedCat ? `Selected: ${catNames[selectedCat]}` : 'No cat selected'}
            </p>
            <div className="flex gap-3">
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button
                variant="primary"
                onClick={onClose}
                disabled={!selectedCat}
                rightIcon="sparkles"
              >
                Confirm Selection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
