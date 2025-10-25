# Loot Chests (Gacha)

Mua rương bằng `$PAW` → mở rương → mint CatNFT theo tỉ lệ hiếm.

## Hành vi (MVP)

- `buy(amount)` — thu PAW, ghi số rương người chơi sở hữu.
- `open()` — tiêu 1 rương, sinh kết quả random, mint CatNFT cho người chơi.
- Randomness: pseudo-random dựa trên `blockhash` + `userNonce` + `msg.sender` (cảnh báo UX: chỉ testnet/MVP).
- Phí: `buy()` có thể burn một phần PAW hoặc chuyển Treasury.

## Hành vi (v2)

- Chainlink VRF: an toàn kết quả; cần thêm flow request/fulfill.
- Có thể tách `open()` thành 2 bước: request → fulfill → claim.

## Tỉ lệ hiếm (đề xuất)

- Common: 60%
- Rare: 25%
- Epic: 10%
- Legendary: 5%

Có thể chia tiếp theo `family` hoặc `skin` pool.

## Sự kiện

- `ChestBought(address user, uint256 amount, uint256 cost)`
- `ChestOpened(address user, uint256 tokenId, string rarity)`

## Bảo mật

- Pseudo-random chỉ dùng cho MVP/testnet; ghi chú rõ trong README/FE.
- Giới hạn `open()` mỗi block nếu cần; thêm `userNonce` để giảm trùng kết quả.
- Với VRF: kiểm tra caller của `fulfillRandomWords` và ánh xạ requestId → user.

