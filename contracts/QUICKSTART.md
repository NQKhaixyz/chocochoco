# Solana/Anchor Quick Start Guide

Get up and running with ChocoChoco Solana program in 5 minutes!

## Prerequisites

You need:
- Rust (1.75+)
- Solana CLI (1.17+)
- Anchor CLI (0.29.0+)
- Node.js (20+) & pnpm

**⚠️ Windows Users:** Anchor development is best done on Linux/macOS. On Windows, use WSL2 (Windows Subsystem for Linux) for the best experience.

## Installation (One-Time Setup)

### Option A: Windows with WSL2 (Recommended)

1. **Install WSL2**
   ```powershell
   # In PowerShell (Admin)
   wsl --install
   # Restart computer
   ```

2. **Open WSL2 and follow Linux instructions below**

### Option B: Linux/macOS (Native)

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup --version
```

### 2. Install Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version
```

### 3. Install Anchor CLI
```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli --locked
anchor --version
```

**Note:** Anchor installation can take 15-30 minutes on first install.

### 4. Create Wallet & Get SOL
```bash
# Create new wallet (or use existing)
solana-keygen new

# Configure to use devnet
solana config set --url devnet

# Check your address
solana address

# Get free devnet SOL
solana airdrop 2

# Verify balance
solana balance
```

## Build & Test

```bash
# From repo root
cd contracts

# Install test dependencies
pnpm install

# Build program (first time may take 5-10 minutes)
anchor build

# This creates:
# - target/deploy/chocochoco_game.so
# - target/idl/chocochoco_game.json
# - target/types/chocochoco_game.ts

# Run tests
anchor test

# Or test without starting new validator
anchor test --skip-local-validator
```

## Deploy to Devnet

```bash
# From repo root
./scripts/solana-deploy.sh devnet

# This will:
# 1. Build program
# 2. Deploy to devnet
# 3. Publish IDL on-chain
# 4. Update frontend/.env automatically
# 5. Print Program ID and Explorer link
```

## Verify Deployment

```bash
./scripts/solana-verify.sh devnet

# Checks:
# - Program exists on-chain
# - IDL published
# - frontend/.env matches
# - Shows explorer link
```

## Common Commands

```bash
# Build
anchor build

# Test
anchor test

# Deploy (via script - recommended)
./scripts/solana-deploy.sh devnet

# Or deploy manually
anchor deploy --provider.cluster devnet

# View program logs
solana logs <PROGRAM_ID>

# Check program info
solana program show <PROGRAM_ID>

# Fetch IDL
anchor idl fetch <PROGRAM_ID> --provider.cluster devnet

# Update IDL
anchor idl upgrade <PROGRAM_ID> -f target/idl/chocochoco_game.json \
  --provider.cluster devnet
```

## Troubleshooting

### Windows: "Could not find globally installed anchor"

Anchor CLI doesn't work natively on Windows. You have two options:

**Option 1: Use WSL2 (Recommended)**
```powershell
# Install WSL2
wsl --install
# Restart, then open WSL2 and install Rust/Solana/Anchor inside WSL
```

**Option 2: Use Anchor via Docker**
```powershell
# Pull Anchor image
docker pull projectserum/build:v0.29.0

# Run build
docker run --rm -v ${PWD}:/workspace -w /workspace projectserum/build:v0.29.0 anchor build
```

**Option 3: Development in Cloud**
- Use GitHub Codespaces
- Use Gitpod
- Use a Linux VM

### "anchor: command not found"
Make sure `~/.cargo/bin` is in your PATH:
```bash
export PATH="$HOME/.cargo/bin:$PATH"
```

### "Insufficient funds"
Get more devnet SOL:
```bash
solana airdrop 2
# Or use faucet: https://solfaucet.com/
```

### "Program ID mismatch"
Update the program ID after first build:
```bash
# Get program ID
solana address -k target/deploy/chocochoco_game-keypair.json

# Copy output and update in programs/chocochoco/src/lib.rs:
declare_id!("YourProgramIdHere");

# Rebuild
anchor build
```

### Tests fail with "Blockhash not found"
Network issue. Try again or use local validator:
```bash
# Terminal 1
solana-test-validator

# Terminal 2
anchor test --skip-local-validator
```

## Project Structure

```
contracts/
├── Anchor.toml              # Workspace config
├── programs/
│   └── chocochoco/
│       └── src/lib.rs       # Main program code (START HERE!)
├── tests/
│   └── chocochoco.ts        # Integration tests
└── target/
    ├── deploy/              # Built programs
    ├── idl/                 # IDL JSON
    └── types/               # TypeScript types
```

## What's Implemented

✅ **Instructions:**
- `initialize_round` - Create new game round
- `commit_meow` - Submit hidden choice + stake
- `reveal_meow` - Prove choice with salt
- `settle_round` - Determine winner
- `claim_treat` - Claim rewards

✅ **State:**
- Round (PDA per round)
- PlayerRound (PDA per player per round)

✅ **Events:**
- RoundCreated, MeowCommitted, MeowRevealed, RoundMeowed, TreatClaimed

✅ **Game Logic:**
- Commit-reveal pattern (keccak256)
- Minority wins mechanic
- Pull payment claims
- Fee collection to treasury

## Example: Play a Round

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";

// 1. Initialize round
const tx1 = await program.methods
  .initializeRound(
    new anchor.BN(300),  // 5 min commit
    new anchor.BN(300),  // 5 min reveal
    new anchor.BN(10_000_000),  // 0.01 SOL stake
    300  // 3% fee
  )
  .accounts({ /* ... */ })
  .rpc();

// 2. Player commits
const commitment = keccak256(abi.encodePacked(choice, salt));
const tx2 = await program.methods
  .commitMeow(Array.from(commitment))
  .accounts({ /* ... */ })
  .rpc();

// 3. Player reveals
const tx3 = await program.methods
  .revealMeow(choice, Array.from(salt))
  .accounts({ /* ... */ })
  .rpc();

// 4. Settle round
const tx4 = await program.methods
  .settleRound()
  .accounts({ /* ... */ })
  .rpc();

// 5. Winner claims
const tx5 = await program.methods
  .claimTreat()
  .accounts({ /* ... */ })
  .rpc();
```

## Next Steps

1. **Read the code:** `programs/chocochoco/src/lib.rs`
2. **Run tests:** `anchor test` and check `tests/chocochoco.ts`
3. **Deploy:** `./scripts/solana-deploy.sh devnet`
4. **Integrate frontend:** See `frontend/` for React + Anchor SDK examples

## Resources

- **Anchor Book:** https://book.anchor-lang.com/
- **Solana Docs:** https://docs.solana.com/
- **Solana Cookbook:** https://solanacookbook.com/
- **This Project Docs:** `docs/SOLANA_MIGRATION.md`, `docs/ANCHOR_IMPLEMENTATION_SUMMARY.md`

## Questions?

Check:
1. `contracts/README.md` - Full documentation
2. `docs/SOLANA_MIGRATION.md` - EVM → Solana comparison
3. `docs/ANCHOR_IMPLEMENTATION_SUMMARY.md` - Implementation details
4. GitHub Issues - Ask questions or report bugs

Happy coding! 🎮🚀
