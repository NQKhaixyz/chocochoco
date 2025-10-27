import { describe, expect, it } from 'vitest'
import { encodePacked, keccak256, hexToBytes } from 'viem'
import { makeCommitment, normalizeSalt, Tribe } from './commitment'

describe('commitment helper', () => {
  const sampleSalt = '0xaabbccddeeff00112233445566778899aabbccddeeff00112233445566778899'

  it('matches solidity encoding for Milk tribe', () => {
    const commitment = makeCommitment('Milk', sampleSalt)
    const expected = keccak256(encodePacked(['uint8', 'bytes32'], [Tribe.Milk, sampleSalt]))
    expect(commitment).toEqual(expected)
  })

  it('accepts cacao tribe as number', () => {
    const commitment = makeCommitment(Tribe.Cacao, sampleSalt)
    const expected = keccak256(encodePacked(['uint8', 'bytes32'], [Tribe.Cacao, sampleSalt]))
    expect(commitment).toEqual(expected)
  })

  it('normalizes salt from Uint8Array', () => {
    const saltBytes = hexToBytes(sampleSalt)
    const normalized = normalizeSalt(saltBytes)
    expect(normalized).toEqual(sampleSalt)
    const commitment = makeCommitment('cacao', saltBytes)
    const expected = keccak256(encodePacked(['uint8', 'bytes32'], [Tribe.Cacao, sampleSalt]))
    expect(commitment).toEqual(expected)
  })

  it('pads ascii salt to 32 bytes', () => {
    const salt = 'kitten'
    const normalized = normalizeSalt(salt)
    expect(normalized.length).toBe(66) // 0x + 64 hex chars
    const commitment = makeCommitment('Milk', salt)
    const expected = keccak256(encodePacked(['uint8', 'bytes32'], [Tribe.Milk, normalized]))
    expect(commitment).toEqual(expected)
  })

  it('throws for invalid tribe', () => {
    expect(() => makeCommitment('strawberry', sampleSalt)).toThrow('Invalid tribe value')
  })

  it('throws when salt exceeds 32 bytes', () => {
    const tooLong = `0x${'aa'.repeat(40)}`
    expect(() => normalizeSalt(tooLong)).toThrow('Salt must be 32 bytes or less')
  })
})

