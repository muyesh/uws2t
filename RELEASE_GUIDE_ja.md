# Window 3Split Extension リリースガイド

このガイドでは、Window 3Split GNOME Shell拡張機能のビルド、パッケージング、リリース方法について説明します。

## 前提条件

### 必要なツール

以下のツールがインストールされていることを確認してください：

```bash
# Ubuntu/Debian
sudo apt install gettext glib2.0-dev-bin zip

# Fedora/RHEL
sudo dnf install gettext glib2-devel zip

# Arch Linux
sudo pacman -S gettext glib2 zip
```

### オプションのツール

検証機能を強化するため：
- `python3` - JSON構文検証
- `node` - JavaScript構文検証
- `xmllint` - XMLスキーマ検証

## クイックスタート

### 1. ビルドとパッケージング

```bash
# フルビルドとパッケージング
make package

# または段階的に
make build      # 翻訳とスキーマのコンパイル
make validate   # パッケージの検証
```

### 2. 自動リリース

```bash
# インタラクティブリリース（初回推奨）
./release.sh

# パッチバージョンアップ
./release.sh --patch

# マイナーバージョンアップ
./release.sh --minor

# メジャーバージョンアップ
./release.sh --major

# 特定のバージョン指定
./release.sh --version 1.2.3
```

## ビルドシステム

### Makefileターゲット

| ターゲット | 説明 |
|-----------|------|
| `all` | フルビルド（デフォルト） |
| `build` | 翻訳とスキーマのコンパイル |
| `compile-translations` | .poファイルから.moファイルをビルド |
| `compile-schemas` | GSettingsスキーマのコンパイル |
| `package` | 配布用zipパッケージの作成 |
| `install` | 拡張機能のローカルインストール |
| `uninstall` | 拡張機能のアンインストール |
| `validate` | パッケージ内容の検証 |
| `reload` | 拡張機能の再読み込み（無効化/有効化） |
| `clean` | 生成された.moファイルの削除 |
| `clean-all` | 全ての生成ファイルの削除 |
| `stats` | 翻訳統計の表示 |
| `info` | パッケージ情報の表示 |

### 翻訳管理

```bash
# 翻訳可能な文字列の抽出
make extract-strings

# 翻訳ファイルの更新
make update-po

# 翻訳のコンパイル
make compile-translations

# 翻訳統計の表示
make stats
```

## リリースプロセス

### 1. 準備

1. **翻訳の更新**（必要に応じて）：
   ```bash
   make extract-strings
   make update-po
   # 必要に応じて.poファイルを編集
   ```

2. **拡張機能のローカルテスト**：
   ```bash
   make install
   gnome-extensions enable window-3split@fumitaka.github.io
   # 機能をテスト
   ```

3. **未コミットの変更の確認**：
   ```bash
   git status
   git add .
   git commit -m "Prepare for release"
   ```

### 2. バージョン管理

拡張機能はセマンティックバージョニング（MAJOR.MINOR.PATCH）を使用します：

- **PATCH** (x.y.Z): バグ修正、翻訳
- **MINOR** (x.Y.0): 新機能、後方互換性あり
- **MAJOR** (X.0.0): 破壊的変更

バージョンは`metadata.json`に保存されます：
```json
{
  "version": "1.2.3"
}
```

### 3. 自動リリース

リリーススクリプトを使用した自動ビルド：

```bash
# インタラクティブモード
./release.sh

# 自動パッチリリース
./release.sh --patch

# テストをスキップ（非推奨）
./release.sh --patch --skip-tests

# パッケージングをスキップ（テスト用）
./release.sh --patch --skip-package
```

### 4. 手動リリース

手動制御を希望する場合：

```bash
# 1. metadata.jsonのバージョンを更新
vim metadata.json

# 2. ビルドとパッケージング
make clean-all
make package

# 3. パッケージの検証
make validate
# または
./validate.sh

# 4. パッケージのテスト
unzip -l dist/window-3split@fumitaka.github.io-v*.zip
```

## パッケージ検証

### 自動検証

```bash
# 最新パッケージの検証
./validate.sh

# 特定パッケージの検証
./validate.sh dist/window-3split@fumitaka.github.io-v1.2.3.zip
```

### 手動検証チェックリスト

- [ ] 必要なファイルがすべて存在
- [ ] metadata.jsonが有効なJSON構文
- [ ] UUIDが期待値と一致
- [ ] バージョンがセマンティックバージョニングに従っている
- [ ] GSettingsスキーマがコンパイル済み
- [ ] 翻訳ファイル（.mo）が存在
- [ ] デバッグコード（console.logなど）がない
- [ ] 一時/バックアップファイルがない
- [ ] 適切なファイル権限

## 配布

### 1. ローカルインストール

```bash
# テスト用インストール
make install

# 拡張機能を有効化
gnome-extensions enable window-3split@fumitaka.github.io

# ステータス確認
gnome-extensions list --enabled | grep window-3split
```

### 2. GNOME Extensions ウェブサイト

1. [extensions.gnome.org](https://extensions.gnome.org) にアクセス
2. アカウントでサインイン
3. `dist/`ディレクトリからzipパッケージをアップロード
4. 拡張機能の詳細を入力
5. レビュー用に提出

### 3. GitHub Releases

```bash
# リリースにタグを付ける
git tag v1.2.3
git push origin v1.2.3

# GitHubリリースを作成
# zipファイルをアセットとしてアップロード
```

### 4. 手動配布

`dist/`のzipパッケージは直接配布可能：
- メール添付
- ファイル共有サービス
- ウェブサイトからの直接ダウンロード

## トラブルシューティング

### ビルドの問題

**問題**: `msgfmt: command not found`
```bash
# 解決策: gettextをインストール
sudo apt install gettext
```

**問題**: `glib-compile-schemas: command not found`
```bash
# 解決策: glib開発ツールをインストール
sudo apt install glib2.0-dev-bin
```

**問題**: 翻訳ファイルが見つからない
```bash
# 解決策: まず翻訳をコンパイル
make compile-translations
```

### パッケージの問題

**問題**: パッケージ検証が失敗
```bash
# 何が問題かを確認
./validate.sh

# 一般的な修正:
make clean-all
make build
```

**問題**: 拡張機能が読み込まれない
```bash
# GNOME Shellログを確認
journalctl -f -o cat /usr/bin/gnome-shell

# GNOME Shellを再起動（X11のみ）
Alt+F2, 'r'と入力, Enterを押す
```

### インストールの問題

**問題**: 拡張機能がリストに表示されない
```bash
# インストールディレクトリを確認
ls ~/.local/share/gnome-shell/extensions/

# 再インストール
make uninstall
make install
```

**問題**: 設定が動作しない
```bash
# スキーマがインストールされているか確認
ls ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/schemas/

# スキーマを再コンパイル
make compile-schemas
make install
```

## 開発ワークフロー

### 日常の開発

```bash
# コードを変更
vim extension.js

# 変更をテスト
make reload

# 必要に応じてログを確認
journalctl -f -o cat /usr/bin/gnome-shell
```

### コミット前

```bash
# 文字列が変更された場合は翻訳を更新
make extract-strings
make update-po

# ビルドをテスト
make clean-all
make build

# 検証
./validate.sh
```

### リリース準備

```bash
# フルリリースプロセス
./release.sh --patch

# または手動プロセス
make clean-all
make package
./validate.sh
```

## ファイル構造

```
window-3split@fumitaka.github.io/
├── extension.js              # メイン拡張機能コード
├── prefs.js                  # 設定ダイアログ
├── metadata.json             # 拡張機能メタデータ
├── convenience.js            # ユーティリティ関数
├── schemas/                  # GSettingsスキーマ
│   ├── *.gschema.xml        # スキーマ定義
│   └── gschemas.compiled    # コンパイル済みスキーマ
├── locale/                   # コンパイル済み翻訳
│   └── */LC_MESSAGES/*.mo   # バイナリ翻訳ファイル
├── po/                       # 翻訳ソース
│   ├── *.po                 # 翻訳ファイル
│   └── *.pot                # 翻訳テンプレート
├── Makefile                  # ビルドシステム
├── release.sh               # リリース自動化
├── validate.sh              # パッケージ検証
└── RELEASE_GUIDE_ja.md      # このファイル
```

## ベストプラクティス

1. **リリース前に必ずローカルテスト**を実行
2. **セマンティックバージョニング**を一貫して使用
3. **新しい文字列を追加した際は翻訳を更新**
4. **配布前にパッケージを検証**
5. **主要な変更についてはリリースノートを保持**
6. **可能な場合はクリーンなシステムでテスト**
7. **GNOME拡張機能ガイドラインに従う**

## サポート

- ログの確認: `journalctl -f -o cat /usr/bin/gnome-shell`
- セーフモードでテスト: 他の拡張機能を無効化
- パッケージの検証: `./validate.sh`
- クリーンリビルド: `make clean-all && make package`
