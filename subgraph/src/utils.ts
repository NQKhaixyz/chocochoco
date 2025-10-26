import { Address, BigInt, crypto, ByteArray } from '@graphprotocol/graph-ts'

export function rid(id: BigInt): string { return id.toString() }

export function prId(roundId: BigInt, player: Address): string {
  return rid(roundId) + '-' + player.toHexString().toLowerCase()
}

export function feeFromRound(totalMilk: BigInt, totalCacao: BigInt, feeBps: i32): BigInt {
  const total = totalMilk.plus(totalCacao)
  // (total * feeBps) / 10000
  return total.times(BigInt.fromI32(feeBps)).div(BigInt.fromI32(10_000))
}

