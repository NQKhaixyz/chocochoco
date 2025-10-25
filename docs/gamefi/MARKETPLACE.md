# Marketplace (Seaport / Nội bộ)

Giai đoạn đầu, sử dụng Seaport/OpenSea để giao dịch CatNFT nhằm giảm độ phức tạp.

## Tích hợp Seaport (khuyến nghị MVP)

- Tạo trang FE hiển thị inventory và nút “View on OpenSea”.
- Có thể thêm nút “List on Seaport” dùng SDK/URL chuẩn.
- Phí bản quyền (royalty) khai báo trong chuẩn ERC-2981 của `CatNFT` (tùy chọn).

## Marketplace nội bộ (tuỳ chọn v2+)

- `list(tokenId, pricePAW)` — người bán ký gửi NFT vào hợp đồng, đặt giá bằng `$PAW`.
- `buy(tokenId)` — người mua trả `$PAW`, nhận NFT; fee → Treasury.
- Sự kiện: `Listed`, `Sold`, `Cancelled`.

## Lưu ý bảo mật

- Tránh reentrancy ở chuyển NFT/PAW (dùng CEI + ReentrancyGuard).
- Kiểm tra quyền sở hữu, trạng thái niêm yết.
- Hạn chế storage không cần thiết, tối ưu gas.

