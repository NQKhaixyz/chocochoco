# GameFi Economy (FOOD, PAW, Treasury)

Mục tiêu: đơn giản – minh bạch – dễ tích hợp minority game.

- FOOD — ChocoFood (ERC-20)
  - Công dụng: nuôi mèo (feed), nâng cấp/đổi skin (sink kinh tế), có thể mở theo giai đoạn.
  - Nguồn: người chơi kiếm thêm thông qua minority game khi `stakeToken=FOOD`; ngoài ra “tự cày” (up later) hoặc phân phối sự kiện.
  - Lưu ý: minority game không mint mới; chỉ phân phối lại FOOD giữa người chơi (trừ fee Treasury).

- PAW — CatCoin (ERC-20)
  - Công dụng: mua “Loot Chest”.
  - Nguồn: bán token, thưởng sự kiện, swap.
  - Dòng tiền: một phần PAW khi mua rương bị burn hoặc chuyển vào Treasury.

- CatNFT — ERC-721
  - Sở hữu mèo, có `rarity`, `skin`, `family`, `level`, `generation`.
  - Được mint khi mở rương.

- Treasury
  - Nhận crumb fee (minority game) và một phần doanh thu rương (PAW) / phí marketplace.
  - Sử dụng cho vận hành, phần thưởng, buyback/burn nếu cần.

## Dòng chảy chính

1) Minority game với stake FOOD: người thắng nhận thêm FOOD từ bên thua (sau fee). Không tạo lạm phát FOOD.
2) Người chơi dùng PAW để mua rương → mở → nhận CatNFT.
3) Người chơi có thể bán CatNFT trên marketplace (Seaport) → nhận PAW hoặc native.
4) Người chơi dùng FOOD để “feed” mèo (tăng cấp/skin), gia tăng giá trị sưu tầm (sink FOOD).

## Tham số khuyến nghị (MVP)

- feeBps (minority): 300 (3%)
- Giá rương: 100–500 PAW (tùy cân bằng)
- Burn PAW khi mua rương: 20–50%
- Tỉ lệ hiếm: xem CHESTS.md

## Biến môi trường

- `STAKE_TOKEN` — bật stake bằng ERC-20; khuyến nghị trỏ = `FOOD_TOKEN`
- `FOOD_TOKEN`, `PAW_TOKEN`, `CAT_NFT`, `CHEST_ADDRESS`

## Rủi ro & lưu ý

- Nếu mở cơ chế “tự cày” FOOD: kiểm soát tốc độ phát hành để tránh lạm phát.
- Drop rate rương cần cân bằng với giá rương và nguồn cung FOOD/PAW.
- Với VRF: chi phí gas cao hơn; cân nhắc chỉ VRF ở mainnet.

