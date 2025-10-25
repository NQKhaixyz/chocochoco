# ChocoChoco — Tài liệu thiết kế đầy đủ (Design Doc)

In a world of sweets, only the fewest get the feast.

Thế giới ngọt ngào, ai ít hơn… ăn nhiều hơn!

Phiên bản: v1.0 (MVP)


## 1. Tóm tắt điều hành

ChocoChoco là trò chơi on-chain kiểu “minority game” vận hành bởi cơ chế commit–reveal. Người chơi stake để tham gia, chọn một trong hai phe: Mèo Sữa (Milk) hoặc Mèo Cacao (Cacao). Sau thời gian reveal, phe có số người ít hơn (minority) thắng và nhận phần thưởng từ pool của phe còn lại sau khi trừ crumb fee (3%) cho Cat Treasury. Thiết kế ưu tiên tính công bằng, chi phí gas thấp, và trải nghiệm UX dễ thương, hiện đại.

MVP triển khai trên L2 phí thấp (Base/Polygon), sử dụng contract Solidity 0.8.x, cơ chế pull-payment (người thắng tự claim), và giao diện React + Tailwind + wagmi + viem.


## 2. Mục tiêu và Phi mục tiêu

- Mục tiêu
  - Cơ chế commit–reveal chống front-running/last-second switch.
  - Chơi theo vòng (round), state machine rõ ràng: Created → CommitOpen → RevealOpen → Settled.
  - Phân chia thưởng minh bạch; trích fee về Treasury.
  - Gas hiệu quả: tránh loop khi trả thưởng, dùng claim() riêng lẻ.
  - Bảo mật cơ bản: ReentrancyGuard, effects-before-interactions, kiểm tra deadline.
  - Tích hợp UX thân thiện: 3 màn hình Join (Commit), Reveal, Claim + đồng hồ đếm ngược.

- Phi mục tiêu (v1)
  - KYC/POAP/Soulbound bắt buộc (chỉ ở dạng tuỳ chọn/extension).
  - Randomness/VRF cho core logic (chỉ optional mini-event).
  - Cross-chain bridging, multi-token phức tạp (có thể cân nhắc v2).
  - Phân phối payout theo batch on-chain (dễ tốn gas, v1 dùng pull-payment).


## 3. Thuật ngữ & Vai trò

- Round: một vòng chơi gồm các giai đoạn Commit → Reveal → Settled.
- Tribe: phe chọn, gồm Milk (🍼) và Cacao (🍫).
- Player: người chơi tham gia vòng.
- Treasury: địa chỉ nhận crumb fee (3%).
- Admin/Owner: người quản trị có thể pause/unpause, cập nhật tham số an toàn.


## 4. Yêu cầu chức năng

- Tạo vòng tự động/kế tiếp khi settle xong (mặc định tái sử dụng tham số).
- Commit: gửi hash keccak(choice, salt) + stake.
- Reveal: mở choice + salt; nếu hợp lệ, hệ thống ghi nhận count & pool.
- Settle: sau revealDeadline, xác định minority; phát sự kiện vòng kết thúc.
- Claim: người thắng tự nhận phần thưởng; ngăn double-claim.
- Hòa: hoàn stake hoặc rollover sang vòng sau (cấu hình được).
- No-reveal: có thể forfeit một phần/toàn bộ stake (cấu hình được).
- Fee: trích theo basis points (feeBps) về Treasury trước khi chia.
- Hạn chế 1 vé/địa chỉ/vòng ở v1 (giảm Sybil và chống spam).
- Pausable: có thể tạm dừng commit/reveal trong sự cố.


## 5. Yêu cầu phi chức năng

- Bảo mật: chống reentrancy, xác minh hash chặt chẽ, không loop trả thưởng.
- Hiệu năng: tối thiểu event, struct gọn, tránh truy vấn không cần thiết.
- Khả dụng: đơn giản, dễ tích hợp UI/SDK.
- Quan sát được: sự kiện đầy đủ để lập chỉ mục (indexing/analytics).


## 6. Kiến trúc tổng thể

- On-chain: 1 contract chính “ChocoChocoGame” (hoặc “MinorityGame” theo README), có thể hỗ trợ native token (ETH/MATIC) trước; ERC-20 là extension.
- Off-chain: frontend (React + wagmi + viem), indexer (The Graph/SubQuery) để tổng hợp dữ liệu, dashboard analytics.
- Quy trình luồng dữ liệu: người chơi (dApp) → contract (commit/reveal/claim), event → indexer → UI hiển thị lịch sử, bảng xếp hạng, thống kê.


## 7. Thiết kế Smart Contract

### 7.1 Kiểu dữ liệu & Lưu trữ

- enum Status { Created, CommitOpen, RevealOpen, Settled }
- enum Tribe { None, Milk, Cacao }
- struct Round {
  - Status status
  - uint64 commitDeadline
  - uint64 revealDeadline
  - uint96 stake            // v1: cố định mỗi vé
  - uint16 feeBps           // 300 = 3%
  - uint128 poolMilk
  - uint128 poolCacao
  - uint64 countMilk
  - uint64 countCacao
  - uint8 tieMode           // 0 = refund, 1 = rollover (tuỳ chọn)
  - uint8 forfeitMode       // 0 = none, 1 = partial, 2 = full (tuỳ chọn)
  - uint16 forfeitBps       // nếu partial, tỉ lệ phạt
}

- uint256 public currentRoundId;
- mapping(uint256 => Round) public rounds;
- mapping(uint256 => mapping(address => bytes32)) public commitments;
- mapping(uint256 => mapping(address => Tribe)) public revealed;
- mapping(uint256 => mapping(address => bool)) public claimed;
- address public treasury;
- optional: address public stakeToken; // zero-address = native

Lưu ý gas: dùng số nguyên kích thước vừa đủ (uint64/uint96/uint128) và đóng gói field hợp lý.

### 7.2 State machine

- Created → CommitOpen → RevealOpen → Settled
- Chuyển trạng thái:
  - _createNewRound(): status = CommitOpen; đặt deadline.
  - Sau commitDeadline: mở cửa RevealOpen (tự động bằng require() trong reveal; hoặc admin mở thủ công/via settle trước reveal? V1: implicit thông qua thời gian).
  - Sau revealDeadline: settle → Settled.

### 7.3 API (đề xuất)

- constructor(address _treasury, address _stakeToken, uint96 stake, uint64 commitDur, uint64 revealDur, uint16 feeBps, uint8 tieMode, uint8 forfeitMode, uint16 forfeitBps)
- function commitMeow(bytes32 commitment) external payable
- function revealMeow(uint8 tribe, bytes32 salt) external
- function settleRound() external
- function claimTreat(uint256 roundId) external
- function makeCommitment(uint8 tribe, bytes32 salt) external pure returns (bytes32)
- function getRound(uint256 id) external view returns (Round memory)
- function currentRound() external view returns (uint256)
- Admin:
  - function pause() external
  - function unpause() external
  - function setTreasury(address) external
  - function setParamsForNext(uint96 stake, uint64 commitDur, uint64 revealDur, uint16 feeBps, uint8 tieMode, uint8 forfeitMode, uint16 forfeitBps) external

Ghi chú:
- Native mode: require(msg.value == r.stake) khi commit.
- ERC-20 mode: sử dụng safeTransferFrom khi commit; giữ tiền trong contract.
- Cấm double-commit cùng round: require(commitments[id][msg.sender] == 0).
- Cấm double-reveal/claim: cờ trạng thái.

### 7.4 Sự kiện (events)

- event RoundCreated(uint256 id, uint96 stake, uint64 commitDeadline, uint64 revealDeadline, uint16 feeBps);
- event MeowCommitted(uint256 indexed id, address indexed player);
- event MeowRevealed(uint256 indexed id, address indexed player, Tribe tribe);
- event RoundMeowed(uint256 indexed id, Tribe minority);
- event TreatClaimed(uint256 indexed id, address indexed player, uint256 amount);

### 7.5 Xử lý lỗi (custom errors)

- error CommitClosed();
- error RevealClosed();
- error AlreadyCommitted();
- error AlreadyRevealed();
- error AlreadyClaimed();
- error BadStake();
- error BadReveal();
- error NotWinner();
- error NotSettled();

### 7.6 Quy tắc payout & fee

- Tổng pool: $Total = poolMilk + poolCacao$.
- Fee: $Fee = \frac{feeBps}{10{,}000} \times Total$ → chuyển Treasury trước.
- Distributable: $D = Total - Fee$.
- MinorityPool: $M = (minority == Milk ? poolMilk : poolCacao)$.
- Với stake cố định v1, payout mỗi người thắng: $payout = D \times \frac{stake}{M}$.

### 7.7 Hòa & Rollover

- tieMode = refund: hoàn stake cho người đã reveal hợp lệ, người không reveal xử lý theo forfeitMode.
- tieMode = rollover: chuyển pool chưa phân phối sang vòng sau (cần biến tích luỹ hoặc tạo “jackpot”). V1 khuyến nghị refund cho đơn giản.

### 7.8 No-reveal & Forfeit

- forfeitMode = none/partial/full.
- partial: cắt forfeitBps từ stake người không reveal, có thể phân bổ vào pool đối phương hoặc Treasury (cấu hình).
- full: toàn bộ stake người không reveal bị tịch thu theo quy tắc cấu hình.
- Lưu ý: đơn giản hóa v1 bằng partial→0 (tắt) hoặc full→dồn về Treasury.

### 7.9 Bảo mật

- ReentrancyGuard cho claimTreat.
- Checks-effects-interactions trong claim và bất kỳ chỗ chuyển tiền.
- Bảo vệ salt: người dùng không tái sử dụng salt giữa nhiều vòng.
- Cửa sổ thời gian rõ ràng, kiểm tra block.timestamp theo deadline.
- Tránh vòng lặp payout.


## 8. Threat model & Rủi ro

- Front-running/last-second switch: xử lý bằng commit–reveal.
- Griefing (no-reveal): giảm thiểu bằng forfeit + 1 vé/địa chỉ/vòng.
- Sybil: tăng stake tối thiểu, phí cố định, NFT ticket (tùy chọn), giới hạn 1 vé/địa chỉ/vòng.
- Reentrancy: bảo vệ claim; không dùng low-level call không cần thiết.
- ERC-20 allowance phishing: khuyến khích approve theo nhu cầu; dùng SafeERC20.
- Replay cross-round: verify trên roundId khác nhau; commitment map theo round.
- MEV: payout theo claim cá nhân; tránh batch; sự kiện tối giản.


## 9. Tokenomics & tham số

- Crumb fee: mặc định 3% (300 bps) cho Cat Treasury.
- Stake: v1 cố định (ví dụ: 0.01 ETH/MATIC). V2 mở rộng stake động hoặc nhiều vé.
- Payout công thức:
  - Theo vốn góp (khuyến nghị):

    $$ payout_i = \frac{stake_i}{Pool_{Minority}} \times (TotalPool - Fee) $$

  - Chia đều theo đầu người (dễ Sybil, không khuyến nghị):

    $$ payout = \frac{TotalPool - Fee}{Count_{Minority}} $$


## 10. Gas & hiệu năng

- Không for-loop trả thưởng; dùng claim cá nhân.
- mapping và struct gọn; sự kiện đủ dùng nhưng không dư thừa.
- Hạn chế các phép toán 256-bit không cần thiết; pack field hợp lý.
- Tách native/erc20 bằng cờ để tránh logic rẽ nhánh nặng.


## 11. Frontend & UX

- Stack: React + Tailwind + wagmi + viem.
- Màn hình:
  - Join (Commit): chọn Milk/Cacao, tạo salt, tính commitment off-chain, gửi commit + stake.
  - Reveal: lấy lại salt (localStorage/clipboard), gọi reveal.
  - Claim: nếu thắng, hiển thị payout và nút claim.
  - Lịch vòng & đồng hồ: đồng bộ thời gian từ block.timestamp/chain, thêm margin.
- Thương hiệu/Theme:
  - Pastel hồng kem; nút bo tròn; icon mèo; animation thắng/thua; âm thanh “purr~”.
- Lưu trữ salt an toàn: localStorage có mã hoá nhẹ hoặc gợi ý người dùng sao lưu.


## 12. Indexing & Analytics

- Dùng The Graph/SubQuery:
  - Entity: Round, PlayerRound, TreasuryFee, Claim.
  - Nguồn: RoundCreated, MeowCommitted, MeowRevealed, RoundMeowed, TreatClaimed.
- Dashboard: số người/round, tỷ lệ Milk/Cacao, doanh thu fee, tỉ lệ no-reveal.


## 13. Khả năng mở rộng (v2+)

- >2 tribes (Matcha, Strawberry…): tổng quát hoá struct pool[]/count[]; minority = min(counts).
- Stake động: stake_i khác nhau; payout theo tỉ lệ stake_i.
- NFT Ticket/Soulbound: giới hạn 1 vé/1 NFT/vòng; perks giảm phí.
- VRF mini-event: lucky cat airdrop; không ảnh hưởng core logic.
- Leaderboard: tổng payout thắng, win-rate theo tuần; NFT phần thưởng.


## 14. Triển khai & vận hành

- Mạng: Base/Polygon (testnet → mainnet).
- Môi trường:
  - RPC_URL, PRIVATE_KEY, TREASURY_ADDRESS, (tuỳ chọn) STAKE_TOKEN.
- Quy trình triển khai:
  - Triển khai contract → xác minh (Sourcify/Etherscan) → cấu hình frontend.
- Quyền quản trị:
  - Owner có thể pause/unpause, cập nhật tham số vòng tiếp theo.
  - Cân nhắc timelock/multi-sig cho thay đổi quan trọng.
- Nâng cấp:
  - v1: không nâng cấp (đơn giản). v2: cân nhắc proxy + UUPS/Transparent.


## 15. Kiểm thử & QA

- Unit test:
  - commit: stake sai/đúng, double-commit.
  - reveal: trước/sau deadline, hash sai/đúng, double-reveal.
  - settle: trước/sau revealDeadline, hoà/non-hoà.
  - claim: non-winner, double-claim, payout chính xác, fee chính xác.
  - no-reveal: phạt đúng quy tắc, không làm hỏng phân chia.
- Property/Fuzz:
  - phân bố ngẫu nhiên số người; tính bảo toàn tổng tiền trước/sau fee.
- Invariant:
  - Không âm số, không overflow; tổng claim không vượt distributable.
- Gas snapshot: đảm bảo chi phí ổn định.


## 16. Rủi ro & phương án dự phòng

- Lỗi logic payout/fee: kiểm thử kỹ, review, bug bounty trước mainnet.
- Congestion/MEV: claim theo lượt; retry cơ chế; cập nhật UI hướng dẫn.
- Người dùng mất salt: không thể reveal → hiển thị cảnh báo rõ ràng khi commit.
- Admin key risk: dùng multi-sig, giới hạn quyền, công bố tham số trước.


## 17. Phụ lục

### 17.1 Ví dụ tạo commitment

- Off-chain: salt = bytes32 ngẫu nhiên; tribe = 1 (Milk) hoặc 2 (Cacao)
- commitment = keccak256(abi.encodePacked(tribe, salt))

### 17.2 Gợi ý giao diện hàm (Solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IChocoChocoGame {
    enum Status { Created, CommitOpen, RevealOpen, Settled }
    enum Tribe { None, Milk, Cacao }

    struct Round {
        Status status;
        uint64 commitDeadline;
        uint64 revealDeadline;
        uint96 stake;
        uint16 feeBps;
        uint128 poolMilk;
        uint128 poolCacao;
        uint64 countMilk;
        uint64 countCacao;
    }

    function currentRound() external view returns (uint256);
    function getRound(uint256 id) external view returns (Round memory);
    function commitMeow(bytes32 commitment) external payable;
    function revealMeow(uint8 tribe, bytes32 salt) external;
    function settleRound() external;
    function claimTreat(uint256 roundId) external;
    function makeCommitment(uint8 tribe, bytes32 salt) external pure returns (bytes32);
}
```

### 17.3 Trình tự (sequence) – happy path

1) Player chọn Milk, tạo salt, tính commitment → gọi commitMeow(commitment) + stake.
2) Hết commitDeadline → chuyển sang reveal window.
3) Player gọi revealMeow(1, salt) → hợp lệ → cập nhật countMilk và poolMilk.
4) Hết revealDeadline → bất kỳ ai gọi settleRound() → xác định minority → RoundMeowed.
5) Nếu Milk là minority → mỗi người Milk thắng → gọi claimTreat(roundId) nhận payout.

### 17.4 Công thức tổng quát (với stake động – v2)

- $payout_i = D \times \dfrac{stake_i}{\sum_{j \in Minority} stake_j}$.

---

Tài liệu này đồng bộ với README trong `chocochoco/README.md`. Mọi thay đổi lớn nên cập nhật cả hai nơi. Nếu bạn muốn, có thể tách cấu hình chi tiết (tham số vòng, fee, chế độ forfeit/tie) vào `docs/params.md` khi tiến đến production.
