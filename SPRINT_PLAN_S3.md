# Sprint 3 — GameFi Expansion (Proposal)

Mục tiêu: bổ sung lớp GameFi (token, rương, mèo, marketplace) trên nền minority game đã ổn định.

## Mục tiêu Sprint
- ERC-20 stake ($FOOD) hoạt động end-to-end với minority game (S2.3)
- Triển khai `$FOOD`, `$PAW`, `CatNFT`
- MVP rương (pseudo-random) + FE mua/mở
- Tích hợp Seaport cho giao dịch CatNFT từ FE

## Stories
- S3.1 GameFi economy & CatNFT (docs + contracts)
- S3.2 Loot Chests (Gacha) (contracts + FE)
- S3.3 Marketplace integration (FE + docs)

## Env & Deploy
- STAKE_TOKEN, FOOD_TOKEN, PAW_TOKEN, CAT_NFT, CHEST_ADDRESS

## Rủi ro
- Pseudo-random chỉ dùng cho testnet/MVP; ghi chú UX
- Cân bằng drop rate & giá rương

Xem chi tiết: `docs/gamefi/*` và `docs/issues/023-025`.
