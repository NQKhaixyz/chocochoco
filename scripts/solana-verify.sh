#!/usr/bin/env bash
set -euo pipefail

# Verify Solana program deployment and on-chain IDL. Also supports manual IDL publish/upgrade.
#
# Verify mode (recommended):
#   scripts/solana-verify.sh devnet [PROGRAM_ID]
#     - If PROGRAM_ID missing, read the last entry for the cluster from solana/deployments.json
#     - Shows `solana program show`, compares with frontend/.env, checks on-chain IDL
#
# IDL publish/upgrade mode (back-compat):
#   scripts/solana-verify.sh devnet <PROGRAM_ID> <IDL_PATH>

NETWORK=${1:-}
ARG2=${2:-}
ARG3=${3:-}

case "${NETWORK}" in
  devnet) CLUSTER=devnet; URL="https://api.devnet.solana.com";;
  testnet) CLUSTER=testnet; URL="https://api.testnet.solana.com";;
  *) echo "Usage: scripts/solana-verify.sh [devnet|testnet] [PROGRAM_ID] [IDL_PATH (optional for publish)]" >&2; exit 1;;
esac

# If IDL path is provided and exists -> publish/upgrade IDL (legacy behavior)
if [[ -n "${ARG3}" && -f "${ARG3}" ]]; then
  PROGRAM_ID="${ARG2:-}"
  IDL_PATH="${ARG3}"
  if [[ -z "${PROGRAM_ID}" ]]; then
    echo "Missing PROGRAM_ID for IDL publish." >&2; exit 1
  fi
  echo "→ Publishing IDL for $PROGRAM_ID on $CLUSTER"
  if anchor idl init "$PROGRAM_ID" "$IDL_PATH" --provider.cluster "$CLUSTER" >/dev/null 2>&1; then
    echo "IDL initialized on-chain."
  else
    anchor idl upgrade "$PROGRAM_ID" "$IDL_PATH" --provider.cluster "$CLUSTER"
    echo "IDL upgraded on-chain."
  fi
  EXPLORER_URL="https://explorer.solana.com/address/${PROGRAM_ID}?cluster=${CLUSTER}"
  echo "→ Explorer: $EXPLORER_URL"
  exit 0
fi

# Verify mode
PROGRAM_ID="${ARG2:-}"
if [[ -z "${PROGRAM_ID}" ]]; then
  # Read from solana/deployments.json (last entry for this cluster)
  PROGRAM_ID=$(node -e '
    const fs = require("fs");
    try {
      const data = JSON.parse(fs.readFileSync("solana/deployments.json","utf8"));
      const cluster = process.argv[1];
      const filt = Array.isArray(data) ? data.filter(x=>x && x.network===cluster) : [];
      if (filt.length === 0) process.exit(1);
      console.log(filt[filt.length-1].programId);
    } catch (e) { process.exit(1); }
  ' "$CLUSTER" 2>/dev/null || true)
fi

if [[ -z "${PROGRAM_ID}" ]]; then
  echo "Unable to determine PROGRAM_ID. Provide it explicitly or ensure solana/deployments.json exists." >&2
  exit 1
fi

echo "🔍 Verifying program deployment on $CLUSTER..."
solana program show "$PROGRAM_ID" --url "$URL"

# Compare with frontend/.env
ENV_PATH="frontend/.env"
ENV_ID=""
if [[ -f "$ENV_PATH" ]]; then
  ENV_ID=$(grep -E '^VITE_PROGRAM_ID=' "$ENV_PATH" | sed 's/^VITE_PROGRAM_ID=//')
fi

if [[ -n "$ENV_ID" && "$ENV_ID" != "$PROGRAM_ID" ]]; then
  echo "⚠️  Mismatch: frontend/.env has $ENV_ID, deployments/arg has $PROGRAM_ID"
else
  echo "✅ Program ID matches frontend/.env or env not set"
fi

echo "🔍 Checking on-chain IDL..."
TMP_IDL=$(mktemp)
set +e
anchor idl fetch "$PROGRAM_ID" --provider.cluster "$CLUSTER" > "$TMP_IDL" 2>/dev/null
FETCH_RC=$?
set -e
if [[ $FETCH_RC -eq 0 && -s "$TMP_IDL" ]]; then
  echo "✅ IDL found on-chain!"
else
  echo "❌ No on-chain IDL found. Consider running: scripts/solana-deploy.sh $CLUSTER or publish via this script with IDL path."
fi
rm -f "$TMP_IDL"

echo "Explorer: https://explorer.solana.com/address/${PROGRAM_ID}?cluster=${CLUSTER}"

