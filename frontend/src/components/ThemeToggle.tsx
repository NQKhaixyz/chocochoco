import React from 'react'

type Theme = 'light' | 'dark'

function getSystemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem('theme')
    if (v === 'light' || v === 'dark') return v
  } catch {}
  return null
}

function applyTheme(theme: Theme) {
  const isDark = theme === 'dark'
  document.documentElement.classList.toggle('dark', isDark)
}

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>(() => {
    const stored = getStoredTheme()
    if (stored) return stored
    return getSystemPrefersDark() ? 'dark' : 'light'
  })

  React.useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
    } catch {}
    applyTheme(theme)
    try {
      const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
      if (meta) meta.setAttribute('content', theme === 'dark' ? '#101012' : '#fffdfc')
    } catch {}
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`shrink-0 inline-flex items-center gap-2 whitespace-nowrap px-2 md:px-3 py-1 rounded-xl border shadow-soft transition ${
        isDark ? 'bg-pastel-blue' : 'bg-pastel-yellow'
      }`}
      title={isDark ? 'Dark mode' : 'Light mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span aria-hidden>{isDark ? '🌙' : '☀️'}</span>
      <span className="hidden md:inline">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  )
}
