# ChocoChoco Frontend

Vite + React + TypeScript + Tailwind + ESLint/Prettier + wagmi v2 + viem. Includes WalletConnect and a simple network switch (Base Sepolia / Polygon Mumbai).

## Commands

```bash
pnpm i
cp .env.example .env
pnpm dev
```

- Build: `pnpm build`
- Preview: `pnpm preview`
- Lint: `pnpm lint`
- Format: `pnpm format`

## Configure

Fill `.env`:

```
VITE_BASE_SEPOLIA_RPC=...
VITE_POLYGON_MUMBAI_RPC=...
VITE_WALLETCONNECT_PROJECT_ID=...
VITE_RPC_URL=...
VITE_CHAIN_ID=84532
VITE_CONTRACT_ADDRESS=0x...
VITE_TREASURY_ADDRESS=0x...
VITE_SUBGRAPH_URL=https://api.studio.thegraph.com/query/<slug>/<version>
```

## Features

- Connect wallet (Injected / WalletConnect)
- Switch between Base Sepolia (84532) and Polygon Mumbai (80001)
- Show address and balance for the active network

## Theme & UX

- Pastel theme via CSS variables in `src/styles/theme.css` and Tailwind tokens (brand, accent, card, border, win/lose)
- Dark mode supported by toggling `class="dark"` on `<html>`
- Cat icon in Navbar and empty-states: `/assets/icons/cat.svg`

## Sound toggle

- Global sound context in `src/context/sound.tsx`
- Toggle component in Navbar (`SoundToggle`) persists to `localStorage`
- Place `purr.mp3` (<=200KB) under `public/assets/sfx/`

## Leaderboard (Subgraph)

- Env: `VITE_SUBGRAPH_URL`
- Route: `/leaderboard`
- Tables:
  - Top Payout: aggregates Claims by player (client-side)
  - Weekly Win-Rate: last 7 days from PlayerRounds (revealed=true), compares `side` with `round.winnerSide`
- Pagination: prev/next via first/skip; Next enabled only when a page returns full `pageSize`.

## Landing & Onboarding
- Landing: route `/landing` (CTA “Play on Testnet” → `/app`).
- Docs links: README, DESIGN.md, SPRINT_PLAN.md (configurable via env if desired).
- In‑app tips: toggle in Navbar (persisted via localStorage).
- Coach marks: 3 steps (Commit → Reveal → Claim), lightweight overlay.
