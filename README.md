# ChocoChoco — On-Chain Minority Game (Commit–Reveal)

> **In a world of sweets, only the fewest get the feast.**  
> Thế giới ngọt ngào, ai ít hơn… ăn nhiều hơn!

🎮 **Solana-powered** minority game where players stake, commit their choice (Milk 🍼 or Cacao 🍫), reveal, and the **minority side wins** the pool!

📚 **Documentation:** [DESIGN.md](./DESIGN.md) · [SPRINT_PLAN.md](./SPRINT_PLAN.md) · [SPRINT_PLAN_S3.md](./SPRINT_PLAN_S3.md)  
🔧 **Scripts Guide:** [scripts/README.md](./scripts/README.md)

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Quick Start](#3-quick-start)
4. [Solana Program Development](#4-solana-program-development)
5. [Frontend Development](#5-frontend-development)
6. [Deployment Guide](#6-deployment-guide)
7. [Gameplay Flow](#7-gameplay-flow)
8. [Architecture](#8-architecture)
9. [Troubleshooting](#9-troubleshooting)
10. [Contributing](#10-contributing)

---

## 1. Overview

**ChocoChoco** is an on-chain **minority game** built on Solana using the **commit-reveal pattern** to ensure fairness and prevent front-running.

### Tech Stack

**Primary (Solana):**
- 🦀 **Program:** Anchor Framework (Rust)
- ⚛️ **Frontend:** React 19 + TypeScript + Vite
- 🎨 **Styling:** Tailwind CSS 3.4
- 🔗 **Web3:** @solana/web3.js + @solana/wallet-adapter
- 🌐 **Network:** Devnet/Testnet/Mainnet-beta

**Legacy (EVM - Optional):**
- 📜 Solidity 0.8.x with Foundry
- 🌉 Base Sepolia, Polygon Amoy

### Game Mechanics

1. **Commit Phase:** Players stake SOL and submit a hidden commitment (hash of choice + salt)
2. **Reveal Phase:** Players reveal their true choice (Milk 🍼 or Cacao 🍫) with the salt
3. **Settlement:** Minority side wins! Winners split the pool minus a small crumb fee (3%)
4. **Claim:** Winners claim their rewards; UI prevents double-claiming

**Key Features:**
- 🛡️ MEV-resistant (commit-reveal)
- ⚡ Efficient on-chain logic (no loops, pull-payment pattern)
- 🔐 Secure (reentrancy guards, CEI pattern)
- 📊 Indexable events for analytics

---

## 2. Prerequisites

### Required Tools

1. **Node.js & Package Manager**
   ```bash
   # Node.js LTS (v20+)
   node --version  # Should be v20+
   
   # pnpm (recommended)
   npm install -g pnpm
   pnpm --version  # Should be 8.0+
   ```

2. **Solana CLI** (for program deployment)
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   solana --version  # Should be 1.18+
   ```

3. **Anchor CLI** (for program development)
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli
   anchor --version  # Should be 0.29.0+
   ```

4. **Rust** (if building from source)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup --version
   ```

### Optional Tools (for EVM legacy support)

- **Foundry** for Solidity contracts:
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```

### Wallet Requirements

- **Solana:** Phantom, Solflare, or any Solana wallet with devnet/testnet SOL
- **EVM (legacy):** MetaMask or WalletConnect-compatible wallet

---

## 3. Quick Start

### 3.1 Clone & Install

```bash
# Clone repository
git clone https://github.com/NQKhaixyz/chocochoco.git
cd chocochoco

# Install all dependencies (monorepo)
pnpm install
```

### 3.2 Configure Environment

```bash
# Frontend environment
cd frontend
cp .env.example .env

# Edit .env with your values (see next section)
```

**Required Frontend Variables:**

```bash
# Solana Configuration
VITE_SOLANA_CLUSTER=devnet              # devnet | testnet | mainnet-beta
VITE_PROGRAM_ID=J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz  # Your deployed program
VITE_STAKE_LAMPORTS=1000000             # Default stake (0.001 SOL)

# Optional: Custom RPC
VITE_SOLANA_RPC_URL=                    # Leave empty to use cluster default
```

💡 **Tip:** After deploying your program, `scripts/solana-deploy.sh` will **automatically update** `VITE_PROGRAM_ID` in your `.env`!

### 3.3 Start Development

```bash
# Frontend only (connects to existing deployed program)
cd frontend
pnpm dev
# Open http://localhost:5173
```

**OR use task-based workflow:**

```bash
# Automatically updates issue status (S1.11)
pnpm task:s1_11:start  # Marks issue "in-progress" & starts dev server
# ... make changes ...
pnpm task:s1_11:done   # Marks issue "done"
```

---

## 4. Solana Program Development

### 4.1 Setup Solana Configuration

The deploy scripts automatically read from your Solana CLI config (no `.env` needed for scripts!):

```bash
# Check current config
solana config get

# Set cluster (devnet recommended for testing)
solana config set --url devnet

# Check your balance
solana balance

# Airdrop SOL if needed (devnet/testnet only)
solana airdrop 2
```

### 4.2 Build Program

```bash
cd contracts  # Or wherever your Anchor program is

# Build with Anchor
anchor build

# Output: target/deploy/your_program.so & target/idl/your_program.json
```

### 4.3 Run Tests

```bash
# Unit tests
anchor test

# Integration tests (requires local validator)
anchor test --skip-local-validator  # If validator already running
```

### 4.4 Local Development with Validator

```bash
# Terminal 1: Start local validator
solana-test-validator

# Terminal 2: Deploy to local
anchor deploy --provider.cluster localnet

# Terminal 3: Run tests
anchor test --skip-deploy
```

---

## 5. Frontend Development

### 5.1 Project Structure

```
frontend/
├── src/
│   ├── components/          # UI components
│   │   ├── SolanaConnect.tsx        # Wallet connection
│   │   ├── SolanaClaimPanel.tsx     # Claim rewards
│   │   ├── SolanaCountdown.tsx      # Time countdown
│   │   └── RevealForm.tsx           # Reveal screen
│   ├── hooks/               # Custom React hooks
│   │   ├── useSolanaTime.ts         # Chain time sync
│   │   ├── useCountdown.ts          # Countdown logic
│   │   └── useSolanaEvents.ts       # Event subscriptions
│   ├── lib/                 # Utilities
│   │   ├── time-format.ts           # Time formatting
│   │   ├── player-round.ts          # State parsing
│   │   └── pda.ts                   # PDA derivation
│   ├── solana/              # Solana integration
│   │   ├── program.ts               # Program instance
│   │   └── instructions.ts          # Instruction builders
│   └── styles/              # CSS & theming
└── public/assets/           # Static assets
```

### 5.2 Development Commands

```bash
cd frontend

# Development server (hot reload)
pnpm dev               # Starts on localhost:5173

# Type checking
pnpm type-check        # Or: tsc --noEmit

# Linting
pnpm lint

# Build for production
pnpm build             # Output: dist/

# Preview production build
pnpm preview
```

### 5.3 Task-Based Development (Sprint Workflow)

Each Sprint 1 task has dedicated scripts that auto-update issue status:

```bash
# S1.5 - FE Project Setup
pnpm task:s1_5:start  # Mark in-progress, start dev
pnpm task:s1_5:done   # Mark done

# S1.6 - Join/Commit Screen
pnpm task:s1_6:start
pnpm task:s1_6:done

# S1.7 - Reveal Screen
pnpm task:s1_7:start
pnpm task:s1_7:done

# S1.8 - Claim Screen
pnpm task:s1_8:start
pnpm task:s1_8:done

# S1.9 - Countdown & Helpers
pnpm task:s1_9:start
pnpm task:s1_9:done

# S1.10 - Env & Config
pnpm task:s1_10:start
pnpm task:s1_10:done

# S1.11 - Docs & Runbook (current)
pnpm task:s1_11:start
pnpm task:s1_11:done
```

These scripts use `scripts/update-issue-status.mjs` to automatically update `docs/issues/*.md` files.

---

## 6. Deployment Guide

### 6.1 Deploy to Devnet (Recommended First Step)

```bash
# From repo root, ensure you have SOL balance
solana balance  # Should show at least 2 SOL on devnet

# Deploy program + publish IDL + update frontend/.env automatically!
chmod +x scripts/solana-deploy.sh
scripts/solana-deploy.sh devnet
```

**What happens:**
1. ✅ Builds program with `anchor build`
2. ✅ Uses your `solana config` for cluster/wallet
3. ✅ Deploys program to devnet
4. ✅ Publishes IDL on-chain (`anchor idl init`)
5. ✅ Saves deployment info to `solana/deployments.json`
6. ✅ **Automatically updates `frontend/.env`**:
   - Sets `VITE_SOLANA_CLUSTER=devnet`
   - Sets `VITE_PROGRAM_ID=<your_deployed_program_id>`

### 6.2 Verify Deployment

```bash
chmod +x scripts/solana-verify.sh

# Verify latest deployment (reads from solana/deployments.json)
scripts/solana-verify.sh devnet

# Or verify specific program ID
scripts/solana-verify.sh devnet YourProgramId111111...
```

**Output example:**
```
🔍 Verifying program deployment on devnet...
Program Id: J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz
Authority: YourWalletAddress11111111111111111
Balance: 0.5 SOL
Executable Data Length: 123456 bytes

✅ Program ID matches frontend/.env
✅ IDL found on-chain!
📊 Explorer: https://explorer.solana.com/address/J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz?cluster=devnet
```

### 6.3 Deploy to Testnet

```bash
# Switch cluster
solana config set --url testnet
solana airdrop 2

# Deploy (same command, different cluster)
scripts/solana-deploy.sh testnet
scripts/solana-verify.sh testnet
```

### 6.4 Deploy to Mainnet-Beta (Production)

⚠️ **Warning:** This deploys to production! Ensure thorough testing on devnet/testnet first.

```bash
# Switch to mainnet
solana config set --url mainnet-beta

# Ensure you have real SOL for deployment (~1-2 SOL)
solana balance

# Deploy
scripts/solana-deploy.sh mainnet-beta
scripts/solana-verify.sh mainnet-beta
```

### 6.5 Deployment Tracking

All deployments are logged in `solana/deployments.json`:

```json
[
  {
    "program": "chocochoco_game",
    "programId": "J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz",
    "network": "devnet",
    "slot": 123456789,
    "explorer": "https://explorer.solana.com/address/J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz?cluster=devnet",
    "timestamp": "2025-10-26T10:30:00.000Z"
  }
]
```

### 6.6 IDL Management

**Publish/Update IDL manually:**

```bash
# Initialize new IDL
anchor idl init <PROGRAM_ID> target/idl/your_program.json \
  --provider.cluster devnet

# Update existing IDL
anchor idl upgrade <PROGRAM_ID> target/idl/your_program.json \
  --provider.cluster devnet

# Fetch IDL from chain
anchor idl fetch <PROGRAM_ID> --provider.cluster devnet
```

**Or use the verify script:**

```bash
scripts/solana-verify.sh devnet <PROGRAM_ID> target/idl/your_program.json
```

---

## 7. Gameplay Flow

---

## 7. Gameplay Flow

### Phase 1: Commit (Hidden Choice)

Players stake SOL and submit a commitment without revealing their choice:

```typescript
// Frontend generates commitment
const salt = crypto.randomBytes(32);
const commitment = keccak256(abi.encodePacked(choice, salt));

// Submit to program
await program.methods
  .commitMeow(commitment)
  .accounts({
    round: roundPda,
    playerRound: playerRoundPda,
    player: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([wallet])
  .rpc();
```

### Phase 2: Reveal (Show True Choice)

During the reveal window, players reveal their actual choice + salt:

```typescript
await program.methods
  .revealMeow(choice, salt)  // choice: 0 = Milk, 1 = Cacao
  .accounts({
    round: roundPda,
    playerRound: playerRoundPda,
    player: wallet.publicKey,
  })
  .signers([wallet])
  .rpc();
```

### Phase 3: Settlement

After reveal deadline, anyone can trigger settlement:

```typescript
await program.methods
  .settleRound()
  .accounts({
    round: roundPda,
    treasury: treasuryPubkey,
  })
  .rpc();

// Program emits RoundMeowed event with winner data
```

### Phase 4: Claim Rewards

Winners claim their share of the pool:

```typescript
await program.methods
  .claimTreat()
  .accounts({
    round: roundPda,
    playerRound: playerRoundPda,
    player: wallet.publicKey,
  })
  .signers([wallet])
  .rpc();
```

**UI automatically:**
- ✅ Checks if player is a winner
- ✅ Prevents double-claiming
- ✅ Shows payout amount
- ✅ Displays animations (win/lose)

---

## 8. Architecture

### 8.1 System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Solana Program                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ChocoChocoGame (Anchor)                         │  │
│  │  - commitMeow()                                  │  │
│  │  - revealMeow()                                  │  │
│  │  - settleRound()                                 │  │
│  │  - claimTreat()                                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ RPC calls & events
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Commit     │→ │    Reveal    │→ │    Claim     │  │
│  │   Screen     │  │    Screen    │  │    Screen    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  Components:                                            │
│  - SolanaConnect (wallet adapter)                       │
│  - SolanaCountdown (time sync)                          │
│  - SolanaClaimPanel (rewards)                           │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Queries
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Indexer (Optional - Future)                │
│  - The Graph / SubQuery                                 │
│  - Leaderboards                                         │
│  - Analytics                                            │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Program Accounts (PDAs)

**Round Account:**
```rust
#[account]
pub struct Round {
    pub status: RoundStatus,         // Created | CommitOpen | RevealOpen | Settled
    pub commit_deadline: i64,        // Unix timestamp
    pub reveal_deadline: i64,        // Unix timestamp
    pub stake_lamports: u64,         // Required stake amount
    pub milk_count: u32,             // Players who chose Milk
    pub cacao_count: u32,            // Players who chose Cacao
    pub milk_pool: u64,              // Total lamports staked on Milk
    pub cacao_pool: u64,             // Total lamports staked on Cacao
    pub winner_side: Option<Tribe>,  // Milk | Cacao | None (tie)
    pub bump: u8,                    // PDA bump seed
}
```

**PlayerRound Account:**
```rust
#[account]
pub struct PlayerRound {
    pub commitment: [u8; 32],        // keccak256(choice || salt)
    pub tribe: Option<Tribe>,        // Revealed choice
    pub revealed: bool,              // Has player revealed?
    pub claimed: bool,               // Has player claimed reward?
    pub bump: u8,                    // PDA bump seed
}
```

### 8.3 State Machine

```
Round Status Flow:

Created
  │
  │ initialize_round()
  ▼
CommitOpen  ◄─┐
  │           │ Players submit commitments
  │           │ (within commit window)
  ▼           │
RevealOpen    │
  │           │ Players reveal choices
  │           │ (within reveal window)
  ▼           │
Settled       │
  │           │ Settlement triggered
  │           │ Winners claim rewards
  └───────────┘
  
New round starts
```

### 8.4 Key Design Patterns

1. **Commit-Reveal Pattern:** Prevents front-running by hiding choices until reveal phase
2. **Pull Payment:** Winners call `claimTreat()` themselves (no loops, gas-efficient)
3. **PDA Architecture:** Deterministic addresses for Round and PlayerRound accounts
4. **Event-Driven:** Emits events for indexers and real-time UI updates
5. **CEI Pattern:** Checks-Effects-Interactions to prevent reentrancy

### 8.5 Fee Structure

```
Total Pool = Milk Pool + Cacao Pool

Crumb Fee (3%) → Treasury
Remaining Pool (97%) → Winner Pool

Per-Winner Payout = Winner Pool / Winner Count
```

**Example:**
- 10 players stake 0.01 SOL each (5 Milk, 5 Cacao)
- Total pool: 0.1 SOL
- Milk side wins (minority with 5 players)
- Crumb fee: 0.003 SOL → Treasury
- Winner pool: 0.097 SOL
- Each Milk player claims: 0.0194 SOL (1.94x return)

### 8.6 Environment Configuration Flow

```
Developer Workflow:

1. Configure Solana CLI
   $ solana config set --url devnet
   $ solana config set --keypair ~/.config/solana/id.json

2. Build Program
   $ cd contracts && anchor build

3. Deploy (auto-updates frontend/.env!)
   $ scripts/solana-deploy.sh devnet
   
   ✅ Updates frontend/.env:
      VITE_SOLANA_CLUSTER=devnet
      VITE_PROGRAM_ID=<deployed_program_id>

4. Frontend Reads Config
   const programId = new PublicKey(import.meta.env.VITE_PROGRAM_ID)
   const cluster = import.meta.env.VITE_SOLANA_CLUSTER
```

---

## 8.7 Indexer Service (Optional - For Analytics)

The indexer service listens to Solana program events and provides REST APIs for leaderboards and analytics.

**Location:** `indexer/`

**Features:**
- Real-time event listening via WebSocket
- PostgreSQL storage with automatic deduplication
- REST APIs for leaderboard queries
- Automatic backfill on startup
- Helius Streams support (optional)

**Quick Start:**

```bash
cd indexer

# Install dependencies
pnpm install

# Configure
cp .env.example .env
# Edit PROGRAM_ID, DATABASE_URL, etc.

# Create database
createdb chocochoco_indexer

# Run migrations
pnpm migrate

# Start indexer
pnpm dev
```

**API Endpoints:**

```bash
# Health check
GET http://localhost:3001/health

# Top payout leaderboard
GET http://localhost:3001/leaderboard/top-payout?limit=50

# Weekly win rate
GET http://localhost:3001/leaderboard/weekly-winrate

# Get round by ID
GET http://localhost:3001/rounds/:id

# Get player rounds
GET http://localhost:3001/player/:address/rounds?limit=50
```

**See `indexer/README.md` for complete documentation.**

---

## 9. Troubleshooting

### 9.1 Solana CLI Issues

**Error: "Insufficient funds for deployment"**

```bash
# Check balance
solana balance

# Airdrop SOL (devnet/testnet only)
solana airdrop 2

# Wait and check again
solana balance
```

**Error: "Invalid keypair"**

```bash
# Generate new keypair
solana-keygen new --outfile ~/.config/solana/id.json

# Or use existing one
solana config set --keypair /path/to/your-keypair.json
```

**Error: "Cluster RPC URL not responding"**

```bash
# Try different RPC endpoint
solana config set --url https://api.devnet.solana.com

# Or use custom RPC (Helius, Alchemy, QuickNode)
solana config set --url https://your-custom-rpc.com
```

### 9.2 Anchor Build/Deploy Issues

**Error: "anchor: command not found"**

```bash
# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli

# Verify installation
anchor --version
```

**Error: "Program ID mismatch"**

```bash
# Check program address from keypair
solana address -k target/deploy/your_program-keypair.json

# Update Anchor.toml [programs.devnet] section
# Update lib.rs declare_id!() macro

# Rebuild
anchor build
```

**Error: "IDL account not found"**

```bash
# Publish IDL manually
anchor idl init <PROGRAM_ID> target/idl/your_program.json \
  --provider.cluster devnet

# Verify
anchor idl fetch <PROGRAM_ID> --provider.cluster devnet
```

### 9.3 Frontend Issues

**Error: "Cannot find module '@solana/web3.js'"**

```bash
cd frontend
pnpm install

# If still errors, try clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Error: "Property 'env' does not exist on type 'ImportMeta'"**

Solution: Restart TypeScript server
- VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"
- Or check `frontend/src/vite-env.d.ts` exists

**Error: "Buffer is not defined"**

Solution: Ensure `@types/node` is installed and `tsconfig.json` includes:
```json
{
  "compilerSettings": {
    "types": ["vite/client", "node"]
  }
}
```

**Error: "Wallet not connected"**

- Ensure wallet extension is installed (Phantom, Solflare)
- Check wallet is unlocked
- Verify wallet is set to correct cluster (devnet/testnet/mainnet)
- Try refreshing page

**Environment variables not updating:**

Vite requires server restart after `.env` changes:
```bash
# Stop dev server (Ctrl+C)
# Edit .env
# Restart
pnpm dev
```

### 9.4 Deployment Script Issues

**Scripts not executable (Unix/Mac):**

```bash
chmod +x scripts/*.sh
```

**PowerShell syntax errors (Windows):**

Use `;` instead of `&&` for command chaining:
```bash
cd c:\path\to\repo; scripts\solana-deploy.sh devnet
```

### 9.5 Transaction Issues

**Error: "Transaction simulation failed: Blockhash not found"**

Solution: Network congestion or old blockhash
```typescript
// Add commitment level and retry logic
const { blockhash } = await connection.getLatestBlockhash('confirmed');
// Retry transaction with new blockhash
```

**Error: "Transaction too large"**

Solution: Program may be too large for deployment
```bash
# Optimize program size
cargo build-bpf --features "no-entrypoint"

# Or increase compute units in Anchor.toml
```

**Error: "Custom program error: 0x1"**

Solution: Check program error codes in IDL or Anchor errors
```bash
# View program logs
solana logs <PROGRAM_ID>

# Or use anchor with verbose flag
anchor test --verbose
```

### 9.6 Wallet & Cluster Issues

**Error: "Cluster mismatch"**

Ensure frontend cluster matches program deployment:
```bash
# Frontend .env
VITE_SOLANA_CLUSTER=devnet  # Must match deployed cluster

# Verify program exists on cluster
solana program show <PROGRAM_ID> --url devnet
```

**Error: "Wallet balance shows 0 SOL"**

- Ensure wallet is set to correct cluster in extension
- Check airdrop limits (devnet: 2 SOL per request, max 10 SOL/day)
- Try alternative airdrop: https://solfaucet.com/

### 9.7 RPC Rate Limiting

**Error: "429 Too Many Requests"**

Solution: Use paid RPC provider
```bash
# Frontend .env
VITE_SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_KEY

# Or use Alchemy, QuickNode, Triton, etc.
```

### 9.8 IDL Issues

**Error: "IDL not found for program"**

```bash
# Check if IDL exists on-chain
anchor idl fetch <PROGRAM_ID> --provider.cluster devnet

# If not found, publish it
anchor idl init <PROGRAM_ID> target/idl/your_program.json \
  --provider.cluster devnet
```

**Error: "IDL version mismatch"**

```bash
# Upgrade IDL after program update
anchor idl upgrade <PROGRAM_ID> target/idl/your_program.json \
  --provider.cluster devnet
```

### 9.9 Commit/Reveal Timing Issues

**Error: "Reveal phase not started yet"**

- Check countdown component (uses on-chain time)
- Ensure frontend uses `useSolanaTime()` hook for accurate time sync
- Verify round deadlines in program state

**Error: "Reveal deadline passed"**

- Commitment window closed, cannot reveal
- Wait for next round
- Check if admin can extend deadline (if implemented)

**Hash mismatch error:**

```typescript
// Ensure commitment matches reveal
const commitment = keccak256(abi.encodePacked(choice, salt));

// Salt must be exactly the same bytes used in commit
// Store salt securely in localStorage or state
```

### 9.10 Claim Issues

**Error: "Already claimed"**

UI should prevent this, but if error occurs:
- Check `playerRound.claimed` flag
- Ensure UI refetches state after claim transaction

**Error: "Not a winner"**

- Check `round.winner_side` matches `playerRound.tribe`
- Handle tie case (tie may refund or roll over)

### 9.11 Getting Help

**Logs & Debugging:**

```bash
# View program logs in real-time
solana logs <PROGRAM_ID>

# View recent logs
solana logs <PROGRAM_ID> --before <SLOT_NUMBER>

# Get transaction details
solana transaction <SIGNATURE>
```

**Explorers:**
- Devnet: https://explorer.solana.com/?cluster=devnet
- Testnet: https://explorer.solana.com/?cluster=testnet
- Mainnet: https://explorer.solana.com/

**Community Support:**
- GitHub Issues: https://github.com/NQKhaixyz/chocochoco/issues
- Solana Discord: https://solana.com/discord
- Anchor Discord: https://discord.gg/anchor

---

## 10. Contributing

### Branch Strategy

- `main` - Stable production branch
- `dev` - Integration branch for testing
- `feat/*` - Feature branches
- `fix/*` - Bugfix branches

### Commit Convention

Use Conventional Commits format:

```bash
feat: add commit validation
fix: resolve double-claim bug
chore: update dependencies
docs: improve README deployment section
test: add unit tests for settle logic
```

### Pull Request Process

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

### Development Workflow

```bash
# Install dependencies
pnpm install

# Create feature branch
git checkout -b feat/my-feature

# Make changes, run tests
anchor test                    # Program tests
cd frontend && pnpm lint       # Frontend linting

# Commit with conventional format
git commit -m "feat: add new feature"

# Push and create PR
git push origin feat/my-feature
```

### Code Quality

- ✅ All tests must pass
- ✅ TypeScript strict mode (no `any` types)
- ✅ ESLint & Prettier formatting
- ✅ No console.log in production code
- ✅ Update documentation for API changes

---

## 📚 Additional Resources

### Documentation

- **[DESIGN.md](./DESIGN.md)** - Complete game mechanics and architecture
- **[SPRINT_PLAN.md](./SPRINT_PLAN.md)** - Sprint 1-2 roadmap (MVP → Production)
- **[SPRINT_PLAN_S3.md](./SPRINT_PLAN_S3.md)** - Sprint 3 GameFi expansion (NFTs, tokens, marketplace)
- **[scripts/README.md](./scripts/README.md)** - Detailed script usage and environment guide

### Sprint Documentation

All sprint tasks are documented in `docs/issues/`:

**Sprint 1 - Core MVP:**
- [S1.1 - Spec & Scaffolding](./docs/issues/001-S1.1-spec-and-scaffolding.md)
- [S1.2 - Core Contract](./docs/issues/002-S1.2-implement-core-contract-v1.md)
- [S1.3 - Unit Tests](./docs/issues/003-S1.3-unit-tests-core.md)
- [S1.4 - Deploy & Verify](./docs/issues/004-S1.4-deploy-testnet-and-verify.md)
- [S1.5 - FE Setup](./docs/issues/005-S1.5-fe-project-setup.md)
- [S1.6 - Join/Commit Screen](./docs/issues/006-S1.6-join-commit-screen.md)
- [S1.7 - Reveal Screen](./docs/issues/007-S1.7-reveal-screen.md)
- [S1.8 - Claim Screen](./docs/issues/008-S1.8-claim-screen.md)
- [S1.9 - Countdown & Helpers](./docs/issues/009-S1.9-shared-countdown-and-helpers.md)
- [S1.10 - Env & Config](./docs/issues/010-S1.10-env-and-config.md)
- [S1.11 - Docs & Runbook](./docs/issues/011-S1.11-basic-docs-and-runbook.md) ← You are here

**Sprint 2 - Production Readiness:**
- [S2.1 - Forfeit Mode](./docs/issues/014-S2.1-forfeit-mode.md)
- [S2.2 - Admin & Pausable](./docs/issues/015-S2.2-admin-params-and-pausable.md)
- [S2.3 - ERC20 Support](./docs/issues/016-S2.3-erc20-support.md)
- [S2.4 - Subgraph Setup](./docs/issues/017-S2.4-subgraph-setup.md)
- [S2.5 - Leaderboard UI](./docs/issues/018-S2.5-leaderboard-ui.md)

### External Links

- **Solana:** https://docs.solana.com/
- **Anchor Framework:** https://www.anchor-lang.com/
- **Solana Web3.js:** https://solana-labs.github.io/solana-web3.js/
- **Wallet Adapter:** https://github.com/solana-labs/wallet-adapter

---

## 📄 License

See [LICENSE](./LICENSE) file for details.

---

## 🎮 Play & Deploy

**Ready to play?**

1. Get devnet SOL: `solana airdrop 2`
2. Deploy program: `scripts/solana-deploy.sh devnet`
3. Start frontend: `cd frontend && pnpm dev`
4. Open http://localhost:5173
5. Connect wallet, choose Milk 🍼 or Cacao 🍫, and may the minority win!

**Questions?** Open an issue: https://github.com/NQKhaixyz/chocochoco/issues

---

*Built with ❤️ on Solana by the ChocoChoco team*

## 7) Quy trình chơi (Commit → Reveal → Claim)

- Commit: chọn Milk/Cacao, app tạo salt cục bộ, tính commitment, gửi commit kèm stake.
- Reveal: trong cửa sổ, gửi `reveal(choice, salt)`.
- Settle: phe thiểu số thắng (hoà → hoàn stake); emit `RoundMeowed`.
- Claim: chỉ người thắng claim; UI chặn double‑claim.

Chi tiết: xem `DESIGN.md`.

## 8) Leaderboard (Subgraph)

- Env: `VITE_SUBGRAPH_URL`
- Route: `/leaderboard`
- Bảng:
  - Top Payout: tổng claim theo `player` (aggregate client‑side)
  - Weekly Win‑Rate: 7 ngày gần nhất từ `playerRounds` (revealed=true), so sánh `side` với `round.winnerSide`
- Phân trang: Prev/Next theo `first/skip`; Next chỉ bật khi đủ `pageSize`.

## 9) Theme & UX

- Pastel theme (CSS variables) tại `frontend/src/styles/theme.css`; Tailwind tokens (brand, accent, card, border, win/lose)
- Dark mode: thêm class `dark` vào `<html>`
- Cat icon: `frontend/public/assets/icons/cat.svg`
- Win/Lose animation: Lottie trong `frontend/public/assets/anim/`
- Sound toggle: `src/context/sound.tsx` (purr khi thắng, lưu trạng thái localStorage)

## 10) Landing & Onboarding

- Landing: route `/landing` (CTA “Play on Testnet” → `/app`)
- In‑app tips: bật/tắt tại Navbar (persist localStorage)
- Coach marks: 3 bước (Commit → Reveal → Claim)

## 11) Indexing / Subgraph

Xem `subgraph/README.md` để cài đặt, build và deploy qua The Graph Studio.
- Chạy `forge build` để tạo ABI tại `contracts/out/ChocoChocoGame.sol/ChocoChocoGame.json`.
- Cập nhật `subgraph.yaml` với `network`, `address`, `startBlock` trước khi deploy.

## 12) Troubleshooting

- Ví/mạng: đảm bảo `CHAIN_ID` khớp mạng ví; thử RPC public
- Commit/Reveal bị từ chối: kiểm tra countdown (chain time). Hash mismatch → kiểm tra schema + salt
- Double‑claim: UI disable nếu `hasClaimed`; refetch sau khi mined
- Verify lỗi: đúng network/args; chờ indexer vài phút rồi thử lại
- Env không đọc: Vite yêu cầu biến `VITE_*`
- Countdown lệch: dùng hook chain time (`frontend/src/hooks/useChainTime.ts`)

## 13) Quy ước

- Branches: main (stable), dev (integration), feature: `feat/*`, `fix/*`
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, …)
- Env: giữ `.env.example`, không commit secrets
