# Commitment Hash Reference Guide

## Overview

The ChocoChoco game uses a **commit-reveal pattern** with SHA256 hashing to ensure fair play. Players first commit to a hidden choice, then reveal it later to prove they didn't change their mind.

---

## Hash Function Specification

### Format
```
commitment = SHA256(tribe || salt || player || round_id)
```

### Components
- **tribe** (1 byte): Player's choice
  - `0x01` = Milk
  - `0x02` = Cacao
- **salt** (32 bytes): Random bytes for uniqueness
- **player** (32 bytes): Player's public key
- **round_id** (32 bytes): Round account public key

**Total input:** 97 bytes  
**Output:** 32 bytes (SHA256 hash)

---

## Implementation Examples

### TypeScript (Frontend)

```typescript
import { PublicKey } from "@solana/web3.js";
import * as crypto from "crypto";

function makeCommitment(
  tribe: number,           // 1 = Milk, 2 = Cacao
  salt: Buffer,            // 32 random bytes
  playerPubkey: PublicKey,
  roundPubkey: PublicKey
): Buffer {
  const data = Buffer.concat([
    Buffer.from([tribe]),           // 1 byte
    salt,                            // 32 bytes
    playerPubkey.toBuffer(),        // 32 bytes
    roundPubkey.toBuffer()          // 32 bytes
  ]);
  
  return Buffer.from(
    crypto.createHash("sha256").update(data).digest()
  );
}

// Usage
const salt = crypto.randomBytes(32);
const commitment = makeCommitment(
  1,  // Milk
  salt,
  playerKeypair.publicKey,
  roundPDA
);

// Store salt securely! You'll need it to reveal later
```

### Rust (Program)

```rust
use solana_program::hash::hash;

pub fn verify_commitment(
    tribe_value: u8,
    salt: [u8; 32],
    player: &Pubkey,
    round: &Pubkey,
    stored_commitment: [u8; 32],
) -> Result<()> {
    let mut data = Vec::new();
    data.push(tribe_value);              // 1 byte
    data.extend_from_slice(&salt);       // 32 bytes
    data.extend_from_slice(player.as_ref()); // 32 bytes
    data.extend_from_slice(round.as_ref());  // 32 bytes
    
    let computed_hash = hash(&data);
    
    require!(
        computed_hash.to_bytes() == stored_commitment,
        GameError::InvalidReveal
    );
    
    Ok(())
}
```

### JavaScript (Browser)

```javascript
async function makeCommitment(tribe, salt, playerPubkey, roundPubkey) {
  // Concatenate all components
  const data = new Uint8Array(97);
  data[0] = tribe;                                    // byte 0
  data.set(salt, 1);                                  // bytes 1-32
  data.set(playerPubkey.toBytes(), 33);              // bytes 33-64
  data.set(roundPubkey.toBytes(), 65);               // bytes 65-96
  
  // Hash with SHA256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

// Usage with Web Crypto API
const salt = crypto.getRandomValues(new Uint8Array(32));
const commitment = await makeCommitment(
  1,  // Milk
  salt,
  wallet.publicKey,
  roundPDA
);
```

---

## Step-by-Step Flow

### 1. Generate Salt (Client)
```typescript
// Generate 32 random bytes
const salt = crypto.randomBytes(32);

// IMPORTANT: Store salt securely!
// You'll need it to reveal your choice later
localStorage.setItem(`salt_${roundId}`, salt.toString('hex'));
```

### 2. Create Commitment (Client)
```typescript
const tribe = 1; // Milk
const commitment = makeCommitment(
  tribe,
  salt,
  wallet.publicKey,
  roundPDA
);

// Also store tribe choice
localStorage.setItem(`tribe_${roundId}`, tribe.toString());
```

### 3. Submit Commitment (On-Chain)
```typescript
await program.methods
  .commitMeow(Array.from(commitment))
  .accounts({
    round: roundPDA,
    playerRound: playerRoundPDA,
    player: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### 4. Reveal (On-Chain)
```typescript
// Retrieve stored values
const salt = Buffer.from(
  localStorage.getItem(`salt_${roundId}`),
  'hex'
);
const tribe = parseInt(
  localStorage.getItem(`tribe_${roundId}`)
);

// Submit reveal
await program.methods
  .revealMeow(tribe, Array.from(salt))
  .accounts({
    round: roundPDA,
    playerRound: playerRoundPDA,
    player: wallet.publicKey,
  })
  .rpc();
```

---

## Security Considerations

### ✅ DO:
- **Generate cryptographically random salt** using `crypto.randomBytes()` or `crypto.getRandomValues()`
- **Store salt securely** - without it, you can't reveal!
- **Use the correct order**: `tribe || salt || player || round_id`
- **Include player and round_id** in the hash (prevents replay attacks)

### ❌ DON'T:
- Don't use predictable salt (like `[0, 0, 0, ...]` or timestamp)
- Don't reuse salt across multiple games
- Don't share salt before reveal phase ends
- Don't hardcode salt values in your code

---

## Common Pitfalls

### 1. Wrong Byte Order
```typescript
// ❌ WRONG - incorrect order
Buffer.concat([salt, Buffer.from([tribe]), player, round])

// ✅ CORRECT - tribe first
Buffer.concat([Buffer.from([tribe]), salt, player, round])
```

### 2. Wrong Hash Algorithm
```typescript
// ❌ WRONG - using SHA3 or Keccak256
crypto.createHash("sha3-256")  // NO!
crypto.createHash("keccak256") // NO!

// ✅ CORRECT - using SHA256
crypto.createHash("sha256")    // YES!
```

### 3. Lost Salt
```typescript
// ❌ WRONG - not storing salt
const salt = crypto.randomBytes(32);
const commitment = makeCommitment(tribe, salt, ...);
// Salt is lost! Can't reveal anymore

// ✅ CORRECT - store salt securely
localStorage.setItem(`salt_${roundId}`, salt.toString('hex'));
```

### 4. Wrong Tribe Value
```typescript
// ❌ WRONG - using 0-indexed values
const tribe = 0; // Milk - NO!

// ✅ CORRECT - 1 = Milk, 2 = Cacao
const tribe = 1; // Milk - YES!
```

---

## Testing Hash Compatibility

### Test Vector 1: Milk
```
tribe:    0x01
salt:     0x0000...0000 (32 bytes of zeros)
player:   11111111111111111111111111111111
round:    22222222222222222222222222222222

Expected Hash:
SHA256 = 0x... (compute this in your implementation)
```

### Test Vector 2: Cacao
```
tribe:    0x02
salt:     0xFFFF...FFFF (32 bytes of 0xFF)
player:   33333333333333333333333333333333
round:    44444444444444444444444444444444

Expected Hash:
SHA256 = 0x... (compute this in your implementation)
```

### Verification Script
```typescript
function testCommitment() {
  const salt = Buffer.alloc(32, 0);
  const player = new PublicKey("11111111111111111111111111111111");
  const round = new PublicKey("22222222222222222222222222222222");
  
  const commitment = makeCommitment(1, salt, player, round);
  
  console.log("Commitment:", commitment.toString('hex'));
  
  // Should match Rust program output for same inputs
}
```

---

## Frontend Integration Checklist

- [ ] Implement `makeCommitment()` function with correct SHA256
- [ ] Generate random salt using `crypto.randomBytes(32)`
- [ ] Store salt and tribe choice securely (localStorage/sessionStorage)
- [ ] Submit commitment via `commit_meow` instruction
- [ ] Wait for reveal phase to start
- [ ] Retrieve stored salt and tribe
- [ ] Submit reveal via `reveal_meow` instruction
- [ ] Clear stored salt after successful reveal
- [ ] Handle errors (hash mismatch, timing issues)

---

## Debugging Tips

### Enable Logging
```typescript
const data = Buffer.concat([
  Buffer.from([tribe]),
  salt,
  playerPubkey.toBuffer(),
  roundPubkey.toBuffer()
]);

console.log("Input data:", data.toString('hex'));
console.log("Input length:", data.length); // Should be 97
console.log("Commitment:", commitment.toString('hex'));
```

### Compare with Rust
If reveal fails with `InvalidReveal`, log both sides:
```rust
// In program
msg!("Computed hash: {:?}", computed_hash.to_bytes());
msg!("Stored hash: {:?}", player_round.commitment);
```

### Check Component Sizes
```typescript
console.log("Tribe size:", Buffer.from([tribe]).length);        // 1
console.log("Salt size:", salt.length);                         // 32
console.log("Player size:", playerPubkey.toBuffer().length);    // 32
console.log("Round size:", roundPubkey.toBuffer().length);      // 32
console.log("Total:", 1 + 32 + 32 + 32);                       // 97
```

---

## FAQ

**Q: Why include player and round in the hash?**  
A: Prevents replay attacks. Without them, someone could copy your commitment to another round or pretend to be you.

**Q: Can I use a shorter salt?**  
A: No, the program expects exactly 32 bytes. Use `crypto.randomBytes(32)`.

**Q: What if I lose my salt?**  
A: You cannot reveal, and your stake is forfeited. Always back up your salt!

**Q: Can I change my choice after committing?**  
A: No, that's the whole point of commit-reveal! The hash locks in your choice.

**Q: Why SHA256 instead of Keccak256?**  
A: Solana's `solana_program::hash::hash()` uses SHA256. It's the standard for Solana programs.

---

## References

- Solana Hash Function: [`solana_program::hash::hash()`](https://docs.rs/solana-program/latest/solana_program/hash/fn.hash.html)
- Node.js Crypto: [`crypto.createHash()`](https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_options)
- Web Crypto API: [`crypto.subtle.digest()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)

---

*Last Updated: 2025-10-27*  
*Program: ChocoChoco Game v1*  
*Hash Version: SHA256*
