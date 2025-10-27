# Indexer Deployment Guide

This guide covers building and deploying the ChocoChoco Indexer API.

## Artifacts
- Build outputs in `indexer/dist/` (TypeScript → JS)
- Health endpoints: `GET /health`, `GET /ready`
- Migrations: `pnpm --filter @chocochoco/indexer migrate`

## 1) Environment

Copy and edit production variables:

```bash
cd indexer
cp .env.production .env
```

Key variables:

```bash
CLUSTER=devnet|testnet|mainnet-beta
PROGRAM_ID=<program_pubkey>
RPC_WS_URL=wss://api.devnet.solana.com
RPC_HTTP_URL=https://api.devnet.solana.com
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chocochoco_indexer
PORT=3001
CORS_ORIGINS=https://your-frontend-domain
```

## 2) Database

Dockerized Postgres:

```bash
docker run --name chocochoco-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=chocochoco_indexer \
  -p 5432:5432 -d postgres:14

pnpm --filter @chocochoco/indexer migrate
```

## 3) Build & Run

```bash
pnpm --filter @chocochoco/indexer build
pnpm --filter @chocochoco/indexer start
```

Health checks:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/ready
```

## 4) Docker

Build and run:

```bash
cd indexer
docker build -t chocochoco-indexer -f Dockerfile ..
docker run --rm -p 3001:3001 --env-file .env.production chocochoco-indexer
```

Compose with Postgres:

```bash
docker compose up -d --build
```

## 5) PM2

```bash
npm i -g pm2
pnpm --filter @chocochoco/indexer build
pm2 start dist/index.js --name chocochoco-indexer
pm2 save && pm2 startup
```

## 6) systemd

Example unit file:

```ini
[Unit]
Description=ChocoChoco Indexer
After=network.target postgresql.service

[Service]
Type=simple
User=chocochoco
WorkingDirectory=/opt/chocochoco/indexer
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Reload and enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable chocochoco-indexer
sudo systemctl start chocochoco-indexer
```

## 7) Troubleshooting
- `/ready` returns 503 → check DB and RPC URLs
- Port in use → choose another `PORT` or free the port
- Migrations fail → ensure DB is reachable, correct credentials

