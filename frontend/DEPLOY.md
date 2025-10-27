# Frontend Deploy Guide

This guide standardizes building and deploying the ChocoChoco frontend (Vite + React).

## 1) Environment (Production)

Create `frontend/.env.production` from `.env.example` and fill:

```
VITE_SOLANA_CLUSTER=devnet # or testnet | mainnet-beta
VITE_PROGRAM_ID=J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_INDEXER_URL=https://your-indexer.example.com
VITE_STAKE_LAMPORTS=1000000
```

Notes:
- Prefer a reliable RPC (Helius/Alchemy) for production.
- Do not hardcode API URLs in code; always use `VITE_INDEXER_URL`.

## 2) Build & Smoke Test

```bash
pnpm i
pnpm build     # outputs dist/
pnpm preview   # smoke test locally
```

Verify:
- Wallet connect works (Phantom/Solflare).
- Leaderboard loads via `VITE_INDEXER_URL`.
- Commit/Reveal/Claim screens render and fetch config.

## 3) Host Static Files

Any static hosting works. Options:

- Vercel/Netlify: upload `dist/`.
- Nginx example:

```
server {
  listen 80;
  server_name your-frontend.example.com;
  root /var/www/chocochoco/frontend/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html; # SPA fallback
  }
}
```

## 4) CORS & Indexer

- If Indexer runs on another domain, allow the FE origin via `CORS_ORIGINS` in the Indexer `.env`.
- Example: `CORS_ORIGINS=https://your-frontend.example.com`

## 5) Troubleshooting

- Blank screen on refresh: ensure SPA fallback `try_files ... /index.html` is configured.
- API 403/blocked: configure CORS in Indexer.
- Wrong cluster/program: rebuild after changing env values.

