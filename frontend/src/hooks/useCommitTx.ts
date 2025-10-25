import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Abi, AbiFunction } from 'viem'

type CommitArgs = {
  address: `0x${string}`
  abi: Abi
  commitment: `0x${string}`
  stakeWei: bigint
  functionName?: 'commitMeow' | 'commit'
  payable?: boolean
}

function findCommitFn(abi: Abi, preferred?: 'commitMeow' | 'commit') {
  const fns = (abi as readonly AbiFunction[]).filter((i) => i.type === 'function')
  const byName = (name: 'commitMeow' | 'commit') =>
    fns.filter((f) => (f as any).name === name).sort((a, b) => (a.inputs?.length ?? 0) - (b.inputs?.length ?? 0))

  const candidates = [
    ...(preferred ? byName(preferred) : []),
    ...byName('commitMeow'),
    ...byName('commit'),
  ]
  const unique: AbiFunction[] = []
  for (const c of candidates) {
    if (!unique.find((u) => (u as any).name === (c as any).name && (u.inputs?.length ?? 0) === (c.inputs?.length ?? 0))) {
      unique.push(c)
    }
  }
  const fn = unique[0]
  if (!fn) return null
  const isPayable = (fn.stateMutability as any) === 'payable'
  const inputs = fn.inputs ?? []
  return {
    functionName: (fn as any).name as 'commitMeow' | 'commit',
    inputsLength: inputs.length,
    payable: isPayable,
  }
}

export function useCommitTx() {
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash, query: { enabled: !!hash } })

  async function commit(args: CommitArgs) {
    const chosen = findCommitFn(args.abi, args.functionName)
    if (!chosen) throw new Error('No commit function found in ABI')

    const fn = chosen.functionName
    const payable = args.payable ?? chosen.payable

    if (payable) {
      // commit(bytes32) payable
      return writeContract({
        address: args.address,
        abi: args.abi,
        functionName: fn as any,
        args: [args.commitment],
        value: args.stakeWei,
      })
    }

    // Non-payable variant expects stake as argument when inputsLength === 2
    if (chosen.inputsLength >= 2) {
      return writeContract({
        address: args.address,
        abi: args.abi,
        functionName: fn as any,
        args: [args.commitment, args.stakeWei],
      })
    }

    // Fallback: nonpayable with only commitment
    return writeContract({
      address: args.address,
      abi: args.abi,
      functionName: fn as any,
      args: [args.commitment],
    })
  }

  return { commit, txHash: hash, isPending, writeError, receipt }
}

