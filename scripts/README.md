# ChocoChoco Scripts & Environment Configuration

**Updated for Solana Migration - October 2025**

This guide covers environment setup, deployment, and verification for both **Solana (primary)** and **EVM chains (legacy)**

---

## Table of Contents

1. [Environment Variables](#1-environment-variables)
2. [Solana Configuration](#2-solana-configuration)
3. [Frontend Development](#3-frontend-development)
4. [Solana Deployment & Verification](#4-solana-deployment--verification)
5. [EVM Deployment (Legacy)](#5-evm-deployment-legacy)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Environment Variables

### Frontend Environment (`.env`)

ChocoChoco uses **Vite** for the frontend. All environment variables must be prefixed with `VITE_`.

**Setup:**
```bash
cd frontend
cp .env.example .env
# Edit .env with your values
```

**Required Solana Variables:**
```bash
# Solana cluster (devnet, testnet, mainnet-beta)
VITE_SOLANA_CLUSTER=devnet

# Your deployed program ID (get from `anchor deploy`)
VITE_PROGRAM_ID=YourProgramPublicKey11111111111111111111

# Default stake amount in lamports (1 SOL = 1,000,000,000 lamports)
VITE_STAKE_LAMPORTS=1000000

# Optional: Custom RPC endpoint
VITE_SOLANA_RPC_URL=
```

**Optional EVM Variables (for legacy support):**
```bash
VITE_CHAIN_ID=84532
VITE_RPC_URL=https://sepolia.base.org
VITE_CONTRACT_ADDRESS=0x...
VITE_TREASURY_ADDRESS=0x...
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

**How FE Reads Environment:**

The frontend automatically reads these via `import.meta.env`:

```typescript
// Example: src/components/SolanaConnect.tsx
const programId = new PublicKey(import.meta.env.VITE_PROGRAM_ID)
const cluster = import.meta.env.VITE_SOLANA_CLUSTER
```

Type definitions are in `frontend/src/vite-env.d.ts`.

---

## 2. Solana Configuration

### Using `solana config`

Scripts automatically use your Solana CLI configuration instead of environment variables.

**Check current config:**
```bash
solana config get
```

**Output example:**
```
Config File: /home/user/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/user/.config/solana/id.json
Commitment: confirmed
```

**Set cluster:**
```bash
# Devnet (recommended for testing)
solana config set --url https://api.devnet.solana.com

# Testnet
solana config set --url https://api.testnet.solana.com

# Mainnet-beta (production)
solana config set --url https://api.mainnet-beta.solana.com
```

**Set keypair:**
```bash
# Use default wallet
solana config set --keypair ~/.config/solana/id.json

# Use custom wallet
solana config set --keypair /path/to/your-wallet.json
```

**Check balance:**
```bash
solana balance
```

**Airdrop SOL (devnet/testnet only):**
```bash
solana airdrop 2
```

### Anchor Configuration (if using Anchor framework)

If you have an `Anchor.toml` in your contracts directory:

```toml
[provider]
cluster = "devnet"  # or testnet
wallet = "~/.config/solana/id.json"

[programs.devnet]
your_program = "YourProgramId111111111111111111111111111"
```

Anchor CLI respects this config automatically.

---

## 3. Frontend Development

### Quick Start

```bash
cd frontend
pnpm install
cp .env.example .env
# Edit .env with your VITE_PROGRAM_ID
pnpm dev
```

The app will be available at `http://localhost:5173`

### Task-Based Development (with Auto Status Updates)

ChocoChoco includes scripts to automatically update issue status when starting/completing features.

**S1.5 - FE Project Setup:**
```bash
pnpm task:s1_5:start  # Sets status to "in-progress" and starts dev
pnpm task:s1_5:done   # Sets status to "done"
```

**S1.6 - Join/Commit Screen:**
```bash
pnpm task:s1_6:start
pnpm task:s1_6:done
```

**S1.7 - Reveal Screen:**
```bash
pnpm task:s1_7:start
pnpm task:s1_7:done
```

**S1.8 - Claim Screen:**
```bash
pnpm task:s1_8:start
pnpm task:s1_8:done
```

**S1.9 - Countdown & Helpers:**
```bash
pnpm task:s1_9:start
pnpm task:s1_9:done
```

**S1.10 - Env & Config:**
```bash
pnpm task:s1_10:start
pnpm task:s1_10:done
```

### Build & Preview

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Environment Hot-Reload

Vite requires server restart after `.env` changes:

```bash
# Stop dev server (Ctrl+C)
# Edit .env
# Restart
pnpm dev
```

---

## 4. Solana Deployment & Verification

### Prerequisites

1. **Install Solana CLI:**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

2. **Install Anchor CLI (if using Anchor):**
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli
   ```

3. **Build your program:**
   ```bash
   cd contracts  # or wherever your Solana program is
   anchor build  # or: cargo build-bpf
   ```

### Deploy to Devnet

```bash
# From repo root
chmod +x scripts/solana-deploy.sh
scripts/solana-deploy.sh devnet
```

**What it does:**

1. Builds program with `anchor build`
2. Uses your current `solana config` for cluster and wallet
3. Deploys with `solana program deploy`
4. Publishes IDL on-chain (for Anchor programs)
5. Saves deployment info to `solana/deployments.json`
6. **Automatically updates `frontend/.env`** with:
   - `VITE_SOLANA_CLUSTER=devnet`
   - `VITE_PROGRAM_ID=<deployed_program_id>`

**Manual Override (optional):**

```bash
# Use specific wallet
SOLANA_WALLET=/path/to/wallet.json scripts/solana-deploy.sh devnet

# Use specific program keypair
PROGRAM_KEYPAIR=/path/to/program-keypair.json scripts/solana-deploy.sh devnet

# Update different env file
FRONTEND_ENV_PATH=./custom/.env scripts/solana-deploy.sh devnet
```

### Deploy to Testnet

```bash
scripts/solana-deploy.sh testnet
```

Same process as devnet, but uses testnet RPC.

### Verify Deployment

```bash
chmod +x scripts/solana-verify.sh

# Verify latest deployment (reads from solana/deployments.json)
scripts/solana-verify.sh devnet

# Verify specific program ID
scripts/solana-verify.sh devnet YourProgramId111111111111111111111
```

**What it checks:**

1. ✅ Program exists on-chain (`solana program show`)
2. ✅ Program ID matches `frontend/.env`
3. ✅ IDL exists on-chain (`anchor idl fetch`)
4. 📊 Shows explorer link

**Output example:**
```
🔍 Verifying program deployment on devnet...
Program Id: YourProgramId111111111111111111111
Authority: Your1Wa11etAddress1111111111111111111
Balance: 0.5 SOL
Executable Data Length: 123456 bytes

✅ Program ID matches frontend/.env
✅ IDL found on-chain!
Explorer: https://explorer.solana.com/address/YourProgramId?cluster=devnet
```

### IDL Management

**Publish/Update IDL manually:**

```bash
# Publish new IDL
scripts/solana-verify.sh devnet <PROGRAM_ID> target/idl/your_program.json

# Or use anchor directly
anchor idl init <PROGRAM_ID> target/idl/your_program.json --provider.cluster devnet
anchor idl upgrade <PROGRAM_ID> target/idl/your_program.json --provider.cluster devnet
```

### Deployment Tracking

All deployments are logged in `solana/deployments.json`:

```json
[
  {
    "program": "chocochoco_game",
    "programId": "YourProgramId111111111111111111111",
    "network": "devnet",
    "slot": 123456789,
    "explorer": "https://explorer.solana.com/address/...",
    "timestamp": "2025-10-26T10:30:00.000Z"
  }
]
```

---

## 5. EVM Deployment (Legacy)

For backward compatibility with EVM testnets (Base Sepolia, Polygon Amoy).

### Prerequisites

1. **Install Foundry:**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Setup env for scripts:**
   ```bash
   cd scripts
   cp env.example .env
   # Edit with PRIVATE_KEY, RPC URLs, API keys
   source .env
   ```

### Deploy to Base Sepolia

```bash
chmod +x scripts/deploy-testnet.sh
scripts/deploy-testnet.sh base
```

### Deploy to Polygon Amoy

```bash
scripts/deploy-testnet.sh polygon
```

### Verify Contracts

```bash
chmod +x scripts/verify.sh
scripts/verify.sh base 0xYourDeployedAddress
scripts/verify.sh polygon 0xYourDeployedAddress
```

Deployments are saved to `contracts/deployments.json`.

**Note:** EVM deployments do NOT auto-update `frontend/.env`. Update manually:

```bash
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=84532  # Base Sepolia
VITE_RPC_URL=https://sepolia.base.org
```

---

## 6. Troubleshooting

### Frontend Issues

**Error: "Cannot find module '@solana/web3.js'"**

Solution:
```bash
cd frontend
pnpm install
```

**Error: "Property 'env' does not exist on type 'ImportMeta'"**

Solution: TypeScript server needs restart
```bash
# In VS Code: Cmd/Ctrl + Shift + P
# Run: "TypeScript: Restart TS Server"
```

Or check `frontend/src/vite-env.d.ts` exists.

**Env variables not updating**

Solution: Restart dev server after `.env` changes
```bash
# Stop (Ctrl+C) and restart
pnpm dev
```

### Solana Deployment Issues

**Error: "Insufficient funds"**

Solution: Airdrop SOL to your wallet
```bash
solana airdrop 2
solana balance
```

**Error: "Program ID does not match keypair"**

Solution: Ensure program keypair matches deployed ID
```bash
# Check program address from keypair
solana address -k target/deploy/your_program-keypair.json

# If different, regenerate or use correct keypair
```

**Error: "IDL account not found"**

Solution: Publish IDL manually
```bash
anchor idl init <PROGRAM_ID> target/idl/your_program.json --provider.cluster devnet
```

**Deploy script can't find program**

Solution: Build first
```bash
anchor build
# Or: cargo build-bpf
```

### Script Permission Issues (Unix/Mac)

```bash
chmod +x scripts/*.sh
```

### RPC Rate Limits

If hitting rate limits on public RPCs:

**Solana:** Use paid RPC provider
- [Helius](https://helius.dev/)
- [Alchemy](https://www.alchemy.com/)
- [QuickNode](https://www.quicknode.com/)

Update `.env`:
```bash
VITE_SOLANA_RPC_URL=https://your-custom-rpc.com
```

**EVM:** Use paid providers
- [Alchemy](https://www.alchemy.com/)
- [Infura](https://infura.io/)

---

## Configuration Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Solana Configuration                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  solana config   │
                    │  - cluster       │
                    │  - keypair       │
                    │  - commitment    │
                    └──────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌────────────┐     ┌──────────────┐   ┌────────────┐
   │   Deploy   │     │    Verify    │   │  Frontend  │
   │   Script   │     │    Script    │   │    .env    │
   └────────────┘     └──────────────┘   └────────────┘
          │                   │                   │
          └───────────────────┴───────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Reads cluster   │
                    │  from CLI config │
                    │  automatically   │
                    └──────────────────┘
```

---

## Environment Variable Reference

### Solana (Primary)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_SOLANA_CLUSTER` | ✅ | devnet | Cluster: devnet/testnet/mainnet-beta |
| `VITE_PROGRAM_ID` | ✅ | - | Deployed program public key |
| `VITE_STAKE_LAMPORTS` | ✅ | 1000000 | Default stake (0.001 SOL) |
| `VITE_SOLANA_RPC_URL` | ❌ | - | Custom RPC (overrides cluster default) |
| `VITE_HELIUS_API_KEY` | ❌ | - | Helius API key for enhanced RPC |

### EVM (Legacy)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_CHAIN_ID` | ❌ | 84532 | EVM chain ID |
| `VITE_RPC_URL` | ❌ | - | EVM RPC endpoint |
| `VITE_CONTRACT_ADDRESS` | ❌ | - | Deployed EVM contract |
| `VITE_TREASURY_ADDRESS` | ❌ | - | Treasury wallet |
| `VITE_WALLETCONNECT_PROJECT_ID` | ❌ | - | WalletConnect project ID |

---

## Quick Reference Commands

```bash
# Frontend dev
pnpm --filter frontend dev
pnpm task:s1_<N>:start
pnpm task:s1_<N>:done

# Solana config
solana config get
solana config set --url devnet
solana balance
solana airdrop 2

# Solana deploy
scripts/solana-deploy.sh devnet
scripts/solana-verify.sh devnet

# EVM deploy (legacy)
scripts/deploy-testnet.sh base
scripts/verify.sh base 0xAddress

# Build
cd frontend && pnpm build
cd contracts && anchor build
```

---

## Additional Resources

- [Solana CLI Docs](https://docs.solana.com/cli)
- [Anchor Book](https://www.anchor-lang.com/)
- [Vite Environment Docs](https://vitejs.dev/guide/env-and-mode.html)
- [Solana Explorer](https://explorer.solana.com/)
- [Helius RPC](https://helius.dev/)

---

**Updated:** October 2025 | **Version:** 2.0 (Solana Migration) | **Task:** S1.10
