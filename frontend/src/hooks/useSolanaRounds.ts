import { useEffect, useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || 'J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz'
)

interface Round {
  roundId: number
  startTime: number
  commitEndTime: number
  revealEndTime: number
  finalizeTime: number
  countMilk: number
  countCacao: number
  stake: bigint
  feeBps: number
  isFinalized: boolean
}

/**
 * Get current round ID from Solana program
 * TODO: Implement actual program account fetching
 */
export function useCurrentRoundId() {
  const { connection } = useConnection()
  const [roundId, setRoundId] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // TODO: Fetch from program global state PDA
    // For now, return mock data
    setIsLoading(false)
    setRoundId(1)
  }, [connection])

  return { roundId, isLoading, error }
}

/**
 * Get round data from Solana program
 * TODO: Implement actual program account fetching
 */
export function useRound(roundId: number | undefined) {
  const { connection } = useConnection()
  const [round, setRound] = useState<Round | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!roundId) {
      setIsLoading(false)
      return
    }

    // TODO: Fetch from program round PDA
    // For now, return mock data
    const mockRound: Round = {
      roundId,
      startTime: Date.now() / 1000,
      commitEndTime: Date.now() / 1000 + 3600, // 1 hour from now
      revealEndTime: Date.now() / 1000 + 7200, // 2 hours from now
      finalizeTime: Date.now() / 1000 + 10800, // 3 hours from now
      countMilk: 5,
      countCacao: 3,
      stake: BigInt(5_000_000_000), // 5 SOL in lamports
      feeBps: 250, // 2.5%
      isFinalized: false,
    }

    setRound(mockRound)
    setIsLoading(false)
  }, [connection, roundId])

  return { round, isLoading, error }
}

/**
 * Calculate deadlines and phase from round data
 */
export function useDeadlines() {
  const { roundId } = useCurrentRoundId()
  const { round, isLoading, error } = useRound(roundId)

  const [now, setNow] = useState(Date.now() / 1000)

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now() / 1000)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!round) {
    return {
      round: undefined,
      roundId: undefined,
      commitSecondsRemaining: undefined,
      revealSecondsRemaining: undefined,
      finalizeSecondsRemaining: undefined,
      phase: 'loading' as const,
      isLoading,
      error,
    }
  }

  const commitSecondsRemaining = Math.max(0, round.commitEndTime - now)
  const revealSecondsRemaining = Math.max(0, round.revealEndTime - now)
  const finalizeSecondsRemaining = Math.max(0, round.finalizeTime - now)

  let phase: 'commit' | 'reveal' | 'finalize' | 'complete' | 'loading' = 'loading'
  if (round.isFinalized) {
    phase = 'complete'
  } else if (commitSecondsRemaining > 0) {
    phase = 'commit'
  } else if (revealSecondsRemaining > 0) {
    phase = 'reveal'
  } else if (finalizeSecondsRemaining > 0) {
    phase = 'finalize'
  } else {
    phase = 'complete'
  }

  return {
    round,
    roundId,
    commitSecondsRemaining,
    revealSecondsRemaining,
    finalizeSecondsRemaining,
    phase,
    isLoading,
    error,
  }
}
