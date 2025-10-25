# ChocoChoco Frontend

Stack: React + Tailwind + wagmi + viem.

Core (Minority Game):
- Join (Commit)
- Reveal
- Claim
- Round schedule & countdown

GameFi screens (đề xuất):
- Inventory (danh sách CatNFT, chi tiết metadata)
- Chest (mua/mở rương bằng `$PAW`, hiện kết quả)
- Marketplace (liệt kê/đi link Seaport/OpenSea; về sau có thể mua/bán nội bộ)
- Feed (tiêu `$FOOD` để nâng cấp/thay skin – mở dần)

Wallet/Config:
- wagmi connectors (MetaMask, WalletConnect)
- Mạng: Base/Polygon testnet/mainnet
- Env: `VITE_CONTRACT_ADDRESS`, `VITE_STAKE_TOKEN`, `VITE_FOOD_TOKEN`, `VITE_PAW_TOKEN`, `VITE_CAT_NFT`, `VITE_CHEST_ADDRESS`

Data/Indexing: 
- Subgraph (The Graph/SubQuery) để hiển thị lịch sử round, leaderboard, inventory, sự kiện mở rương.

Tài liệu liên quan:
- Hợp đồng: `../contracts/README.md`
- Thiết kế: `../DESIGN.md`
- Sprint: `../SPRINT_PLAN.md`
- GameFi: `../docs/gamefi/ECONOMY.md`, `../docs/gamefi/NFTS.md`, `../docs/gamefi/CHESTS.md`, `../docs/gamefi/MARKETPLACE.md`
