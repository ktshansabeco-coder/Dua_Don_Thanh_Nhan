# Website Dừa Dòn Thành Nhân

Trang tĩnh (HTML + CSS + JavaScript thuần), chạy được trên GitHub Pages.

## Cấu trúc
- `index.html` – trang chính (SEO, OpenGraph, Schema.org)
- `assets/css/styles.css`, `assets/js/app.js`
- `data/products.json` – cấu hình thương hiệu, giá, sản phẩm gợi ý
- `assets/images/` – ảnh sản phẩm

## Thay ảnh thật
Chép ảnh chụp thật vào `assets/images/` đúng tên (ghi đè là nhận ngay):
`hero-dua-don-1.jpg`, `can-canh-dua-say.jpg`, `dua-don-topping.jpg`, `goi-250g-500g.jpg`.
Ảnh sản phẩm gợi ý đặt tên theo mã: `BDN.jpg`, `BRG.jpg`, `KMS.jpg`, `CSD.jpg`, `DD-250.jpg`, `DD-500.jpg`.
Chưa có ảnh thì web tự hiện hình minh họa dự phòng, không bị vỡ giao diện.

## Sửa số điện thoại / Zalo / giá
Sửa **hai nơi cho đồng bộ**: `data/products.json` và hằng số `FALLBACK` đầu file `assets/js/app.js`
(bản dự phòng dùng khi mở trực tiếp bằng `file://`).
- Trường `phone`, `zalo`, `address`, `email`, `facebookUrl`, `ownerName`, `shipFee`
- Giá nằm trong `variants[].price` (đơn vị đồng, không dấu chấm)
- Trường còn dạng `[...]` sẽ hiện thông báo lịch sự thay vì gọi/nhắn.
- Giá hiển thị trong `index.html` (JSON-LD, mô tả SEO) sửa tay nếu đổi giá.

## Chạy thử
- Nhấp đôi `index.html` (dùng dữ liệu dự phòng), hoặc
- `python3 -m http.server 8000` rồi mở http://localhost:8000

## Đưa lên GitHub Pages
1. Tạo repo mới, đẩy toàn bộ thư mục này lên nhánh `main`.
2. Settings → Pages → Source: `Deploy from a branch` → `main` / `(root)` → Save.
3. Sau 1–2 phút truy cập `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

## Lưu đơn tự động (tùy chọn)
Bản tĩnh không có backend. Có thể nối thêm:
- **Formspree**: tạo form, lấy URL, trong `app.js` thêm `fetch("https://formspree.io/f/XXXX",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({order:text})})` ngay trước `sendZalo(...)` ở sự kiện `submit`.
- **Google Sheets**: tạo Apps Script `doPost(e)` ghi dòng vào Sheet, triển khai dạng Web App, rồi `fetch` tới URL đó như trên (`mode:"no-cors"`).
- Thanh toán VNPay/MoMo và tồn kho thời gian thực cần backend riêng.
