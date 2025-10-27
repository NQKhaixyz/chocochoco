import { PublicKey } from '@solana/web3.js'
import { Program, AnchorProvider } from '@coral-xyz/anchor'
import type { ChocoChocoGame } from '../idl/chocochoco_game'
import { IDL } from '../idl/chocochoco_game'

// Program ID from environment
export const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || 'J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz'
)

/**
 * Get the Anchor program instance
 */
export function getProgram(provider: AnchorProvider): Program<ChocoChocoGame> {
  return new Program(IDL, provider)
}

/**
 * Derive round PDA address
 */
export function getRoundAddress(roundId: number): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('round'), Buffer.from(roundId.toString())],
    PROGRAM_ID
  )
  return pda
}

/**
 * Derive global state PDA
 */
export function getGlobalStateAddress(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from('global')], PROGRAM_ID)
  return pda
}
