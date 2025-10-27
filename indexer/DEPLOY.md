# Indexer Deploy Guide (Backend)

This guide standardizes building and deploying the ChocoChoco Indexer API (Node.js + TypeScript).

## 1) Environment (Production)

Create `indexer/.env` from `.env.example` and fill:

```
CLUSTER=devnet                         # or testnet | mainnet-beta
PROGRAM_ID=J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz
RPC_WS_URL=wss://api.devnet.solana.com
RPC_HTTP_URL=https://api.devnet.solana.com

# Database (PostgreSQL recommended for prod)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chocochoco_indexer

# Server
PORT=3001
CORS_ORIGINS=https://your-frontend.example.com
LOG_LEVEL=info
AUTO_BACKFILL=true
```

Notes:
- Error code `28P01` means wrong Postgres password; fix `DATABASE_URL`.
- You can use SQLite for development: `DATABASE_URL=sqlite:./dev.db`.

## 2) Database

Run Postgres in Docker (recommended locally):

```
docker run --name chocochoco-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=chocochoco_indexer \
  -p 5432:5432 \
  -d postgres:14
```

Run migrations:

```
cd indexer
pnpm migrate
```

## 3) Build & Run (Production)

```
pnpm build
pnpm start
```

Verify health:

```
curl http://localhost:3001/health
# → { "status": "ok" }
```

## 4) Process Management

Options:
- PM2: `pm2 start dist/index.js --name chocochoco-indexer && pm2 save`
- systemd: see example service in `indexer/README.md`
- Docker: build a small runtime image and run as a container

## 5) Dockerfile (Optional)

Multi-stage example:

```
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm i --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/dist ./dist
RUN corepack enable && pnpm i --prod --frozen-lockfile
CMD ["node", "dist/index.js"]
```

## 6) Troubleshooting

- DB auth failed (`28P01`): fix password or use Docker Postgres with known creds.
- Rate limits/WS drops: consider Helius endpoints with API key.
- CORS blocked: set `CORS_ORIGINS` to include frontend domain.

