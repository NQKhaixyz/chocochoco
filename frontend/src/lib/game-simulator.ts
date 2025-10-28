import { PublicKey } from '@solana/web3.js'
import { randomSalt32, type Tribe } from './solana-commit'
import * as demo from './demo-rounds'
import { notifyLeaderboardUpdate, notifySimulationStart, notifySimulationEnd } from './simulator-events'

/**
 * Game Simulator - Simulates 100 users playing the game automatically
 */

interface SimulatedUser {
  publicKey: PublicKey
  address: string
  name: string
  balance: bigint
  strategy: 'random' | 'minority-seeker' | 'majority-follower' | 'contrarian'
  playRate: number // 0-1, probability of joining a round
}

// Generate unique user addresses
function generateUserAddress(index: number): PublicKey {
  // Create a deterministic 32-byte array for each user
  const bytes = new Uint8Array(32)
  
  // Fill first bytes with index information
  bytes[0] = index & 0xff
  bytes[1] = (index >> 8) & 0xff
  bytes[2] = (index >> 16) & 0xff
  bytes[3] = (index >> 24) & 0xff
  
  // Fill rest with deterministic pattern
  for (let i = 4; i < 32; i++) {
    bytes[i] = (index + i) & 0xff
  }
  
  // Create PublicKey from bytes
  return new PublicKey(bytes)
}

// Generate 100 simulated users
export function generateSimulatedUsers(): SimulatedUser[] {
  const strategies: SimulatedUser['strategy'][] = [
    'random',
    'minority-seeker',
    'majority-follower',
    'contrarian'
  ]
  
  const users: SimulatedUser[] = []
  
  for (let i = 0; i < 100; i++) {
    const publicKey = generateUserAddress(i)
    const address = publicKey.toBase58()
    const strategy = strategies[i % strategies.length] as SimulatedUser['strategy']
    
    users.push({
      publicKey,
      address,
      name: `SimUser_${i.toString().padStart(3, '0')}`,
      balance: BigInt(Math.floor(Math.random() * 500 + 100)) * 1_000_000_000n, // 100-600 FOOD
      strategy,
      playRate: Math.random() * 0.5 + 0.5, // 50-100% play rate
    })
  }
  
  return users
}

// Store users in localStorage
const STORAGE_KEY = 'chocochoco:simulated-users'

export function saveSimulatedUsers(users: SimulatedUser[]) {
  try {
    const serializable = users.map(u => ({
      address: u.address,
      name: u.name,
      balance: u.balance.toString(),
      strategy: u.strategy,
      playRate: u.playRate,
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch (e) {
    console.error('Failed to save simulated users', e)
  }
}

export function loadSimulatedUsers(): SimulatedUser[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const data = JSON.parse(stored)
    return data.map((u: any) => ({
      publicKey: new PublicKey(u.address),
      address: u.address,
      name: u.name,
      balance: BigInt(u.balance),
      strategy: u.strategy,
      playRate: u.playRate,
    }))
  } catch (e) {
    console.error('Failed to load simulated users', e)
    return []
  }
}

// Initialize simulated users with random balances
export function initializeSimulator() {
  let users = loadSimulatedUsers()
  
  if (users.length === 0) {
    users = generateSimulatedUsers()
    saveSimulatedUsers(users)
    
    // Set initial balances in demo state
    users.forEach(user => {
      const balanceState = JSON.parse(localStorage.getItem('chocochoco:demo:balances') || '{}')
      balanceState[user.address] = user.balance.toString()
      localStorage.setItem('chocochoco:demo:balances', JSON.stringify(balanceState))
    })
  }
  
  return users
}

// Get tribe choice based on user strategy
function chooseTribe(
  user: SimulatedUser,
  currentMilk: number,
  currentCacao: number
): Tribe {
  switch (user.strategy) {
    case 'random':
      return Math.random() > 0.5 ? 'Milk' : 'Cacao'
    
    case 'minority-seeker':
      // Try to join the current minority (before this commit)
      if (currentMilk === currentCacao) {
        return Math.random() > 0.5 ? 'Milk' : 'Cacao'
      }
      return currentMilk < currentCacao ? 'Milk' : 'Cacao'
    
    case 'majority-follower':
      // Join the current majority
      if (currentMilk === currentCacao) {
        return Math.random() > 0.5 ? 'Milk' : 'Cacao'
      }
      return currentMilk > currentCacao ? 'Milk' : 'Cacao'
    
    case 'contrarian':
      // Do the opposite of what seems logical
      if (currentMilk === currentCacao) {
        return Math.random() > 0.5 ? 'Milk' : 'Cacao'
      }
      return currentMilk > currentCacao ? 'Cacao' : 'Milk'
    
    default:
      return Math.random() > 0.5 ? 'Milk' : 'Cacao'
  }
}

// Simulate users committing to a round
export async function simulateRoundCommits(roundId: number) {
  const users = loadSimulatedUsers()
  if (users.length === 0) {
    console.warn('No simulated users found. Run initializeSimulator() first.')
    return
  }
  
  const round = demo.getRound(roundId)
  if (!round) {
    console.warn(`Round ${roundId} not found`)
    return
  }
  
  let milkCount = round.countMilk
  let cacaoCount = round.countCacao
  const commitResults: { user: string; tribe: Tribe; success: boolean }[] = []
  
  // Process users one by one (not in parallel)
  for (const user of users) {
    // Check if user decides to play this round
    if (Math.random() > user.playRate) {
      continue
    }
    
    // Check if user has enough balance
    const balance = demo.getBalance(user.address)
    const stake = BigInt(round.stakeLamports)
    
    if (balance < stake) {
      continue
    }
    
    // Choose tribe based on strategy
    const tribe = chooseTribe(user, milkCount, cacaoCount)
    
    // Generate salt and commit
    const salt = randomSalt32()
    const saltHex = `0x${Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`
    
    try {
      // Random stake between 5-20 FOOD
      const stakeAmount = BigInt(Math.floor(Math.random() * 15 + 5)) * 1_000_000_000n
      
      demo.demoCommit(roundId, user.address, tribe, saltHex, stakeAmount)
      
      // Update local count
      if (tribe === 'Milk') {
        milkCount++
      } else {
        cacaoCount++
      }
      
      commitResults.push({ user: user.name, tribe, success: true })
    } catch (e) {
      commitResults.push({ user: user.name, tribe, success: false })
    }
    
    // Small delay between each commit (sequential processing)
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  
  console.log(`✅ Round ${roundId} commits complete:`)
  console.log(`  - ${commitResults.filter(r => r.success).length} commits successful`)
  console.log(`  - Milk: ${milkCount}, Cacao: ${cacaoCount}`)
  console.log(`  - Minority: ${milkCount < cacaoCount ? 'Milk' : milkCount > cacaoCount ? 'Cacao' : 'Tied'}`)
  
  return commitResults.filter(r => r.success).length
}

// Simulate users revealing
export async function simulateRoundReveals(roundId: number) {
  const users = loadSimulatedUsers()
  const state = JSON.parse(localStorage.getItem('chocochoco:demo:state') || '{"rounds":{},"playerRounds":{}}')
  
  const playerRounds = Object.values(state.playerRounds).filter(
    (pr: any) => pr.roundId === roundId && !pr.revealed
  )
  
  let revealCount = 0
  
  for (const pr of playerRounds as any[]) {
    const user = users.find(u => u.address === pr.player)
    if (!user) continue
    
    try {
      demo.demoReveal(roundId, pr.player, pr.tribe, pr.saltHex)
      revealCount++
      await new Promise(resolve => setTimeout(resolve, 10))
    } catch (e) {
      // Ignore reveal errors
    }
  }
  
  console.log(`✅ Round ${roundId} reveals complete: ${revealCount} users revealed`)
  return revealCount
}

// Simulate users claiming
export async function simulateRoundClaims(roundId: number) {
  const state = JSON.parse(localStorage.getItem('chocochoco:demo:state') || '{"rounds":{},"playerRounds":{}}')
  const round = state.rounds[roundId]
  
  if (!round || !round.isFinalized || round.winnerSide === null) {
    console.warn(`Round ${roundId} not ready for claims`)
    return 0
  }
  
  const playerRounds = Object.values(state.playerRounds).filter(
    (pr: any) => pr.roundId === roundId && pr.revealed && !pr.claimed && pr.tribe === round.winnerSide
  )
  
  let claimCount = 0
  
  for (const pr of playerRounds as any[]) {
    try {
      demo.claim(roundId, new PublicKey(pr.player))
      claimCount++
      await new Promise(resolve => setTimeout(resolve, 10))
    } catch (e) {
      // Ignore claim errors
    }
  }
  
  console.log(`✅ Round ${roundId} claims complete: ${claimCount} users claimed`)
  return claimCount
}

// Auto-play: simulate full round lifecycle
export async function simulateFullRound(roundId: number) {
  console.log(`🎮 Simulating Round ${roundId}...`)
  
  // 1. Commit phase
  console.log(`  📝 Phase 1: Commits`)
  const commitCount = await simulateRoundCommits(roundId)
  console.log(`  ✅ ${commitCount} commits completed`)
  
  // Wait between phases
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 2. Reveal phase
  console.log(`  🎭 Phase 2: Reveals`)
  const revealCount = await simulateRoundReveals(roundId)
  console.log(`  ✅ ${revealCount} reveals completed`)
  
  // Wait between phases
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 3. Check finalization
  const round = demo.getRound(roundId)
  if (round?.isFinalized && round.winnerSide) {
    console.log(`  🏆 Round ${roundId} settled: ${round.winnerSide} wins!`)
  }
  
  // 4. Claims
  console.log(`  💰 Phase 3: Claims`)
  const claimCount = await simulateRoundClaims(roundId)
  console.log(`  ✅ ${claimCount} claims completed`)
  
  console.log(`🎉 Round ${roundId} complete!\n`)
  
  // Notify leaderboard to update
  notifyLeaderboardUpdate()
}

// Flag to control infinite simulation
let isInfiniteSimulationRunning = false

export function stopInfiniteSimulation() {
  isInfiniteSimulationRunning = false
}

export function isInfiniteSimulationActive(): boolean {
  return isInfiniteSimulationRunning
}

// Infinite simulation: auto-play rounds until stopped
export async function startInfiniteSimulation() {
  if (isInfiniteSimulationRunning) {
    console.warn('Infinite simulation already running')
    return
  }
  
  console.log(`🚀 Starting infinite simulation (run until stopped)...`)
  isInfiniteSimulationRunning = true
  
  // Notify simulation start
  notifySimulationStart()
  
  // Initialize users if needed
  initializeSimulator()
  
  let roundCount = 0
  
  while (isInfiniteSimulationRunning) {
    const currentRoundId = demo.getCurrentRoundId()
    
    console.log(`\n--- Starting Round ${currentRoundId} ---`)
    
    try {
      // Simulate this round completely
      await simulateFullRound(currentRoundId)
      roundCount++
      
      console.log(`✅ Round ${currentRoundId} complete, advancing to next round...`)
      
      // Advance to next round AFTER completing current one
      demo.advanceToNextRound()
      
      // Delay between rounds so we can see each one
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (e: any) {
      console.error(`❌ Error in round ${currentRoundId}:`, e.message)
      // Try to advance even if error
      try {
        demo.advanceToNextRound()
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  console.log(`✅ Infinite simulation stopped after ${roundCount} rounds.`)
  
  // Notify simulation end
  notifySimulationEnd()
}

// Continuous simulation: auto-play multiple rounds
export async function startContinuousSimulation(numRounds: number = 5) {
  console.log(`🚀 Starting continuous simulation for ${numRounds} rounds...`)
  
  // Notify simulation start
  notifySimulationStart()
  
  // Initialize users if needed
  initializeSimulator()
  
  const startRound = demo.getCurrentRoundId()
  
  for (let i = 0; i < numRounds; i++) {
    const roundId = startRound + i
    
    // Ensure round exists
    if (!demo.getRound(roundId)) {
      demo.advanceToNextRound()
    }
    
    await simulateFullRound(roundId)
    
    // Advance to next round
    if (i < numRounds - 1) {
      demo.advanceToNextRound()
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  console.log(`✅ Continuous simulation complete! ${numRounds} rounds played.`)
  
  // Notify simulation end
  notifySimulationEnd()
  
  // Print summary
  const users = loadSimulatedUsers()
  const topEarners = users
    .map(u => ({
      name: u.name,
      balance: demo.getBalance(u.address),
      profit: demo.getBalance(u.address) - u.balance,
    }))
    .sort((a, b) => Number(b.profit - a.profit))
    .slice(0, 10)
  
  console.log('\n🏆 Top 10 Earners:')
  topEarners.forEach((user, idx) => {
    console.log(`${idx + 1}. ${user.name}: ${demo.formatFoodBalance(user.profit)} profit`)
  })
}

// Reset simulator
export function resetSimulator() {
  localStorage.removeItem(STORAGE_KEY)
  console.log('✅ Simulator reset. Run initializeSimulator() to create new users.')
}

// Get simulator stats
export function getSimulatorStats() {
  const users = loadSimulatedUsers()
  
  if (users.length === 0) {
    return {
      totalUsers: 0,
      totalBalance: 0n,
      averageBalance: 0n,
      strategies: {},
    }
  }
  
  const totalBalance = users.reduce((sum, u) => {
    const balance = demo.getBalance(u.address)
    return sum + balance
  }, 0n)
  
  const strategies = users.reduce((acc, u) => {
    acc[u.strategy] = (acc[u.strategy] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    totalUsers: users.length,
    totalBalance,
    averageBalance: totalBalance / BigInt(users.length),
    strategies,
  }
}

// Get leaderboard data from simulated users
export function getSimulatedLeaderboard() {
  const users = loadSimulatedUsers()
  
  if (users.length === 0) {
    return {
      topPayout: [],
      topWinRate: [],
    }
  }
  
  // Get player stats for each user
  const playerStats = users.map(user => {
    const stats = demo.getPlayerStats(user.publicKey)
    const currentBalance = demo.getBalance(user.address)
    const totalPayout = currentBalance - user.balance // Net profit
    
    return {
      player: user.address,
      name: user.name,
      strategy: user.strategy,
      totalPayout: totalPayout > 0n ? totalPayout : 0n,
      wins: stats.wins,
      losses: stats.roundsPlayed - stats.wins,
      totalRounds: stats.roundsPlayed,
      winRate: stats.roundsPlayed > 0 ? (stats.wins / stats.roundsPlayed) * 100 : 0,
      lastClaim: Date.now(),
      totalClaims: stats.claimed,
    }
  })
  
  // Sort by total payout (descending)
  const topPayout = [...playerStats]
    .sort((a, b) => Number(b.totalPayout - a.totalPayout))
    .slice(0, 50)
    .map((entry, index) => ({
      rank: index + 1,
      player: entry.player,
      totalPayout: entry.totalPayout,
      totalClaims: entry.totalClaims,
      lastClaim: new Date().toISOString(),
    }))
  
  // Sort by win rate (descending)
  const topWinRate = [...playerStats]
    .filter(p => p.totalRounds >= 3) // At least 3 rounds played
    .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)
    .slice(0, 50)
    .map((entry, index) => ({
      rank: index + 1,
      player: entry.player,
      wins: entry.wins,
      losses: entry.losses,
      total: entry.totalRounds,
      rate: entry.winRate,
      winRate: entry.winRate,
    }))
  
  return {
    topPayout,
    topWinRate,
  }
}

/**
 * Add AI players to current round only (doesn't auto-advance rounds)
 * This allows AI to play alongside human players in the same round
 */
export async function addAIPlayersToCurrentRound(): Promise<number> {
  const users = loadSimulatedUsers()
  if (users.length === 0) {
    console.warn('No simulated users found. Run initializeSimulator() first.')
    return 0
  }
  
  const currentRoundId = demo.getCurrentRoundId()
  const round = demo.getRound(currentRoundId)
  
  if (!round) {
    console.warn(`Round ${currentRoundId} not found`)
    return 0
  }
  
  const now = Math.floor(Date.now() / 1000)
  if (now >= round.commitEndTime) {
    console.warn('Commit phase has ended for current round')
    return 0
  }
  
  let successCount = 0
  let milkCount = round.countMilk
  let cacaoCount = round.countCacao
  
  // Process each user sequentially
  for (const user of users) {
    // Check if user decides to play (based on playRate)
    if (Math.random() > user.playRate) {
      continue
    }
    
    // Check balance
    const balance = demo.getBalance(user.address)
    if (balance < BigInt(5_000_000_000)) { // Need at least 5 FOOD
      continue
    }
    
    // Choose tribe based on strategy
    const tribe = chooseTribe(user, milkCount, cacaoCount)
    
    // Generate salt and commit
    const salt = randomSalt32()
    const saltHex = `0x${Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`
    
    try {
      // Random stake between 5-20 FOOD
      const stakeAmount = BigInt(Math.floor(Math.random() * 15 + 5)) * 1_000_000_000n
      
      demo.demoCommit(currentRoundId, user.address, tribe, saltHex, stakeAmount)
      
      // Update local count
      if (tribe === 'Milk') {
        milkCount++
      } else {
        cacaoCount++
      }
      
      successCount++
    } catch (e) {
      // Skip if commit fails
    }
    
    // Small delay between commits
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  
  console.log(`✅ Added ${successCount} AI players to Round ${currentRoundId}`)
  console.log(`  - Milk: ${milkCount}, Cacao: ${cacaoCount}`)
  
  return successCount
}

// Get mixed leaderboard (real + simulated users)
export function getMixedLeaderboard(realTopPayout: any[], realTopWinRate: any[]) {
  const simulated = getSimulatedLeaderboard()
  
  // Merge and re-sort top payout
  const mixedPayout = [...realTopPayout, ...simulated.topPayout]
    .sort((a, b) => {
      const aTotal = typeof a.totalPayout === 'bigint' ? a.totalPayout : BigInt(a.totalPayout || 0)
      const bTotal = typeof b.totalPayout === 'bigint' ? b.totalPayout : BigInt(b.totalPayout || 0)
      return Number(bTotal - aTotal)
    })
    .slice(0, 50)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
  
  // Merge and re-sort win rate
  const mixedWinRate = [...realTopWinRate, ...simulated.topWinRate]
    .sort((a, b) => {
      const aRate = a.rate !== undefined ? a.rate : (a.winRate !== undefined ? a.winRate : parseFloat(a.rate || '0'))
      const bRate = b.rate !== undefined ? b.rate : (b.winRate !== undefined ? b.winRate : parseFloat(b.rate || '0'))
      return bRate - aRate || b.wins - a.wins
    })
    .slice(0, 50)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
  
  return {
    topPayout: mixedPayout,
    topWinRate: mixedWinRate,
  }
}
