# ChocoChoco — Design Document (v1.0 / MVP)

> In a world of sweets, only the fewest get the feast.
> Thế giới ngọt ngào, ai ít hơn… ăn nhiều hơn!

---

## 0. Meta

- Phiên bản: v1.0 (MVP)
- Trạng thái: Draft-hoàn chỉnh cho triển khai testnet
- Phạm vi: Core Minority Game (commit–reveal) + mở rộng GameFi (FOOD, CatNFT, Marketplace)
- Mục tiêu bản này: Đủ chi tiết để đội dev/FE/DevOps triển khai, verify, và tích hợp UI + indexer.

---

## 1. Tóm tắt điều hành

ChocoChoco là trò chơi on-chain kiểu minority game vận hành bởi cơ chế commit–reveal. Người chơi stake để tham gia, chọn một trong hai phe: Mèo Sữa (Milk) hoặc Mèo Cacao (Cacao). Sau giai đoạn reveal, phe có số người ít hơn (minority) thắng và nhận phần thưởng từ pool của phe còn lại sau khi trừ crumb fee (mặc định 3%) cho Cat Treasury.

- Hạ tầng: L2 phí thấp (Base/Polygon), Solidity 0.8.x, pull-payment (người thắng tự claim).
- Frontend: React + Tailwind + wagmi + viem.
- Ưu tiên: Công bằng (kháng front-running), gas thấp, UX nhẹ nhàng, hiện đại.

---

## 2. Mục tiêu và Phi mục tiêu

### 2.1 Mục tiêu

- Kháng MEV / switch phút chót: Commit–reveal bắt buộc.
- Theo vòng (round): State machine rõ ràng Created → CommitOpen → RevealOpen → Settled.
- Phân chia minh bạch: Trích fee về Treasury trước khi chia thưởng.
- Hiệu quả gas: Không loop trả thưởng; claim() cá nhân.
- Bảo mật cơ bản: ReentrancyGuard, CEI, deadline rõ ràng.
- UX 3 màn hình: Join (Commit), Reveal, Claim + countdown.

### 2.2 Phi mục tiêu (MVP)

- KYC/POAP/Soulbound bắt buộc (chỉ tuỳ chọn).
- Randomness/VRF cho core logic (chỉ mini-event optional).
- Cross-chain bridging / multi-token phức tạp (cân nhắc v2).
- Payout batch on-chain (giữ pull-payment ở v1).

---

## 3. Thuật ngữ & Vai trò

- Round: Một vòng chơi gồm các giai đoạn Commit → Reveal → Settled.
- Tribe: Phe chọn, gồm Milk (🍼) và Cacao (🍫).
- Player: Người chơi tham gia vòng.
- Treasury: Địa chỉ nhận crumb fee.
- Admin/Owner: Có thể pause/unpause, cập nhật tham số an toàn.

---

## 4. Yêu cầu chức năng

- Tạo vòng mới khi settle xong (tái sử dụng tham số nếu không đổi).
- Commit: Gửi hash = keccak(choice, salt) + stake.
- Reveal: Mở choice + salt; hệ thống ghi nhận count & pool.
- Settle: Sau revealDeadline, xác định minority; phát sự kiện kết thúc.
- Claim: Người thắng tự claim; ngăn double-claim.
- Hòa (tie): Hoàn stake hoặc rollover sang vòng sau (cấu hình).
- No-reveal: Có thể forfeit một phần/toàn bộ stake (cấu hình).
- Fee: Trích theo basis points (feeBps) về Treasury trước khi chia.
- Giới hạn: 1 vé/địa chỉ/vòng (v1).
- Pausable: Tạm dừng commit/reveal khi sự cố.

---

## 5. Yêu cầu phi chức năng

- Bảo mật: Chống reentrancy, xác minh hash chặt chẽ, không loop trả thưởng.
- Hiệu năng: Event tối giản; struct gọn; tránh storage/compute dư thừa.
- Khả dụng: API rõ ràng; dễ tích hợp UI/SDK.
- Quan sát: Sự kiện đầy đủ để lập chỉ mục (index/analytics).

---

## 6. Kiến trúc tổng thể

- On-chain: 1 contract chính ChocoChocoGame (aka MinorityGame), hỗ trợ native token trước; ERC-20 là extension.
- Off-chain: FE (React + wagmi + viem), indexer (The Graph/SubQuery), dashboard analytics.
- Luồng dữ liệu: dApp → contract (commit/reveal/claim) → events → indexer → UI (lịch sử/leaderboard/thống kê).

---

## 7. Thiết kế Smart Contract

### 7.1 Kiểu dữ liệu & Lưu trữ

```solidity
enum Status { Created, CommitOpen, RevealOpen, Settled }
enum Tribe  { None, Milk, Cacao }

struct Round {
    Status status;
    uint64 commitDeadline;
    uint64 revealDeadline;
    uint96 stake;          // v1: stake cố định mỗi vé
    uint16 feeBps;         // 300 = 3%
    uint128 poolMilk;
    uint128 poolCacao;
    uint64 countMilk;
    uint64 countCacao;
    uint8 tieMode;         // 0 = refund, 1 = rollover (optional)
    uint8 forfeitMode;     // 0 = none, 1 = partial, 2 = full (optional)
    uint16 forfeitBps;     // nếu partial
}

uint256 public currentRoundId;
mapping(uint256 => Round) public rounds;
mapping(uint256 => mapping(address => bytes32)) public commitments;
mapping(uint256 => mapping(address => Tribe))   public revealed;
mapping(uint256 => mapping(address => bool))    public claimed;

address public treasury;
address public stakeToken; // address(0) = native
```

Lưu ý gas: Dùng số nguyên kích thước vừa đủ (uint64/96/128) và pack field hợp lý.

### 7.2 State machine

- Created → CommitOpen → RevealOpen → Settled
- Chuyển trạng thái:
  - _createNewRound() đặt status = CommitOpen và deadline.
  - Hết commitDeadline → mở cửa RevealOpen (implicit theo block.timestamp).
  - Hết revealDeadline → settleRound() → Settled.

### 7.3 API (đề xuất)

```solidity
constructor(
  address _treasury,
  address _stakeToken,
  uint96 stake,
  uint64 commitDur,
  uint64 revealDur,
  uint16 feeBps,
  uint8 tieMode,
  uint8 forfeitMode,
  uint16 forfeitBps
);

function commitMeow(bytes32 commitment) external payable;
function revealMeow(uint8 tribe, bytes32 salt) external;
function settleRound() external;
function claimTreat(uint256 roundId) external;
function makeCommitment(uint8 tribe, bytes32 salt) external pure returns (bytes32);
function getRound(uint256 id) external view returns (Round memory);
function currentRound() external view returns (uint256);

// Admin
function pause() external;
function unpause() external;
function setTreasury(address) external;
function setParamsForNext(
  uint96 stake,
  uint64 commitDur,
  uint64 revealDur,
  uint16 feeBps,
  uint8 tieMode,
  uint8 forfeitMode,
  uint16 forfeitBps
) external;
```

Ràng buộc:

- Native mode: require(msg.value == r.stake) khi commit.
- ERC-20 mode: safeTransferFrom khi commit; giữ tiền trong contract.
- Cấm double-commit: require(commitments[id][msg.sender] == 0).
- Cấm double-reveal/claim: cờ revealed/claimed.

### 7.4 Sự kiện

```solidity
event RoundCreated(uint256 id, uint96 stake, uint64 commitDeadline, uint64 revealDeadline, uint16 feeBps);
event MeowCommitted(uint256 indexed id, address indexed player);
event MeowRevealed(uint256 indexed id, address indexed player, Tribe tribe);
event RoundMeowed(uint256 indexed id, Tribe minority);
event TreatClaimed(uint256 indexed id, address indexed player, uint256 amount);
```

### 7.5 Lỗi tùy biến

```solidity
error CommitClosed();
error RevealClosed();
error AlreadyCommitted();
error AlreadyRevealed();
error AlreadyClaimed();
error BadStake();
error BadReveal();
error NotWinner();
error NotSettled();
```

### 7.6 Quy tắc payout & fee (v1 stake cố định)

Ký hiệu:

- Total = poolMilk + poolCacao
- Fee = feeBps/10,000 × Total
- D = Total − Fee
- M = (minority == Milk ? poolMilk : poolCacao)

Với stake cố định s cho mỗi vé (v1), payout mỗi người thắng:

```
payout = D × s / M
```

### 7.7 Hòa & Rollover

- tieMode = refund: Hoàn stake cho người đã reveal hợp lệ; người không reveal xử lý theo forfeitMode.
- tieMode = rollover: Chuyển pool chưa phân phối sang vòng sau. (v1 khuyến nghị refund để đơn giản.)

### 7.8 No-reveal & Forfeit

- forfeitMode ∈ { none, partial, full }.
- partial: Cắt forfeitBps từ stake người không reveal; phân bổ về Treasury hoặc pool đối phương (cấu hình).
- full: Tịch thu toàn bộ stake người không reveal theo quy tắc cấu hình.
- v1 khuyến nghị tắt (partial = 0) hoặc dồn về Treasury để đơn giản.

### 7.9 Bảo mật

- ReentrancyGuard cho claimTreat (và marketplace v2).
- Checks-Effects-Interactions trong claim và chuyển tiền.
- Salt hygiene: Không tái sử dụng salt giữa các vòng.
- Deadline: Kiểm tra block.timestamp với deadline chuẩn xác.
- Tránh vòng lặp payout.

---

## 8. Threat model & Rủi ro

- Front-running / last-second switch: Commit–reveal.
- Griefing (no-reveal): Forfeit + giới hạn 1 vé/địa chỉ/vòng.
- Sybil: Tăng stake tối thiểu, phí cố định, NFT ticket (tuỳ chọn), 1 vé/địa chỉ/vòng.
- Reentrancy: Bảo vệ claim; tránh call nguy hiểm.
- ERC-20 allowance phishing: Approve theo nhu cầu; dùng SafeERC20; hướng dẫn revoke.
- Replay cross-round: Commitment theo roundId khác nhau.
- MEV: Claim cá nhân; tối giản event.

---

## 9. Tokenomics & tham số

- Crumb fee: 3% (300 bps) cho Treasury.
- Stake: v1 cố định (vd: 0.01 ETH/MATIC hoặc s FOOD).
- Payout (v1 stake cố định): payout_i = s/M × (Total − Fee)
- Payout (v2 stake động): payout_i = s_i / sum_j s_j × (Total − Fee)

---

## 10. Gas & hiệu năng

- Không for-loop trả thưởng; claim cá nhân.
- Struct gọn; event đủ dùng.
- Hạn chế phép toán 256-bit không cần thiết.
- Phân tách native/ERC-20 bằng cờ để tránh rẽ nhánh nặng.

---

## 11. Frontend & UX

- Stack: React + Tailwind + wagmi + viem.
- Màn hình:
  - Join (Commit): chọn Milk/Cacao, tạo salt, tính commitment off-chain, gửi commit + stake.
  - Reveal: lấy lại salt (localStorage/clipboard), gọi reveal.
  - Claim: nếu thắng, hiển thị payout và nút claim.
  - Lịch vòng & countdown: đồng bộ thời gian từ block.timestamp, thêm margin.
- Branding/Theme: Pastel hồng kem; bo tròn; icon mèo; animation thắng/thua; âm thanh "purr~".
- Bảo quản salt: localStorage mã hoá nhẹ + gợi ý sao lưu.

---

## 12. Indexing & Analytics

- The Graph/SubQuery:
  - Entity: Round, PlayerRound, TreasuryFee, Claim.
  - Event: RoundCreated, MeowCommitted, MeowRevealed, RoundMeowed, TreatClaimed.
- Dashboard: số người/round, tỷ lệ Milk/Cacao, doanh thu fee, tỉ lệ no-reveal.

---

## 13. Khả năng mở rộng (v2+)

- >2 tribes (Matcha, Strawberry…): tổng quát hoá pool[]/count[]; minority = argmin(counts).
- Stake động: s_i khác nhau; payout tỉ lệ s_i.
- NFT Ticket/Soulbound: giới hạn 1 vé/1 NFT/vòng; perks giảm phí.
- VRF mini-event: Lucky cat airdrop; không ảnh hưởng core logic.
- Leaderboard: tổng payout thắng; win-rate; NFT phần thưởng.

---

## 14. Triển khai & vận hành

- Mạng: Base/Polygon (testnet → mainnet).
- Môi trường: RPC_URL, PRIVATE_KEY, TREASURY_ADDRESS, (tuỳ chọn) STAKE_TOKEN.
- Quy trình: Deploy contract → Verify (Sourcify/Etherscan) → Cấu hình frontend.
- Quản trị: Owner có thể pause/unpause, cập nhật tham số vòng.
- Nâng cấp: v1 non-upgradeable; v2 cân nhắc proxy (UUPS/Transparent) + timelock/multi-sig.

### 14.1 Env bắt buộc (root .env)

| Key | Mô tả | Ví dụ |
| --- | --- | --- |
| PRIVATE_KEY | Private key ví deploy (0x-prefixed). | 0xabc... |
| BASE_SEPOLIA_RPC | RPC Base Sepolia | https://base-sepolia.g.alchemy.com/v2/<key> |
| POLYGON_MUMBAI_RPC | RPC Polygon Mumbai | https://polygon-mumbai.g.alchemy.com/v2/<key> |
| BASESCAN_API_KEY | API key Basescan (verify) | abcd1234 |
| POLYGONSCAN_API_KEY | API key Polygonscan (verify) | efgh5678 |
| FRONTEND_ENV_PATH | (Optional) Override đường dẫn FE env | frontend/.env |

Bảo mật: Không commit .env (thêm .env vào .gitignore).

### 14.2 Acceptance Criteria (S1.4)

- Có địa chỉ contract và link verify hợp lệ.
- FE .env cập nhật VITE_CONTRACT_ADDRESS.
- scripts/README.md có hướng dẫn deploy & verify + lưu địa chỉ/chain/block.

---

## 15. Kiểm thử & QA

### 15.1 Unit test

- commit: stake sai/đúng; double-commit; deadline.
- reveal: trước/sau deadline; hash sai/đúng; double-reveal.
- settle: trước/sau revealDeadline; hoà/non-hoà.
- claim: non-winner; double-claim; payout & fee chính xác.
- no-reveal: phạt đúng quy tắc; không phá phân chia.

### 15.2 Property/Fuzz

- Phân bố ngẫu nhiên số người; bảo toàn tổng tiền trước/sau fee.

### 15.3 Invariant

- Không âm/overflow.
- Tổng claim không vượt D = Total − Fee.

### 15.4 Gas snapshot

- Snapshot commit/reveal/settle/claim để kiểm soát chi phí.

---

## 16. Rủi ro & phương án dự phòng

- Lỗi payout/fee: Kiểm thử kỹ; code review chéo; bug bounty trước mainnet.
- Congestion/MEV: Claim theo lượt; hướng dẫn UI retry; không batch thanh toán.
- Mất salt: Không thể reveal → cảnh báo rõ ràng khi commit (FE).
- Admin key risk: Multi-sig, giới hạn quyền, công bố tham số trước.

---

## 17. Phụ lục

### 17.1 Ví dụ tạo commitment (off-chain)

- salt = bytes32 ngẫu nhiên; tribe ∈ {1(Milk), 2(Cacao)}
- commitment = keccak256(abi.encodePacked(tribe, salt))

### 17.2 Interface (Solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IChocoChocoGame {
    enum Status { Created, CommitOpen, RevealOpen, Settled }
    enum Tribe  { None, Milk, Cacao }

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

1. Player chọn Milk, tạo salt, tính commitment → gọi commitMeow(commitment) + stake.
2. Hết commitDeadline → mở reveal window.
3. Player gọi revealMeow(1, salt) → hợp lệ → cập nhật countMilk và poolMilk.
4. Hết revealDeadline → bất kỳ ai gọi settleRound() → xác định minority → RoundMeowed.
5. Nếu Milk là minority → mỗi người Milk thắng → gọi claimTreat(roundId) nhận payout.

### 17.4 Công thức tổng quát (v2 stake động)

```
payout_i = D × s_i / sum_{j in Minority} s_j,  với  D = Total − Fee
```

---

## 18. GameFi mở rộng — Mèo, Token, Marketplace

Mục tiêu: Xây dựng hệ sinh thái 3 trụ cột quanh core minority game:

1) Cơ chế tăng token FOOD qua gameplay;
2) Nuôi mèo (CatNFT) bằng FOOD (token sink);
3) Sàn giao dịch mèo (Marketplace) để lưu thông tài sản.

### 18.1 Tài sản & Token

| Loại | Mô tả | Chuẩn |
| --- | --- | --- |
| FOOD (ChocoFood) | ERC-20 dùng làm stake chính. Người chơi kiếm FOOD khi thắng, tiêu FOOD khi nuôi mèo. Không mint thêm khi thắng; chỉ tái phân phối. | ERC-20 |
| PAW (CatCoin) | ERC-20 phụ để mua rương (Loot Chest) hoặc giao dịch marketplace; có thể burn một phần khi sử dụng. | ERC-20 |
| CatNFT | NFT đại diện mèo: rarity, skin, level, generation. | ERC-721 (ERC-2981 optional) |

### 18.2 Cơ chế tăng token FOOD qua Minority Game

- Stake FOOD trong commit–reveal thay vì native token.
- Phân phối: Bên thiểu số nhận lại FOOD từ bên đa số sau khi trừ fee.
- Bảo toàn cung: Không mint thêm, chỉ tái phân phối tổng FOOD giữa người chơi và Treasury.

Payout FOOD:

```
payout_i = (s_i / sum_{j in Minority} s_j) × (TotalFOOD − FeeFOOD)
FeeFOOD = feeBps/10,000 × TotalFOOD
```

### 18.3 Nuôi mèo bằng FOOD (Feeding & Leveling)

Mục tiêu: Tạo sink FOOD và gia tăng giá trị CatNFT.

Contract: CatCare (hoặc tích hợp vào CatNFT).

API đề xuất:

```solidity
function feed(uint256 catId, uint256 amountFOOD) external;
function levelOf(uint256 catId) external view returns (uint256);
```

Cơ chế: Owner CatNFT gọi feed() để nạp FOOD; một phần FOOD burn hoặc chuyển Treasury. Mỗi feed tăng XP; khi đạt ngưỡng → level up. Giới hạn feed/ngày.

Gợi ý công thức:

```
XP_new = XP_old + k × amountFOOD
Level up khi XP ≥ threshold(level)
```

Sự kiện:

```solidity
event Fed(uint256 catId, address owner, uint256 amountFOOD, uint256 newLevel);
```

Bảo mật: owner-only, feedCapPerDay, ReentrancyGuard khi chuyển/burn FOOD.

### 18.4 Sàn giao dịch mèo (Cat Marketplace)

- MVP: Tích hợp OpenSea/Seaport SDK. UI Inventory + List/View on OpenSea. Optional ERC-2981 để hiển thị royalty.
- V2+ (on-chain nội bộ): Contract CatMarket tối giản:

```solidity
function list(uint256 tokenId, uint256 pricePAW) external;
function buy(uint256 tokenId) external;
function cancel(uint256 tokenId) external;
```

- Đơn vị giao dịch: PAW.
- Phí: % nhỏ về Treasury.
- Sự kiện: Listed, Sold, Cancelled.
- Bảo mật: CEI + ReentrancyGuard; kiểm tra quyền sở hữu NFT.

### 18.5 Dòng chảy kinh tế (Token Flow)

Chu trình:

1) Stake FOOD → chơi minority game.
2) Bên thắng nhận FOOD.
3) Feed mèo để tăng level/skin (FOOD bị burn/thu về Treasury).
4) Giao dịch CatNFT bằng PAW trên marketplace.
5) Treasury thu fee (từ game + marketplace) → dùng cho reward/airdrop/sự kiện.

### 18.6 Env GameFi & Triển khai mở rộng

| Key | Mô tả |
| --- | --- |
| FOOD_TOKEN | Địa chỉ token FOOD |
| PAW_TOKEN | Địa chỉ token PAW |
| CAT_NFT | Địa chỉ CatNFT |
| CAT_MARKET | (Tuỳ chọn) Địa chỉ marketplace nội bộ |

### 18.7 Cân bằng & Rủi ro

| Rủi ro | Giảm thiểu |
| --- | --- |
| Lạm phát FOOD | Tổng cung cố định + sink (burn/feed/fee) |
| Abuse feed bot | Giới hạn feed/ngày; owner-only; cooldown |
| Reentrancy marketplace | CEI + ReentrancyGuard |
| Phishing allowance | SafeERC20; hướng dẫn revoke allowance |

### 18.8 Tích hợp UI

- Inventory: CatNFT + Level + XP progress.
- Feed UI: amountFOOD; nút "Feed Me!"; progress bar; tooltip chi phí.
- Marketplace: Danh sách mèo; filter/sort; link OpenSea; (v2) buy/list/cancel on-chain.
- Dashboard: Tổng FOOD/PAW, lịch sử vòng, leaderboard mèo.

---

## 19. DevOps, Deploy & Verify (S1.4)

### 19.1 Scope

- Deploy script (Hardhat/Foundry) cho Base/Polygon testnet.
- Verify trên Etherscan (Basescan/Polygonscan) hoặc Sourcify.
- Ghi lại địa chỉ, chain, block; cập nhật FE .env.

### 19.2 Acceptance Criteria

- Contract address + verify link có hiệu lực.
- FE được cập nhật VITE_CONTRACT_ADDRESS.
- scripts/README.md có hướng dẫn deploy/verify + đường dẫn lưu kết quả.

### 19.3 Env bắt buộc

- PRIVATE_KEY — Deployer (0x-prefixed)
- BASE_SEPOLIA_RPC, POLYGON_MUMBAI_RPC — RPC URLs
- BASESCAN_API_KEY, POLYGONSCAN_API_KEY — Explorer API keys
- Optional: FRONTEND_ENV_PATH để override frontend/.env

### 19.4 Gợi ý cấu trúc output

```json
{
  "network": "base-sepolia",
  "address": "0x...",
  "blockNumber": 1234567,
  "verifyUrl": "https://base-sepolia.basescan.org/address/0x...",
  "updatedAt": 1730000000
}
```

- Append scripts/README.md với hướng dẫn chạy, tham số, và link verify.

---

## 20. Quy định & Chính sách người dùng

- Minh bạch rủi ro game (mất tiền do thua/no-reveal).
- Yêu cầu bảo quản seed/private key; dApp không chịu trách nhiệm mất mát do người dùng.
- Điều khoản sử dụng: không khuyến khích lạm dụng Sybil; tôn trọng pháp luật địa phương.

---

## 21. Roadmap rút gọn

- MVP (v1): Core minority game (native/FOOD), FE cơ bản, indexer, deploy testnet.
- v1.1: Feed CatNFT (CatCare), OpenSea integration.
- v1.2: Marketplace nội bộ (PAW), royalty, sự kiện mini.
- v2: Stake động, >2 tribes, VRF mini-event, proxy upgrade, multi-sig/timelock.

---

Document synced with `chocochoco/README.md`. For major changes, update both.

