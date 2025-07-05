# UltraWideSnapperTwoThirds

21:9ウルトラワイドモニターユーザー向けに設計されたGNOME Shell拡張機能です。キーボードショートカットを使用してウィンドウを効率的に配置し、画面の2/3または1/3のセクションに左右どちらかに配置できます。生産性を最大化し、モニターの幅を最大限に活用できます。

## 概要

UltraWideSnapperTwoThirdsは、4つの重要なウィンドウ配置機能を提供することで、ウルトラワイドモニターでのマルチタスク体験を向上させます：

- **左寄せ 2/3**: ウィンドウを画面の左側に2/3の幅で配置
- **右寄せ 2/3**: ウィンドウを画面の右側に2/3の幅で配置
- **左寄せ 1/3**: ウィンドウを画面の左側に1/3の幅で配置
- **右寄せ 1/3**: ウィンドウを画面の右側に1/3の幅で配置

**対応環境:**
- Ubuntu 22.04（および互換ディストリビューション）
- GNOME Shell 42.x
- Waylandセッション
- 21:9ウルトラワイドモニター（推奨）

## クイックスタート

### 前提条件

インストール前に、必要なツールがインストールされていることを確認してください：

```bash
# Ubuntu/Debian
sudo apt install gettext glib2.0-dev-bin zip

# Fedora/RHEL
sudo dnf install gettext glib2-devel zip

# Arch Linux
sudo pacman -S gettext glib2 zip
```

### 方法1: make installを使用

拡張機能をインストールして有効化する最も簡単な方法：

```bash
# ビルドとインストール
make install

# GNOME Shellを再起動（ログアウトしてログイン）
# その後拡張機能を有効化
gnome-extensions enable uws2t@muyesh.github.io
```

### 方法2: 手動インストール

インストールプロセスをより詳細に制御したい場合：

```bash
# 拡張機能をビルド
make build

# 拡張機能ディレクトリにコピー
cp -r build/uws2t@muyesh.github.io ~/.local/share/gnome-shell/extensions/

# GNOME Shellを再起動（ログアウトしてログイン）
# その後拡張機能を有効化
gnome-extensions enable uws2t@muyesh.github.io
```

**重要:** インストール後は、ログアウトしてログインし直すことでGNOME Shellを再起動する必要があります。GNOME Shellが再起動されるまで拡張機能は認識されません。

### インストールの確認

拡張機能が有効になっているかを確認：

```bash
gnome-extensions list --enabled | grep uws2t
```

## 機能

### ウィンドウ配置機能

| 機能 | デフォルトショートカット | 説明 |
|------|-------------------------|------|
| 左寄せ 2/3 | `Ctrl+Super+Left` | ウィンドウを左側に2/3の幅で配置 |
| 右寄せ 2/3 | `Ctrl+Shift+Super+Right` | ウィンドウを右側に2/3の幅で配置 |
| 右寄せ 1/3 | `Ctrl+Super+Right` | ウィンドウを右側に1/3の幅で配置 |
| 左寄せ 1/3 | `Ctrl+Shift+Super+Left` | ウィンドウを左側に1/3の幅で配置 |

### 動作の仕組み

各配置機能は3つのステップで動作します：

1. **最大化解除**: ウィンドウが最大化されている場合、まず最大化を解除
2. **サイズ計算**: 目標の幅（作業領域の1/3または2/3）を決定
3. **配置**: 計算された位置とサイズにウィンドウを移動・リサイズ

### カスタマイズ

拡張機能の設定からキーボードショートカットをカスタマイズできます：

```bash
gnome-extensions prefs uws2t@muyesh.github.io
```

## インストールとビルド

### ビルドシステム

この拡張機能は以下の主要なターゲットを持つMakefileベースのビルドシステムを使用しています：

| ターゲット | 説明 |
|-----------|------|
| `make build` | 翻訳とスキーマをコンパイル |
| `make install` | 拡張機能をビルドしてローカルにインストール |
| `make package` | 配布用zipパッケージを作成 |
| `make clean-all` | 生成されたファイルをすべて削除 |

### 詳細なビルドプロセス

1. **翻訳をコンパイル**（翻訳ファイルを変更した場合）：
   ```bash
   make compile-translations
   ```

2. **GSettingsスキーマをコンパイル**：
   ```bash
   make compile-schemas
   ```

3. **フルビルド**：
   ```bash
   make build
   ```

4. **配布パッケージを作成**：
   ```bash
   make package
   ```

### アンインストール

拡張機能を削除するには：

```bash
make uninstall
```

## プロジェクト構造

```
uws2t@muyesh.github.io/
├── extension.js              # メイン拡張機能
├── prefs.js                  # 設定・環境設定UI
├── metadata.json             # 拡張機能メタデータ
├── convenience.js            # ユーティリティ関数
├── schemas/                  # GSettingsスキーマ
│   ├── org.gnome.shell.extensions.uws2t.gschema.xml
│   └── gschemas.compiled
├── locale/                   # コンパイル済み翻訳
│   └── */LC_MESSAGES/*.mo
├── po/                       # 翻訳ソース
│   ├── *.po                  # 翻訳ファイル
│   └── *.pot                 # 翻訳テンプレート
├── build/                    # ビルド出力ディレクトリ
├── Makefile                  # ビルドシステム
├── release.sh               # リリース自動化スクリプト
└── validate.sh              # パッケージ検証スクリプト
```

### 主要ファイル

- **extension.js**: メインのウィンドウ配置ロジックとキーボードショートカットハンドラーを含む
- **prefs.js**: ショートカットをカスタマイズするための設定ダイアログを提供
- **metadata.json**: UUID、バージョン、対応GNOME Shellバージョンを含む拡張機能メタデータを定義
- **schemas/**: ユーザー設定を保存するためのGSettingsスキーマ定義を含む

## 開発

### 開発環境のセットアップ

1. **リポジトリをクローン**：
   ```bash
   git clone https://github.com/muyesh/uws2t.git
   cd uws2t
   ```

2. **開発依存関係をインストール**：
   ```bash
   # Ubuntu/Debian
   sudo apt install gettext glib2.0-dev-bin
   ```

3. **テスト用にビルドしてインストール**：
   ```bash
   make install
   ```

### 翻訳の追加

1. **翻訳可能な文字列を抽出**：
   ```bash
   make extract-strings
   ```

2. **既存の翻訳を更新**：
   ```bash
   make update-po
   ```

3. **新しい言語を追加**（`LANG`を言語コードに置き換え）：
   ```bash
   # MakefileのLANGUAGESにLANGを追加
   # po/LANG.poファイルを作成
   make update-po
   ```

4. **翻訳をコンパイル**：
   ```bash
   make compile-translations
   ```

### 対応言語

現在対応している言語：
- 英語 (en)
- 日本語 (ja)
- 中国語簡体字 (zh_CN)
- 中国語繁体字 (zh_TW)
- 中国語香港 (zh_HK)
- ベトナム語 (vi)
- 韓国語 (ko)

### 開発ワークフロー

1. **ソースファイルを変更**
2. **ローカルでテスト**：
   ```bash
   make install
   # ログアウト/ログインしてGNOME Shellを再起動
   gnome-extensions enable uws2t@muyesh.github.io
   ```
3. **必要に応じてログを確認**：
   ```bash
   journalctl -f -o cat /usr/bin/gnome-shell | grep UltraWideSnapperTwoThirds
   ```

## ライセンス

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

**注記:** この拡張機能は、開発効率とコード品質の向上のため、生成AI技術の支援を受けて開発されました。
