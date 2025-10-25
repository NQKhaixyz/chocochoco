# ChocoChoco Contracts

On-chain smart contracts for ChocoChoco, scaffolded with **Foundry**.

![CI](https://github.com/Dle28/MICA-E.Dapp/actions/workflows/chocochoco-contracts-ci.yml/badge.svg)

## Prerequisites

- `foundryup` installed (see <https://book.getfoundry.sh/getting-started/installation>)
- Node.js (optional, for scripting helpers)

## Project layout

- `foundry.toml` — Foundry configuration (remappings, RPC endpoints, Etherscan keys)
- `lib/openzeppelin-contracts` — placeholder directory; install real dependency via `forge install`
- `src/ChocoChocoGame.sol` — minority commit/reveal (v1 native, v2 ERC-20 stake)
- `test/ChocoChocoGame.t.sol` — TDD seed verifying version + default params
- `script/DeployChocoChocoGame.s.sol` — minimal deployment script

GameFi modules (đề xuất; thêm dần trong `src/`):
- `FoodToken.sol` (ERC20) — `$FOOD`, dùng để “feed”; cũng là `stakeToken` cho minority game (xem issue S2.3 ERC-20 support)
- `PawToken.sol` (ERC20) — `$PAW`, dùng để mua rương
- `CatNFT.sol` (ERC721) — NFT mèo với rarity/skin
- `LootChest.sol` — mua/mở rương, mint CatNFT; pseudo-random/VRF
- (tùy chọn) `CatMarket.sol` — marketplace nội bộ tối giản (khởi đầu có thể dùng Seaport)

## Setup

```bash
cd contracts
foundryup                 # only if Foundry not yet installed
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit  # optional but recommended when extending tests
```

## Run tests

```bash
forge test
```

## Deploy (example)

```bash
forge script script/DeployChocoChocoGame.s.sol:DeployChocoChocoGame \
	--rpc-url $BASE_SEPOLIA_RPC \
	--broadcast
```

Contract spec and API are defined in `../DESIGN.md`.

### ERC-20 stake (S2.3)
- Bật đường đi ERC-20 cho stake để người chơi “chơi để kiếm” thêm `$FOOD`.
- Env khuyến nghị: `STAKE_TOKEN=$FOOD_TOKEN`.

### GameFi addresses (gợi ý env)
- `FOOD_TOKEN`, `PAW_TOKEN`, `CAT_NFT`, `CHEST_ADDRESS`

### Security notes
- Pull-payment (claim) cho payout; tránh vòng lặp lớn.
- ReentrancyGuard ở các chỗ chuyển tiền/token; CEI.
- Nếu dùng VRF, cô lập chức năng fulfill và kiểm tra nguồn randomness.
