import { useMemo } from 'react'
import { useAccount, useChainId, useReadContract, useWatchContractEvent } from 'wagmi'
import type { Abi } from 'viem'

type UseRoundResultsArgs = {
  roundId: bigint
  contractAddress: `0x${string}`
  contractAbi: Abi
  fnGetInfo?: string // default: 'rounds'
  fnHasClaimed?: string // default: 'claimed'
  fnPlayerRevealed?: string // default: 'revealed'
  eventRoundMeowed?: string // default: 'RoundMeowed'
}

export function useRoundResults({
  roundId,
  contractAddress,
  contractAbi,
  fnGetInfo = 'rounds',
  fnHasClaimed = 'claimed',
  fnPlayerRevealed = 'revealed',
  eventRoundMeowed = 'RoundMeowed',
}: UseRoundResultsArgs) {
  const { address } = useAccount()
  const chainId = useChainId()

  const roundInfo = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: fnGetInfo as any,
    args: [roundId],
    query: { enabled: !!roundId },
  })

  const playerRevealed = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: fnPlayerRevealed as any,
    args: [roundId, address],
    query: { enabled: !!address && !!roundId },
  })

  const claimed = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: fnHasClaimed as any,
    args: [roundId, address],
    query: { enabled: !!address && !!roundId },
  })

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    eventName: eventRoundMeowed as any,
    onLogs: () => {
      roundInfo.refetch?.()
      playerRevealed.refetch?.()
      claimed.refetch?.()
    },
  })

  // rounds(roundId) returns:
  // [status(uint8), commitDeadline(uint64), revealDeadline(uint64), stake(uint96), feeBps(uint16), poolMilk(uint128), poolCacao(uint128), countMilk(uint64), countCacao(uint64)]
  const tuple = roundInfo.data as any
  const status = tuple ? Number(tuple[0]) : null
  const countMilk = tuple ? Number(tuple[7] ?? 0) : 0
  const countCacao = tuple ? Number(tuple[8] ?? 0) : 0

  const isSettled = status === 3 // Status.Settled

  const winnerSide: number | null = useMemo(() => {
    if (!tuple) return null
    if (countMilk === countCacao) return null // tie
    // Tribe.Milk=1, Tribe.Cacao=2
    return countMilk < countCacao ? 1 : 2
  }, [tuple, countMilk, countCacao])

  const playerSide = useMemo(() => {
    const v = playerRevealed.data as any
    if (v == null) return null
    // revealed mapping returns enum value (0=None,1=Milk,2=Cacao)
    const n = Number(v)
    if (Number.isNaN(n)) return null
    return n
  }, [playerRevealed.data])

  const hasClaimed = Boolean(claimed.data)
  const isWinner = isSettled && playerSide != null && playerSide !== 0 && winnerSide != null && playerSide === winnerSide

  return {
    chainId,
    isSettled,
    winnerSide, // 1=Milk, 2=Cacao, null=tie/unknown
    playerSide, // 0=None,1=Milk,2=Cacao, or null if unknown
    hasClaimed,
    isWinner,
    refetchAll: () => {
      roundInfo.refetch?.()
      playerRevealed.refetch?.()
      claimed.refetch?.()
    },
    loading: roundInfo.isLoading || playerRevealed.isLoading || claimed.isLoading,
    error: roundInfo.error || playerRevealed.error || claimed.error,
  }
}

