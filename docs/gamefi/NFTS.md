# CatNFT (ERC-721)

CatNFT đại diện cho mèo sưu tầm với thuộc tính hiếm/skin/family.

## Metadata đề xuất

- name: "Choco Cat #1234"
- description: "A sweet feline from the ChocoChoco universe."
- image: ipfs://... (PNG/GIF/WebP)
- attributes (ERC-721 metadata standard):
  - trait_type: "Rarity" — value: Common | Rare | Epic | Legendary
  - trait_type: "Family" — value: Milk | Cacao | Matcha | Strawberry (về sau)
  - trait_type: "Skin" — value: e.g., "Vanilla Swirl", "Dark Cacao"
  - trait_type: "Generation" — value: 1
  - trait_type: "Level" — value: 1 (tăng bằng FOOD, optional v2)

Ví dụ JSON:

```json
{
  "name": "Choco Cat #1234",
  "description": "A sweet feline from the ChocoChoco universe.",
  "image": "ipfs://Qm...",
  "attributes": [
    {"trait_type": "Rarity", "value": "Rare"},
    {"trait_type": "Family", "value": "Milk"},
    {"trait_type": "Skin", "value": "Vanilla Swirl"},
    {"trait_type": "Generation", "value": 1},
    {"trait_type": "Level", "value": 1}
  ]
}
```

## Minting

- Chủ yếu thông qua `LootChest.open()`.
- Admin có thể có hàm `mintTo` cho sự kiện/airdrop.

## Lưu trữ asset

- Ưu tiên IPFS/Arweave. Có thể dùng baseURI + tokenURI.
- Bộ sưu tập small → có thể nén sprite sheet; FE cắt hiển thị.

## Cân bằng & mở rộng

- Có thể mở thêm `>2` family (Matcha, Strawberry) → cập nhật drop pool.
- Level/skin thay đổi sử dụng `$FOOD`; cần chuẩn hóa rule nâng cấp.

