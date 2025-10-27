import { useMemo } from 'react'
import { useReadContract, useWatchContractEvent } from 'wagmi'
import {
  chocoChocoContract,
  hasDeploymentConfigured,
  normalizeRoundStruct,
  type ChocoRoundStruct,
  type ChocoRoundView,
  chocoChocoAddress,
} from '../lib/chocochoco-contract'

const REFRESH_INTERVAL_MS = 12_000

type UseCurrentRoundIdOptions = {
  enabled?: boolean
  refetchInterval?: number
}

export function useCurrentRoundId(options: UseCurrentRoundIdOptions = {}) {
  const enabled = options.enabled ?? hasDeploymentConfigured()

  const query = useReadContract({
    ...chocoChocoContract,
    functionName: 'currentRound',
    query: {
      enabled,
      refetchInterval: options.refetchInterval ?? REFRESH_INTERVAL_MS,
    },
  })

  useWatchContractEvent({
    ...chocoChocoContract,
    address: enabled ? chocoChocoAddress : undefined,
    eventName: 'RoundCreated',
    onLogs: () => query.refetch(),
  })

  return {
    ...query,
    roundId: query.data as bigint | undefined,
  }
}

type UseRoundOptions = {
  roundId?: bigint | number
  enabled?: boolean
  refetchInterval?: number
}

export function useRound(options: UseRoundOptions = {}) {
  const { roundId, enabled = true, refetchInterval = REFRESH_INTERVAL_MS } = options
  const { roundId: currentRoundId } = useCurrentRoundId({ enabled: enabled && roundId === undefined })

  const target = roundId !== undefined ? BigInt(roundId) : currentRoundId
  const shouldRead = enabled && hasDeploymentConfigured() && target !== undefined
  const args = target !== undefined ? ([target] as const) : undefined

  const query = useReadContract({
    ...chocoChocoContract,
    functionName: 'getRound',
    args,
    query: {
      enabled: shouldRead,
      refetchInterval,
    },
  })

  useWatchContractEvent({
    ...chocoChocoContract,
    address: shouldRead ? chocoChocoAddress : undefined,
    eventName: 'RoundMeowed',
    onLogs: () => query.refetch(),
  })

  useWatchContractEvent({
    ...chocoChocoContract,
    address: shouldRead ? chocoChocoAddress : undefined,
    eventName: 'MeowCommitted',
    onLogs: () => query.refetch(),
  })

  useWatchContractEvent({
    ...chocoChocoContract,
    address: shouldRead ? chocoChocoAddress : undefined,
    eventName: 'MeowRevealed',
    onLogs: () => query.refetch(),
  })

  const view = useMemo<ChocoRoundView | undefined>(() => {
    const raw = query.data as ChocoRoundStruct | undefined
    if (!raw) return undefined
    return normalizeRoundStruct(raw)
  }, [query.data])

  return {
    ...query,
    roundId: target,
    round: query.data as ChocoRoundStruct | undefined,
    view,
  }
}

export function useDeadlines(options: UseRoundOptions = {}) {
  const { view, round: rawRound, roundId, ...rest } = useRound(options)

  const commitDeadlineMs = view ? view.commitDeadline * 1000 : undefined
  const revealDeadlineMs = view ? view.revealDeadline * 1000 : undefined

  const now = Date.now()
  const commitSecondsRemaining =
    commitDeadlineMs !== undefined ? Math.max(0, Math.floor((commitDeadlineMs - now) / 1000)) : undefined
  const revealSecondsRemaining =
    revealDeadlineMs !== undefined ? Math.max(0, Math.floor((revealDeadlineMs - now) / 1000)) : undefined

  const status = view?.status ?? 0

  const phase =
    status === 3
      ? 'Settled'
      : status === 2
        ? 'RevealOpen'
        : status === 1
          ? 'CommitOpen'
          : 'Created'

  return {
    ...rest,
    roundId,
    rawRound,
    round: view,
    commitDeadlineMs,
    revealDeadlineMs,
    commitSecondsRemaining,
    revealSecondsRemaining,
    phase,
    isCommitOpen: phase === 'CommitOpen' && (commitSecondsRemaining ?? 0) > 0,
    isRevealOpen: phase === 'RevealOpen' && (revealSecondsRemaining ?? 0) > 0,
    isSettled: phase === 'Settled',
  }
}
