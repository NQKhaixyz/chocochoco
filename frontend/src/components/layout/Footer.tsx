import React from 'react'

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-surface py-6 text-sm text-muted">
      <div className="container flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
        <span>© {new Date().getFullYear()} ChocoChoco Labs · Testnet only</span>
        <div className="flex gap-4 text-xs uppercase tracking-[0.2em]">
          <a href="https://github.com/chocochoco-labs" target="_blank" rel="noreferrer" className="hover:text-fg">
            Github
          </a>
          <a href="https://docs.chocochoco.xyz" className="hover:text-fg">
            Docs
          </a>
          <a href="mailto:team@chocochoco.xyz" className="hover:text-fg">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}

