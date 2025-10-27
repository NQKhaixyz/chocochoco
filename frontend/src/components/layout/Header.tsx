import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import SoundToggle from '../SoundToggle'
import OnboardingToggle from '../OnboardingToggle'
import { ConnectButton } from '../ConnectButton'
import { Icon } from '../ui/Icon'
import { cn } from '../../lib/cn'

const ENABLE_ADMIN = (import.meta.env.VITE_ENABLE_ADMIN as string | undefined) === 'true'

type NavItem = { to: string; label: string; icon: Parameters<typeof Icon>[0]['name']; exact?: boolean }

const baseItems: NavItem[] = [
  { to: '/join', label: 'Join', icon: 'sparkles' },
  { to: '/reveal', label: 'Reveal', icon: 'timer' },
  { to: '/claim', label: 'Claim', icon: 'treasury' },
  { to: '/rounds', label: 'Rounds', icon: 'history' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'trophy' },
]

export const navItems: NavItem[] = ENABLE_ADMIN ? [...baseItems, { to: '/admin', label: 'Admin', icon: 'dashboard' }] : baseItems

export function Header() {
  const [open, setOpen] = useState(false)

  function close() {
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface-subtle/95 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-semibold text-fg" onClick={close}>
          <img src="/assets/icons/cat.svg" alt="ChocoCat" className="h-7 w-7" />
          ChocoChoco
        </NavLink>
        <nav className="hidden items-center gap-3 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted transition hover:text-fg',
                  isActive && 'bg-surface text-fg shadow-soft',
                )
              }
            >
              <Icon name={item.icon} className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {import.meta.env.DEV ? (
            <NavLink
              to="/styleguide"
              className={({ isActive }) =>
                cn(
                  'hidden items-center gap-1 rounded-full bg-brand/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-strong hover:bg-brand/45 md:flex',
                  isActive && 'bg-brand/60',
                )
              }
            >
              Styleguide
            </NavLink>
          ) : null}
          <SoundToggle />
          <OnboardingToggle />
          <div className="hidden md:flex">
            <ConnectButton />
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <span className="sr-only">Toggle navigation</span>
            <Icon name={open ? 'close' : 'menu'} className={cn('h-4 w-4', open && 'rotate-90 transition')} />
          </button>
        </div>
      </div>
      {open ? (
        <nav className="md:hidden">
          <div className="container flex flex-col gap-2 pb-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={close}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-muted transition hover:text-fg',
                    isActive && 'border-brand bg-brand/20 text-fg',
                  )
                }
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
            {import.meta.env.DEV ? (
              <NavLink
                to="/styleguide"
                onClick={close}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl border border-brand/45 bg-brand/25 px-4 py-3 text-sm font-semibold text-brand-strong transition hover:bg-brand/35',
                    isActive && 'bg-brand/55 text-slate-900',
                  )
                }
              >
                <Icon name="sparkles" className="h-4 w-4" />
                Styleguide
              </NavLink>
            ) : null}
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <ConnectButton />
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
