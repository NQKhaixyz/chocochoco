import React from 'react'

type Colorway = 'candy' | 'ocean' | 'sunset' | 'lilac' | 'forest'

const ORDER: Colorway[] = ['candy', 'ocean', 'sunset', 'lilac', 'forest']

function getStoredColorway(): Colorway | null {
  try {
    const v = localStorage.getItem('colorway')
    if (ORDER.includes(v as Colorway)) return v as Colorway
  } catch {}
  return null
}

function applyColorway(next: Colorway) {
  document.documentElement.setAttribute('data-colorway', next)
}

function label(c: Colorway) {
  switch (c) {
    case 'candy':
      return 'Candy'
    case 'ocean':
      return 'Ocean'
    case 'sunset':
      return 'Sunset'
    case 'lilac':
      return 'Lilac'
    case 'forest':
      return 'Forest'
  }
}

export default function PaletteToggle() {
  const [colorway, setColorway] = React.useState<Colorway>(() => getStoredColorway() ?? 'candy')

  React.useEffect(() => {
    try {
      localStorage.setItem('colorway', colorway)
    } catch {}
    applyColorway(colorway)
  }, [colorway])

  function cycle() {
    const idx = ORDER.indexOf(colorway)
    const nextIndex = (idx + 1) % ORDER.length
    const next = ORDER[nextIndex] ?? 'candy'
    setColorway(next)
  }

  const swatch: Record<Colorway, string> = {
    candy: 'from-pastel-pink via-pastel-mint to-pastel-blue',
    ocean: 'from-pastel-blue via-brand to-accent-strong',
    sunset: 'from-accent via-brand to-pastel-yellow',
    lilac: 'from-pastel-lilac via-accent to-pastel-pink',
    forest: 'from-pastel-mint via-brand to-pastel-yellow',
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-2 md:px-3 py-1 text-sm shadow-soft transition hover:-translate-y-[1px] hover:shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      title={`Theme: ${label(colorway)}`}
      aria-label={`Switch colorway (current: ${label(colorway)})`}
    >
      <span
        aria-hidden
        className={`h-4 w-6 rounded-md bg-gradient-to-r ${swatch[colorway]} shadow-inner`}
      />
      <span className="hidden md:inline">{label(colorway)}</span>
    </button>
  )
}
