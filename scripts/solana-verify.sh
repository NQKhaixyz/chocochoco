#!/usr/bin/env bash
set -euo pipefail

# Publish/upgrade Anchor IDL for a deployed Solana program (devnet/testnet).
# Usage:
#   scripts/solana-verify.sh devnet <PROGRAM_ID> <IDL_PATH>
#   scripts/solana-verify.sh testnet <PROGRAM_ID> <IDL_PATH>

NETWORK=${1:-}
PROGRAM_ID=${2:-}
IDL_PATH=${3:-}

if [[ -z "$NETWORK" || -z "$PROGRAM_ID" || -z "$IDL_PATH" ]]; then
  echo "Usage: scripts/solana-verify.sh [devnet|testnet] <PROGRAM_ID> <IDL_PATH>" >&2
  exit 1
fi

case "$NETWORK" in
  devnet) CLUSTER=devnet;;
  testnet) CLUSTER=testnet;;
  *) echo "Unknown network: $NETWORK (expected devnet|testnet)" >&2; exit 1;;
esac

if [[ ! -f "$IDL_PATH" ]]; then
  echo "IDL not found: $IDL_PATH" >&2
  exit 1
fi

echo "→ Publishing IDL for $PROGRAM_ID on $CLUSTER"
if anchor idl init "$PROGRAM_ID" "$IDL_PATH" --provider.cluster "$CLUSTER" >/dev/null 2>&1; then
  echo "IDL initialized on-chain."
else
  anchor idl upgrade "$PROGRAM_ID" "$IDL_PATH" --provider.cluster "$CLUSTER"
  echo "IDL upgraded on-chain."
fi

EXPLORER_URL="https://explorer.solana.com/address/${PROGRAM_ID}?cluster=${CLUSTER}"
echo "🔗 Explorer: $EXPLORER_URL"

