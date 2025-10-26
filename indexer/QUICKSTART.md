# Quick Start with Docker PostgreSQL

## Start Docker Desktop first
1. Open **Docker Desktop** from the Start Menu
2. Wait for "Docker Desktop is running" message

## Then run these commands:

```powershell
# Start PostgreSQL container
docker run --name chocochoco-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=chocochoco_indexer `
  -p 5432:5432 `
  -d postgres:14

# Update indexer configuration
cd indexer
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chocochoco_indexer"
(Get-Content .env) -replace 'DATABASE_URL=.*', 'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chocochoco_indexer' | Set-Content .env

# Run migrations and start
pnpm migrate
pnpm dev
```

The indexer will now be running and listening for Solana events!

## API Endpoints
- `http://localhost:3001/health` - Health check
- `http://localhost:3001/leaderboard/top-payout` - Top players by payout
- `http://localhost:3001/leaderboard/weekly-winrate` - Weekly win rates
- `http://localhost:3001/rounds` - All rounds
- `http://localhost:3001/player/:address/rounds` - Player's rounds
