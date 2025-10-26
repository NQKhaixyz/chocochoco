# ChocoChoco Subgraph

> Indexes on-chain events for the ChocoChoco commit–reveal game: RoundCreated, MeowCommitted, MeowRevealed, RoundMeowed, TreatClaimed.

## Entities
- Round: deadlines, totals (committed/revealed), settle status and winner
- PlayerRound: per-player participation per round (commit/reveal/claim)
- Claim: payout claims
- TreasuryFee: settlement fee computed from on-chain pools and feeBps

## Requirements
- Node LTS
- `pnpm i` inside `subgraph/`
- The Graph Studio account (for hosted deploy)
- Build contracts with Foundry to generate ABI at `contracts/out/ChocoChocoGame.sol/ChocoChocoGame.json`

## Configure
Edit `subgraph/subgraph.yaml`:
- `network`: `base-sepolia` or `polygon-mumbai`
- `source.address`: deployed contract address
- `startBlock`: block to start indexing from

The ABI path points to Foundry output: `../contracts/out/ChocoChocoGame.sol/ChocoChocoGame.json`.
Run `forge build` from the contracts folder before `graph build`.

## Commands
```bash
pnpm i
pnpm codegen
pnpm build

# Base Sepolia
pnpm create:base-sepolia
pnpm deploy:base-sepolia

# Or Polygon Mumbai
pnpm create:mumbai
pnpm deploy:mumbai
```

## Query examples

Latest rounds
```graphql
{
  rounds(first: 5, orderBy: createdAt, orderDirection: desc) {
    id
    commitEnd
    revealEnd
    totalCommitted
    totalRevealedMilk
    totalRevealedCacao
    isSettled
    winnerSide
  }
}
```

Player in a round
```graphql
{
  playerRounds(where:{ player: "0xyouraddresslowercased", round_: { id: "1" } }) {
    id
    commitment
    stake
    side
    revealed
    claimed
    payout
  }
}
```

Recent claims
```graphql
{
  claims(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    round { id }
    player
    amount
    tx
    timestamp
  }
}
```

Treasury fees of a round
```graphql
{
  treasuryFees(where:{ round: "1" }) {
    id
    amount
    tx
    timestamp
  }
}
```

## Notes
- Event signatures match the Solidity contract in `contracts/src/ChocoChocoGame.sol`.
- Side mapping follows Enum values: 1=Milk, 2=Cacao, 0=None.
- Per-commit stake inferred from `rounds(roundId).stake` (fixed per entry).
- Fee on settlement computed from `rounds(roundId)` pools and `feeBps`.

## Troubleshooting
- Empty results: double-check `address`, `startBlock`, and `network`.
- Codegen/build errors: ensure ABI path exists (run `forge build`) and event signatures match.
- Totals differ: we only add to `totalRevealed*` on reveal; before that use `totalCommitted`.

