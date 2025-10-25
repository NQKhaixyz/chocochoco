#!/usr/bin/env bash
set -euo pipefail

# Deploy ChocoChocoGame to Base Sepolia or Polygon Amoy and verify the source.
# Usage:
#   scripts/deploy-testnet.sh base
#   scripts/deploy-testnet.sh polygon
#
# Requires env vars (see scripts/env.example):
#   PRIVATE_KEY, TREASURY_ADDRESS, STAKE_WEI, COMMIT_SEC, REVEAL_SEC, FEE_BPS
#   BASE_SEPOLIA_RPC, BASESCAN_API_KEY
#   POLYGON_AMOY_RPC, POLYGONSCAN_API_KEY

CHAIN_INPUT=${1:-}
if [[ -z "$CHAIN_INPUT" ]]; then
  echo "Usage: scripts/deploy-testnet.sh [base|polygon]"
  exit 1
fi

pushd contracts > /dev/null

if [[ "$CHAIN_INPUT" == "base" ]]; then
  : "${BASE_SEPOLIA_RPC:?Missing BASE_SEPOLIA_RPC}"
  : "${BASESCAN_API_KEY:?Missing BASESCAN_API_KEY}"
  forge script script/DeployChocoChocoGame.s.sol:DeployChocoChocoGame \
    --chain base_sepolia --rpc-url "$BASE_SEPOLIA_RPC" \
    --broadcast --verify --etherscan-api-key "$BASESCAN_API_KEY" -vv
  CHAIN_ID=84532
  EXPLORER="https://sepolia.basescan.org/address"
elif [[ "$CHAIN_INPUT" == "polygon" ]]; then
  : "${POLYGON_AMOY_RPC:?Missing POLYGON_AMOY_RPC}"
  : "${POLYGONSCAN_API_KEY:?Missing POLYGONSCAN_API_KEY}"
  forge script script/DeployChocoChocoGame.s.sol:DeployChocoChocoGame \
    --chain polygon_amoy --rpc-url "$POLYGON_AMOY_RPC" \
    --broadcast --verify --etherscan-api-key "$POLYGONSCAN_API_KEY" -vv
  CHAIN_ID=80002
  EXPLORER="https://amoy.polygonscan.com/address"
else
  echo "Unknown chain: $CHAIN_INPUT (expected base|polygon)"
  exit 1
fi

RUN_JSON="broadcast/DeployChocoChocoGame.s.sol/${CHAIN_ID}/run-latest.json"

if command -v node >/dev/null 2>&1 && [[ -f "../scripts/print-latest-deploy.mjs" ]]; then
  node ../scripts/print-latest-deploy.mjs "$RUN_JSON" "$EXPLORER"
else
  echo "Broadcast JSON: $RUN_JSON"
  echo "Tip: install Node and run scripts/print-latest-deploy.mjs to extract address."
fi

popd > /dev/null

