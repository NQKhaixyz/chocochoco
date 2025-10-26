use anchor_lang::prelude::*;

// This program ID will be updated after first deployment
// Run: anchor build && solana address -k target/deploy/chocochoco_game-keypair.json
declare_id!("J5GgxY8zobKvjJovnENncHDLWVQ2gBPH2skhTKL8JuGz");

#[allow(deprecated)]
#[program]
pub mod chocochoco_game {
    use super::*;

    /// Initialize a new game round
    /// Sets commit and reveal deadlines based on duration parameters
    pub fn initialize_round(
        ctx: Context<InitializeRound>,
        _nonce: u8,
        commit_duration_secs: i64,
        reveal_duration_secs: i64,
        stake_lamports: u64,
        fee_basis_points: u16,
    ) -> Result<()> {
        let round = &mut ctx.accounts.round;
        let clock = Clock::get()?;
        
        require!(stake_lamports > 0, GameError::InvalidStake);
        require!(commit_duration_secs > 0 && reveal_duration_secs > 0, GameError::InvalidDuration);
        require!(fee_basis_points <= 2000, GameError::FeeTooHigh); // Max 20%
        
        round.status = RoundStatus::CommitOpen;
        round.commit_deadline = clock.unix_timestamp + commit_duration_secs;
        round.reveal_deadline = round.commit_deadline + reveal_duration_secs;
        round.stake_lamports = stake_lamports;
        round.fee_basis_points = fee_basis_points;
        round.milk_count = 0;
        round.cacao_count = 0;
        round.milk_pool = 0;
        round.cacao_pool = 0;
        round.winner_side = None;
        round.treasury = ctx.accounts.treasury.key();
        round.bump = ctx.bumps.round;
        
        emit!(RoundCreated {
            round_id: round.key(),
            stake_lamports,
            commit_deadline: round.commit_deadline,
            reveal_deadline: round.reveal_deadline,
            fee_basis_points,
        });
        
        Ok(())
    }

    /// Player commits their choice (hidden as hash)
    /// Transfers stake to program PDA
    pub fn commit_meow(
        ctx: Context<CommitMeow>,
        commitment: [u8; 32],
    ) -> Result<()> {
        let round = &ctx.accounts.round;
        let player_round = &mut ctx.accounts.player_round;
        let clock = Clock::get()?;
        
        // Check commit phase is open
        require!(round.status == RoundStatus::CommitOpen, GameError::CommitClosed);
        require!(clock.unix_timestamp <= round.commit_deadline, GameError::CommitClosed);
        
        // Check player hasn't already committed
        require!(player_round.commitment == [0u8; 32], GameError::AlreadyCommitted);
        
        // Transfer stake from player to round PDA
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: ctx.accounts.round.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, round.stake_lamports)?;
        
        // Store commitment
        player_round.commitment = commitment;
        player_round.tribe = None;
        player_round.revealed = false;
        player_round.claimed = false;
        player_round.round = round.key();
        player_round.player = ctx.accounts.player.key();
        player_round.bump = ctx.bumps.player_round;
        
        emit!(MeowCommitted {
            round_id: round.key(),
            player: ctx.accounts.player.key(),
        });
        
        Ok(())
    }

    /// Player reveals their choice with salt to prove commitment
    /// Updates round pools and counts
    pub fn reveal_meow(
        ctx: Context<RevealMeow>,
        tribe_value: u8,
        salt: [u8; 32],
    ) -> Result<()> {
        let round = &mut ctx.accounts.round;
        let player_round = &mut ctx.accounts.player_round;
        let clock = Clock::get()?;
        
        // Check reveal phase is open
        require!(
            clock.unix_timestamp > round.commit_deadline && 
            clock.unix_timestamp <= round.reveal_deadline,
            GameError::RevealClosed
        );
        require!(!player_round.revealed, GameError::AlreadyRevealed);
        require!(player_round.commitment != [0u8; 32], GameError::NoCommitment);
        
        // Verify commitment matches: sha256(tribe || salt || player || round_id)
        use anchor_lang::solana_program::hash::hash;
        let mut data = Vec::new();
        data.push(tribe_value);
        data.extend_from_slice(&salt);
        data.extend_from_slice(ctx.accounts.player.key().as_ref());
        data.extend_from_slice(round.key().as_ref());
        let computed_hash = hash(&data);
        
        require!(
            computed_hash.to_bytes() == player_round.commitment,
            GameError::InvalidReveal
        );
        
        // Parse tribe (1 = Milk, 2 = Cacao)
        let tribe = match tribe_value {
            1 => Tribe::Milk,
            2 => Tribe::Cacao,
            _ => return Err(GameError::InvalidTribe.into()),
        };
        
        // Update player state
        player_round.tribe = Some(tribe);
        player_round.revealed = true;
        
        // Update round pools
        match tribe {
            Tribe::Milk => {
                round.milk_count += 1;
                round.milk_pool += round.stake_lamports;
            }
            Tribe::Cacao => {
                round.cacao_count += 1;
                round.cacao_pool += round.stake_lamports;
            }
        }
        
        emit!(MeowRevealed {
            round_id: round.key(),
            player: player_round.player,
            tribe,
        });
        
        Ok(())
    }

    /// Settle the round after reveal deadline
    /// Determines winner and transfers fee to treasury
    pub fn settle_round(ctx: Context<SettleRound>) -> Result<()> {
        // Compute and mutate within a scoped borrow, then release before lamports ops
        let clock = Clock::get()?;
        let (winner_side, fee, round_key) = {
            let round = &mut ctx.accounts.round;
        
        // Check reveal deadline has passed
        require!(clock.unix_timestamp > round.reveal_deadline, GameError::RevealNotEnded);
        require!(round.status != RoundStatus::Settled, GameError::AlreadySettled);
        
            // Determine minority (winner side)
            let winner_side = if round.milk_count == round.cacao_count {
                None // Tie - refund everyone
            } else if round.milk_count < round.cacao_count {
                Some(Tribe::Milk)
            } else {
                Some(Tribe::Cacao)
            };

            round.winner_side = winner_side;
            round.status = RoundStatus::Settled;

            // Compute fee
            let mut fee: u64 = 0;
            if winner_side.is_some() {
                let total_pool = round.milk_pool + round.cacao_pool;
                fee = (total_pool as u128 * round.fee_basis_points as u128 / 10000) as u64;
            }

            (winner_side, fee, round.key())
        };

        if fee > 0 {
            // Transfer fee from round PDA to treasury
            let round_ai = ctx.accounts.round.to_account_info();
            let treasury_ai = ctx.accounts.treasury.to_account_info();
            **round_ai.try_borrow_mut_lamports()? -= fee;
            **treasury_ai.try_borrow_mut_lamports()? += fee;
        }
        
        emit!(RoundMeowed { round_id: round_key, winner_side });
        
        Ok(())
    }

    /// Player claims their reward (if winner) or refund (if tie)
    /// Pull payment pattern - players must call this themselves
    pub fn claim_treat(ctx: Context<ClaimTreat>) -> Result<()> {
        let round = &ctx.accounts.round;
        let player_round = &mut ctx.accounts.player_round;
        
        // Check round is settled
        require!(round.status == RoundStatus::Settled, GameError::NotSettled);
        require!(!player_round.claimed, GameError::AlreadyClaimed);
        require!(player_round.commitment != [0u8; 32], GameError::NoCommitment);
        
        let amount = if round.winner_side.is_none() {
            // Tie: refund stake to anyone who committed
            if player_round.revealed {
                round.stake_lamports
            } else {
                // Non-revealers forfeit in tie (could be configurable)
                0
            }
        } else if !player_round.revealed {
            // Non-revealers forfeit stake
            0
        } else if player_round.tribe == round.winner_side {
            // Winner: proportional share of (pool - fee)
            let total_pool = round.milk_pool + round.cacao_pool;
            let fee = (total_pool as u128 * round.fee_basis_points as u128 / 10000) as u64;
            let distributable = total_pool - fee;
            
            let winner_pool = match round.winner_side.unwrap() {
                Tribe::Milk => round.milk_pool,
                Tribe::Cacao => round.cacao_pool,
            };
            
            // Each winner gets (distributable * stake / winner_pool)
            // Since stake is fixed per player, this simplifies to distributable / winner_count
            (distributable as u128 * round.stake_lamports as u128 / winner_pool as u128) as u64
        } else {
            // Loser gets nothing
            return Err(GameError::NotWinner.into());
        };
        
        require!(amount > 0, GameError::NoReward);
        
        // Mark as claimed before transfer (CEI pattern)
        player_round.claimed = true;

        // Keep round key for event after releasing borrow
        let round_key = round.key();
        // Transfer from round PDA to player (no borrow of `round` variable)
        let round_ai = ctx.accounts.round.to_account_info();
        let player_ai = ctx.accounts.player.to_account_info();
        **round_ai.try_borrow_mut_lamports()? -= amount;
        **player_ai.try_borrow_mut_lamports()? += amount;
        
        emit!(TreatClaimed {
            round_id: round_key,
            player: player_round.player,
            amount,
        });
        
        Ok(())
    }
}

// ================================ ACCOUNTS ================================

#[derive(Accounts)]
#[instruction(nonce: u8)]
pub struct InitializeRound<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Round::INIT_SPACE,
        seeds = [b"round", authority.key().as_ref(), &[nonce]],
        bump
    )]
    pub round: Account<'info, Round>,
    
    /// CHECK: Treasury receives fees
    pub treasury: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// Note: bump is derived automatically via `bump` above and available as `ctx.bumps.round`.

#[derive(Accounts)]
pub struct CommitMeow<'info> {
    #[account(mut)]
    pub round: Account<'info, Round>,
    
    #[account(
        init,
        payer = player,
        space = 8 + PlayerRound::INIT_SPACE,
        seeds = [b"player_round", round.key().as_ref(), player.key().as_ref()],
        bump
    )]
    pub player_round: Account<'info, PlayerRound>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevealMeow<'info> {
    #[account(mut)]
    pub round: Account<'info, Round>,
    
    #[account(
        mut,
        seeds = [b"player_round", round.key().as_ref(), player.key().as_ref()],
        bump = player_round.bump
    )]
    pub player_round: Account<'info, PlayerRound>,
    
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct SettleRound<'info> {
    #[account(mut)]
    pub round: Account<'info, Round>,
    
    /// CHECK: Treasury receives fees
    #[account(mut, address = round.treasury)]
    pub treasury: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ClaimTreat<'info> {
    #[account(mut)]
    pub round: Account<'info, Round>,
    
    #[account(
        mut,
        seeds = [b"player_round", round.key().as_ref(), player.key().as_ref()],
        bump = player_round.bump
    )]
    pub player_round: Account<'info, PlayerRound>,
    
    #[account(mut)]
    pub player: Signer<'info>,
}

// ================================ STATE ================================

#[account]
#[derive(InitSpace)]
pub struct Round {
    pub status: RoundStatus,
    pub commit_deadline: i64,
    pub reveal_deadline: i64,
    pub stake_lamports: u64,
    pub fee_basis_points: u16,
    pub milk_count: u32,
    pub cacao_count: u32,
    pub milk_pool: u64,
    pub cacao_pool: u64,
    pub winner_side: Option<Tribe>,
    pub treasury: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct PlayerRound {
    pub commitment: [u8; 32],
    pub tribe: Option<Tribe>,
    pub revealed: bool,
    pub claimed: bool,
    pub round: Pubkey,
    pub player: Pubkey,
    pub bump: u8,
}

// ================================ ENUMS ================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum RoundStatus {
    CommitOpen,
    Settled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum Tribe {
    Milk,
    Cacao,
}

// ================================ EVENTS ================================

#[event]
pub struct RoundCreated {
    pub round_id: Pubkey,
    pub stake_lamports: u64,
    pub commit_deadline: i64,
    pub reveal_deadline: i64,
    pub fee_basis_points: u16,
}

#[event]
pub struct MeowCommitted {
    pub round_id: Pubkey,
    pub player: Pubkey,
}

#[event]
pub struct MeowRevealed {
    pub round_id: Pubkey,
    pub player: Pubkey,
    pub tribe: Tribe,
}

#[event]
pub struct RoundMeowed {
    pub round_id: Pubkey,
    pub winner_side: Option<Tribe>,
}

#[event]
pub struct TreatClaimed {
    pub round_id: Pubkey,
    pub player: Pubkey,
    pub amount: u64,
}

// ================================ ERRORS ================================

#[error_code]
pub enum GameError {
    #[msg("Invalid stake amount")]
    InvalidStake,
    
    #[msg("Invalid duration")]
    InvalidDuration,
    
    #[msg("Fee too high (max 20%)")]
    FeeTooHigh,
    
    #[msg("Commit phase is closed")]
    CommitClosed,
    
    #[msg("Already committed")]
    AlreadyCommitted,
    
    #[msg("Reveal phase is closed")]
    RevealClosed,
    
    #[msg("Already revealed")]
    AlreadyRevealed,
    
    #[msg("No commitment found")]
    NoCommitment,
    
    #[msg("Invalid reveal (commitment mismatch)")]
    InvalidReveal,
    
    #[msg("Invalid tribe value")]
    InvalidTribe,
    
    #[msg("Reveal phase not ended")]
    RevealNotEnded,
    
    #[msg("Round already settled")]
    AlreadySettled,
    
    #[msg("Round not settled")]
    NotSettled,
    
    #[msg("Already claimed")]
    AlreadyClaimed,
    
    #[msg("Not a winner")]
    NotWinner,
    
    #[msg("No reward to claim")]
    NoReward,
}
