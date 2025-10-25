#!/usr/bin/env bash
set -euo pipefail

# Verify an already deployed contract/program
# EVM: Base Sepolia / Polygon Amoy via Etherscan-like API
# Solana: publish/upgrade Anchor IDL on devnet/testnet
#
# Usage:
#   EVM   : scripts/verify.sh base 0xDeployedAddress
#           scripts/verify.sh polygon 0xDeployedAddress
#   Solana: scripts/verify.sh solana-devnet <PROGRAM_ID> target/idl/<program>.json
#           scripts/verify.sh solana-testnet <PROGRAM_ID> target/idl/<program>.json

MODE=${1:-}
case "$MODE" in
  base|polygon)
    ADDRESS=${2:-}
    if [[ -z "$ADDRESS" ]]; then
      echo "Usage: scripts/verify.sh [base|polygon] 0xContractAddress" >&2
      exit 1
    fi
    pushd contracts > /dev/null
    case "$MODE" in
      base)
        : "${BASESCAN_API_KEY:?Missing BASESCAN_API_KEY}"
        CHAIN=base_sepolia
        API_KEY="$BASESCAN_API_KEY"
        ;;
      polygon)
        : "${POLYGONSCAN_API_KEY:?Missing POLYGONSCAN_API_KEY}"
        CHAIN=polygon_amoy
        API_KEY="$POLYGONSCAN_API_KEY"
        ;;
    esac
    forge verify-contract \
      --chain "$CHAIN" \
      --etherscan-api-key "$API_KEY" \
      "$ADDRESS" src/ChocoChocoGame.sol:ChocoChocoGame \
      --watch -vv
    popd > /dev/null
    ;;
  solana-devnet|solana-testnet)
    PROGRAM_ID=${2:-}
    IDL_PATH=${3:-}
    if [[ -z "$PROGRAM_ID" || -z "$IDL_PATH" ]]; then
      echo "Usage: scripts/verify.sh $MODE <PROGRAM_ID> <IDL_PATH>" >&2
      exit 1
    fi
    NET=${MODE#solana-}
    chmod +x "$(dirname "$0")/solana-verify.sh" >/dev/null 2>&1 || true
    "$(dirname "$0")/solana-verify.sh" "$NET" "$PROGRAM_ID" "$IDL_PATH"
    ;;
  *)
    echo "Unknown mode: $MODE (expected base|polygon|solana-devnet|solana-testnet)" >&2
    exit 1
    ;;
esac
