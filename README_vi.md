## Ngôn ngữ / Languages / 言語 / 语言 / 語言 / 언어

- [English](README.md)
- [日本語](README_ja.md)
- [简体中文](README_zh_CN.md)
- [繁體中文](README_zh_TW.md)
- [繁體中文（香港）](README_zh_HK.md)
- [Tiếng Việt](README_vi.md)
- [한국어](README_ko.md)

# UltraWideSnapperTwoThirds

Một tiện ích mở rộng GNOME Shell được thiết kế cho người dùng màn hình siêu rộng 21:9 để sắp xếp cửa sổ hiệu quả bằng phím tắt. Tiện ích này cho phép bạn nhanh chóng định vị cửa sổ trong các phần 2/3 hoặc 1/3 của màn hình, căn trái hoặc căn phải, tối đa hóa năng suất và tận dụng tối đa chiều rộng màn hình.

## Tổng quan

UltraWideSnapperTwoThirds nâng cao trải nghiệm đa nhiệm của bạn trên màn hình siêu rộng bằng cách cung cấp bốn chức năng định vị cửa sổ cơ bản:

- **Trái 2/3**: Định vị cửa sổ ở phía bên trái với chiều rộng 2/3 màn hình
- **Phải 2/3**: Định vị cửa sổ ở phía bên phải với chiều rộng 2/3 màn hình
- **Trái 1/3**: Định vị cửa sổ ở phía bên trái với chiều rộng 1/3 màn hình
- **Phải 1/3**: Định vị cửa sổ ở phía bên phải với chiều rộng 1/3 màn hình

**Môi trường được hỗ trợ:**
- Ubuntu 22.04 (và các bản phân phối tương thích)
- GNOME Shell 42.x
- Phiên Wayland
- Màn hình siêu rộng 21:9 (khuyến nghị)

## Bắt đầu nhanh

### Điều kiện tiên quyết

Trước khi cài đặt, hãy đảm bảo bạn có các công cụ cần thiết:

```bash
# Ubuntu/Debian
sudo apt install gettext glib2.0-dev-bin zip

# Fedora/RHEL
sudo dnf install gettext glib2-devel zip

# Arch Linux
sudo pacman -S gettext glib2 zip
```

### Phương pháp 1: Sử dụng make install

Cách nhanh nhất để cài đặt và kích hoạt tiện ích:

```bash
# Xây dựng và cài đặt
make install

# Khởi động lại GNOME Shell (đăng xuất và đăng nhập lại)
# Sau đó kích hoạt tiện ích
gnome-extensions enable uws2t@muyesh.github.io
```

### Phương pháp 2: Cài đặt thủ công

Để kiểm soát tốt hơn quá trình cài đặt:

```bash
# Xây dựng tiện ích
make build

# Sao chép vào thư mục tiện ích
cp -r build/uws2t@muyesh.github.io ~/.local/share/gnome-shell/extensions/

# Khởi động lại GNOME Shell (đăng xuất và đăng nhập lại)
# Sau đó kích hoạt tiện ích
gnome-extensions enable uws2t@muyesh.github.io
```

**Quan trọng:** Sau khi cài đặt, bạn phải khởi động lại GNOME Shell bằng cách đăng xuất và đăng nhập lại. Tiện ích sẽ không được nhận diện cho đến khi GNOME Shell được khởi động lại.

### Xác minh cài đặt

Kiểm tra xem tiện ích đã được kích hoạt chưa:

```bash
gnome-extensions list --enabled | grep uws2t
```

## Tính năng

### Chức năng định vị cửa sổ

| Chức năng | Phím tắt mặc định | Mô tả |
|-----------|-------------------|-------|
| Trái 2/3 | `Ctrl+Super+Left` | Định vị cửa sổ ở phía trái với chiều rộng 2/3 |
| Phải 2/3 | `Ctrl+Shift+Super+Right` | Định vị cửa sổ ở phía phải với chiều rộng 2/3 |
| Phải 1/3 | `Ctrl+Super+Right` | Định vị cửa sổ ở phía phải với chiều rộng 1/3 |
| Trái 1/3 | `Ctrl+Shift+Super+Left` | Định vị cửa sổ ở phía trái với chiều rộng 1/3 |

### Cách hoạt động

Mỗi chức năng định vị hoạt động theo ba bước:

1. **Bỏ tối đa hóa**: Nếu cửa sổ đã được tối đa hóa, nó sẽ được bỏ tối đa hóa trước
2. **Tính toán kích thước**: Xác định chiều rộng mục tiêu (1/3 hoặc 2/3 vùng làm việc)
3. **Định vị**: Di chuyển và thay đổi kích thước cửa sổ đến vị trí và kích thước đã tính toán

### Tùy chỉnh

Bạn có thể tùy chỉnh phím tắt thông qua tùy chọn tiện ích:

```bash
gnome-extensions prefs uws2t@muyesh.github.io
```

![Bảng cấu hình](docs/config_panel.png)

## Cài đặt & Xây dựng

### Hệ thống xây dựng

Tiện ích này sử dụng hệ thống xây dựng dựa trên Makefile với các mục tiêu chính sau:

| Mục tiêu | Mô tả |
|----------|-------|
| `make build` | Biên dịch bản dịch và lược đồ |
| `make install` | Xây dựng và cài đặt tiện ích cục bộ |
| `make package` | Tạo gói zip phân phối |
| `make clean-all` | Xóa tất cả các tệp được tạo |

### Quy trình xây dựng chi tiết

1. **Biên dịch bản dịch** (nếu bạn đã sửa đổi các tệp dịch):
   ```bash
   make compile-translations
   ```

2. **Biên dịch lược đồ GSettings**:
   ```bash
   make compile-schemas
   ```

3. **Xây dựng đầy đủ**:
   ```bash
   make build
   ```

4. **Tạo gói phân phối**:
   ```bash
   make package
   ```

### Gỡ cài đặt

Để xóa tiện ích:

```bash
make uninstall
```

## Cấu trúc dự án

```
uws2t@muyesh.github.io/
├── extension.js              # Chức năng tiện ích chính
├── prefs.js                  # Giao diện cài đặt/tùy chọn
├── metadata.json             # Siêu dữ liệu tiện ích
├── convenience.js            # Hàm tiện ích
├── schemas/                  # Lược đồ GSettings
│   ├── org.gnome.shell.extensions.uws2t.gschema.xml
│   └── gschemas.compiled
├── locale/                   # Bản dịch đã biên dịch
│   └── */LC_MESSAGES/*.mo
├── po/                       # Nguồn bản dịch
│   ├── *.po                  # Tệp dịch
│   └── *.pot                 # Mẫu dịch
├── build/                    # Thư mục đầu ra xây dựng
├── Makefile                  # Hệ thống xây dựng
├── release.sh               # Script tự động hóa phát hành
└── validate.sh              # Script xác thực gói
```

### Tệp chính

- **extension.js**: Chứa logic định vị cửa sổ chính và trình xử lý phím tắt
- **prefs.js**: Cung cấp hộp thoại tùy chọn để tùy chỉnh phím tắt
- **metadata.json**: Định nghĩa siêu dữ liệu tiện ích bao gồm UUID, phiên bản và các phiên bản GNOME Shell được hỗ trợ
- **schemas/**: Chứa định nghĩa lược đồ GSettings để lưu trữ tùy chọn người dùng

## Phát triển

### Thiết lập môi trường phát triển

1. **Sao chép kho lưu trữ**:
   ```bash
   git clone https://github.com/muyesh/uws2t.git
   cd uws2t
   ```

2. **Cài đặt phụ thuộc phát triển**:
   ```bash
   # Ubuntu/Debian
   sudo apt install gettext glib2.0-dev-bin
   ```

3. **Xây dựng và cài đặt để thử nghiệm**:
   ```bash
   make install
   ```

### Thêm bản dịch

1. **Trích xuất chuỗi có thể dịch**:
   ```bash
   make extract-strings
   ```

2. **Cập nhật bản dịch hiện có**:
   ```bash
   make update-po
   ```

3. **Thêm ngôn ngữ mới** (thay thế `LANG` bằng mã ngôn ngữ):
   ```bash
   # Thêm LANG vào LANGUAGES trong Makefile
   # Tạo tệp po/LANG.po
   make update-po
   ```

4. **Biên dịch bản dịch**:
   ```bash
   make compile-translations
   ```

### Ngôn ngữ được hỗ trợ

Các ngôn ngữ hiện được hỗ trợ:
- Tiếng Anh (en)
- Tiếng Nhật (ja)
- Tiếng Trung giản thể (zh_CN)
- Tiếng Trung phồn thể (zh_TW)
- Tiếng Trung phồn thể (Hong Kong) (zh_HK)
- Tiếng Việt (vi)
- Tiếng Hàn (ko)

### Quy trình phát triển

1. **Thực hiện thay đổi** đối với các tệp nguồn
2. **Thử nghiệm cục bộ**:
   ```bash
   make install
   # Đăng xuất/đăng nhập để khởi động lại GNOME Shell
   gnome-extensions enable uws2t@muyesh.github.io
   ```
3. **Kiểm tra nhật ký** nếu cần:
   ```bash
   journalctl -f -o cat /usr/bin/gnome-shell | grep UltraWideSnapperTwoThirds
   ```

## Giấy phép

MIT License

Copyright (c) 2025 Shizhuo Muye

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

**Lưu ý:** Tiện ích này được phát triển với sự hỗ trợ của công nghệ AI tạo sinh để nâng cao hiệu quả phát triển và chất lượng mã.
