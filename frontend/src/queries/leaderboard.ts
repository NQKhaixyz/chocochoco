export const Q_CLAIMS_PAGE = `
query ClaimsPage($first: Int!, $skip: Int!, $orderBy: Claim_orderBy = amount, $orderDirection: OrderDirection = desc) {
  claims(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
    id
    player
    amount
    timestamp
  }
}
`

export const Q_PLAYERROUNDS_WEEK = `
query PlayerRoundsWeek($from: BigInt!, $first: Int!, $skip: Int!) {
  playerRounds(
    first: $first
    skip: $skip
    where: { revealed: true, round_: { settledAt_gte: $from } }
    orderBy: revealedAt
    orderDirection: desc
  ) {
    id
    player
    side
    round { id winnerSide settledAt }
  }
}
`

