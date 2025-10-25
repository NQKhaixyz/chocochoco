import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import type { Abi } from 'viem'

export function useClaimTreat() {
  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: !!hash } })

  async function claim({
    contractAddress,
    contractAbi,
    functionName = 'claimTreat',
    roundId,
    extraArgs = [],
  }: {
    contractAddress: `0x${string}`
    contractAbi: Abi
    functionName?: string // claimTreat | claim
    roundId: bigint
    extraArgs?: any[]
  }) {
    return writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: functionName as any,
      args: [roundId, ...extraArgs],
    })
  }

  return { claim, txHash: hash, isPending, writeError, receipt, reset }
}

