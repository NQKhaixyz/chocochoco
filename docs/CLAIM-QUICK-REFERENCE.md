# Solana Claim Feature - Quick Reference

## Component: SolanaClaimPanel

### Location
`frontend/src/components/SolanaClaimPanel.tsx`

### Usage
```tsx
import SolanaClaimPanel from './components/SolanaClaimPanel'

function App() {
  return (
    <div>
      <SolanaClaimPanel />
    </div>
  )
}import { formatHumanReadable, formatTimestamp } from '@/lib/time-format'

function DeadlineInfo({ deadline }) {
  const { remaining } = useCountdown(deadline)
  
  return (
    <div>
      <p>Absolute: {formatTimestamp(deadline)}</p>
      <p>Remaining: {formatHumanReadable(remaining)}</p>
      <p>Timer: <SolanaCountdown endTs={deadline} /></p>
    </div>
  )
}
```

### Props
None - uses environment variables and hooks internally

### Environment Variables
- `VITE_PROGRAM_ID` - Solana program ID
- `VITE_SOLANA_CLUSTER` - devnet/testnet/mainnet-beta

## State Flow

### Claim Eligibility Logic
```typescript
const canClaim = 
  round.settled &&           // Round must be finalized
  isWinner &&                // Player must be on winning side
  !playerRound.claimed &&    // Must not have claimed already
  publicKey                  // Wallet must be connected
```

### Winner Determination
```typescript
const isWinner = 
  round.settled &&
  round.winnerSide != null &&
  playerRound.revealed &&
  playerRound.tribe === round.winnerSide
```

## Transaction Structure

### Instruction Format
```typescript
{
  programId: PROGRAM_ID,
  keys: [
    { pubkey: player, isSigner: true, isWritable: true },
    { pubkey: roundPda, isSigner: false, isWritable: true },
    { pubkey: playerRoundPda, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ],
  data: Uint8Array([3]) // opcode 3 = claim_treat
}
```

### PDA Derivation
```typescript
// Round PDA
const roundPda = PublicKey.findProgramAddressSync(
  [Buffer.from('round'), roundIdLE8],
  PROGRAM_ID
)[0]

// PlayerRound PDA
const playerRoundPda = PublicKey.findProgramAddressSync(
  [Buffer.from('player'), roundPda.toBuffer(), player.toBuffer()],
  PROGRAM_ID
)[0]
```

## Account Parsing

### RoundState (from round.ts)
```typescript
type RoundState = {
  roundId: bigint
  commitEnd: number      // unix seconds
  revealEnd: number      // unix seconds
  settled: boolean
  winnerSide?: number | null  // 0=Milk, 1=Cacao
}
```

### PlayerRoundState (from player-round.ts)
```typescript
type PlayerRoundState = {
  player: PublicKey
  round: PublicKey
  tribe: number          // 0=Milk, 1=Cacao, 255=None
  commitment: Uint8Array // 32 bytes
  revealed: boolean
  claimed: boolean
}
```

## UI States

### Display Logic
| Condition | Display |
|-----------|---------|
| Round not settled | "⏳ Chờ round được chốt" |
| Not revealed | "ℹ️ Bạn cần reveal trước khi claim" |
| Is winner + not claimed | **Enabled Claim button** |
| Is winner + claimed | "🎉 Bạn đã claim rồi" |
| Not winner | "ℹ️ Chỉ phe thắng mới claim được" |

### Button States
```typescript
<button
  onClick={onClaim}
  disabled={!canClaim || busy}
  className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50"
>
  {busy ? 'Claiming…' : 'Claim'}
</button>
```

## Error Messages

### Normalized Errors
```typescript
function normalizeClaimError(raw: string): string {
  if (/already claimed|double.?claim/i.test(raw)) 
    return 'Bạn đã claim rồi (double-claim blocked)'
  
  if (/not.*winner|wrong.*side|not.*eligible/i.test(raw))
    return 'Chỉ phe thắng mới claim được'
  
  if (/not.*settled|not.*finalized/i.test(raw)) 
    return 'Round chưa chốt kết quả'
  
  if (/0x1/.test(raw)) 
    return 'Lỗi chương trình (0x1): kiểm tra state/account'
  
  return raw
}
```

## Testing Scenarios

### Happy Path
1. User commits with salt
2. User reveals before deadline
3. Round settles, user is on minority side (winner)
4. User clicks Claim
5. Transaction succeeds
6. State updates to `claimed: true`
7. Success toast shows with tx link

### Error Cases
1. **Double Claim**: 
   - User clicks Claim twice
   - Second attempt blocked by disabled button + UI message
   - On-chain also rejects

2. **Wrong Side**:
   - User on majority side (loser)
   - Claim button disabled
   - Info message: "Chỉ phe thắng mới claim được"

3. **Not Revealed**:
   - User committed but didn't reveal
   - Button disabled
   - Message: "Bạn cần reveal trước khi claim"

4. **Round Not Settled**:
   - Reveal period still active
   - Button disabled
   - Message: "Chờ round được chốt"

## Customization

### Change Polling Interval
```typescript
// In SolanaClaimPanel.tsx
useEffect(() => {
  const id = setInterval(() => {
    setPollTrigger((n) => n + 1)
  }, 5000) // Change to desired ms
  return () => clearInterval(id)
}, [])
```

### Adjust Account Layout
Edit `frontend/src/lib/player-round.ts`:
```typescript
export async function fetchPlayerRoundRaw(
  conn: Connection,
  playerRoundPda: PublicKey,
): Promise<PlayerRoundState | null> {
  const acc = await conn.getAccountInfo(playerRoundPda)
  if (!acc) return null
  const data = Buffer.from(acc.data)
  
  // ADJUST THESE OFFSETS to match your program
  const player = new PublicKey(data.slice(0, 32))
  const round = new PublicKey(data.slice(32, 64))
  const tribe = data[64]
  const commitment = new Uint8Array(data.slice(65, 97))
  const revealed = data[97] === 1
  const claimed = data[98] === 1
  
  return { player, round, tribe, commitment, revealed, claimed }
}
```

### Change Instruction Opcode
```typescript
// In SolanaClaimPanel.tsx, onClaim function
const data = new Uint8Array([3]) // Change 3 to your claim_treat opcode
```

## Hooks Available

### useSolanaProgramEvents
```typescript
import { useSolanaProgramEvents } from '../hooks/useSolanaEvents'

useSolanaProgramEvents(
  PROGRAM_ID,
  ['RoundMeowed', 'TreatClaimed'],
  (eventName, signature) => {
    console.log(`Event ${eventName} in tx ${signature}`)
    // Trigger refetch
  },
  10000 // poll every 10s
)
```

### usePolling
```typescript
import { usePolling } from '../hooks/useSolanaEvents'

usePolling(() => {
  fetchRoundData()
  fetchPlayerData()
}, 5000)
```

## Utilities

### derivePlayerRoundPda
```typescript
import { derivePlayerRoundPda } from '../lib/player-round'

const pda = derivePlayerRoundPda(PROGRAM_ID, roundPda, playerPubkey)
```

### fetchPlayerRoundRaw
```typescript
import { fetchPlayerRoundRaw } from '../lib/player-round'

const state = await fetchPlayerRoundRaw(connection, playerRoundPda)
if (state) {
  console.log('Claimed:', state.claimed)
  console.log('Revealed:', state.revealed)
}
```

## Debug Tips

### Check Account Data
```bash
solana account <PLAYER_ROUND_PDA> -u devnet
```

### View Transaction Logs
```typescript
const tx = await connection.getTransaction(signature, {
  commitment: 'confirmed',
  maxSupportedTransactionVersion: 0,
})
console.log(tx?.meta?.logMessages)
```

### Test Claim Without UI
```typescript
import { claimTreat } from '../lib/instructions'

const sig = await claimTreat({
  connection,
  payer: wallet.publicKey,
  programId: PROGRAM_ID,
  roundId: 1n,
})
console.log('Tx:', sig)
```

## Performance

### RPC Calls Per Load
- Initial: 2 calls (round + player_round)
- Per poll: 2 calls every 5s
- Per claim: 1 transaction + 1 refetch (3 calls total)

### Optimization
- Use WebSocket subscriptions instead of polling
- Batch account fetches with `getMultipleAccountsInfo`
- Cache round data if it doesn't change after settlement

## Links

- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Anchor Framework](https://www.anchor-lang.com/)
