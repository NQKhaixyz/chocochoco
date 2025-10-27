import React from 'react'
import ThemeToggle from './ThemeToggle'
import PaletteToggle from './PaletteToggle'
import SoundToggle from './SoundToggle'
import { ConnectButton } from './ConnectButton'
import { Icon } from './ui/Icon'

export default function SettingsMenu() {
  const [open, setOpen] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!panelRef.current) return
      const target = e.target as Node
      if (!panelRef.current.contains(target)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', onDocClick)
      document.addEventListener('keydown', onKey)
    }
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open settings"
      >
        <Icon name="settings" className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-surface p-4 shadow-float">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-strong">Appearance</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <PaletteToggle />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-strong">Sound</p>
            <SoundToggle />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-strong">Wallet</p>
            <div className="rounded-xl border border-border bg-surface-subtle px-3 py-2">
              <ConnectButton />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

