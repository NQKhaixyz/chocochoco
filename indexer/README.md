# ChocoChoco Indexer

Solana event indexer for ChocoChoco game. Listens to Anchor program events, stores them in PostgreSQL, and exposes REST APIs for leaderboards and analytics.

## Features

- 🔊 **Real-time event listening** via WebSocket (`connection.onLogs`)
- 🎯 **Helius Streams support** (optional, for enhanced reliability)
- 🗄️ **PostgreSQL storage** with idempotent upserts and deduplication
- 📊 **REST APIs** for leaderboards and player stats
- 🔄 **Automatic backfill** on startup (configurable)
- 🛡️ **Reorg safety** via slot and block time tracking
- ⚡ **TypeScript** with full type safety

---

## Prerequisites

1. **Node.js** v20+
2. **PostgreSQL** v14+ (or SQLite for development)
3. **Solana CLI** (optional, for testing)
4. **pnpm** (or npm/yarn)

### Install PostgreSQL (if needed)

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

---

## Quick Start

### 1. Install Dependencies

```bash
cd indexer
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

**Required variables:**
```bash
CLUSTER=devnet
PROGRAM_ID=J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz
RPC_WS_URL=wss://api.devnet.solana.com
RPC_HTTP_URL=https://api.devnet.solana.com
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chocochoco_indexer
PORT=3001
```

### 3. Create Database

```bash
# Using psql
createdb chocochoco_indexer

# Or connect and create manually
psql -U postgres
CREATE DATABASE chocochoco_indexer;
\q
```

### 4. Run Migrations

```bash
pnpm migrate
```

This creates all tables: `rounds`, `player_rounds`, `claims`, `treasury_fees`, `indexer_state`.

### 5. Start Indexer

```bash
# Development (with auto-restart)
pnpm dev

# Production
pnpm build
pnpm start
```

**Expected output:**
```
🚀 Starting ChocoChoco Indexer...
✅ Database connection successful
✅ Migrations completed successfully
✅ Event decoder initialized
✅ API server started
✅ Event listener started
✅ ChocoChoco Indexer is running!
📊 API: http://localhost:3001
🔗 Cluster: devnet
🎯 Program: J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz
```

---

## API Endpoints

Base URL: `http://localhost:3001`

### Health & Readiness

```bash
GET /health   # basic uptime
GET /ready    # checks DB + RPC connectivity
```

Example /health:
```json
{ "status": "ok" }
```

Example /ready:
```json
{ "status": "ready", "database": "connected", "rpc": "connected" }
```

### Top Payout Leaderboard

```bash
GET /leaderboard/top-payout?limit=50
```

Response:
```json
[
  {
    "player": "PlayerWallet111111111111111111111111111",
    "totalPayout": "500000000",
    "totalClaims": 10,
    "lastClaim": "2025-10-26T11:30:00.000Z"
  }
]
```

### Weekly Win Rate Leaderboard

```bash
GET /leaderboard/weekly-winrate?from=1729900800
```

Response:
```json
[
  {
    "player": "PlayerWallet111111111111111111111111111",
    "wins": 7,
    "total": 10,
    "rate": 70.00
  }
]
```

### Get Recent Rounds

```bash
GET /rounds?limit=50
```

Response:
```json
[
  {
    "id": "RoundPDA111111111111111111111111111111",
    "roundNumber": "42",
    "commitEnd": "1729900800",
    "revealEnd": "1729902600",
    "stakeLamports": "1000000",
    "milkCount": 5,
    "cacaoCount": 3,
    "milkPool": "5000000",
    "cacaoPool": "3000000",
    "winnerSide": "cacao",
    "settled": true,
    "createdAt": "2025-10-26T10:00:00.000Z",
    "slot": "123456789",
    "txSig": "5J7X...",
    "blockTime": "1729900000"
  }
]
```

### Get Round by ID

```bash
GET /rounds/:id
```

Response includes aggregated stats:
```json
{
  "id": "RoundPDA111111111111111111111111111111",
  "roundNumber": "42",
  "totalPlayers": 8,
  "revealedPlayers": 8,
  "totalPool": "8000000",
  ...
}
```

### Get Player Rounds

```bash
GET /player/:address/rounds?limit=50
```

Response:
```json
[
  {
    "id": "PlayerRoundPDA11111111111111111111111",
    "roundId": "RoundPDA111111111111111111111111111111",
    "player": "PlayerWallet111111111111111111111111111",
    "side": "milk",
    "commitment": "abc123...",
    "stakeLamports": "1000000",
    "revealed": true,
    "claimed": true,
    "createdAt": "2025-10-26T10:00:00.000Z",
    "revealedAt": "2025-10-26T10:30:00.000Z",
    "slot": "123456789",
    "txSig": "5J7X...",
    "blockTime": "1729900000"
  }
]
```

---

## Database Schema

### Tables

**rounds:**
- Primary data for each game round
- Tracks commit/reveal deadlines, pools, winner side, settlement status

**player_rounds:**
- Individual player participation in rounds
- Stores commitment, revealed choice, stake amount, claim status

**claims:**
- Successful reward claims by winners
- De-duplicated by (tx_sig, log_index)

**treasury_fees:**
- Fee payments to treasury (3% crumb fee)
- De-duplicated by (tx_sig, log_index)

**indexer_state:**
- Tracks last processed slot/signature for crash recovery

See `schema.sql` for full schema with indexes and helper functions.

---

## Event Processing

### Supported Events

| Event | Description |
|-------|-------------|
| **RoundCreated** | New round initialized |
| **MeowCommitted** | Player commits choice |
| **MeowRevealed** | Player reveals true choice |
| **RoundMeowed** | Round settled, winner determined |
| **TreatClaimed** | Player claims rewards |
| **FeeCollected** | Treasury fee collected |

### Processing Flow

```
1. WebSocket receives logs → connection.onLogs(programId)
2. Fetch full transaction → connection.getParsedTransaction()
3. Decode events using Anchor IDL
4. Upsert to database (idempotent)
5. Update indexer_state with latest slot
```

### Idempotency

- **Rounds:** Upserted by `id` (PDA address)
- **PlayerRounds:** Upserted by `id` (round-player composite)
- **Claims:** Deduplicated by `(tx_sig, log_index)` unique constraint
- **TreasuryFees:** Deduplicated by `(tx_sig, log_index)` unique constraint

### Reorg Safety

- Tracks `slot` and `block_time` for all entities
- On startup, can reprocess recent slots if needed
- Configurable via `BACKFILL_SLOTS` environment variable

---

## Configuration

### Environment Variables

See `.env.example` for all variables.

**Solana:**
```bash
CLUSTER=devnet|testnet|mainnet-beta
PROGRAM_ID=<your_program_id>
RPC_WS_URL=wss://api.devnet.solana.com
RPC_HTTP_URL=https://api.devnet.solana.com
HELIUS_API_KEY=  # Optional
```

**Database:**
```bash
DATABASE_URL=postgresql://user:pass@host:port/database
# Or SQLite: DATABASE_URL=sqlite:./dev.db
```

**API Server:**
```bash
PORT=3001
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Indexer Behavior:**
```bash
BACKFILL_SLOTS=1000      # Number of slots to backfill on startup
AUTO_BACKFILL=true       # Run backfill automatically
LOG_LEVEL=info           # trace|debug|info|warn|error
MAX_RETRIES=5            # Retry attempts for RPC calls
RETRY_DELAY_MS=1000      # Delay between retries
```

### Helius Streams (Optional)

For production, use Helius Streams for enhanced reliability:

1. Sign up at https://helius.dev/
2. Create a webhook pointing to your indexer
3. Set `HELIUS_API_KEY` in `.env`
4. Configure `WEBHOOK_PATH` and `HELIUS_WEBHOOK_SECRET`

---

## Scripts

```bash
# Development
pnpm dev              # Start with auto-reload

# Build
pnpm build            # Compile TypeScript

# Production
pnpm start            # Run compiled code

# Database
pnpm migrate          # Run migrations
pnpm migrate:rollback # Rollback migrations
pnpm seed             # Seed test data (if implemented)

# Backfill
pnpm backfill         # Manually backfill recent data

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm test             # Run tests
```

---

## Deployment

### Docker (Recommended)

Build:

```bash
docker build -t chocochoco-indexer -f indexer/Dockerfile .
```

Run:

```bash
docker run -p 3001:3001 --env-file indexer/.env.production chocochoco-indexer
```

### Systemd Service (Linux)

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

```bash
sudo systemctl enable chocochoco-indexer
sudo systemctl start chocochoco-indexer
sudo systemctl status chocochoco-indexer
```

### PM2 (Node.js Process Manager)

```bash
pm2 start dist/index.js --name chocochoco-indexer
pm2 save
pm2 startup
```

---

## Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d chocochoco_indexer

# Check DATABASE_URL format
# postgresql://username:password@localhost:5432/database
```

### WebSocket Connection Errors

```bash
# Test RPC endpoint
curl https://api.devnet.solana.com

# Try alternative RPC
RPC_WS_URL=wss://solana-devnet.g.alchemy.com/v2/YOUR-API-KEY
```

### IDL Not Found

```bash
# Ensure IDL exists at indexer/idl/chocochoco_game.json
# Or the indexer will try to fetch from chain

# Manually fetch IDL
anchor idl fetch <PROGRAM_ID> --provider.cluster devnet > idl/chocochoco_game.json
```

### Events Not Processing

```bash
# Check program is deployed
solana program show <PROGRAM_ID> --url devnet

# Check indexer logs
LOG_LEVEL=debug pnpm dev

# Verify program ID matches
echo $PROGRAM_ID
```

### Backfill Taking Too Long

```bash
# Reduce backfill slots
BACKFILL_SLOTS=100 pnpm dev

# Or disable auto-backfill
AUTO_BACKFILL=false pnpm dev
```

### Rate Limiting (429 Errors)

```bash
# Use paid RPC provider
RPC_HTTP_URL=https://rpc.helius.xyz/?api-key=YOUR-KEY
RPC_WS_URL=wss://rpc.helius.xyz/?api-key=YOUR-KEY

# Or implement exponential backoff (already included)
MAX_RETRIES=10
RETRY_DELAY_MS=2000
```

---

## Development

### Project Structure

```
indexer/
├── src/
│   ├── api/              # REST API server
│   │   └── server.ts
│   ├── db/               # Database layer
│   │   ├── pool.ts
│   │   ├── repository.ts
│   │   └── migrate.ts
│   ├── decoder/          # Anchor event decoder
│   │   └── index.ts
│   ├── listener/         # Event listener
│   │   ├── index.ts
│   │   └── processor.ts
│   ├── cli/              # CLI tools
│   │   └── backfill.ts
│   ├── config.ts         # Environment config
│   ├── logger.ts         # Pino logger
│   ├── types.ts          # TypeScript types
│   └── index.ts          # Main entry point
├── idl/                  # Anchor IDL files
├── schema.sql            # Database schema
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Event Types

1. **Define event type** in `src/types.ts`
2. **Add parser** in `src/decoder/index.ts`
3. **Add processor** in `src/listener/processor.ts`
4. **Update schema** if new entity needed

### Testing

```bash
# Unit tests (coming soon)
pnpm test

# Integration test against devnet
1. Deploy test transactions
2. Check database for correct data
3. Query API endpoints
```

---

## Performance

### Benchmarks (Devnet)

- **Event processing:** ~10ms per transaction
- **API response time:** <50ms (with indexes)
- **Database writes:** ~100 upserts/second
- **WebSocket latency:** ~500ms from tx confirmation

### Optimization Tips

1. **Use connection pooling** (already configured)
2. **Add database indexes** for frequently queried fields
3. **Enable materialized views** for leaderboards:
   ```sql
   REFRESH MATERIALIZED VIEW leaderboard_top_payout;
   ```
4. **Use Helius Streams** instead of WebSocket polling
5. **Increase RPC rate limits** with paid provider

---

## Monitoring

### Health Check Endpoint

```bash
# Add to monitoring tool (Uptime Robot, Pingdom, etc.)
curl http://localhost:3001/health
```

### Logs

```bash
# View real-time logs
pnpm dev

# Production logs with PM2
pm2 logs chocochoco-indexer

# Systemd logs
journalctl -u chocochoco-indexer -f
```

### Metrics (Future)

- Prometheus `/metrics` endpoint
- Grafana dashboards
- Alert on indexer lag (slot difference)

---

## License

MIT

---

## Support

- **GitHub Issues:** https://github.com/NQKhaixyz/chocochoco/issues
- **Discord:** Coming soon
- **Documentation:** https://github.com/NQKhaixyz/chocochoco/tree/main/docs

---

**Built with ❤️ for the ChocoChoco community**
