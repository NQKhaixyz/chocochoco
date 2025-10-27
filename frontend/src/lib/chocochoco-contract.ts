import type { Abi, Address } from 'viem'
import abi from '../abi/IChocoChocoGame.json'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

export const chocoChocoAbi = abi as Abi

export type ChocoRoundStruct = {
  status: number
  commitDeadline: bigint
  revealDeadline: bigint
  stake: bigint
  feeBps: bigint | number
  poolMilk: bigint
  poolCacao: bigint
  countMilk: bigint
  countCacao: bigint
  tieMode: number
  forfeitMode: number
  forfeitBps: bigint | number
}

export type ChocoRoundView = {
  status: number
  commitDeadline: number
  revealDeadline: number
  stake: bigint
  feeBps: number
  poolMilk: bigint
  poolCacao: bigint
  countMilk: number
  countCacao: number
  tieMode: number
  forfeitMode: number
  forfeitBps: number
}

export const chocoChocoAddress =
  ((import.meta.env.VITE_CONTRACT_ADDRESS as Address | undefined) ?? ZERO_ADDRESS) as Address

// Solana Program ID (primary)
export const solanaProgramId = import.meta.env.VITE_PROGRAM_ID as string | undefined

export const chocoChocoContract = {
  address: chocoChocoAddress,
  abi: chocoChocoAbi,
} as const

export function hasDeploymentConfigured(address: Address | undefined = chocoChocoAddress) {
  // Check Solana program ID first (primary blockchain)
  if (solanaProgramId && solanaProgramId !== '' && solanaProgramId !== 'YOUR_PROGRAM_ID_HERE') {
    return true
  }
  // Fallback to EVM address check (legacy support)
  return address !== undefined && address !== ZERO_ADDRESS
}

export function normalizeRoundStruct(round: ChocoRoundStruct): ChocoRoundView {
  return {
    status: Number(round.status),
    commitDeadline: Number(round.commitDeadline),
    revealDeadline: Number(round.revealDeadline),
    stake: BigInt(round.stake),
    feeBps: Number(round.feeBps),
    poolMilk: BigInt(round.poolMilk),
    poolCacao: BigInt(round.poolCacao),
    countMilk: Number(round.countMilk),
    countCacao: Number(round.countCacao),
    tieMode: Number(round.tieMode),
    forfeitMode: Number(round.forfeitMode),
    forfeitBps: Number(round.forfeitBps),
  }
}
