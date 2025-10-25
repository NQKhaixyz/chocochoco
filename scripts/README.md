# ChocoChoco Scripts

Utility scripts for deployment, verification, PR automation, data export, etc.

Examples:
- deploy-testnet.sh — deploy + verify to Base Sepolia / Polygon Amoy
- verify.sh — re-run verification for an existing address
- env.example — template for RPC URLs, keys, constructor params
- create_chocochoco_pr.sh — open a PR to https://github.com/NQKhaixyz/chocochoco

GameFi-related env (gợi ý):
- STAKE_TOKEN (khuyến nghị đặt = FOOD_TOKEN)
- FOOD_TOKEN, PAW_TOKEN, CAT_NFT, CHEST_ADDRESS

Usage (PR script):

```bash
chmod +x scripts/create_chocochoco_pr.sh
./scripts/create_chocochoco_pr.sh  # requires gh auth login
```

## Deploy + Verify (Testnets)

Prerequisites:
- Foundry installed (`foundryup`), dependencies installed in `contracts/`
- Copy `scripts/env.example` to `.env` and fill values, then `source .env`
  - Required: `PRIVATE_KEY`, `TREASURY_ADDRESS`, `STAKE_WEI`, `COMMIT_SEC`, `REVEAL_SEC`, `FEE_BPS`
  - RPC/API keys per chain: `BASE_SEPOLIA_RPC`, `BASESCAN_API_KEY`, `POLYGON_AMOY_RPC`, `POLYGONSCAN_API_KEY`

Deploy to Base Sepolia:

```bash
chmod +x scripts/deploy-testnet.sh
scripts/deploy-testnet.sh base
```

Deploy to Polygon Amoy:

```bash
scripts/deploy-testnet.sh polygon
```

The script broadcasts and verifies. A summary is printed and also saved to `contracts/deployments.json`. Raw broadcast artifacts live under `contracts/broadcast/`.

Re-verify (optional) if needed:

```bash
chmod +x scripts/verify.sh
scripts/verify.sh base 0xYourDeployedAddress
scripts/verify.sh polygon 0xYourDeployedAddress
```

## Frontend Env

After deploy, update the FE env with the address and RPC for the target chain. Use `frontend/.env.example` as a template, create `frontend/.env` with:

```
VITE_CHAIN_ID=84532                 # Base Sepolia (or 80002 for Polygon Amoy)
VITE_RPC_URL=$BASE_SEPOLIA_RPC      # or $POLYGON_AMOY_RPC
VITE_GAME_ADDRESS=0xDeployedAddress
```

Then restart the FE dev server.
