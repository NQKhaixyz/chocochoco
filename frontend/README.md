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

```bash
# Solana Configuration
VITE_SOLANA_CLUSTER=devnet
VITE_PROGRAM_ID=J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz
VITE_STAKE_LAMPORTS=1000000
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Indexer Service (for Leaderboard)
VITE_INDEXER_URL=http://localhost:3001

# EVM Legacy (optional)
VITE_BASE_SEPOLIA_RPC=...
VITE_POLYGON_MUMBAI_RPC=...
VITE_WALLETCONNECT_PROJECT_ID=...
VITE_RPC_URL=...
VITE_CHAIN_ID=84532
VITE_CONTRACT_ADDRESS=0x...
VITE_TREASURY_ADDRESS=0x...
```

## Deploy Frontend

- Prepare production env: `cp .env.production .env` and adjust values.
- Build artifacts: `pnpm build` → outputs `dist/`.
- Smoke test locally: `pnpm preview` and open `http://localhost:4173`.
- Ensure wallet connects and requests to `VITE_INDEXER_URL` succeed.

Deployment options:
- Vercel/Netlify: deploy the static `dist/` folder.
- Nginx (static):
  - Copy `dist/` to your server, e.g. `/var/www/chocochoco`.
  - Example Nginx server block:
    - `root /var/www/chocochoco;`
    - `try_files $uri /index.html;` for SPA routing.

Notes:
- Set `VITE_INDEXER_URL` to your deployed Indexer domain.
- For debugging production, sourcemaps are enabled in `vite.config.js`.

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

## Leaderboard (Solana Indexer)

**Data Source**: Solana Indexer REST API (not The Graph)

**Configuration**:
- Set `VITE_INDEXER_URL` in `.env` (e.g., `http://localhost:3001`)
- Start the indexer service: `cd ../indexer && pnpm dev`

**Route**: `/leaderboard`

**Features**:
- **Top Payout (All-time)**: Shows total SOL winnings per player
  - Columns: Rank | Player | Total (SOL)
  - Converts lamports to SOL (6 decimals)
  - Client-side pagination (50 per page)
  
- **Weekly Win-Rate (Last 7 days)**: Shows win percentage for the last 7 days
  - Columns: Rank | Player | Wins | Total | Win-Rate (%)
  - Win rate formatted to 1 decimal place
  - Client-side pagination (50 per page)

**API Endpoints Used**:
- `GET /leaderboard/top-payout?limit=50&offset=0`
- `GET /leaderboard/weekly-winrate?from=<unix>&limit=50&offset=0`
- `GET /stats/meta` (optional, for server time)

**Error Handling**:
- Loading skeletons while fetching
- Empty states with helpful messages
- Retry button on network errors
- Graceful fallback if indexer is unavailable

**Starting the Indexer**:
```bash
# In the indexer directory
cd ../indexer

# Start Docker Desktop first, then:
docker run --name chocochoco-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=chocochoco_indexer \
  -p 5432:5432 \
  -d postgres:14

# Run migrations and start
pnpm migrate
pnpm dev
```

The frontend will automatically connect to the indexer at `VITE_INDEXER_URL`.

## Landing & Onboarding
- Landing: route `/landing` (CTA “Play on Testnet” → `/app`).
- Docs links: README, DESIGN.md, SPRINT_PLAN.md (configurable via env if desired).
- In‑app tips: toggle in Navbar (persisted via localStorage).
- Coach marks: 3 steps (Commit → Reveal → Claim), lightweight overlay.
