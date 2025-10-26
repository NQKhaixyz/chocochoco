# EVM to Solana Migration Guide

## Overview

This document explains the migration from EVM (Ethereum/Base/Polygon) contracts to Solana programs using the Anchor framework.

## Key Differences

### Architecture

| Aspect | EVM (Ethereum/Foundry) | Solana (Anchor) |
|--------|------------------------|-----------------|
| **Language** | Solidity | Rust |
| **Framework** | Foundry/Hardhat | Anchor |
| **Account Model** | Smart contracts with internal state | Program (stateless) + Accounts (state) |
| **Deployment** | Deploy contract with constructor | Deploy program + initialize accounts |
| **State** | Contract storage slots | PDAs (Program Derived Addresses) |
| **Currency** | ETH/Native token | SOL (lamports) |
| **Gas** | Gas limit, gas price | Compute units, rent |
| **Addresses** | 20 bytes (0x...) | 32 bytes (Base58) |
| **Hashing** | keccak256 | keccak256 (via solana-program) |

### Testing

| Aspect | EVM | Solana |
|--------|-----|--------|
| **Test Language** | Solidity (Foundry) or JS | TypeScript (Mocha) |
| **Local Node** | anvil | solana-test-validator |
| **Test Runner** | forge test | anchor test |
| **Coverage** | forge coverage | anchor test --coverage (limited) |

### Deployment

| Aspect | EVM | Solana |
|--------|-----|--------|
| **Build** | forge build | anchor build |
| **Deploy** | forge script | solana program deploy |
| **Verify** | forge verify-contract | IDL publish on-chain |
| **ABI** | JSON ABI | IDL (JSON) |
| **Explorer** | Etherscan | Solana Explorer |

## Migration Steps

### 1. Workspace Setup

**EVM (Foundry):**
```bash
forge init
forge install OpenZeppelin/openzeppelin-contracts
```

**Solana (Anchor):**
```bash
anchor init chocochoco_game
cd chocochoco_game
```

### 2. Contract → Program

**EVM Contract (Solidity):**
```solidity
contract ChocoChocoGame {
    struct Round {
        uint256 stake;
        uint64 commitDeadline;
        mapping(address => bytes32) commitments;
    }
    
    mapping(uint256 => Round) public rounds;
    
    function commitMeow(bytes32 commitment) external payable {
        require(msg.value == stake, "Bad stake");
        rounds[currentRoundId].commitments[msg.sender] = commitment;
    }
}
```

**Solana Program (Anchor/Rust):**
```rust
#[program]
pub mod chocochoco_game {
    pub fn commit_meow(ctx: Context<CommitMeow>, commitment: [u8; 32]) -> Result<()> {
        let round = &ctx.accounts.round;
        let player_round = &mut ctx.accounts.player_round;
        
        // Transfer stake from player to round PDA
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: ctx.accounts.round.to_account_info(),
            },
        );
        transfer(cpi_context, round.stake_lamports)?;
        
        player_round.commitment = commitment;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CommitMeow<'info> {
    #[account(mut)]
    pub round: Account<'info, Round>,
    
    #[account(init, payer = player, space = 8 + PlayerRound::INIT_SPACE)]
    pub player_round: Account<'info, PlayerRound>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
```

### 3. State Management

**EVM:**
- State stored in contract storage slots
- Mappings for player data
- Arrays for lists

**Solana:**
- Program is stateless (only code)
- State stored in separate Account PDAs
- Each player gets their own `PlayerRound` account
- Round state in `Round` account

### 4. Testing

**EVM (Foundry):**
```solidity
function testCommit() public {
    vm.deal(alice, 1 ether);
    vm.prank(alice);
    game.commitMeow{value: 0.01 ether}(commitment);
}
```

**Solana (Anchor):**
```typescript
it("Player commits", async () => {
  const player = Keypair.generate();
  await provider.connection.requestAirdrop(player.publicKey, 1_000_000_000);
  
  await program.methods
    .commitMeow(Array.from(commitment))
    .accounts({
      round: roundPda,
      playerRound: playerRoundPda,
      player: player.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([player])
    .rpc();
});
```

### 5. Frontend Integration

**EVM (Ethers.js/Wagmi):**
```typescript
const { writeContract } = useContractWrite({
  address: '0x...',
  abi: ChocoChocoGameAbi,
  functionName: 'commitMeow',
  args: [commitment],
  value: parseEther('0.01'),
});
```

**Solana (Anchor/Wallet Adapter):**
```typescript
const program = new Program(idl, programId, provider);

await program.methods
  .commitMeow(Array.from(commitment))
  .accounts({
    round: roundPda,
    playerRound: playerRoundPda,
    player: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

## Porting Checklist

### ChocoChocoGame Contract → Solana Program

- [x] **Struct definitions**
  - `Round` → `Round` account with `#[account]`
  - `PlayerRound` → Separate account per player
  
- [x] **Enums**
  - `Status`, `Tribe`, `ForfeitMode` → Same enums with `#[derive(AnchorSerialize, AnchorDeserialize)]`
  
- [x] **Instructions (Functions)**
  - `commitMeow` → `commit_meow` with Context<CommitMeow>
  - `revealMeow` → `reveal_meow` with Context<RevealMeow>
  - `settleRound` → `settle_round` with Context<SettleRound>
  - `claimTreat` → `claim_treat` with Context<ClaimTreat>
  
- [x] **Events**
  - Solidity `emit` → Anchor `emit!` macro
  - All event types ported with `#[event]`
  
- [x] **Access Control**
  - `onlyOwner` → Authority checks in Anchor accounts
  - `Pausable` → Can add paused flag to config account
  
- [x] **State Variables**
  - Contract storage → Round PDA accounts
  - Mappings → Individual PlayerRound accounts per player per round
  
- [x] **Commit-Reveal Pattern**
  - keccak256 hashing → `solana_program::keccak::Hasher`
  - Salt verification same logic
  
- [x] **Payment Logic**
  - `msg.value` → CPI transfer SOL
  - `transfer()` → Lamport manipulation via `**account.try_borrow_mut_lamports()?`

## Environment Variables

### EVM
```bash
CHAIN_ID=84532
RPC_URL=https://sepolia.base.org
ETHERSCAN_KEY=...
```

### Solana
```bash
VITE_SOLANA_CLUSTER=devnet
VITE_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
VITE_SOLANA_RPC_URL=  # Optional, uses cluster default
```

## Common Patterns

### Pattern: ETH Transfer

**EVM:**
```solidity
payable(winner).transfer(amount);
```

**Solana:**
```rust
**ctx.accounts.round.to_account_info().try_borrow_mut_lamports()? -= amount;
**ctx.accounts.winner.to_account_info().try_borrow_mut_lamports()? += amount;
```

### Pattern: Require Checks

**EVM:**
```solidity
require(msg.value == stake, "Bad stake");
require(!claimed, "Already claimed");
```

**Solana:**
```rust
require!(amount == stake_lamports, GameError::InvalidStake);
require!(!player_round.claimed, GameError::AlreadyClaimed);
```

### Pattern: Mappings

**EVM:**
```solidity
mapping(uint256 => mapping(address => bytes32)) public commitments;
bytes32 c = commitments[roundId][player];
```

**Solana:**
```rust
// Each player gets their own account
#[account(
    seeds = [b"player_round", round.key().as_ref(), player.key().as_ref()],
    bump
)]
pub player_round: Account<'info, PlayerRound>,

// Access: player_round.commitment
```

### Pattern: Events

**EVM:**
```solidity
event MeowCommitted(uint256 indexed roundId, address indexed player);
emit MeowCommitted(currentRoundId, msg.sender);
```

**Solana:**
```rust
#[event]
pub struct MeowCommitted {
    pub round_id: Pubkey,
    pub player: Pubkey,
}

emit!(MeowCommitted {
    round_id: round.key(),
    player: ctx.accounts.player.key(),
});
```

## Deployment Comparison

### EVM Deploy

```bash
forge script script/DeployChocoChocoGame.s.sol:DeployChocoChocoGame \
  --rpc-url $BASE_SEPOLIA_RPC \
  --broadcast \
  --verify
```

### Solana Deploy

```bash
# Simpler! Script does everything
./scripts/solana-deploy.sh devnet

# Outputs:
# - Program deployed
# - IDL published on-chain
# - frontend/.env updated automatically
# - solana/deployments.json updated
```

## Advantages of Solana

1. **Lower Fees**: ~$0.00025 per transaction vs $1-50 on Ethereum L1
2. **Faster**: 400ms block time vs 12 seconds on Ethereum
3. **Parallel Execution**: Multiple transactions processed simultaneously
4. **No Gas Wars**: Fixed compute unit pricing
5. **Built-in Account Model**: PDAs provide deterministic addresses

## Challenges

1. **Learning Curve**: Rust + Anchor + Solana account model
2. **Account Space**: Must pre-allocate account size
3. **Rent**: Accounts must maintain minimum SOL balance (rent-exempt)
4. **Compute Limits**: 200k compute units per transaction (can request more)
5. **Tooling**: Less mature than EVM ecosystem

## Resources

- **Anchor Book:** https://book.anchor-lang.com/
- **Solana Cookbook:** https://solanacookbook.com/
- **Anchor Examples:** https://github.com/coral-xyz/anchor/tree/master/tests
- **Solana Program Library:** https://github.com/solana-labs/solana-program-library

## Next Steps

1. **Build:** `anchor build`
2. **Test:** `anchor test`
3. **Deploy:** `./scripts/solana-deploy.sh devnet`
4. **Verify:** `./scripts/solana-verify.sh devnet`
5. **Frontend:** Update frontend to use Anchor SDK instead of Ethers.js
