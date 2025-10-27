import { PublicKey } from '@solana/web3.js'

export type Tribe = 'Milk' | 'Cacao'

export function tribeToU8(t: Tribe): number {
  return t === 'Milk' ? 1 : 2
}

export function randomSalt32(): Uint8Array {
  const s = new Uint8Array(32)
  crypto.getRandomValues(s)
  return s
}

export async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  const ab =
    bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
      ? (bytes.buffer as ArrayBuffer)
      : (bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer)
  const h = await crypto.subtle.digest('SHA-256', ab)
  return new Uint8Array(h)
}

export function toHex(u8: Uint8Array): string {
  return Array.from(u8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function fromHex(hex: string): Uint8Array {
  const h = hex.replace(/^0x/, '')
  const out = new Uint8Array(h.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(2 * i, 2 * i + 2), 16)
  return out
}

export async function computeCommitment(
  tribe: Tribe,
  salt: Uint8Array,
  player: PublicKey,
  round: PublicKey,
): Promise<Uint8Array> {
  const data = new Uint8Array(1 + 32 + 32 + 32)
  data[0] = tribeToU8(tribe)
  data.set(salt, 1)
  data.set(player.toBytes(), 33)
  data.set(round.toBytes(), 65)
  return sha256(data)
}

export function saltKey(round: string, player: string) {
  return `choco:sol:salt:${round}:${player}`
}

export function generateSalt(): `0x${string}` {
  return `0x${toHex(randomSalt32())}`
}
