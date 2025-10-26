# ChocoChoco — FE/BE + Commit–Reveal (Minority Game)

> Hướng dẫn chạy local/dev/testnet, deploy/verify và liên kết contract.
> Thiết kế: xem [DESIGN.md](./DESIGN.md) · Kế hoạch sprint: xem [SPRINT_PLAN.md](./SPRINT_PLAN.md)

---

## 1) Tổng quan

- FE: React/TypeScript (Vite), Tailwind, wagmi v2 + viem
- BE: Foundry (Solidity 0.8.x, commit–reveal). Có ví dụ Hardhat trong tài liệu.
- Mạng: Base Sepolia (84532), Polygon Mumbai (80001) / Amoy (80002)

## 2) Yêu cầu

- Node.js LTS + pnpm
- Ví (MetaMask, …)
- RPC provider (Alchemy/Infura/Ankr…)
- (BE) Private key để deploy testnet

## 3) Thiết lập môi trường

Tạo file env từ mẫu:
- Root: `cp .env.example .env`
- FE: `cd frontend && cp .env.example .env`
- Contracts: `cp contracts/.env.example contracts/.env`

Biến quan trọng:
- Chain/RPC: `RPC_URL`, `CHAIN_ID`
- Contracts: `CONTRACT_ADDRESS`, `TREASURY_ADDRESS`
- FE (Vite): `VITE_RPC_URL`, `VITE_CHAIN_ID`, `VITE_CONTRACT_ADDRESS`, `VITE_TREASURY_ADDRESS`, `VITE_SUBGRAPH_URL`
- (BE): `PRIVATE_KEY`

Lưu ý: KHÔNG commit secret trong `.env`.

## 4) Chạy Local / Dev / Testnet

Cài dependencies: `pnpm i`

- Frontend (Vite)
  - `pnpm --filter frontend dev` hoặc `cd frontend && pnpm dev`
  - Build/Preview: `pnpm build` / `pnpm preview`

- Backend (Foundry trong repo này)
  - Build: `forge build`
  - Deploy: `scripts/deploy-testnet.sh base` (hoặc `polygon`). Xem `scripts/README.md`.

- Hardhat (nếu có)
  - Build: `hardhat compile`
  - Deploy: `hardhat run scripts/deploy.ts --network custom`

## 5) Triển khai & Verify (Testnet)

- Foundry
  - `scripts/deploy-testnet.sh base|polygon`
  - `scripts/verify.sh base|polygon 0xDeployedAddress`
  - Sau deploy, cập nhật FE env: `VITE_CONTRACT_ADDRESS=0xDeployed...`

- Hardhat (ví dụ)
  - `npx hardhat run scripts/deploy.ts --network custom`
  - `npx hardhat verify --network custom 0xDeployed <ctor args>`

## 6) Địa chỉ Contract & Explorer

Cập nhật sau mỗi lần deploy.
- Base Sepolia (84532): `0x...` → https://sepolia.basescan.org/address/0x...
- Polygon Mumbai (80001): `0x...` → https://mumbai.polygonscan.com/address/0x...
- Polygon Amoy (80002): `0x...` → https://amoy.polygonscan.com/address/0x...

Tx ví dụ: https://sepolia.basescan.org/tx/TX_HASH

## 7) Quy trình chơi (Commit → Reveal → Claim)

- Commit: chọn Milk/Cacao, app tạo salt cục bộ, tính commitment, gửi commit kèm stake.
- Reveal: trong cửa sổ, gửi `reveal(choice, salt)`.
- Settle: phe thiểu số thắng (hoà → hoàn stake); emit `RoundMeowed`.
- Claim: chỉ người thắng claim; UI chặn double‑claim.

Chi tiết: xem `DESIGN.md`.

## 8) Leaderboard (Subgraph)

- Env: `VITE_SUBGRAPH_URL`
- Route: `/leaderboard`
- Bảng:
  - Top Payout: tổng claim theo `player` (aggregate client‑side)
  - Weekly Win‑Rate: 7 ngày gần nhất từ `playerRounds` (revealed=true), so sánh `side` với `round.winnerSide`
- Phân trang: Prev/Next theo `first/skip`; Next chỉ bật khi đủ `pageSize`.

## 9) Theme & UX

- Pastel theme (CSS variables) tại `frontend/src/styles/theme.css`; Tailwind tokens (brand, accent, card, border, win/lose)
- Dark mode: thêm class `dark` vào `<html>`
- Cat icon: `frontend/public/assets/icons/cat.svg`
- Win/Lose animation: Lottie trong `frontend/public/assets/anim/`
- Sound toggle: `src/context/sound.tsx` (purr khi thắng, lưu trạng thái localStorage)

## 10) Landing & Onboarding

- Landing: route `/landing` (CTA “Play on Testnet” → `/app`)
- In‑app tips: bật/tắt tại Navbar (persist localStorage)
- Coach marks: 3 bước (Commit → Reveal → Claim)

## 11) Indexing / Subgraph

Xem `subgraph/README.md` để cài đặt, build và deploy qua The Graph Studio.
- Chạy `forge build` để tạo ABI tại `contracts/out/ChocoChocoGame.sol/ChocoChocoGame.json`.
- Cập nhật `subgraph.yaml` với `network`, `address`, `startBlock` trước khi deploy.

## 12) Troubleshooting

- Ví/mạng: đảm bảo `CHAIN_ID` khớp mạng ví; thử RPC public
- Commit/Reveal bị từ chối: kiểm tra countdown (chain time). Hash mismatch → kiểm tra schema + salt
- Double‑claim: UI disable nếu `hasClaimed`; refetch sau khi mined
- Verify lỗi: đúng network/args; chờ indexer vài phút rồi thử lại
- Env không đọc: Vite yêu cầu biến `VITE_*`
- Countdown lệch: dùng hook chain time (`frontend/src/hooks/useChainTime.ts`)

## 13) Quy ước

- Branches: main (stable), dev (integration), feature: `feat/*`, `fix/*`
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, …)
- Env: giữ `.env.example`, không commit secrets
