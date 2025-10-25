# Scripts & Environment

## 1) Environment Variables

Create an `.env` from the example at the repo root:

```bash
cp .env.example .env
```

Required:
- `RPC_URL` — RPC endpoint
- `CHAIN_ID` — e.g. Base Sepolia = `84532`
- `CONTRACT_ADDRESS` — deployed game contract
- `TREASURY_ADDRESS` — treasury wallet address

FE public (pick one depending on framework):
- Next: `NEXT_PUBLIC_*`
- Vite: `VITE_*`

If using the contracts workspace, also create `contracts/.env` from `contracts/.env.example` and fill `PRIVATE_KEY`.

## 2) Frontend

Vite app in `frontend/` reads env from `VITE_*`:

```bash
cd frontend
pnpm i
cp .env.example .env
pnpm dev      # or: pnpm dev:fe
```

Build / Preview:

```bash
pnpm build    # or: pnpm build:fe
pnpm preview  # or: pnpm preview:fe
```

Env used by FE (see `src/lib/wagmi.ts`):
- `VITE_RPC_URL`, `VITE_CHAIN_ID`
- `VITE_CONTRACT_ADDRESS`, `VITE_TREASURY_ADDRESS`

## 3) Backend Deploy

Auto-detect and run (Hardhat or Foundry):

```bash
chmod +x scripts/run-deploy.sh
scripts/run-deploy.sh
```

- Hardhat: looks for `hardhat.config.*` and runs `scripts/deploy.ts` (if present)
- Foundry: uses `scripts/deploy-testnet.sh` (Base Sepolia by default)

Manual (Foundry):

```bash
chmod +x scripts/deploy-testnet.sh
scripts/deploy-testnet.sh base     # or: polygon
```

Verify:

```bash
chmod +x scripts/verify.sh
scripts/verify.sh base 0xYourAddress
```

## 4) Update FE Contract Address

After deployment, update FE env:

```
VITE_CONTRACT_ADDRESS=0x...
VITE_TREASURY_ADDRESS=0x...
VITE_RPC_URL=...
VITE_CHAIN_ID=...
```

## 5) Notes
- Do not commit `.env` with private keys.
- FE only reads `NEXT_PUBLIC_*` (Next) or `VITE_*` (Vite).
- Treasury/Contract must be valid `0x` addresses (20 bytes).

---

## EVM Deploy + Verify (Testnets)

Prerequisites:
- Foundry installed (`foundryup`), dependencies installed in `contracts/`
- Copy `scripts/env.example` to `.env` and fill values, then `source .env`
  - Required: `PRIVATE_KEY`, `TREASURY_ADDRESS`, `STAKE_WEI`, `COMMIT_SEC`, `REVEAL_SEC`, `FEE_BPS`
  - RPC/API keys per chain: `BASE_SEPOLIA_RPC`, `BASESCAN_API_KEY`, `POLYGON_AMOY_RPC`, `POLYGONSCAN_API_KEY`

Deploy to Base Sepolia:

```bash
scripts/deploy-testnet.sh base
```

Deploy to Polygon Amoy:

```bash
scripts/deploy-testnet.sh polygon
```

The script broadcasts and verifies. A summary is printed and saved to `contracts/deployments.json`. Raw broadcast artifacts live under `contracts/broadcast/`.

Re-verify:

```bash
scripts/verify.sh base 0xYourDeployedAddress
scripts/verify.sh polygon 0xYourDeployedAddress
```

---

## Solana (Anchor) — Deploy + IDL Publish

Prerequisites:
- Install Solana CLI and Anchor CLI
- Build your Anchor program so that `target/deploy/<program>.so` and `target/idl/<program>.json` exist

Deploy to Devnet/Testnet:

```bash
chmod +x scripts/solana-deploy.sh
scripts/solana-deploy.sh devnet   # or testnet
```

What it does:
- Sets `solana config` RPC
- Deploys with `solana program deploy`
- Publishes IDL on-chain (`anchor idl init/upgrade`)
- Saves `solana/deployments.json` and updates `frontend/.env`

Manual IDL publish:

```bash
chmod +x scripts/solana-verify.sh
scripts/solana-verify.sh devnet <PROGRAM_ID> target/idl/<program>.json
```

