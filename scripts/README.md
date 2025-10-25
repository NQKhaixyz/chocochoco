# ChocoChoco Scripts

Utility scripts for deployment, verification, PR automation, data export, etc.

Examples:
- deploy-testnet.sh (deploy contracts to Base/Polygon testnet)
- verify.sh (Etherscan/Sourcify verification)
- env.example (RPC_URL, PRIVATE_KEY, TREASURY_ADDRESS, CONTRACT_ADDRESS)
- create_chocochoco_pr.sh (open a PR to https://github.com/NQKhaixyz/chocochoco with current chocochoco content)

Usage (PR script):

```bash
chmod +x scripts/create_chocochoco_pr.sh
./scripts/create_chocochoco_pr.sh  # requires gh auth login
```
