import { PublicKey, Connection } from '@solana/web3.js'
import { u64le } from './bytes'

// TODO: replace seeds to match your program
export function deriveRoundPda(programId: PublicKey, roundId: bigint) {
  const le8 = Buffer.from(u64le(roundId))
  return PublicKey.findProgramAddressSync([Buffer.from('round'), le8], programId)[0]
}

export type RoundState = {
  roundId: bigint
  commitEnd: number // unix seconds
  revealEnd: number // unix seconds
  settled: boolean
  winnerSide?: number | null
}

// Placeholder raw parser — replace layout per your Borsh account schema
export async function fetchRoundRaw(conn: Connection, roundPda: PublicKey): Promise<RoundState | null> {
  const acc = await conn.getAccountInfo(roundPda)
  if (!acc) return null
  const data = Buffer.from(acc.data)
  const u64 = (off: number) => data.readBigUInt64LE(off)
  const i64 = (off: number) => Number(data.readBigInt64LE(off))
  const roundId = u64(0)
  const commitEnd = i64(8)
  const revealEnd = i64(16)
  const settled = data[24] === 1
  const winnerSide = settled ? data[25] : null
  return { roundId, commitEnd, revealEnd, settled, winnerSide }
}
