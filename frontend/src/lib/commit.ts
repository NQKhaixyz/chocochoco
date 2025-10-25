import { keccak256, encodePacked, parseEther } from 'viem'

export type Side = 'Milk' | 'Cacao'

// Match Solidity enum values in ChocoChocoGame:
// enum Tribe { None=0, Milk=1, Cacao=2 }
export const sideToUint = (s: Side) => (s === 'Milk' ? 1 : 2)

export function randomSalt32(): Uint8Array {
  const s = new Uint8Array(32)
  crypto.getRandomValues(s)
  return s
}

export function toHex(u8: Uint8Array): `0x${string}` {
  return `0x${[...u8].map((b) => b.toString(16).padStart(2, '0')).join('')}` as const
}

export function fromHex(hex: `0x${string}`): Uint8Array {
  const h = hex.slice(2)
  const out = new Uint8Array(h.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(2 * i, 2 * i + 2), 16)
  return out
}

export function saltStorageKey(roundId: bigint, address: `0x${string}`) {
  return `choco:salt:${roundId}:${address.toLowerCase()}`
}

export function loadOrCreateSalt(roundId: bigint, address: `0x${string}`): Uint8Array {
  const key = saltStorageKey(roundId, address)
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
  if (saved) return fromHex(saved as `0x${string}`)
  const salt = randomSalt32()
  if (typeof localStorage !== 'undefined') localStorage.setItem(key, toHex(salt))
  return salt
}

/**
 * Build commitment hash.
 *
 * Default here matches the current on-chain contract in this repo
 * (ChocoChocoGame.makeCommitment(uint8 tribe, bytes32 salt)).
 *
 * TODO(back-end): If commitment schema should also include roundId/address/stake,
 * switch to buildCommitmentFull.
 */
export function buildCommitment(params: {
  side: Side
  salt: Uint8Array
}): `0x${string}` {
  const choice = sideToUint(params.side)
  const packed = encodePacked(['uint8', 'bytes32'], [choice, toHex(params.salt)])
  return keccak256(packed)
}

// Alternative commitment that includes more context. Use only if contract expects it.
export function buildCommitmentFull(params: {
  side: Side
  roundId: bigint
  address: `0x${string}`
  stakeWei: bigint
}): `0x${string}` {
  const choice = sideToUint(params.side)
  const packed = encodePacked(
    ['uint8', 'uint256', 'address', 'uint256'],
    [choice, params.roundId, params.address, params.stakeWei],
  )
  return keccak256(packed)
}

export function parseStakeToWei(input: string): bigint {
  return parseEther(input === '' ? '0' : input)
}
