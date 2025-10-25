#!/usr/bin/env bash
set -euo pipefail

# Detects Hardhat or Foundry and runs a basic deploy.
# Usage: scripts/run-deploy.sh [args]

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

if ls "$ROOT_DIR"/hardhat.config.* >/dev/null 2>&1; then
  echo "Detected Hardhat. Running hardhat deploy..."
  if [ -f "$ROOT_DIR/scripts/deploy.ts" ]; then
    npx hardhat run "$ROOT_DIR/scripts/deploy.ts"
  else
    echo "No scripts/deploy.ts found. Please add a deploy script."
    exit 1
  fi
elif [ -f "$ROOT_DIR/contracts/foundry.toml" ]; then
  echo "Detected Foundry. Running Foundry deploy (Base Sepolia by default)..."
  if [ -f "$ROOT_DIR/scripts/deploy-testnet.sh" ]; then
    chmod +x "$ROOT_DIR/scripts/deploy-testnet.sh" || true
    "$ROOT_DIR/scripts/deploy-testnet.sh" base
  else
    echo "scripts/deploy-testnet.sh not found."
    exit 1
  fi
else
  echo "No Hardhat or Foundry configuration found."
  exit 1
fi

