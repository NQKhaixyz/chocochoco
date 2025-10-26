import { PublicKey, Connection } from '@solana/web3.js'

export type PlayerRoundState = {
  player: PublicKey
  round: PublicKey
  tribe: number // 0=Milk, 1=Cacao, 255=None
  commitment: Uint8Array // 32 bytes
  revealed: boolean
  claimed: boolean
}

/**
 * Parse PlayerRound account data.
 * Adjust offsets according to your Anchor account layout.
 * 
 * Example layout (adjust as needed):
 * [0..32) player pubkey
 * [32..64) round pubkey
 * [64] tribe u8
 * [65..97) commitment [u8;32]
 * [97] revealed bool
 * [98] claimed bool
 */
export async function fetchPlayerRoundRaw(
  conn: Connection,
  playerRoundPda: PublicKey,
): Promise<PlayerRoundState | null> {
  const acc = await conn.getAccountInfo(playerRoundPda)
  if (!acc) return null
  
  const data = Buffer.from(acc.data)
  
  // Parse according to layout - ADJUST THESE OFFSETS TO MATCH YOUR PROGRAM
  const player = new PublicKey(data.slice(0, 32))
  const round = new PublicKey(data.slice(32, 64))
  const tribe = data.readUInt8(64)
  const commitment = new Uint8Array(data.slice(65, 97))
  const revealed = data.readUInt8(97) === 1
  const claimed = data.readUInt8(98) === 1

  return { player, round, tribe, commitment, revealed, claimed }
}

/**
 * Derive PlayerRound PDA.
 * Seeds: ["player", round_pda, player_pubkey]
 */
export function derivePlayerRoundPda(
  programId: PublicKey,
  roundPda: PublicKey,
  playerPubkey: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('player'), roundPda.toBuffer(), playerPubkey.toBuffer()],
    programId,
  )[0]
}
