import { encodePacked, keccak256, bytesToHex, hexToBytes, isHex, padHex, type Hex } from 'viem'

export enum Tribe {
  None = 0,
  Milk = 1,
  Cacao = 2,
}

export type TribeInput = keyof typeof Tribe | Tribe | number | string
export type SaltInput = Hex | string | Uint8Array

function normalizeTribe(input: TribeInput): Tribe {
  if (typeof input === 'number') {
    if (input === Tribe.Milk || input === Tribe.Cacao) return input
    if (input === Tribe.None) throw new Error('Tribe "None" is not committable')
  }

  if (typeof input === 'string') {
    const key = input.toLowerCase()
    if (key === 'milk') return Tribe.Milk
    if (key === 'cacao') return Tribe.Cacao
    if (key === 'none') throw new Error('Tribe "None" is not committable')
    const parsed = Number.parseInt(input, 10)
    if (!Number.isNaN(parsed)) {
      return normalizeTribe(parsed)
    }
  }

  throw new Error('Invalid tribe value. Expected Milk(1) or Cacao(2).')
}

export function normalizeSalt(input: SaltInput): Hex {
  if (input instanceof Uint8Array) {
    if (input.length > 32) throw new Error('Salt must be 32 bytes or less')
    return padHex(bytesToHex(input), { dir: 'left', size: 32 })
  }

  if (typeof input === 'string') {
    if (isHex(input, { strict: false })) {
      const hex = (input.startsWith('0x') ? input : `0x${input}`) as Hex
      const bytes = hexToBytes(hex)
      if (bytes.length > 32) throw new Error('Salt must be 32 bytes or less')
      return padHex(bytesToHex(bytes), { dir: 'left', size: 32 })
    }
    const encoder = new TextEncoder()
    const bytes = encoder.encode(input)
    if (bytes.length > 32) throw new Error('Salt string must be <= 32 bytes')
    return padHex(bytesToHex(bytes), { dir: 'left', size: 32 })
  }

  throw new Error('Unsupported salt format')
}

export function makeCommitment(tribe: TribeInput, salt: SaltInput): Hex {
  const tribeCode = normalizeTribe(tribe)
  const normalizedSalt = normalizeSalt(salt)
  return keccak256(encodePacked(['uint8', 'bytes32'], [tribeCode, normalizedSalt]))
}

