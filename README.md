# ChocoChoco 🍫🐱

In a world of sweets, only the fewest get the feast.

Thế giới ngọt ngào, ai ít hơn… ăn nhiều hơn!

ChocoChoco là trò chơi minority commit–reveal on-chain: mỗi vòng, mèo chọn “Mèo Sữa” 🍼 hay “Mèo Cacao” 🍫, stake một khoản, và Phe Thiểu Số ăn trọn phần bánh của Phe Đa Số (sau khi trích một ít crumb fee 🍪 cho Cat Treasury).

- Chain gợi ý: Base / Polygon (phí rẻ)
- Frontend gợi ý: React + Tailwind + wagmi + viem
- Contract: Solidity 0.8.x, commit–reveal, pull-payment claim


## Nội dung

- Tổng quan nhanh
- Luật chơi chi tiết
- Cơ chế on-chain (commit–reveal, state machine)
- Thiết kế contract & API (gợi ý)
- Kinh tế học & công thức thưởng
- Chống Sybil & bảo mật
- Frontend & UX
- Triển khai & môi trường
- Kiểm thử & checklist
- Lộ trình (MVP → Production)
- FAQ
- Giấy phép & đóng góp


## Tài liệu liên quan

- Thiết kế chi tiết: see `DESIGN.md`
- Kế hoạch sprint: see `SPRINT_PLAN.md`
## Tổng quan nhanh

- Mỗi vòng có hai lựa chọn: Mèo Sữa (Milk) hoặc Mèo Cacao (Cacao)
- Giai đoạn Commit: gửi hash = keccak(choice, salt) + stake
- Giai đoạn Reveal: tiết lộ choice + salt để xác thực
- Kết toán: bên có ít người hơn (Minority) thắng; nếu hòa thì hoàn stake hoặc rollover (tùy cấu hình)
- Fee: 3% crumb fee chuyển về Cat Treasury
- Claim: người thắng tự gọi claim() để nhận tiền, tránh for-loop tốn gas


## Luật chơi chi tiết

1) Chọn phe
- “Mèo Sữa” 🍼 thích vị ngọt nhẹ.
- “Mèo Cacao” 🍫 mê hương đắng quyến rũ.

2) Commit
- Người chơi gọi commit(commitment) kèm stake, với commitment = keccak256(abi.encodePacked(choice, salt))

3) Reveal
- Sau khi cửa commit đóng, người chơi reveal(choice, salt). Hệ thống xác minh hash.

4) Phân thắng thua
- Minority = phe có số người reveal hợp lệ ít hơn.
- Nếu count bằng nhau: hòa → hoàn stake hoặc rollover sang vòng sau (tùy cấu hình sản phẩm).

5) Payout
- Người thắng chia pool của bên thua (sau khi trừ fee cho Treasury).

6) Không reveal
- Không reveal đúng hạn có thể bị forfeit một phần hoặc toàn bộ stake theo quy tắc vòng.


## Cơ chế on-chain (commit–reveal, state machine)

State machine mỗi vòng:

- Created → CommitOpen → RevealOpen → Settled

Thông số vòng:

- stakeSize, feeBps (vd: 300 = 3%)
- commitDeadline, revealDeadline

Dữ liệu cốt lõi:

- commitments[user] = bytes32 hash
- revealed[user] = Choice
- countMilk, countCacao, poolMilk, poolCacao

Sự kiện (ví dụ có chủ đề “meow”):

- RoundCreated(id, stake, commitDeadline, revealDeadline, feeBps)
- MeowCommitted(id, player)
- MeowRevealed(id, player, choice)
- RoundMeowed(id, winningTribe) // khi settle
- TreatClaimed(id, player, amount)


## Thiết kế contract & API (gợi ý)

Lưu ý: Đây là khung tham khảo, không dùng ngay cho production nếu chưa kiểm thử/kiểm toán. Bạn có thể bắt đầu từ mẫu “MinorityGame” (Solidity 0.8.x) với các đổi tên cho phù hợp thương hiệu mèo.

Các thực thể chính:

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

Gợi ý hàm public (tên theo chủ đề):

- commitMeow(bytes32 commitment) payable
- revealMeow(uint8 tribe, bytes32 salt)
- settleRound()
- claimTreat(uint256 roundId)
- makeCommitment(uint8 tribe, bytes32 salt) → bytes32 (helper off-chain/on-chain)

Quy tắc triển khai:

- Pull payment: người thắng tự claim để nhận payout.
- Không dùng loop dài khi trả thưởng.
- Chống reentrancy (ReentrancyGuard) và kiểm tra effects-before-interactions.
- Sử dụng salt bí mật và không tái sử dụng salt giữa nhiều vòng.


## Kinh tế học & công thức thưởng

- Crumb fee: 3% (mặc định), chuyển về Cat Treasury trước khi chia thưởng.
- Hai lựa chọn công thức chia thưởng:

1) Theo vốn góp (khuyến nghị):

	$payout_i = \dfrac{stake_i}{Pool_{Minority}}\times (TotalPool - Fee)$

2) Chia đều theo đầu người (vui nhưng dễ Sybil):

	$payout = \dfrac{TotalPool - Fee}{Count_{Minority}}$

Trong bản đơn giản với stake cố định, payout mỗi người thắng = (TotalPool - Fee) × (stake / PoolMinority).


## Chống Sybil & bảo mật

- Commit–Reveal để tránh front-running/last-second switch.
- Forfeit nếu không reveal đúng hạn (cấu hình phần trăm cắt).
- Tăng chi phí chống Sybil: stake tối thiểu cao, phí tham gia cố định, giới hạn 1 vé/địa chỉ/vòng.
- Tuỳ chọn: NFT ticket, Soulbound, KYC/POAP.
- Bảo mật contract:
	- ReentrancyGuard cho claim
	- pull-payment, không chuyển tiền trong vòng lặp
	- kiểm tra biên deadline chặt chẽ
	- tối ưu lưu trữ (struct gọn, event tối thiểu)


## Setup với pnpm

- Cài pnpm (khuyến nghị Corepack): `corepack enable && corepack prepare pnpm@9 --activate` (hoặc `npm i -g pnpm`).
- Kiểm tra cài đặt: `pnpm -v`.
- Workspace: file `pnpm-workspace.yaml` tại root đã khai báo gói `frontend`.
- Khởi tạo Frontend (chưa có mã nguồn FE):
  - `pnpm dlx create-vite@latest frontend --template react-swc`
  - `cd frontend && pnpm i && pnpm dev`
  - Thêm vào `frontend/package.json`: trường `"packageManager": "pnpm@9.x"`
  - Commit `pnpm-lock.yaml` để cố định dependency graph.
- Lưu ý: phần contracts dùng Foundry (không phụ thuộc npm). pnpm chủ yếu áp dụng cho FE/tooling JS.

## Frontend & UX

- Stack: React + Vite/Next.js + Tailwind + wagmi + viem
- Màn hình chính:
	- Join (Commit): chọn “Milk/Cacao”, nhập stake, gửi commit
	- Reveal: dán salt (hoặc lưu tự động), bấm reveal
	- Claim: hiển thị thắng/thua, nút claim nếu thắng
	- Lịch vòng & đếm ngược: hiển thị deadline commit/reveal
- Thương hiệu:
	- Nền pastel hồng kem, nút bo tròn, font tròn kiểu Mochi
	- Animation: mèo thắng nhảy múa; thua xị mặt; hiệu ứng “purr~” khi thắng
- Dữ liệu hiển thị: count mỗi phe, tổng pool, fee, tỷ lệ ăn chia ước tính


## Triển khai & môi trường

Mặc dù repo này chưa chứa code Solidity sẵn cho ChocoChoco, bạn có thể khởi tạo nhanh project smart contract theo một trong hai cách:

1) Foundry (đề xuất cho Solidity):

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

Sau đó thêm contract MinorityGame/ChocoChocoGame theo khung ở phần “Thiết kế contract”, cấu hình mạng (Base/Polygon), và môi trường:

- RPC_URL, PRIVATE_KEY, TREASURY_ADDRESS

Gợi ý tham số mặc định:

- stake: 0.01 ETH/MATIC
- feeBps: 300 (3%)
- commit/reveal duration: 30 phút/30 phút


## Kiểm thử & checklist

Các ca kiểm thử cốt lõi:

- commit đúng stake, double-commit bị chặn
- reveal đúng hash; reveal sai/sai thời điểm bị chặn
- no-reveal bị forfeit (nếu bật)
- hòa: hoàn stake/rollover theo cấu hình
- settle sau revealDeadline
- claim chỉ dành cho người thắng, không trùng lặp
- fee chuyển về Treasury chính xác
- chống reentrancy ở claim

Khuyến nghị công cụ:

- Unit test với Foundry/Hardhat
- Property-based test: số đông/số ít ngẫu nhiên
- Gas snapshot: đảm bảo không có vòng lặp lớn


## Lộ trình (MVP → Production)

MVP (testnet):

- Commit–Reveal–Settle–Claim đầy đủ
- UI 3 màn hình cơ bản, đồng hồ đếm ngược
- Fee 3%, 1 vé/địa chỉ/vòng, penalty no-reveal

Production:

- NFT Cat Avatar (tuỳ chọn), leaderboard tuần
- Analytics: số người/round, tỉ lệ Milk/Cacao, doanh thu fee
- Bổ sung VRF cho mini-event ngẫu nhiên (airdrop, lucky cat)
- Audit/bug bounty, triển khai mainnet


## FAQ

Q: Vì sao cần commit–reveal?
- Để tránh front-running và đổi phe phút chót.

Q: Nếu bằng nhau thì sao?
- Hòa → hoàn stake hoặc rollover (tuỳ cấu hình sản phẩm).

Q: Không kịp reveal?
- Có thể bị cắt stake (forfeit), phần cắt thêm vào pool/treasury tuỳ luật vòng.

Q: Token hay native?
- Hỗ trợ cả native (ETH/MATIC) hoặc ERC-20 ($CHOCO). Bản MVP nên chọn một trong hai cho đơn giản.


## Giấy phép & đóng góp

- Giấy phép: MIT (xem `LICENSE`).
- Đóng góp: chào mừng PR/issue. Vui lòng mô tả rõ ràng, thêm test nếu chỉnh logic.


## Gợi ý đổi tên theo chủ đề mèo (tham khảo)

- event Settled → RoundMeowed
- event Committed → MeowCommitted
- event Revealed → MeowRevealed
- event Claimed → TreatClaimed
- Choice.A/B → Tribe.Milk/Cacao

Thông điệp giao diện ví dụ:

“🐱 Meow! Mèo Sữa thắng vòng này! 🍶🎉”

