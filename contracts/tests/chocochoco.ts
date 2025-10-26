import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";
import * as crypto from "crypto";

// Type will be generated after 'anchor build' at ../target/types/chocochoco_game
// For now, we'll use the generic Program<Idl> type
// After building, you can replace this with:
// import { ChocoChocoGame } from "../target/types/chocochoco_game";

describe("chocochoco-game", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Program workspace name must match PascalCase of crate name "chocochoco_game" -> "ChocochocoGame"
  const program = anchor.workspace.ChocochocoGame as anchor.Program<anchor.Idl>;
  
  const authority = provider.wallet as anchor.Wallet;
  const treasury = Keypair.generate();
  
  // Test parameters
  const COMMIT_DURATION = 300; // 5 minutes
  const REVEAL_DURATION = 300; // 5 minutes
  const STAKE_LAMPORTS = 0.01 * LAMPORTS_PER_SOL;
  const FEE_BPS = 300; // 3%
  
  let roundPubkey: PublicKey;
  let roundBump: number;
  let roundNonce = 0;
  
  // Players for reveal/settlement tests
  let player1: Keypair;
  let player2: Keypair;
  let player3: Keypair;
  
  // Helper: Create commitment hash: sha256(tribe || salt || player || round_id)
  function makeCommitment(tribe: number, salt: Buffer, playerPubkey: PublicKey, roundPubkey: PublicKey): Buffer {
    const data = Buffer.concat([
      Buffer.from([tribe]), 
      salt,
      playerPubkey.toBuffer(),
      roundPubkey.toBuffer()
    ]);
    return Buffer.from(crypto.createHash("sha256").update(data).digest());
  }
  
  // Helper: Derive round PDA
  function getRoundPDA(nonce: number) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("round"),
        authority.publicKey.toBuffer(),
        Buffer.from([nonce])
      ],
      program.programId
    );
  }
  
  // Helper: Derive player_round PDA
  function getPlayerRoundPDA(roundPubkey: PublicKey, playerPubkey: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("player_round"),
        roundPubkey.toBuffer(),
        playerPubkey.toBuffer()
      ],
      program.programId
    );
  }

  describe("Round Lifecycle", () => {
    it("Initializes a new round", async () => {
      [roundPubkey, roundBump] = getRoundPDA(roundNonce);
      
      const tx = await program.methods
        .initializeRound(
          roundNonce,
          new anchor.BN(COMMIT_DURATION),
          new anchor.BN(REVEAL_DURATION),
          new anchor.BN(STAKE_LAMPORTS),
          FEE_BPS
        )
        .accounts({
          round: roundPubkey,
          treasury: treasury.publicKey,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log("Initialize round signature:", tx);
      
      // Fetch and verify round state
      const roundAccount = await program.account.round.fetch(roundPubkey);
      
      expect(roundAccount.status).to.deep.equal({ commitOpen: {} });
      expect((roundAccount.stakeLamports as any).toNumber()).to.equal(STAKE_LAMPORTS);
      expect(roundAccount.feeBasisPoints).to.equal(FEE_BPS);
      expect(roundAccount.milkCount).to.equal(0);
      expect(roundAccount.cacaoCount).to.equal(0);
      expect((roundAccount.treasury as any).toBase58()).to.equal(treasury.publicKey.toBase58());
    });

    it("Player 1 commits to Milk", async () => {
      const player1 = Keypair.generate();
      
      // Airdrop SOL to player
      const airdropSig = await provider.connection.requestAirdrop(
        player1.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);
      
      // Generate commitment
      const salt1 = crypto.randomBytes(32);
      const commitment1 = makeCommitment(1, salt1, player1.publicKey, roundPubkey); // 1 = Milk
      
      const [playerRoundPda] = getPlayerRoundPDA(roundPubkey, player1.publicKey);
      
      const tx = await program.methods
        .commitMeow(Array.from(commitment1))
        .accounts({
          round: roundPubkey,
          playerRound: playerRoundPda,
          player: player1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([player1])
        .rpc();
      
      console.log("Player 1 commit signature:", tx);
      
      // Verify player round created
      const playerRoundAccount = await program.account.playerRound.fetch(playerRoundPda);
      expect(playerRoundAccount.commitment).to.deep.equal(Array.from(commitment1));
      expect(playerRoundAccount.revealed).to.be.false;
      expect(playerRoundAccount.claimed).to.be.false;
      
      // Store for reveal phase
      (player1 as any).salt = salt1;
    });

    it("Player 2 commits to Cacao", async () => {
      const player2 = Keypair.generate();
      
      // Airdrop SOL
      const airdropSig = await provider.connection.requestAirdrop(
        player2.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);
      
      // Generate commitment
      const salt2 = crypto.randomBytes(32);
      const commitment2 = makeCommitment(2, salt2, player2.publicKey, roundPubkey); // 2 = Cacao
      
      const [playerRoundPda] = getPlayerRoundPDA(roundPubkey, player2.publicKey);
      
      const tx = await program.methods
        .commitMeow(Array.from(commitment2))
        .accounts({
          round: roundPubkey,
          playerRound: playerRoundPda,
          player: player2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([player2])
        .rpc();
      
      console.log("Player 2 commit signature:", tx);
      
      // Store for reveal phase
      (player2 as any).salt = salt2;
    });

    it("Rejects double commit", async () => {
      const player1 = Keypair.generate();
      
      // Airdrop SOL
      const airdropSig = await provider.connection.requestAirdrop(
        player1.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);
      
      const salt = crypto.randomBytes(32);
      const commitment = makeCommitment(1, salt, player1.publicKey, roundPubkey);
      const [playerRoundPda] = getPlayerRoundPDA(roundPubkey, player1.publicKey);
      
      // First commit
      await program.methods
        .commitMeow(Array.from(commitment))
        .accounts({
          round: roundPubkey,
          playerRound: playerRoundPda,
          player: player1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([player1])
        .rpc();
      
      // Try to commit again (should fail)
      try {
        await program.methods
          .commitMeow(Array.from(commitment))
          .accounts({
            round: roundPubkey,
            playerRound: playerRoundPda,
            player: player1.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([player1])
          .rpc();
        
        expect.fail("Should have rejected double commit");
      } catch (err) {
        expect(err.toString()).to.include("already in use");
      }
    });
  });

  describe("Reveal Phase", () => {
    let newRoundPubkey: PublicKey;
    
    before(async () => {
      // Create new round for reveal tests
      roundNonce++;
      [newRoundPubkey, roundBump] = getRoundPDA(roundNonce);
      roundPubkey = newRoundPubkey;  // Update global roundPubkey
      
      await program.methods
        .initializeRound(
          roundNonce,
          new anchor.BN(5), // 5 seconds commit
          new anchor.BN(300),
          new anchor.BN(STAKE_LAMPORTS),
          FEE_BPS
        )
        .accounts({
          round: roundPubkey,
          treasury: treasury.publicKey,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      // Setup 3 players: 2 Milk, 1 Cacao (Cacao wins)
      player1 = Keypair.generate();
      player2 = Keypair.generate();
      player3 = Keypair.generate();
      
      for (const player of [player1, player2, player3]) {
        const airdropSig = await provider.connection.requestAirdrop(
          player.publicKey,
          2 * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(airdropSig);
      }
      
      // Commits
      const salt1 = crypto.randomBytes(32);
      const salt2 = crypto.randomBytes(32);
      const salt3 = crypto.randomBytes(32);
      
      (player1 as any).salt = salt1;
      (player1 as any).tribe = 1; // Milk
      (player2 as any).salt = salt2;
      (player2 as any).tribe = 1; // Milk
      (player3 as any).salt = salt3;
      (player3 as any).tribe = 2; // Cacao
      
      const commitment1 = makeCommitment(1, salt1, player1.publicKey, roundPubkey);
      const commitment2 = makeCommitment(1, salt2, player2.publicKey, roundPubkey);
      const commitment3 = makeCommitment(2, salt3, player3.publicKey, roundPubkey);
      
      for (const [player, commitment] of [
        [player1, commitment1],
        [player2, commitment2],
        [player3, commitment3]
      ]) {
        const [playerRoundPda] = getPlayerRoundPDA(roundPubkey, (player as Keypair).publicKey);
        await program.methods
          .commitMeow(Array.from(commitment as Buffer))
          .accounts({
            round: roundPubkey,
            playerRound: playerRoundPda,
            player: (player as Keypair).publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([player as Keypair])
          .rpc();
      }
      
      // Wait for commit phase to end
      await new Promise(resolve => setTimeout(resolve, 6000));
    });

    it("Players reveal their choices", async () => {
      for (const player of [player1, player2, player3]) {
        const [playerRoundPda] = getPlayerRoundPDA(roundPubkey, player.publicKey);
        
        const tx = await program.methods
          .revealMeow(
            (player as any).tribe,
            Array.from((player as any).salt)
          )
          .accounts({
            round: roundPubkey,
            playerRound: playerRoundPda,
            player: player.publicKey,
          })
          .signers([player])
          .rpc();
        
        console.log(`Player ${player.publicKey.toBase58().slice(0, 8)} reveal:`, tx);
      }
      
      // Check round state
      const roundAccount = await program.account.round.fetch(roundPubkey);
      expect(roundAccount.milkCount).to.equal(2);
      expect(roundAccount.cacaoCount).to.equal(1);
    });

    it("Rejects invalid reveal (wrong salt)", async () => {
      const player = Keypair.generate();
      const airdropSig = await provider.connection.requestAirdrop(
        player.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);
      
      const salt = crypto.randomBytes(32);
      const wrongSalt = crypto.randomBytes(32);
      const commitment = makeCommitment(1, salt, player.publicKey, roundPubkey);
      
      const [playerRoundPda] = getPlayerRoundPDA(roundPubkey, player.publicKey);
      
      await program.methods
        .commitMeow(Array.from(commitment))
        .accounts({
          round: roundPubkey,
          playerRound: playerRoundPda,
          player: player.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([player])
        .rpc();
      
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      try {
        await program.methods
          .revealMeow(1, Array.from(wrongSalt))
          .accounts({
            round: roundPubkey,
            playerRound: playerRoundPda,
            player: player.publicKey,
          })
          .signers([player])
          .rpc();
        
        expect.fail("Should have rejected invalid reveal");
      } catch (err) {
        expect(err.toString()).to.include("InvalidReveal");
      }
    });
  });

  describe("Settlement and Claims", () => {
    before(async () => {
      // Wait for reveal phase to end
      await new Promise(resolve => setTimeout(resolve, 310000)); // 5+ minutes
    });

    it("Settles the round", async () => {
      const tx = await program.methods
        .settleRound()
        .accounts({
          round: roundPubkey,
          treasury: treasury.publicKey,
        })
        .rpc();
      
      console.log("Settle round signature:", tx);
      
      const roundAccount = await program.account.round.fetch(roundPubkey);
      expect(roundAccount.status).to.deep.equal({ settled: {} });
      
      // Winner should be Cacao (minority with 1 player vs 2 Milk players)
      expect(roundAccount.winnerSide).to.deep.equal({ cacao: {} });
    });

    it("Winner claims reward", async () => {
      // Player 3 (Cacao) should win
      const [playerRoundPda] = getPlayerRoundPDA(roundPubkey, player3.publicKey);
      
      const balanceBefore = await provider.connection.getBalance(player3.publicKey);
      
      const tx = await program.methods
        .claimTreat()
        .accounts({
          round: roundPubkey,
          playerRound: playerRoundPda,
          player: player3.publicKey,
        })
        .signers([player3])
        .rpc();
      
      console.log("Claim treat signature:", tx);
      
      const balanceAfter = await provider.connection.getBalance(player3.publicKey);
      const reward = balanceAfter - balanceBefore;
      
      console.log("Reward:", reward / LAMPORTS_PER_SOL, "SOL");
      
      // Winner gets (total_pool - fee) since they're the only winner
      // Total pool = 3 * STAKE = 0.03 SOL
      // Fee = 3% = 0.0009 SOL
      // Winner gets = 0.0291 SOL
      expect(reward).to.be.greaterThan(STAKE_LAMPORTS * 2.5);
      
      const playerRoundAccount = await program.account.playerRound.fetch(playerRoundPda);
      expect(playerRoundAccount.claimed).to.be.true;
    });

    it("Loser cannot claim", async () => {
      const [playerRoundPda] = getPlayerRoundPDA(roundPubkey, player1.publicKey);
      
      try {
        await program.methods
          .claimTreat()
          .accounts({
            round: roundPubkey,
            playerRound: playerRoundPda,
            player: player1.publicKey,
          })
          .signers([player1])
          .rpc();
        
        expect.fail("Should have rejected loser claim");
      } catch (err) {
        expect(err.toString()).to.include("NotWinner");
      }
    });

    it("Rejects double claim", async () => {
      const [playerRoundPda] = getPlayerRoundPDA(roundPubkey, player3.publicKey);
      
      try {
        await program.methods
          .claimTreat()
          .accounts({
            round: roundPubkey,
            playerRound: playerRoundPda,
            player: player3.publicKey,
          })
          .signers([player3])
          .rpc();
        
        expect.fail("Should have rejected double claim");
      } catch (err) {
        expect(err.toString()).to.include("AlreadyClaimed");
      }
    });
  });
});
