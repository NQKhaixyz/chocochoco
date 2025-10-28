import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import SoundToggle from './SoundToggle'
import OnboardingToggle from './OnboardingToggle'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/profile', label: 'Profile' },
    { href: '/rounds', label: 'Rounds' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-card backdrop-blur border-b border-border">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 md:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="font-semibold text-lg flex items-center gap-2">
            <img src="/assets/icons/cat.svg" alt="ChocoCat" className="h-6 w-6" />
            <span className="hidden sm:inline">ChocoChoco</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted hover:text-fg transition"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-3">
            <SoundToggle />
            <OnboardingToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-border pt-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-base text-muted hover:text-fg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <SoundToggle />
              <OnboardingToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
