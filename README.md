# ChocoChoco — FE/BE + Commit–Reveal (Minority Game)

> Run local/dev/testnet, deploy/verify, and contract links.
> Thiết kế: see [DESIGN.md](./DESIGN.md) · Sprint: see [SPRINT_PLAN.md](./SPRINT_PLAN.md)

---

## 1) Overview
- FE: React/TypeScript (Vite), Tailwind, wagmi v2 + viem
- BE: Foundry (Solidity 0.8.x, commit–reveal). Hardhat examples included in docs.
- Networks: Base Sepolia (84532), Polygon Mumbai (80001)/Amoy (80002)

## 2) Requirements
- Node.js LTS + pnpm
- Wallet (MetaMask, etc.)
- RPC provider (Alchemy/Infura/Ankr…)
- (BE) Private key for testnet deploy

## 3) Environment Setup
Create env files from examples:
- Root: `cp .env.example .env`
- FE: `cd frontend && cp .env.example .env`
- Contracts: `cp contracts/.env.example contracts/.env`

Important variables:
- Chain/RPC: `RPC_URL`, `CHAIN_ID`
- Contracts: `CONTRACT_ADDRESS`, `TREASURY_ADDRESS`
- FE (Vite): `VITE_RPC_URL`, `VITE_CHAIN_ID`, `VITE_CONTRACT_ADDRESS`, `VITE_TREASURY_ADDRESS`
- (BE) `PRIVATE_KEY`

Do NOT commit secrets in `.env`.

## 4) Run Local / Dev / Testnet
Install deps:
- `pnpm i`

Frontend (Vite):
- `pnpm --filter frontend dev` or `cd frontend && pnpm dev`
- Build/Preview: `pnpm build` / `pnpm preview`

Backend (Foundry in this repo):
- Build: `forge build`
- Deploy: `scripts/deploy-testnet.sh base` (or `polygon`). See `scripts/README.md`.

Hardhat (if present):
- Build: `hardhat compile`
- Deploy: `hardhat run scripts/deploy.ts --network custom`

## 5) Deploy & Verify (Testnet)
Foundry:
- `scripts/deploy-testnet.sh base|polygon`
- `scripts/verify.sh base|polygon 0xDeployedAddress`
- After deploy, update FE env: `VITE_CONTRACT_ADDRESS=0xDeployed...`

Hardhat (example):
- `npx hardhat run scripts/deploy.ts --network custom`
- `npx hardhat verify --network custom 0xDeployed <ctor args>`

## 6) Contract Addresses & Explorers
Update after each deploy.
- Base Sepolia (84532): `0x...` → https://sepolia.basescan.org/address/0x...
- Polygon Mumbai (80001): `0x...` → https://mumbai.polygonscan.com/address/0x...
- Polygon Amoy (80002): `0x...` → https://amoy.polygonscan.com/address/0x...
Tx example: https://sepolia.basescan.org/tx/TX_HASH

## 7) Dev Flow (Commit → Reveal → Claim)
- Commit: choose Milk/Cacao; app creates salt locally, computes commitment, sends commit with stake.
- Reveal: within window, send `reveal(choice, salt)`.
- Settle: minority side wins (tie refunds); event `RoundMeowed` emitted.
- Claim: only winners claim; UI prevents double-claim. Details in `DESIGN.md`.

## 8) Troubleshooting
- Wallet/network: ensure `CHAIN_ID` matches wallet; try public RPC.
- Commit/Reveal rejected: confirm countdown windows (chain time). Hash mismatch → check commitment schema and salt.
- Double-claim: UI disables if `hasClaimed`; refetch after mined.
- Verify fails: correct network/args; wait a few minutes, retry.
- Env not read: Vite requires `VITE_*` variables.
- Countdown skew: use the chain time hook (`frontend/src/hooks/useChainTime.ts`).

## 9) Conventions
- Branches: main (stable), dev (integration), feature: `feat/*`, `fix/*`
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, …)
- Env: keep `.env.example`, never commit secrets.

## 10) Links
- [DESIGN.md](./DESIGN.md)
- [SPRINT_PLAN.md](./SPRINT_PLAN.md)

---
# ChocoChoco ðŸ«ðŸ±

In a world of sweets, only the fewest get the feast.

Tháº¿ giá»›i ngá»t ngÃ o, ai Ã­t hÆ¡nâ€¦ Äƒn nhiá»u hÆ¡n!

ChocoChoco lÃ  trÃ² chÆ¡i minority commitâ€“reveal on-chain: má»—i vÃ²ng, mÃ¨o chá»n â€œMÃ¨o Sá»¯aâ€ ðŸ¼ hay â€œMÃ¨o Cacaoâ€ ðŸ«, stake má»™t khoáº£n, vÃ  Phe Thiá»ƒu Sá»‘ Äƒn trá»n pháº§n bÃ¡nh cá»§a Phe Äa Sá»‘ (sau khi trÃ­ch má»™t Ã­t crumb fee ðŸª cho Cat Treasury).

- Chain gá»£i Ã½: Base / Polygon (phÃ­ ráº»)
- Frontend gá»£i Ã½: React + Tailwind + wagmi + viem
- Contract: Solidity 0.8.x, commitâ€“reveal, pull-payment claim


## Ná»™i dung

- Tá»•ng quan nhanh
- Luáº­t chÆ¡i chi tiáº¿t
- CÆ¡ cháº¿ on-chain (commitâ€“reveal, state machine)
- Thiáº¿t káº¿ contract & API (gá»£i Ã½)
- Kinh táº¿ há»c & cÃ´ng thá»©c thÆ°á»Ÿng
- Chá»‘ng Sybil & báº£o máº­t
- Frontend & UX
- Triá»ƒn khai & mÃ´i trÆ°á»ng
- Kiá»ƒm thá»­ & checklist
- Lá»™ trÃ¬nh (MVP â†’ Production)
- FAQ
- Giáº¥y phÃ©p & Ä‘Ã³ng gÃ³p


## TÃ i liá»‡u liÃªn quan

- Thiáº¿t káº¿ chi tiáº¿t: see `DESIGN.md`
- Káº¿ hoáº¡ch sprint: see `SPRINT_PLAN.md`
## Tá»•ng quan nhanh

- Má»—i vÃ²ng cÃ³ hai lá»±a chá»n: MÃ¨o Sá»¯a (Milk) hoáº·c MÃ¨o Cacao (Cacao)
- Giai Ä‘oáº¡n Commit: gá»­i hash = keccak(choice, salt) + stake
- Giai Ä‘oáº¡n Reveal: tiáº¿t lá»™ choice + salt Ä‘á»ƒ xÃ¡c thá»±c
- Káº¿t toÃ¡n: bÃªn cÃ³ Ã­t ngÆ°á»i hÆ¡n (Minority) tháº¯ng; náº¿u hÃ²a thÃ¬ hoÃ n stake hoáº·c rollover (tÃ¹y cáº¥u hÃ¬nh)
- Fee: 3% crumb fee chuyá»ƒn vá» Cat Treasury
- Claim: ngÆ°á»i tháº¯ng tá»± gá»i claim() Ä‘á»ƒ nháº­n tiá»n, trÃ¡nh for-loop tá»‘n gas


## Luáº­t chÆ¡i chi tiáº¿t

1) Chá»n phe
- â€œMÃ¨o Sá»¯aâ€ ðŸ¼ thÃ­ch vá»‹ ngá»t nháº¹.
- â€œMÃ¨o Cacaoâ€ ðŸ« mÃª hÆ°Æ¡ng Ä‘áº¯ng quyáº¿n rÅ©.

2) Commit
- NgÆ°á»i chÆ¡i gá»i commit(commitment) kÃ¨m stake, vá»›i commitment = keccak256(abi.encodePacked(choice, salt))

3) Reveal
- Sau khi cá»­a commit Ä‘Ã³ng, ngÆ°á»i chÆ¡i reveal(choice, salt). Há»‡ thá»‘ng xÃ¡c minh hash.

4) PhÃ¢n tháº¯ng thua
- Minority = phe cÃ³ sá»‘ ngÆ°á»i reveal há»£p lá»‡ Ã­t hÆ¡n.
- Náº¿u count báº±ng nhau: hÃ²a â†’ hoÃ n stake hoáº·c rollover sang vÃ²ng sau (tÃ¹y cáº¥u hÃ¬nh sáº£n pháº©m).

5) Payout
- NgÆ°á»i tháº¯ng chia pool cá»§a bÃªn thua (sau khi trá»« fee cho Treasury).

6) KhÃ´ng reveal
- KhÃ´ng reveal Ä‘Ãºng háº¡n cÃ³ thá»ƒ bá»‹ forfeit má»™t pháº§n hoáº·c toÃ n bá»™ stake theo quy táº¯c vÃ²ng.


## CÆ¡ cháº¿ on-chain (commitâ€“reveal, state machine)

State machine má»—i vÃ²ng:

- Created â†’ CommitOpen â†’ RevealOpen â†’ Settled

ThÃ´ng sá»‘ vÃ²ng:

- stakeSize, feeBps (vd: 300 = 3%)
- commitDeadline, revealDeadline

Dá»¯ liá»‡u cá»‘t lÃµi:

- commitments[user] = bytes32 hash
- revealed[user] = Choice
- countMilk, countCacao, poolMilk, poolCacao

Sá»± kiá»‡n (vÃ­ dá»¥ cÃ³ chá»§ Ä‘á» â€œmeowâ€):

- RoundCreated(id, stake, commitDeadline, revealDeadline, feeBps)
- MeowCommitted(id, player)
- MeowRevealed(id, player, choice)
- RoundMeowed(id, winningTribe) // khi settle
- TreatClaimed(id, player, amount)


## Thiáº¿t káº¿ contract & API (gá»£i Ã½)

LÆ°u Ã½: ÄÃ¢y lÃ  khung tham kháº£o, khÃ´ng dÃ¹ng ngay cho production náº¿u chÆ°a kiá»ƒm thá»­/kiá»ƒm toÃ¡n. Báº¡n cÃ³ thá»ƒ báº¯t Ä‘áº§u tá»« máº«u â€œMinorityGameâ€ (Solidity 0.8.x) vá»›i cÃ¡c Ä‘á»•i tÃªn cho phÃ¹ há»£p thÆ°Æ¡ng hiá»‡u mÃ¨o.

CÃ¡c thá»±c thá»ƒ chÃ­nh:

- enum Status { Created, CommitOpen, RevealOpen, Settled }
- enum Tribe { None, Milk, Cacao }
- struct Round {
	- Status status
	- uint64 commitDeadline
	- uint64 revealDeadline
	- uint96 stake
	- uint16 feeBps
	- uint128 poolMilk
	- uint128 poolCacao
	- uint64 countMilk
	- uint64 countCacao
}

Gá»£i Ã½ hÃ m public (tÃªn theo chá»§ Ä‘á»):

- commitMeow(bytes32 commitment) payable
- revealMeow(uint8 tribe, bytes32 salt)
- settleRound()
- claimTreat(uint256 roundId)
- makeCommitment(uint8 tribe, bytes32 salt) â†’ bytes32 (helper off-chain/on-chain)

Quy táº¯c triá»ƒn khai:

- Pull payment: ngÆ°á»i tháº¯ng tá»± claim Ä‘á»ƒ nháº­n payout.
- KhÃ´ng dÃ¹ng loop dÃ i khi tráº£ thÆ°á»Ÿng.
- Chá»‘ng reentrancy (ReentrancyGuard) vÃ  kiá»ƒm tra effects-before-interactions.
- Sá»­ dá»¥ng salt bÃ­ máº­t vÃ  khÃ´ng tÃ¡i sá»­ dá»¥ng salt giá»¯a nhiá»u vÃ²ng.


## Kinh táº¿ há»c & cÃ´ng thá»©c thÆ°á»Ÿng

- Crumb fee: 3% (máº·c Ä‘á»‹nh), chuyá»ƒn vá» Cat Treasury trÆ°á»›c khi chia thÆ°á»Ÿng.
- Hai lá»±a chá»n cÃ´ng thá»©c chia thÆ°á»Ÿng:

1) Theo vá»‘n gÃ³p (khuyáº¿n nghá»‹):

	$payout_i = \dfrac{stake_i}{Pool_{Minority}}\times (TotalPool - Fee)$

2) Chia Ä‘á»u theo Ä‘áº§u ngÆ°á»i (vui nhÆ°ng dá»… Sybil):

	$payout = \dfrac{TotalPool - Fee}{Count_{Minority}}$

Trong báº£n Ä‘Æ¡n giáº£n vá»›i stake cá»‘ Ä‘á»‹nh, payout má»—i ngÆ°á»i tháº¯ng = (TotalPool - Fee) Ã— (stake / PoolMinority).


## Chá»‘ng Sybil & báº£o máº­t

- Commitâ€“Reveal Ä‘á»ƒ trÃ¡nh front-running/last-second switch.
- Forfeit náº¿u khÃ´ng reveal Ä‘Ãºng háº¡n (cáº¥u hÃ¬nh pháº§n trÄƒm cáº¯t).
- TÄƒng chi phÃ­ chá»‘ng Sybil: stake tá»‘i thiá»ƒu cao, phÃ­ tham gia cá»‘ Ä‘á»‹nh, giá»›i háº¡n 1 vÃ©/Ä‘á»‹a chá»‰/vÃ²ng.
- Tuá»³ chá»n: NFT ticket, Soulbound, KYC/POAP.
- Báº£o máº­t contract:
	- ReentrancyGuard cho claim
	- pull-payment, khÃ´ng chuyá»ƒn tiá»n trong vÃ²ng láº·p
	- kiá»ƒm tra biÃªn deadline cháº·t cháº½
	- tá»‘i Æ°u lÆ°u trá»¯ (struct gá»n, event tá»‘i thiá»ƒu)


## Setup vá»›i pnpm

- CÃ i pnpm (khuyáº¿n nghá»‹ Corepack): `corepack enable && corepack prepare pnpm@9 --activate` (hoáº·c `npm i -g pnpm`).
- Kiá»ƒm tra cÃ i Ä‘áº·t: `pnpm -v`.
- Workspace: file `pnpm-workspace.yaml` táº¡i root Ä‘Ã£ khai bÃ¡o gÃ³i `frontend`.
- Khá»Ÿi táº¡o Frontend (chÆ°a cÃ³ mÃ£ nguá»“n FE):
  - `pnpm dlx create-vite@latest frontend --template react-swc`
  - `cd frontend && pnpm i && pnpm dev`
  - ThÃªm vÃ o `frontend/package.json`: trÆ°á»ng `"packageManager": "pnpm@9.x"`
  - Commit `pnpm-lock.yaml` Ä‘á»ƒ cá»‘ Ä‘á»‹nh dependency graph.
- LÆ°u Ã½: pháº§n contracts dÃ¹ng Foundry (khÃ´ng phá»¥ thuá»™c npm). pnpm chá»§ yáº¿u Ã¡p dá»¥ng cho FE/tooling JS.

## Frontend & UX

- Stack: React + Vite/Next.js + Tailwind + wagmi + viem
- MÃ n hÃ¬nh chÃ­nh:
	- Join (Commit): chá»n â€œMilk/Cacaoâ€, nháº­p stake, gá»­i commit
	- Reveal: dÃ¡n salt (hoáº·c lÆ°u tá»± Ä‘á»™ng), báº¥m reveal
	- Claim: hiá»ƒn thá»‹ tháº¯ng/thua, nÃºt claim náº¿u tháº¯ng
	- Lá»‹ch vÃ²ng & Ä‘áº¿m ngÆ°á»£c: hiá»ƒn thá»‹ deadline commit/reveal
- ThÆ°Æ¡ng hiá»‡u:
	- Ná»n pastel há»“ng kem, nÃºt bo trÃ²n, font trÃ²n kiá»ƒu Mochi
	- Animation: mÃ¨o tháº¯ng nháº£y mÃºa; thua xá»‹ máº·t; hiá»‡u á»©ng â€œpurr~â€ khi tháº¯ng
- Dá»¯ liá»‡u hiá»ƒn thá»‹: count má»—i phe, tá»•ng pool, fee, tá»· lá»‡ Äƒn chia Æ°á»›c tÃ­nh


## Triá»ƒn khai & mÃ´i trÆ°á»ng

Máº·c dÃ¹ repo nÃ y chÆ°a chá»©a code Solidity sáºµn cho ChocoChoco, báº¡n cÃ³ thá»ƒ khá»Ÿi táº¡o nhanh project smart contract theo má»™t trong hai cÃ¡ch:

1) Foundry (Ä‘á» xuáº¥t cho Solidity):

```
forge init choco-contracts
cd choco-contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

2) Hardhat:

```
npm create hardhat@latest choco-contracts
cd choco-contracts
npm i @openzeppelin/contracts
```

Sau Ä‘Ã³ thÃªm contract MinorityGame/ChocoChocoGame theo khung á»Ÿ pháº§n â€œThiáº¿t káº¿ contractâ€, cáº¥u hÃ¬nh máº¡ng (Base/Polygon), vÃ  mÃ´i trÆ°á»ng:

- RPC_URL, PRIVATE_KEY, TREASURY_ADDRESS

Gá»£i Ã½ tham sá»‘ máº·c Ä‘á»‹nh:

- stake: 0.01 ETH/MATIC
- feeBps: 300 (3%)
- commit/reveal duration: 30 phÃºt/30 phÃºt


## Kiá»ƒm thá»­ & checklist

CÃ¡c ca kiá»ƒm thá»­ cá»‘t lÃµi:

- commit Ä‘Ãºng stake, double-commit bá»‹ cháº·n
- reveal Ä‘Ãºng hash; reveal sai/sai thá»i Ä‘iá»ƒm bá»‹ cháº·n
- no-reveal bá»‹ forfeit (náº¿u báº­t)
- hÃ²a: hoÃ n stake/rollover theo cáº¥u hÃ¬nh
- settle sau revealDeadline
- claim chá»‰ dÃ nh cho ngÆ°á»i tháº¯ng, khÃ´ng trÃ¹ng láº·p
- fee chuyá»ƒn vá» Treasury chÃ­nh xÃ¡c
- chá»‘ng reentrancy á»Ÿ claim

Khuyáº¿n nghá»‹ cÃ´ng cá»¥:

- Unit test vá»›i Foundry/Hardhat
- Property-based test: sá»‘ Ä‘Ã´ng/sá»‘ Ã­t ngáº«u nhiÃªn
- Gas snapshot: Ä‘áº£m báº£o khÃ´ng cÃ³ vÃ²ng láº·p lá»›n


## Lá»™ trÃ¬nh (MVP â†’ Production)

MVP (testnet):

- Commitâ€“Revealâ€“Settleâ€“Claim Ä‘áº§y Ä‘á»§
- UI 3 mÃ n hÃ¬nh cÆ¡ báº£n, Ä‘á»“ng há»“ Ä‘áº¿m ngÆ°á»£c
- Fee 3%, 1 vÃ©/Ä‘á»‹a chá»‰/vÃ²ng, penalty no-reveal

Production:

- NFT Cat Avatar (tuá»³ chá»n), leaderboard tuáº§n
- Analytics: sá»‘ ngÆ°á»i/round, tá»‰ lá»‡ Milk/Cacao, doanh thu fee
- Bá»• sung VRF cho mini-event ngáº«u nhiÃªn (airdrop, lucky cat)
- Audit/bug bounty, triá»ƒn khai mainnet


## FAQ

Q: VÃ¬ sao cáº§n commitâ€“reveal?
- Äá»ƒ trÃ¡nh front-running vÃ  Ä‘á»•i phe phÃºt chÃ³t.

Q: Náº¿u báº±ng nhau thÃ¬ sao?
- HÃ²a â†’ hoÃ n stake hoáº·c rollover (tuá»³ cáº¥u hÃ¬nh sáº£n pháº©m).

Q: KhÃ´ng ká»‹p reveal?
- CÃ³ thá»ƒ bá»‹ cáº¯t stake (forfeit), pháº§n cáº¯t thÃªm vÃ o pool/treasury tuá»³ luáº­t vÃ²ng.

Q: Token hay native?
- Há»— trá»£ cáº£ native (ETH/MATIC) hoáº·c ERC-20 ($CHOCO). Báº£n MVP nÃªn chá»n má»™t trong hai cho Ä‘Æ¡n giáº£n.


## Giáº¥y phÃ©p & Ä‘Ã³ng gÃ³p

- Giáº¥y phÃ©p: MIT (xem `LICENSE`).
- ÄÃ³ng gÃ³p: chÃ o má»«ng PR/issue. Vui lÃ²ng mÃ´ táº£ rÃµ rÃ ng, thÃªm test náº¿u chá»‰nh logic.


## Gá»£i Ã½ Ä‘á»•i tÃªn theo chá»§ Ä‘á» mÃ¨o (tham kháº£o)

- event Settled â†’ RoundMeowed
- event Committed â†’ MeowCommitted
- event Revealed â†’ MeowRevealed
- event Claimed â†’ TreatClaimed
- Choice.A/B â†’ Tribe.Milk/Cacao

ThÃ´ng Ä‘iá»‡p giao diá»‡n vÃ­ dá»¥:

â€œðŸ± Meow! MÃ¨o Sá»¯a tháº¯ng vÃ²ng nÃ y! ðŸ¶ðŸŽ‰â€



## Indexing / Subgraph

See subgraph/README.md for setup, build and deploy via The Graph Studio. Ensure the ABI exists by running `forge build` so the path `contracts/out/ChocoChocoGame.sol/ChocoChocoGame.json` is available. Update `subgraph.yaml` with `network`, `address`, and `startBlock` before deploying.
