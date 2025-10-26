# ChocoChoco Contracts (Solana/Anchor)# ChocoChoco Contracts



On-chain smart contracts for ChocoChoco, built with **Anchor Framework** on Solana.On-chain smart contracts for ChocoChoco, scaffolded with **Foundry**.



![CI](https://github.com/Dle28/MICA-E.Dapp/actions/workflows/chocochoco-contracts-ci.yml/badge.svg)![CI](https://github.com/Dle28/MICA-E.Dapp/actions/workflows/chocochoco-contracts-ci.yml/badge.svg)



## Quick Start

### Build the Program

```bash
# In WSL or Linux/macOS
cd contracts
anchor build
```

This generates:
- `target/deploy/chocochoco_game.so` - Compiled program binary
- `target/idl/chocochoco_game.json` - Interface Definition Language file
- `target/types/chocochoco_game.ts` - TypeScript types for frontend

### Run Tests

```bash
anchor test
```

Or test against devnet without starting a local validator:

```bash
anchor test --skip-local-validator
```

### Deploy to Devnet

```bash
# From repo root
./scripts/solana-deploy.sh devnet
```

This script will:
1. Build the program
2. Deploy to devnet
3. Initialize the IDL on-chain
4. Update `frontend/.env` with the program ID
5. Save deployment info to `solana/deployments.json`

---

## Program Overview

**Program ID:** `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS` (placeholder, will be updated after deployment)

### Instructions

1. **`initialize_round`** - Create a new game round
   - Parameters: `nonce`, `commit_duration`, `reveal_duration`, `stake`, `fee_bps`
   - Creates Round PDA
   
2. **`commit_meow`** - Player commits hidden choice
   - Parameters: `commitment` (32-byte SHA256 hash)
   - Creates PlayerRound PDA
   - Transfers stake to round PDA

3. **`reveal_meow`** - Player reveals their choice
   - Parameters: `tribe` (1=Milk, 2=Cacao), `salt` (32 bytes)
   - Verifies: `SHA256(tribe || salt || player || round_id) == commitment`
   
4. **`settle_round`** - Determine winner after reveal phase
   - Minority wins
   - Transfers fee to treasury
   
5. **`claim_treat`** - Winner claims reward
   - Pull payment pattern
   - Winners get proportional share of pool minus fee

### State Accounts

- **Round (PDA)**: `["round", authority, nonce]`
  - Stores game parameters, deadlines, pools, winner
  
- **PlayerRound (PDA)**: `["player_round", round, player]`
  - Stores commitment, revealed choice, claim status

### Events

All events are emitted and logged on-chain:
- `RoundCreated`
- `MeowCommitted`
- `MeowRevealed`
- `RoundMeowed` (settled)
- `TreatClaimed`

---

## Documentation

- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete technical specification
- **[COMMITMENT_HASH_GUIDE.md](./COMMITMENT_HASH_GUIDE.md)** - Hash function reference for frontend
- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute getting started guide
- **[../docs/SOLANA_MIGRATION.md](../docs/SOLANA_MIGRATION.md)** - EVM to Solana migration guide

---

## Development Workflow

### 1. Make Changes
Edit `programs/chocochoco/src/lib.rs`

### 2. Build
```bash
anchor build
```

### 3. Update Program ID (First Build Only)
```bash
# Get the program ID
solana address -k target/deploy/chocochoco_game-keypair.json

# Copy the output and update in:
# - programs/chocochoco/src/lib.rs (declare_id!)
# - Anchor.toml (programs section)

# Rebuild
anchor build
```

### 4. Test
```bash
anchor test
```

### 5. Deploy
```bash
./scripts/solana-deploy.sh devnet  # or testnet, mainnet-beta
```

---

## Program Architecture

### Instruction → Account → State Flow

```
initialize_round
  ↓
Round PDA created
  ↓
commit_meow
  ↓
PlayerRound PDA created + stake transferred
  ↓
reveal_meow
  ↓
PlayerRound updated + Round pools updated
  ↓
settle_round
  ↓
Round status = Settled + fee to treasury
  ↓
claim_treat
  ↓
Payout transferred to winner
```

### Commitment Hash
```
SHA256(tribe || salt || player || round_id)
       ↓        ↓       ↓          ↓
     1 byte  32 bytes 32 bytes  32 bytes
                ↓
           32-byte hash
```

See [COMMITMENT_HASH_GUIDE.md](./COMMITMENT_HASH_GUIDE.md) for implementation details.

---## Prerequisites



ChocoChoco implements a **commit-reveal minority game** on Solana where players:- `foundryup` installed (see <https://book.getfoundry.sh/getting-started/installation>)

1. **Commit** - Submit encrypted choice (Milk 🍼 or Cacao 🍫) + stake SOL- Node.js (optional, for scripting helpers)

2. **Reveal** - Prove their choice with original salt

3. **Settle** - Minority side wins the pool## Project layout

4. **Claim** - Winners claim proportional rewards

- `foundry.toml` — Foundry configuration (remappings, RPC endpoints, Etherscan keys)

## 🛠️ Prerequisites- `lib/openzeppelin-contracts` — placeholder directory; install real dependency via `forge install`

- `src/ChocoChocoGame.sol` — minority commit/reveal (v1 native, v2 ERC-20 stake)

### Required Tools- `test/ChocoChocoGame.t.sol` — TDD seed verifying version + default params

- `script/DeployChocoChocoGame.s.sol` — minimal deployment script

1. **Rust & Cargo** (1.75+)

   ```bashGameFi modules (đề xuất; thêm dần trong `src/`):

   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh- `FoodToken.sol` (ERC20) — `$FOOD`, dùng để “feed”; cũng là `stakeToken` cho minority game (xem issue S2.3 ERC-20 support)

   rustup --version- `PawToken.sol` (ERC20) — `$PAW`, dùng để mua rương

   ```- `CatNFT.sol` (ERC721) — NFT mèo với rarity/skin

- `LootChest.sol` — mua/mở rương, mint CatNFT; pseudo-random/VRF

2. **Solana CLI** (1.17+)- (tùy chọn) `CatMarket.sol` — marketplace nội bộ tối giản (khởi đầu có thể dùng Seaport)

   ```bash

   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"## Setup

   solana --version

   ``````bash

cd contracts

3. **Anchor CLI** (0.29.0+)foundryup                 # only if Foundry not yet installed

   ```bashforge install OpenZeppelin/openzeppelin-contracts --no-commit

   cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cliforge install foundry-rs/forge-std --no-commit  # optional but recommended when extending tests

   anchor --version```

   ```

## Run tests

4. **Node.js & pnpm** (for TypeScript tests)

   ```bash```bash

   node --version  # Should be v20+forge test

   npm install -g pnpm```

   ```

## Deploy (example)

### Solana Configuration

```bash

```bashforge script script/DeployChocoChocoGame.s.sol:DeployChocoChocoGame \

# Check current config	--rpc-url $BASE_SEPOLIA_RPC \

solana config get	--broadcast

```

# Set cluster (devnet recommended for testing)

solana config set --url devnetContract spec and API are defined in `../DESIGN.md`.



# Create or use existing wallet### ERC-20 stake (S2.3)

solana-keygen new  # Or use existing keypair- Bật đường đi ERC-20 cho stake để người chơi “chơi để kiếm” thêm `$FOOD`.

- Env khuyến nghị: `STAKE_TOKEN=$FOOD_TOKEN`.

# Check balance

solana balance### GameFi addresses (gợi ý env)

- `FOOD_TOKEN`, `PAW_TOKEN`, `CAT_NFT`, `CHEST_ADDRESS`

# Airdrop SOL (devnet/testnet only)

solana airdrop 2### Security notes

```- Pull-payment (claim) cho payout; tránh vòng lặp lớn.

- ReentrancyGuard ở các chỗ chuyển tiền/token; CEI.

## 📁 Project Layout- Nếu dùng VRF, cô lập chức năng fulfill và kiểm tra nguồn randomness.


```
contracts/
├── Anchor.toml              # Anchor workspace config
├── Cargo.toml               # Rust workspace
├── programs/
│   └── chocochoco/
│       ├── Cargo.toml       # Program dependencies
│       ├── Xargo.toml       # Build config
│       └── src/
│           └── lib.rs       # Main program logic
├── tests/
│   └── chocochoco.ts        # TypeScript integration tests
├── target/
│   ├── deploy/              # Built .so binaries
│   ├── idl/                 # Generated IDL JSON
│   └── types/               # TypeScript types
└── package.json             # Test dependencies

Legacy EVM (Foundry):
├── foundry.toml             # ⚠️ DEPRECATED - for reference only
├── src/ChocoChocoGame.sol   # ⚠️ Legacy Solidity contract
├── test/                    # ⚠️ Legacy Foundry tests
└── script/                  # ⚠️ Legacy deploy scripts
```

**Note:** Foundry/Solidity files are kept for reference but are no longer actively maintained. All new development uses Anchor/Solana.

## 🏗️ Build & Test

### Build Program

```bash
# Build Anchor program
anchor build

# Output:
# - target/deploy/chocochoco_game.so (executable)
# - target/idl/chocochoco_game.json (interface definition)
# - target/types/chocochoco_game.ts (TypeScript types)
```

### Run Tests

```bash
# Install test dependencies
pnpm install

# Run full test suite (starts local validator)
anchor test

# Run without starting validator (if already running)
anchor test --skip-local-validator

# Run specific test file
pnpm ts-mocha -p ./tsconfig.json tests/chocochoco.ts
```

### Local Development

```bash
# Terminal 1: Start local validator
solana-test-validator

# Terminal 2: Deploy to local
anchor deploy --provider.cluster localnet

# Terminal 3: Run tests
anchor test --skip-deploy --skip-local-validator
```

## 🚀 Deployment

### Deploy to Devnet (Recommended First Step)

```bash
# From repo root
./scripts/solana-deploy.sh devnet
```

**What this does:**
1. ✅ Builds program with `anchor build`
2. ✅ Uses your `solana config` for cluster/wallet
3. ✅ Deploys program to devnet
4. ✅ Publishes IDL on-chain (`anchor idl init` or `upgrade`)
5. ✅ Saves deployment to `solana/deployments.json`
6. ✅ **Automatically updates `frontend/.env`** with `VITE_PROGRAM_ID` and `VITE_SOLANA_CLUSTER`

### Deploy to Testnet

```bash
solana config set --url testnet
solana airdrop 2
./scripts/solana-deploy.sh testnet
```

### Deploy to Mainnet-Beta (Production)

⚠️ **Warning:** This deploys to production with real SOL!

```bash
solana config set --url mainnet-beta
# Ensure you have 1-2 SOL for deployment
solana balance
./scripts/solana-deploy.sh mainnet-beta
```

### Verify Deployment

```bash
# Verify latest deployment for cluster
./scripts/solana-verify.sh devnet

# Or verify specific program ID
./scripts/solana-verify.sh devnet <PROGRAM_ID>
```

**Verification checks:**
- ✅ Program exists on-chain
- ✅ Program ID matches `frontend/.env`
- ✅ IDL published on-chain
- ✅ Shows explorer link

## 📜 IDL Management

The **Interface Definition Language (IDL)** is Solana's equivalent of Ethereum's ABI. It's used by frontend clients to interact with your program.

### Automatic (via deploy script)

```bash
./scripts/solana-deploy.sh devnet  # Publishes IDL automatically
```

### Manual IDL Operations

```bash
# Initialize new IDL
anchor idl init <PROGRAM_ID> -f target/idl/chocochoco_game.json \
  --provider.cluster devnet

# Update existing IDL
anchor idl upgrade <PROGRAM_ID> -f target/idl/chocochoco_game.json \
  --provider.cluster devnet

# Fetch IDL from chain
anchor idl fetch <PROGRAM_ID> --provider.cluster devnet -o fetched.json

# Erase IDL (caution!)
anchor idl erase <PROGRAM_ID> --provider.cluster devnet
```

## 🧪 Program Architecture

### Instructions (Public API)

| Instruction | Description | Accounts |
|------------|-------------|----------|
| `initialize_round` | Create new game round | Round PDA, Treasury, Authority |
| `commit_meow` | Submit hidden choice + stake | Round, PlayerRound PDA, Player |
| `reveal_meow` | Prove commitment with salt | Round, PlayerRound, Player |
| `settle_round` | Determine winner, collect fees | Round, Treasury |
| `claim_treat` | Claim rewards (winners only) | Round, PlayerRound, Player |

### Accounts (State)

**Round Account** (PDA: `["round", authority, nonce]`)
```rust
pub struct Round {
    pub status: RoundStatus,        // CommitOpen | Settled
    pub commit_deadline: i64,       // Unix timestamp
    pub reveal_deadline: i64,       // Unix timestamp
    pub stake_lamports: u64,        // Required stake
    pub fee_basis_points: u16,      // 300 = 3%
    pub milk_count: u32,            // Players who chose Milk
    pub cacao_count: u32,           // Players who chose Cacao
    pub milk_pool: u64,             // Total lamports on Milk
    pub cacao_pool: u64,            // Total lamports on Cacao
    pub winner_side: Option<Tribe>, // Milk | Cacao | None (tie)
    pub treasury: Pubkey,           // Fee destination
}
```

**PlayerRound Account** (PDA: `["player_round", round, player]`)
```rust
pub struct PlayerRound {
    pub commitment: [u8; 32],       // keccak256(tribe || salt)
    pub tribe: Option<Tribe>,       // Revealed choice
    pub revealed: bool,             // Has player revealed?
    pub claimed: bool,              // Has player claimed reward?
    pub round: Pubkey,              // Parent round
    pub player: Pubkey,             // Player wallet
}
```

### Events

All instructions emit events for indexing:
- `RoundCreated` - New round initialized
- `MeowCommitted` - Player submitted commitment
- `MeowRevealed` - Player revealed choice
- `RoundMeowed` - Round settled with winner
- `TreatClaimed` - Player claimed reward

## 🧰 Development Commands

```bash
# Build
anchor build

# Test
anchor test                                    # Full suite with validator
anchor test --skip-local-validator             # Use existing validator
pnpm test                                      # Same as anchor test

# Deploy
anchor deploy --provider.cluster devnet        # Deploy only (no IDL)
./scripts/solana-deploy.sh devnet              # Deploy + IDL + update FE

# IDL
anchor idl init <PROGRAM_ID> -f target/idl/chocochoco_game.json
anchor idl upgrade <PROGRAM_ID> -f target/idl/chocochoco_game.json
anchor idl fetch <PROGRAM_ID> -o fetched.json

# Verify
./scripts/solana-verify.sh devnet              # Check deployment + IDL

# Lint & Format
cargo clippy -- -D warnings                    # Rust linting
cargo fmt                                      # Rust formatting
pnpm lint                                      # TypeScript linting
```

## 🔧 Troubleshooting

### "anchor: command not found"
```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli
```

### "Program ID mismatch"
```bash
# Get program ID from keypair
solana address -k target/deploy/chocochoco_game-keypair.json

# Update Anchor.toml [programs.<cluster>] section
# Update lib.rs declare_id!() macro
anchor build
```

### "IDL account not found"
```bash
anchor idl init <PROGRAM_ID> -f target/idl/chocochoco_game.json \
  --provider.cluster devnet
```

### "Insufficient funds"
```bash
solana balance
solana airdrop 2  # devnet/testnet only
```

## 📚 Resources

- **Anchor Docs:** https://www.anchor-lang.com/
- **Solana Docs:** https://docs.solana.com/
- **Program Spec:** See `../DESIGN.md`
- **Frontend Integration:** See `../frontend/README.md`

---

## ⚠️ Legacy EVM (Foundry/Hardhat)

The following Foundry files are **DEPRECATED** but kept for reference:

- `foundry.toml` - Foundry configuration
- `src/ChocoChocoGame.sol` - Solidity contract (v1 native, v2 ERC-20)
- `test/ChocoChocoGame.t.sol` - Foundry tests
- `script/DeployChocoChocoGame.s.sol` - Deploy script
- `lib/openzeppelin-contracts` - OpenZeppelin dependencies

**To use legacy Foundry tooling** (not recommended):

```bash
foundryup
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge test
forge script script/DeployChocoChocoGame.s.sol:DeployChocoChocoGame \
  --rpc-url $BASE_SEPOLIA_RPC \
  --broadcast
```

**Note:** All new development should use Anchor/Solana. EVM contracts will not receive updates.
