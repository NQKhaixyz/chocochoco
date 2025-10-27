// Local demo state manager to link Join → Reveal → Claim flows
// Uses localStorage to simulate rounds and per-player states.

import { PublicKey } from '@solana/web3.js'
import { computeCommitment, toHex, type Tribe } from './solana-commit'
import { getRoundAddress } from '../solana/program'

export type DemoRound = {
  id: number
  startTime: number // epoch seconds
  commitEndTime: number
  revealEndTime: number
  finalizeTime: number
  stakeLamports: bigint
  feeBps: number
  countMilk: number
  countCacao: number
  isFinalized: boolean
  winnerSide: Tribe | null
}

export type DemoPlayerRound = {
  roundId: number
  player: string // base58
  commitmentHex: `0x${string}`
  tribe: Tribe
  saltHex: `0x${string}`
  committedAt: number
  revealed: boolean
  claimed: boolean
  revealedAt?: number
  claimedAt?: number
}

type DemoState = {
  currentRoundId: number
  rounds: Record<number, DemoRound>
  playerRounds: Record<string, DemoPlayerRound> // key: `${roundId}:${player}`
}

const LS_KEY = 'choco:demo:v1'

function nowSec() {
  return Math.floor(Date.now() / 1000)
}

function loadState(): DemoState {
  const existing = localStorage.getItem(LS_KEY)
  if (existing) {
    try {
      const parsed = JSON.parse(existing, (key, value) => {
        // Revive BigInt values
        if (key === 'stakeLamports' && typeof value === 'string') {
          return BigInt(value)
        }
        return value
      }) as DemoState
      return parsed
    } catch {}
  }
  // initialize with a first round
  const init = createStateWithNewRound(undefined)
  saveState(init)
  return init
}

function saveState(state: DemoState) {
  localStorage.setItem(LS_KEY, JSON.stringify(state, (key, value) => {
    // Serialize BigInt as string
    if (typeof value === 'bigint') {
      return value.toString()
    }
    return value
  }))
}

function durations() {
  const commitSecs = parseInt(import.meta.env.VITE_DEMO_COMMIT_SECS || '30')
  const revealSecs = parseInt(import.meta.env.VITE_DEMO_REVEAL_SECS || '30')
  const finalizeSecs = parseInt(import.meta.env.VITE_DEMO_FINALIZE_SECS || '10')
  return { commitSecs, revealSecs, finalizeSecs }
}

function defaultStakeLamports(): bigint {
  const v = import.meta.env.VITE_DEMO_STAKE_LAMPORTS
  if (!v) return BigInt(5_000_000_000) // 5 SOL default (for demo only)
  try {
    return BigInt(v)
  } catch {
    return BigInt(5_000_000_000)
  }
}

function createRound(id: number, startAt?: number): DemoRound {
  const { commitSecs, revealSecs, finalizeSecs } = durations()
  const start = startAt ?? nowSec()
  return {
    id,
    startTime: start,
    commitEndTime: start + commitSecs,
    revealEndTime: start + commitSecs + revealSecs,
    finalizeTime: start + commitSecs + revealSecs + finalizeSecs,
    stakeLamports: defaultStakeLamports(),
    feeBps: 250,
    countMilk: 0,
    countCacao: 0,
    isFinalized: false,
    winnerSide: null,
  }
}

function createStateWithNewRound(base?: DemoState): DemoState {
  const id = base ? base.currentRoundId + 1 : 1
  const round = createRound(id)
  const state: DemoState = base
    ? { ...base, currentRoundId: id, rounds: { ...base.rounds, [id]: round } }
    : { currentRoundId: id, rounds: { [id]: round }, playerRounds: {} }
  return state
}

function keyFor(roundId: number, player: string) {
  return `${roundId}:${player}`
}

function recalcCounts(state: DemoState, roundId: number) {
  const pr = Object.values(state.playerRounds).filter((x) => x.roundId === roundId)
  const milk = pr.filter((x) => x.tribe === 'Milk').length
  const cacao = pr.filter((x) => x.tribe === 'Cacao').length
  const round = state.rounds[roundId]
  if (round) {
    round.countMilk = milk
    round.countCacao = cacao
  }
}

function maybeSettle(state: DemoState, roundId: number) {
  const round = state.rounds[roundId]
  if (!round) return
  const t = nowSec()
  // compute winner after reveal ends if not set
  if (t >= round.revealEndTime && round.winnerSide === null) {
    const prs = Object.values(state.playerRounds).filter((x) => x.roundId === roundId && x.revealed)
    const milk = prs.filter((x) => x.tribe === 'Milk').length
    const cacao = prs.filter((x) => x.tribe === 'Cacao').length
    if (milk === cacao) {
      round.winnerSide = null // tie
    } else {
      round.winnerSide = milk < cacao ? 'Milk' : 'Cacao'
    }
  }
  // finalize after finalizeTime
  if (t >= round.finalizeTime) {
    round.isFinalized = true
  }
}

function maybeAdvanceRound(state: DemoState) {
  const curr = state.rounds[state.currentRoundId]
  if (!curr) return
  const t = nowSec()
  if (t > curr.finalizeTime && curr.isFinalized) {
    // start a new round
    const next = createRound(state.currentRoundId + 1, t)
    state.rounds[next.id] = next
    state.currentRoundId = next.id
  }
}

export function getCurrentRoundId(): number {
  const state = loadState()
  maybeSettle(state, state.currentRoundId)
  maybeAdvanceRound(state)
  saveState(state)
  return state.currentRoundId
}

export function getRound(roundId: number): DemoRound | undefined {
  const state = loadState()
  const r = state.rounds[roundId]
  if (!r) return undefined
  maybeSettle(state, roundId)
  recalcCounts(state, roundId)
  saveState(state)
  return state.rounds[roundId]
}

export function getPlayerRound(roundId: number, player: PublicKey): DemoPlayerRound | undefined {
  const state = loadState()
  const k = keyFor(roundId, player.toBase58())
  return state.playerRounds[k]
}

export async function commit(
  roundId: number,
  player: PublicKey,
  tribe: Tribe,
  salt: Uint8Array,
): Promise<DemoPlayerRound> {
  const state = loadState()
  const round = state.rounds[roundId]
  if (!round) throw new Error('Round not found')
  const t = nowSec()
  if (t >= round.commitEndTime) throw new Error('Commit phase closed')

  const roundPk = getRoundAddress(roundId)
  const commitment = await computeCommitment(tribe, salt, player, roundPk)
  const entry: DemoPlayerRound = {
    roundId,
    player: player.toBase58(),
    tribe,
    saltHex: `0x${toHex(salt)}` as const,
    commitmentHex: `0x${toHex(commitment)}` as const,
    committedAt: Date.now(),
    revealed: false,
    claimed: false,
  }
  const k = keyFor(roundId, entry.player)
  state.playerRounds[k] = entry
  recalcCounts(state, roundId)
  saveState(state)
  return entry
}

export function reveal(roundId: number, player: PublicKey) {
  const state = loadState()
  const round = state.rounds[roundId]
  if (!round) throw new Error('Round not found')
  const t = nowSec()
  if (t < round.commitEndTime) throw new Error('Reveal not started')
  if (t >= round.revealEndTime) throw new Error('Reveal closed')
  const k = keyFor(roundId, player.toBase58())
  const pr = state.playerRounds[k]
  if (!pr) throw new Error('No commit for this player')
  if (pr.revealed) return
  pr.revealed = true
  pr.revealedAt = Date.now()
  saveState(state)
}

export function canClaim(roundId: number, player: PublicKey): { eligible: boolean; reason?: string } {
  const state = loadState()
  const round = state.rounds[roundId]
  if (!round) return { eligible: false, reason: 'Round not found' }
  maybeSettle(state, roundId)
  const pr = state.playerRounds[keyFor(roundId, player.toBase58())]
  if (!pr) return { eligible: false, reason: 'Not participated' }
  if (!round.isFinalized) return { eligible: false, reason: 'Round not finalized' }
  if (!pr.revealed) return { eligible: false, reason: 'Not revealed' }
  if (pr.claimed) return { eligible: false, reason: 'Already claimed' }
  if (round.winnerSide === null) return { eligible: false, reason: 'Tie (no winner)' }
  if (round.winnerSide !== pr.tribe) return { eligible: false, reason: 'Not on winning side' }
  return { eligible: true }
}

export function claim(roundId: number, player: PublicKey) {
  const state = loadState()
  const round = state.rounds[roundId]
  if (!round) throw new Error('Round not found')
  maybeSettle(state, roundId)
  if (!round.isFinalized) throw new Error('Round not finalized')
  const k = keyFor(roundId, player.toBase58())
  const pr = state.playerRounds[k]
  if (!pr) throw new Error('Not participated')
  if (!pr.revealed) throw new Error('Not revealed')
  if (pr.claimed) throw new Error('Already claimed')
  if (round.winnerSide === null) throw new Error('Tie (no winner)')
  if (round.winnerSide !== pr.tribe) throw new Error('Not on winning side')
  pr.claimed = true
  pr.claimedAt = Date.now()
  saveState(state)
}

export function getRecentDemoRounds(limit = 10): DemoRound[] {
  const state = loadState()
  // update current round before returning
  maybeSettle(state, state.currentRoundId)
  maybeAdvanceRound(state)
  saveState(state)
  const all = Object.values(state.rounds)
  all.sort((a, b) => b.id - a.id)
  return all.slice(0, limit)
}

export function listPlayerRounds(player: PublicKey): DemoPlayerRound[] {
  const state = loadState()
  return Object.values(state.playerRounds).filter((x) => x.player === player.toBase58())
}

export function computePayoutPerWinner(roundId: number): bigint {
  const state = loadState()
  const r = state.rounds[roundId]
  if (!r || r.winnerSide === null) return 0n
  const all = Object.values(state.playerRounds).filter((x) => x.roundId === roundId)
  const revealedWinners = all.filter((x) => x.revealed && x.tribe === r.winnerSide)
  const winners = BigInt(revealedWinners.length)
  if (winners === 0n) return 0n
  const participants = BigInt(all.length)
  const totalPool = participants * r.stakeLamports
  const fee = (totalPool * BigInt(r.feeBps)) / 10000n
  const distributable = totalPool - fee
  return distributable / winners
}

export function getPlayerStats(player: PublicKey): {
  roundsPlayed: number
  revealed: number
  wins: number
  claimed: number
  totalPayoutLamports: bigint
} {
  const prs = listPlayerRounds(player)
  let total: bigint = 0n
  let wins = 0
  for (const pr of prs) {
    const r = getRound(pr.roundId)
    if (!r) continue
    if (r.winnerSide && pr.revealed && pr.tribe === r.winnerSide) {
      wins++
      if (pr.claimed) {
        total += computePayoutPerWinner(pr.roundId)
      }
    }
  }
  return {
    roundsPlayed: prs.length,
    revealed: prs.filter((x) => x.revealed).length,
    wins,
    claimed: prs.filter((x) => x.claimed).length,
    totalPayoutLamports: total,
  }
}

// Simulator helper functions
export function demoCommit(roundId: number, playerAddress: string, tribe: Tribe, saltHex: `0x${string}`) {
  const state = loadState()
  const round = state.rounds[roundId]
  if (!round) throw new Error('Round not found')
  
  const t = nowSec()
  if (t >= round.commitEndTime) throw new Error('Commit phase closed')
  
  const k = keyFor(roundId, playerAddress)
  if (state.playerRounds[k]) throw new Error('Already committed')

  // Create fake commitment
  const commitment = saltHex.replace('0x', '')
  
  state.playerRounds[k] = {
    roundId,
    player: playerAddress,
    commitmentHex: `0x${commitment}`,
    tribe,
    saltHex,
    committedAt: Date.now(),
    revealed: false,
    claimed: false,
  }
  
  recalcCounts(state, roundId)
  saveState(state)
}

export function demoReveal(roundId: number, playerAddress: string, tribe: Tribe, saltHex: `0x${string}`) {
  const state = loadState()
  const round = state.rounds[roundId]
  if (!round) throw new Error('Round not found')
  
  const k = keyFor(roundId, playerAddress)
  const pr = state.playerRounds[k]
  if (!pr) throw new Error('No commitment found')
  if (pr.revealed) return
  
  pr.revealed = true
  pr.revealedAt = Date.now()
  
  recalcCounts(state, roundId)
  maybeSettle(state, roundId)
  saveState(state)
}

export function getCurrentRound(): DemoRound | undefined {
  const state = loadState()
  maybeAdvanceRound(state)
  saveState(state)
  return state.rounds[state.currentRoundId]
}

export function advanceToNextRound() {
  const state = loadState()
  const newState = createStateWithNewRound(state)
  saveState(newState)
}

export function clearAllDemoData() {
  localStorage.removeItem(LS_KEY)
}
