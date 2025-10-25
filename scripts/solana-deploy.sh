#!/usr/bin/env bash
set -euo pipefail

# Deploy a Solana Anchor program to devnet or testnet and publish the IDL.
# Requirements:
# - Solana CLI (`solana`) and Anchor CLI (`anchor`) installed
# - An Anchor workspace with a compiled .so under `target/deploy/<program>.so`
# - PROGRAM_NAME env or infer from target/deploy/*.so
# - Optional: PROGRAM_KEYPAIR path (default: target/deploy/<program>-keypair.json)
#
# Usage:
#   scripts/solana-deploy.sh devnet
#   scripts/solana-deploy.sh testnet
#
# Environment (optional):
#   SOLANA_WALLET (path to deployer keypair, default: ~/.config/solana/id.json)
#   PROGRAM_NAME (Anchor program name; inferred if not set)
#   PROGRAM_KEYPAIR (path to program keypair json)
#   FRONTEND_ENV_PATH (override frontend/.env)

NETWORK=${1:-}
if [[ -z "$NETWORK" ]]; then
  echo "Usage: scripts/solana-deploy.sh [devnet|testnet]" >&2
  exit 1
fi

case "$NETWORK" in
  devnet)
    RPC_URL="https://api.devnet.solana.com"
    CLUSTER="devnet"
    ;;
  testnet)
    RPC_URL="https://api.testnet.solana.com"
    CLUSTER="testnet"
    ;;
  *)
    echo "Unknown network: $NETWORK (expected devnet|testnet)" >&2
    exit 1
    ;;
esac

# Find program name from target/deploy if not provided
if [[ -z "${PROGRAM_NAME:-}" ]]; then
  CANDIDATE=$(ls target/deploy/*.so 2>/dev/null | head -n1 || true)
  if [[ -z "$CANDIDATE" ]]; then
    echo "No program .so found under target/deploy. Run 'anchor build' first." >&2
    exit 1
  fi
  BASENAME=$(basename "$CANDIDATE")
  PROGRAM_NAME=${BASENAME%.so}
fi

PROGRAM_SO="target/deploy/${PROGRAM_NAME}.so"
PROGRAM_KEYPAIR_DEFAULT="target/deploy/${PROGRAM_NAME}-keypair.json"
PROGRAM_KEYPAIR_PATH=${PROGRAM_KEYPAIR:-$PROGRAM_KEYPAIR_DEFAULT}

if [[ ! -f "$PROGRAM_SO" ]]; then
  echo "Missing program binary: $PROGRAM_SO. Run 'anchor build' first." >&2
  exit 1
fi

if [[ ! -f "$PROGRAM_KEYPAIR_PATH" ]]; then
  echo "Missing program keypair: $PROGRAM_KEYPAIR_PATH. Run 'anchor build' first." >&2
  exit 1
fi

echo "-> Setting Solana config to $RPC_URL ($CLUSTER)"
solana config set --url "$RPC_URL" >/dev/null

if [[ -n "${SOLANA_WALLET:-}" ]]; then
  solana config set --keypair "$SOLANA_WALLET" >/dev/null
fi

echo "-> Deploying ${PROGRAM_NAME} to $CLUSTER"
DEPLOY_OUTPUT=$(solana program deploy "$PROGRAM_SO" --program-id "$PROGRAM_KEYPAIR_PATH")
echo "$DEPLOY_OUTPUT"

# Extract program id
PROGRAM_ID=$(echo "$DEPLOY_OUTPUT" | sed -n 's/^Program Id: \(.*\)$/\1/p' | tr -d '\r')
if [[ -z "$PROGRAM_ID" ]]; then
  # Fallback: solana address -k <program keypair>
  PROGRAM_ID=$(solana address -k "$PROGRAM_KEYPAIR_PATH")
fi

SLOT=$(solana slot)
EXPLORER_URL="https://explorer.solana.com/address/${PROGRAM_ID}?cluster=${CLUSTER}"

echo "Deployed ${PROGRAM_NAME} at ${PROGRAM_ID} on ${CLUSTER} (slot ${SLOT})"
echo "Explorer: ${EXPLORER_URL}"

# Publish IDL (verify-like step for Anchor projects)
IDL_PATH="target/idl/${PROGRAM_NAME}.json"
if [[ -f "$IDL_PATH" ]]; then
  echo "-> Publishing IDL to chain"
  # Try init, if exists then update
  if anchor idl init "$PROGRAM_ID" "$IDL_PATH" --provider.cluster "$CLUSTER" >/dev/null 2>&1; then
    echo "IDL initialized on-chain."
  else
    anchor idl upgrade "$PROGRAM_ID" "$IDL_PATH" --provider.cluster "$CLUSTER"
    echo "IDL upgraded on-chain." 
  fi
else
  echo "Info: No IDL found at $IDL_PATH — skipping IDL publish."
fi

# Save outputs and update FE env
PROGRAM_ID="$PROGRAM_ID" CLUSTER="$CLUSTER" SLOT="$SLOT" EXPLORER_URL="$EXPLORER_URL" PROGRAM_NAME="$PROGRAM_NAME" \
node -e '
  const fs = require("fs");
  const path = require("path");
  const programId = process.env.PROGRAM_ID;
  const cluster = process.env.CLUSTER;
  const slot = process.env.SLOT;
  const explorer = process.env.EXPLORER_URL;
  const dest = path.resolve("solana", "deployments.json");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  let data = [];
  if (fs.existsSync(dest)) {
    try { data = JSON.parse(fs.readFileSync(dest, "utf8")); if (!Array.isArray(data)) data = []; } catch {}
  }
  data.push({
    program: process.env.PROGRAM_NAME,
    programId,
    network: cluster,
    slot: Number(slot),
    explorer,
    timestamp: new Date().toISOString()
  });
  fs.writeFileSync(dest, JSON.stringify(data, null, 2));
  const envPath = process.env.FRONTEND_ENV_PATH || path.resolve("frontend", ".env");
  let contents = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const lines = contents ? contents.split(/\r?\n/) : [];
  function setKV(k,v){ let f=false; for(let i=0;i<lines.length;i++){ if(lines[i].startsWith(k+"=")){ lines[i]=k+"="+v; f=true; break; } } if(!f) lines.push(k+"="+v); }
  setKV("VITE_SOLANA_CLUSTER", cluster);
  setKV("VITE_PROGRAM_ID", programId);
  fs.mkdirSync(path.dirname(envPath), { recursive: true });
  fs.writeFileSync(envPath, lines.filter(Boolean).join("\n")+"\n");
  console.log("Saved -> "+path.relative(process.cwd(), dest));
  console.log("Updated FE env -> "+path.relative(process.cwd(), envPath));
'

