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
  playerBalances: Record<string, bigint> // key: player address -> FOOD balance in lamports
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
        // Revive player balances
        if (key === 'playerBalances' && typeof value === 'object' && value !== null) {
          const balances: Record<string, bigint> = {}
          for (const [player, balance] of Object.entries(value)) {
            if (typeof balance === 'string' || typeof balance === 'number') {
              balances[player] = BigInt(balance)
            } else {
              balances[player] = 0n
            }
          }
          return balances
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
    : { currentRoundId: id, rounds: { [id]: round }, playerRounds: {}, playerBalances: {} }
  return state
}

function keyFor(roundId: number, player: string) {
  return `${roundId}:${player}`
}

// FOOD token balance management
const INITIAL_FOOD_BALANCE = BigInt(100_000_000_000) // 100 FOOD tokens (9 decimals)

function ensurePlayerBalance(state: DemoState, player: string) {
  if (!state.playerBalances) {
    state.playerBalances = {}
  }
  if (state.playerBalances[player] === undefined) {
    state.playerBalances[player] = INITIAL_FOOD_BALANCE
  }
}

function getPlayerBalance(state: DemoState, player: string): bigint {
  ensurePlayerBalance(state, player)
  return state.playerBalances[player] ?? 0n
}

function deductStake(state: DemoState, player: string, amount: bigint) {
  ensurePlayerBalance(state, player)
  const current = state.playerBalances[player] ?? 0n
  if (current < amount) {
    throw new Error('Insufficient FOOD balance')
  }
  state.playerBalances[player] = current - amount
}

function addPayout(state: DemoState, player: string, amount: bigint) {
  ensurePlayerBalance(state, player)
  const current = state.playerBalances[player] ?? 0n
  state.playerBalances[player] = current + amount
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
  
  // Auto-reveal all committed players when reveal phase starts
  if (t >= round.commitEndTime && t < round.revealEndTime) {
    const prs = Object.values(state.playerRounds).filter(
      (x) => x.roundId === roundId && !x.revealed
    )
    prs.forEach((pr) => {
      pr.revealed = true
      pr.revealedAt = Date.now()
    })
    if (prs.length > 0) {
      recalcCounts(state, roundId)
    }
  }
  
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
  customStakeLamports?: bigint,
): Promise<DemoPlayerRound> {
  const state = loadState()
  const round = state.rounds[roundId]
  if (!round) throw new Error('Round not found')
  const t = nowSec()
  if (t >= round.commitEndTime) throw new Error('Commit phase closed')

  // Use custom stake or default round stake
  const stakeAmount = customStakeLamports ?? round.stakeLamports
  
  // Deduct stake from player balance
  deductStake(state, player.toBase58(), stakeAmount)

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
  
  // Calculate payout
  const payout = computePayoutPerWinner(roundId)
  
  // Add payout to player balance
  addPayout(state, player.toBase58(), payout)
  
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
export function demoCommit(roundId: number, playerAddress: string, tribe: Tribe, saltHex: `0x${string}`, customStakeLamports?: bigint) {
  const state = loadState()
  const round = state.rounds[roundId]
  if (!round) throw new Error('Round not found')
  
  const t = nowSec()
  if (t >= round.commitEndTime) throw new Error('Commit phase closed')
  
  const k = keyFor(roundId, playerAddress)
  if (state.playerRounds[k]) throw new Error('Already committed')

  // Use custom stake or default round stake
  const stakeAmount = customStakeLamports ?? round.stakeLamports
  
  // Deduct stake from player balance
  deductStake(state, playerAddress, stakeAmount)

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

// Get player's FOOD token balance
export function getBalance(player: PublicKey | string): bigint {
  const state = loadState()
  const address = typeof player === 'string' ? player : player.toBase58()
  return getPlayerBalance(state, address)
}

// Format FOOD balance for display (9 decimals)
export function formatFoodBalance(lamports: bigint): string {
  // Ensure we have a BigInt
  const amount = typeof lamports === 'bigint' ? lamports : BigInt(lamports || 0)
  
  const neg = amount < 0n
  const v = neg ? -amount : amount
  const whole = v / 1_000_000_000n
  const fracPart = (v % 1_000_000_000n).toString().padStart(9, '0')
  const frac = fracPart.slice(0, 3) // 3 decimal places
  return `${neg ? '-' : ''}${whole.toString()}.${frac} FOOD`
}

// Get balance history for a player across all rounds (cumulative earnings)
export function getBalanceHistory(player: PublicKey | string): Array<{ roundId: number; balance: bigint; change: bigint; timestamp: number; earnings: bigint }> {
  const state = loadState()
  const address = typeof player === 'string' ? player : player.toBase58()
  
  const playerRounds = Object.values(state.playerRounds)
    .filter(pr => pr.player === address)
    .sort((a, b) => a.roundId - b.roundId)
  
  const history: Array<{ roundId: number; balance: bigint; change: bigint; timestamp: number; earnings: bigint }> = []
  let totalEarnings = 0n // Cumulative net profit/loss (not including stake)
  
  // Start with zero earnings
  const firstRound = playerRounds[0]
  if (firstRound) {
    history.push({
      roundId: 0,
      balance: 0n,
      change: 0n,
      timestamp: firstRound.committedAt - 1000,
      earnings: 0n
    })
  }
  
  for (const pr of playerRounds) {
    const round = state.rounds[pr.roundId]
    if (!round) continue
    
    let netProfit = 0n // Net profit/loss for this round
    
    // Calculate earnings based on round status
    if (round.isFinalized && round.winnerSide !== null) {
      if (round.winnerSide === pr.tribe) {
        // Won: only count if claimed
        if (pr.claimed) {
          const totalStake = BigInt(round.countMilk + round.countCacao) * round.stakeLamports
          const fee = (totalStake * BigInt(round.feeBps)) / 10000n
          const pool = totalStake - fee
          const winnerCount = round.winnerSide === 'Milk' ? round.countMilk : round.countCacao
          if (winnerCount > 0) {
            const payout = pool / BigInt(winnerCount)
            // Net profit = payout - original stake
            netProfit = payout - BigInt(round.stakeLamports)
          }
        }
        // If won but not claimed yet, netProfit = 0 (pending)
      } else {
        // Lost: count the loss immediately when finalized (even if not "claimed")
        netProfit = -BigInt(round.stakeLamports)
      }
    }
    // If not finalized yet, netProfit = 0 (pending)
    
    totalEarnings += netProfit
    
    history.push({
      roundId: pr.roundId,
      balance: totalEarnings,
      change: netProfit,
      timestamp: pr.claimedAt || pr.revealedAt || pr.committedAt,
      earnings: totalEarnings
    })
  }
  
  return history
}

/**
 * Get transaction history for a player
 */
export function getTransactionHistory(player: PublicKey | string): Array<{
  id: string
  type: 'commit' | 'claim' | 'refund'
  amount: bigint
  roundId: number
  timestamp: number
  status: 'success' | 'pending' | 'failed'
}> {
  const state = loadState()
  const address = typeof player === 'string' ? player : player.toBase58()
  
  const playerRounds = Object.values(state.playerRounds)
    .filter(pr => pr.player === address)
    .sort((a, b) => b.roundId - a.roundId)
  
  const transactions: Array<{
    id: string
    type: 'commit' | 'claim' | 'refund'
    amount: bigint
    roundId: number
    timestamp: number
    status: 'success' | 'pending' | 'failed'
  }> = []
  
  for (const pr of playerRounds) {
    const round = state.rounds[pr.roundId]
    if (!round) continue
    
    // Add commit transaction
    transactions.push({
      id: `${pr.roundId}-commit-${pr.player}`,
      type: 'commit',
      amount: BigInt(round.stakeLamports),
      roundId: pr.roundId,
      timestamp: pr.committedAt,
      status: 'success'
    })
    
    // Add claim transaction if claimed
    if (pr.claimed && round.isFinalized && round.winnerSide === pr.tribe) {
      const totalStake = BigInt(round.countMilk + round.countCacao) * round.stakeLamports
      const fee = (totalStake * BigInt(round.feeBps)) / 10000n
      const pool = totalStake - fee
      const winnerCount = round.winnerSide === 'Milk' ? round.countMilk : round.countCacao
      
      if (winnerCount > 0) {
        const payout = pool / BigInt(winnerCount)
        transactions.push({
          id: `${pr.roundId}-claim-${pr.player}`,
          type: 'claim',
          amount: payout,
          roundId: pr.roundId,
          timestamp: pr.claimedAt || Date.now(),
          status: 'success'
        })
      }
    }
  }
  
  return transactions
}

/**
 * Get earnings breakdown by round for a player
 */
export function getEarningsBreakdown(player: PublicKey | string): Array<{
  roundId: number
  tribe: 'Milk' | 'Cacao'
  stake: bigint
  payout: bigint
  profit: bigint
  timestamp: number
}> {
  const state = loadState()
  const address = typeof player === 'string' ? player : player.toBase58()
  
  const playerRounds = Object.values(state.playerRounds)
    .filter(pr => pr.player === address && pr.revealed)
    .sort((a, b) => b.roundId - a.roundId)
  
  const earnings: Array<{
    roundId: number
    tribe: 'Milk' | 'Cacao'
    stake: bigint
    payout: bigint
    profit: bigint
    timestamp: number
  }> = []
  
  for (const pr of playerRounds) {
    const round = state.rounds[pr.roundId]
    if (!round || !round.isFinalized || round.winnerSide === null) continue
    
    const stake = BigInt(round.stakeLamports)
    let payout = 0n
    let profit = 0n
    
    if (round.winnerSide === pr.tribe && pr.claimed) {
      const totalStake = BigInt(round.countMilk + round.countCacao) * round.stakeLamports
      const fee = (totalStake * BigInt(round.feeBps)) / 10000n
      const pool = totalStake - fee
      const winnerCount = round.winnerSide === 'Milk' ? round.countMilk : round.countCacao
      
      if (winnerCount > 0) {
        payout = pool / BigInt(winnerCount)
        profit = payout - stake
      }
    } else if (round.winnerSide !== pr.tribe) {
      // Lost
      payout = 0n
      profit = -stake
    }
    
    earnings.push({
      roundId: pr.roundId,
      tribe: pr.tribe as 'Milk' | 'Cacao',
      stake,
      payout,
      profit,
      timestamp: pr.claimedAt || pr.revealedAt || pr.committedAt
    })
  }
  
  return earnings
}
