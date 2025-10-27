import { useEffect, useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import * as demo from '../lib/demo-rounds'

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
    let cancelled = false
    setIsLoading(true)
    try {
      const id = demo.getCurrentRoundId()
      if (!cancelled) {
        setRoundId(id)
        setIsLoading(false)
      }
    } catch (e: any) {
      if (!cancelled) {
        setError(e instanceof Error ? e : new Error(String(e)))
        setIsLoading(false)
      }
    }
    // poll a bit so demo can advance rounds automatically
    const iv = setInterval(() => {
      try {
        const id = demo.getCurrentRoundId()
        if (!cancelled) setRoundId(id)
      } catch {}
    }, 1000)
    return () => {
      cancelled = true
      clearInterval(iv)
    }
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

    let cancelled = false
    setIsLoading(true)
    const update = () => {
      try {
        const d = demo.getRound(roundId)
        if (!d) return
        const r: Round = {
          roundId: d.id,
          startTime: d.startTime,
          commitEndTime: d.commitEndTime,
          revealEndTime: d.revealEndTime,
          finalizeTime: d.finalizeTime,
          countMilk: d.countMilk,
          countCacao: d.countCacao,
          stake: d.stakeLamports,
          feeBps: d.feeBps,
          isFinalized: d.isFinalized,
        }
        if (!cancelled) {
          setRound(r)
          setIsLoading(false)
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
          setIsLoading(false)
        }
      }
    }
    update()
    const iv = setInterval(update, 1000)
    return () => {
      cancelled = true
      clearInterval(iv)
    }
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
