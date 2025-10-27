import { PublicKey } from '@solana/web3.js'
import { computeCommitment, toHex, type Tribe } from './solana-commit'

export type VaultEntry = {
  round: string
  player: string
  tribe: Tribe
  saltHex: string // 0x-prefixed hex
  commitmentHex: string // 0x-prefixed hex of sha256 result
  savedAt: number
}

function key(round: string, player: string) {
  return `choco:sol:vault:${round}:${player}`
}

export function getVault(roundPk: PublicKey, playerPk: PublicKey): VaultEntry | null {
  const k = key(roundPk.toBase58(), playerPk.toBase58())
  const raw = localStorage.getItem(k)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as VaultEntry
    return parsed
  } catch {
    return null
  }
}

export async function saveVault(
  roundPk: PublicKey,
  playerPk: PublicKey,
  tribe: Tribe,
  salt: Uint8Array,
): Promise<VaultEntry> {
  const commitment = await computeCommitment(tribe, salt, playerPk, roundPk)
  const commitmentHex = `0x${toHex(commitment)}`
  const saltHex = `0x${toHex(salt)}`

  const entry: VaultEntry = {
    round: roundPk.toBase58(),
    player: playerPk.toBase58(),
    tribe,
    saltHex,
    commitmentHex,
    savedAt: Date.now(),
  }

  const k = key(entry.round, entry.player)
  localStorage.setItem(k, JSON.stringify(entry))
  return entry
}

export function clearVault(roundPk: PublicKey, playerPk: PublicKey) {
  const k = key(roundPk.toBase58(), playerPk.toBase58())
  localStorage.removeItem(k)
}

