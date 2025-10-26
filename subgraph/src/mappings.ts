import { Address, BigInt } from '@graphprotocol/graph-ts'
import {
  RoundCreated as RoundCreatedEvent,
  MeowCommitted as MeowCommittedEvent,
  MeowRevealed as MeowRevealedEvent,
  RoundMeowed as RoundMeowedEvent,
  TreatClaimed as TreatClaimedEvent,
  ChocoChocoGame,
} from '../generated/ChocoChocoGame/ChocoChocoGame'
import { Round, PlayerRound, Claim, TreasuryFee } from '../generated/schema'
import { prId, rid, feeFromRound } from './utils'

function bind(addr: Address): ChocoChocoGame { return ChocoChocoGame.bind(addr) }

export function handleRoundCreated(e: RoundCreatedEvent): void {
  const id = rid(e.params.id)
  let r = new Round(id)
  r.commitEnd = e.params.commitDeadline
  r.revealEnd = e.params.revealDeadline
  r.totalCommitted = BigInt.zero()
  r.totalRevealedMilk = BigInt.zero()
  r.totalRevealedCacao = BigInt.zero()
  r.isSettled = false
  r.winnerSide = null
  r.createdAt = e.block.timestamp
  r.createdTx = e.transaction.hash
  r.settledAt = null
  r.settledTx = null
  r.save()
}

export function handleMeowCommitted(e: MeowCommittedEvent): void {
  const contract = bind(e.address)
  const roundId = e.params.id
  const id = rid(roundId)
  let r = Round.load(id)
  if (r == null) return

  const pid = prId(roundId, e.params.player)
  let p = PlayerRound.load(pid)
  if (p == null) {
    p = new PlayerRound(pid)
    p.round = id
    p.player = e.params.player
    // Read commitment and stake from contract state
    const c = contract.commitments(roundId, e.params.player)
    p.commitment = c
    const info = contract.rounds(roundId)
    // tuple order: status, commitDeadline, revealDeadline, stake, feeBps, poolMilk, poolCacao, countMilk, countCacao
    p.stake = info.value3
    p.side = 0
    p.salt = null
    p.revealed = false
    p.committedAt = e.block.timestamp
    p.commitTx = e.transaction.hash
    p.revealedAt = null
    p.revealTx = null
    p.claimed = false
    p.payout = null
    p.save()
  } else {
    // Update commitment only (if re-commit allowed)
    const c = contract.commitments(roundId, e.params.player)
    p.commitment = c
    p.committedAt = e.block.timestamp
    p.commitTx = e.transaction.hash
    p.save()
  }

  // Increase total committed by per-entry stake
  const info2 = contract.rounds(roundId)
  const stake = info2.value3
  r.totalCommitted = r.totalCommitted.plus(stake)
  r.save()
}

export function handleMeowRevealed(e: MeowRevealedEvent): void {
  const roundId = e.params.id
  const id = rid(roundId)
  let r = Round.load(id)
  if (r == null) return

  const pid = prId(roundId, e.params.player)
  let p = PlayerRound.load(pid)
  if (p == null) return

  const tribe = e.params.tribe // 1=Milk, 2=Cacao (0=None)
  p.side = tribe
  p.revealed = true
  p.revealedAt = e.block.timestamp
  p.revealTx = e.transaction.hash
  p.save()

  if (tribe == 1) {
    r.totalRevealedMilk = r.totalRevealedMilk.plus(p.stake)
  } else if (tribe == 2) {
    r.totalRevealedCacao = r.totalRevealedCacao.plus(p.stake)
  }
  r.save()
}

export function handleRoundMeowed(e: RoundMeowedEvent): void {
  const contract = bind(e.address)
  const roundId = e.params.id
  const id = rid(roundId)
  let r = Round.load(id)
  if (r == null) return

  const minority = e.params.minority // 0=None, 1=Milk, 2=Cacao
  r.isSettled = true
  r.winnerSide = minority == 0 ? null : minority
  r.settledAt = e.block.timestamp
  r.settledTx = e.transaction.hash
  r.save()

  // Compute fee from on-chain round state
  const info = contract.rounds(roundId)
  // order per tuple: status, commitDeadline, revealDeadline, stake, feeBps, poolMilk, poolCacao, countMilk, countCacao
  const poolMilk = info.value5
  const poolCacao = info.value6
  const feeBps = info.value4.toI32()
  const fee = feeFromRound(poolMilk, poolCacao, feeBps)

  const feeId = id + '-' + e.logIndex.toString()
  let tf = new TreasuryFee(feeId)
  tf.round = id
  tf.amount = fee
  tf.tx = e.transaction.hash
  tf.timestamp = e.block.timestamp
  tf.save()
}

export function handleTreatClaimed(e: TreatClaimedEvent): void {
  const roundId = e.params.id
  const id = rid(roundId)
  const pid = prId(roundId, e.params.player)
  let p = PlayerRound.load(pid)
  if (p != null) {
    p.claimed = true
    p.payout = e.params.amount
    p.save()
  }

  let c = new Claim(pid)
  c.round = id
  c.player = e.params.player
  c.amount = e.params.amount
  c.tx = e.transaction.hash
  c.timestamp = e.block.timestamp
  c.save()
}
