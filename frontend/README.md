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
```

## Features

- Connect wallet (Injected / WalletConnect)
- Switch between Base Sepolia (84532) and Polygon Mumbai (80001)
- Show address and balance for the active network
