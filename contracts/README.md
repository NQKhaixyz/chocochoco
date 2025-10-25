# ChocoChoco Contracts

This folder holds the on-chain smart contracts for ChocoChoco, scaffolded with **Foundry**.

![CI](https://github.com/Dle28/MICA-E.Dapp/actions/workflows/chocochoco-contracts-ci.yml/badge.svg)

## Prerequisites

- `foundryup` installed (see <https://book.getfoundry.sh/getting-started/installation>)
- Node.js (optional, for scripting helpers)

## Project layout

- `foundry.toml` — Foundry configuration (remappings, RPC endpoints, Etherscan keys)
- `lib/openzeppelin-contracts` — placeholder directory; install real dependency via `forge install`
- `src/ChocoChocoGame.sol` — placeholder contract with default round parameters
- `test/ChocoChocoGame.t.sol` — TDD seed verifying version + default params
- `script/DeployChocoChocoGame.s.sol` — minimal deployment script

## Setup

```bash
cd contracts
foundryup                 # only if Foundry not yet installed
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit  # optional but recommended when extending tests
```

## Run tests

```bash
forge test
```

## Deploy (example)

```bash
forge script script/DeployChocoChocoGame.s.sol:DeployChocoChocoGame \
	--rpc-url $BASE_SEPOLIA_RPC \
	--broadcast
```

Contract spec and API are defined in `../DESIGN.md`.
