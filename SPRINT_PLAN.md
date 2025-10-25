# ChocoChoco — Sprint Planning

Ngày cập nhật: 2025-10-25
Phạm vi: MVP (testnet) → Production uplift

## 0) Mục tiêu Sprint

- Sprint 1 (2 tuần): Hoàn thiện MVP testnet
  - Contract commit–reveal v1 (native token), settle/claim, fee Treasury, tie refund, tắt forfeit mặc định.
  - Frontend MVP (Join/Reveal/Claim + countdown + basic analytics).
  - Triển khai testnet (Base/Polygon), verify, cấu hình frontend.
  - Bài test cốt lõi: commit/reveal/settle/claim/fee/tie.

- Sprint 2 (2 tuần): Uplift → Production-ready
  - Forfeit mode, Pausable, Admin params for next round, custom errors, SafeERC20 (ERC-20 support).
  - Indexing (The Graph/SubQuery) + Leaderboard cơ bản.
  - Bổ sung bảo mật (ReentrancyGuard, invariant tests, gas snapshot) và audit-lite.
  - Branding/UI polish + basic marketing landing.

## 1) Định nghĩa Ready/Done

- DoR (Definition of Ready)
  - Story có acceptance criteria, estimate, phụ thuộc rõ ràng.
  - API/contract interface đã chốt (liên kết DESIGN.md).

- DoD (Definition of Done)
  - Code có test (pass), lint/typecheck pass (nếu applicable).
  - Docs cập nhật (README/DESIGN/CHANGELOG nếu cần).
  - Deploy (đối với tasks có triển khai), có link xác minh.

## 2) Vai trò & phân công (placeholder)

- PM: @owner
- Backend/Contract: @be1, @be2
- Frontend: @fe1, @fe2
- DevOps: @devops
- Design/Brand: @design

## 3) Epics & Backlog (liên kết DESIGN.md)

- E1: Smart Contract Core (commit-reveal) [owner: admin1]
- E2: Frontend MVP (Join/Reveal/Claim) [owner: admin2]
- E3: Deploy & Ops (testnet, verify, env) [owner: admin2]
- E4: Analytics/Indexing & Leaderboard [owner: admin2]
- E5: Security & QA [owner: admin1]
- E6: Branding & Content [owner: admin2]

## Assignments (admin1/admin2)

- admin1 (contracts, security, tests):
  - S1.1, S1.2, S1.3, S1.12, S1.13
  - S2.1, S2.2, S2.3, S2.8, S2.9

- admin2 (frontend, docs, ops, analytics):
  - S1.4, S1.5, S1.6, S1.7, S1.8, S1.9, S1.10, S1.11
  - S2.4, S2.5, S2.6, S2.7

## 4) Sprint 1 — Stories & Tasks (2 tuần)

E1 — Contract v1 (native token)
- S1.1 Spec & scaffolding (Foundry/Hardhat)
  - AC: Tạo project, cài OZ, cấu hình network.
  - Est: 3
  - Owner: admin1
- S1.2 Implement ChocoChocoGame v1 (native)
  - AC: constructor, commitMeow, revealMeow, settleRound, claimTreat, makeCommitment, events.
  - Rule: tieMode=refund, forfeit=off, fee=3%, stake=0.01, commit/reveal=30/30min.
  - Est: 8
  - Owner: admin1
- S1.3 Unit tests (happy/edge)
  - AC: commit stake sai/đúng, double-commit, reveal sớm/trễ, bad salt, tie refund, fee accuracy, claim winner only, double-claim.
  - Est: 8
  - Owner: admin1
- S1.4 Deploy testnet & verify
  - AC: contract address, verify OK, env URL.
  - Est: 3
  - Owner: admin2

E2 — Frontend MVP
- S1.5 Project setup (React + Vite/Next, Tailwind, wagmi, viem)
  - AC: repo FE, connect wallet, network switch.
  - Est: 5
  - Owner: admin2
- S1.6 Join (Commit) screen
  - AC: chọn Milk/Cacao, generate salt (local), compute commitment, gửi tx + stake.
  - Est: 5
  - Owner: admin2
- S1.7 Reveal screen
  - AC: hiển thị round, countdown, reveal bằng salt, handle errors.
  - Est: 5
  - Owner: admin2
- S1.8 Claim screen
  - AC: hiển thị winner/minority, nút claim, thông báo.
  - Est: 3
  - Owner: admin2
- S1.9 Shared components & Countdown
  - AC: đồng bộ thời gian từ chain, format thời gian.
  - Est: 3
  - Owner: admin2

E3 — Deploy & Ops
- S1.10 Env & Config
  - AC: RPC_URL, CONTRACT_ADDRESS, TREASURY_ADDRESS; build/deploy scripts.
  - Est: 3
  - Owner: admin2
- S1.11 Basic docs & runbook
  - AC: README cập nhật bước chạy, liên kết DESIGN, SPRINT_PLAN.
  - Est: 2
  - Owner: admin2

E5 — Security & QA (cơ bản trong S1)
- S1.12 Reentrancy & CEI checks
  - AC: dùng ReentrancyGuard cho claim, kiểm tra effects-before-interactions.
  - Est: 3
  - Owner: admin1
- S1.13 Gas sanity & no large loops
  - AC: claim pull-only; sự kiện tối thiểu.
  - Est: 2
  - Owner: admin1

Buffer: 10–15%.

## 5) Sprint 2 — Stories & Tasks (2 tuần)

E1 — Contract v2 features
- S2.1 Forfeit mode (partial/full)
  - AC: param forfeitMode/forfeitBps, test no-reveal paths.
  - Est: 8
  - Owner: admin1
- S2.2 Admin params & Pausable
  - AC: setParamsForNext, pause/unpause, tests.
  - Est: 5
  - Owner: admin1
- S2.3 ERC-20 support (optional switch)
  - AC: SafeERC20, approve+commit path, tests.
  - Est: 8
  - Owner: admin1

E4 — Indexing & Leaderboard
- S2.4 Subgraph setup
  - AC: Entities (Round, PlayerRound, Claim, TreasuryFee), handlers for events.
  - Est: 8
  - Owner: admin2
- S2.5 Leaderboard UI
  - AC: top payout, win-rate tuần, pagination.
  - Est: 5
  - Owner: admin2

E6 — Branding & Content
- S2.6 Theme pastel, animation mèo thắng/thua
  - AC: assets, micro-animations, sound toggle.
  - Est: 5
  - Owner: admin2
- S2.7 Landing & docs polish
  - AC: hướng dẫn người dùng mới, tooltips.
  - Est: 3
  - Owner: admin2

E5 — Security & QA
- S2.8 Property/Fuzz & Invariants
  - AC: bảo toàn tiền, no overflow, tổng claim <= distributable.
  - Est: 8
  - Owner: admin1
- S2.9 Audit-lite checklist
  - AC: rà soát permissions, errors, deadcode, events, gas.
  - Est: 3
  - Owner: admin1

## 6) Phụ thuộc & Rủi ro

- Phụ thuộc
  - RPC/L2 testnet ổn định.
  - Treasury address xác nhận.
  - FE và BE đồng bộ ABI & event.
- Rủi ro
  - Mất salt người dùng → không reveal: nhắc lưu salt ở commit.
  - MEV/giá gas cao: claim pull-only, tránh batch.
  - Trễ verify: dự phòng bằng Sourcify.

## 7) Velocity & Ước lượng

- Thang điểm: 1 (nhỏ), 3 (vừa), 5 (trung), 8 (phức tạp), 13 (rất phức tạp).
- Ước lượng Sprint 1: ~50–60 points (đội 3–4 người, full-time 2 tuần).
- Ước lượng Sprint 2: ~55–65 points.

## 8) Lịch trình mẫu

- Tuần 1: E1 (S1.1–S1.3), E2 (S1.5–S1.7)
- Tuần 2: E1 (S1.4), E2 (S1.8–S1.9), E3 (S1.10–S1.11), E5 (S1.12–S1.13)
- Retro & planning Sprint 2 cuối tuần 2.

## 9) Board/Tracking gợi ý

- Columns: Backlog → Ready → In Progress → Review → Done
- Tags: contract, frontend, devops, analytics, security, docs
- Definition of blocked: phụ thuộc chưa đáp ứng (RPC/ABI/Env…)

## 10) Acceptance criteria mẫu (tham khảo)

- Commit/Reveal
  - Người chơi commit với stake chính xác; double-commit bị chặn.
  - Reveal chỉ chấp nhận trong window, hash khớp, double-reveal bị chặn.
- Settle/Tie
  - settle chỉ sau revealDeadline; tie → refund đúng.
- Claim/Fee
  - Chỉ winner claim được; double-claim bị chặn; fee chuyển Treasury chính xác.
- Frontend
  - Countdown chính xác ±1s; mạng đúng chain; hiển thị lỗi rõ ràng; lưu salt an toàn.

---

Tham khảo thêm: `DESIGN.md` và `README.md`. Khi story thay đổi phạm vi, cập nhật ước lượng và AC tương ứng.
