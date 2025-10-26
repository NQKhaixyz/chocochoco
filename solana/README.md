# Solana Deployments

This directory tracks Anchor program deployments across different clusters.

## deployments.json

Automatically updated by `scripts/solana-deploy.sh`. Each entry contains:

```json
{
  "program": "chocochoco_game",
  "programId": "J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz",
  "network": "devnet",
  "slot": 123456789,
  "explorer": "https://explorer.solana.com/address/J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz?cluster=devnet",
  "timestamp": "2025-10-26T10:30:00.000Z"
}
```

## Usage

### Deploy to devnet
```bash
./scripts/solana-deploy.sh devnet
```

### Verify deployment
```bash
./scripts/solana-verify.sh devnet
```

### Check latest program ID for cluster
```bash
# Using jq
jq '.[] | select(.network=="devnet") | .programId' solana/deployments.json | tail -n1

# Using Node.js
node -e '
  const data = require("./solana/deployments.json");
  const devnet = data.filter(x => x.network === "devnet");
  console.log(devnet[devnet.length - 1]?.programId);
'
```
