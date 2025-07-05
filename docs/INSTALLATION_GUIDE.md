# GNOME Shell拡張機能の配置とリロード手順

## 拡張機能情報
- **拡張機能ID**: `window-3split@fumitaka.github.io`
- **対象GNOME Shell**: バージョン 42

## 1. 拡張機能の初回インストール

### 必要なファイル
- `extension.js` - メイン機能
- `metadata.json` - 拡張機能のメタデータ
- `prefs.js` - 設定画面
- `schemas/` - 設定スキーマディレクトリ

### インストール手順
```bash
# 現在の作業ディレクトリから実行
cd /home/fumitaka/src/window_3split_extention

# インストール先ディレクトリを作成
mkdir -p ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io

# 必要なファイルをコピー
cp extension.js ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/
cp metadata.json ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/
cp prefs.js ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/
cp -r schemas ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/

# スキーマをコンパイル
glib-compile-schemas ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/schemas/
```

### 拡張機能の有効化
```bash
# 拡張機能を有効化
gnome-extensions enable window-3split@fumitaka.github.io
```

## 2. コード修正後の更新手順

### extension.jsのみを修正した場合
```bash
# 1. 拡張機能を無効化
gnome-extensions disable window-3split@fumitaka.github.io

# 2. 修正されたファイルをコピー
cp extension.js ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/

# 3. 拡張機能を再有効化
gnome-extensions enable window-3split@fumitaka.github.io
```

### 複数ファイルを修正した場合
```bash
# 1. 拡張機能を無効化
gnome-extensions disable window-3split@fumitaka.github.io

# 2. 修正されたファイルをコピー（必要に応じて選択）
cp extension.js ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/
cp prefs.js ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/
cp metadata.json ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/

# 3. スキーマファイルを修正した場合は再コンパイル
cp -r schemas ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/
glib-compile-schemas ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/schemas/

# 4. 拡張機能を再有効化
gnome-extensions enable window-3split@fumitaka.github.io
```

## 3. 動作確認

### 拡張機能の状態確認
```bash
# インストール済み拡張機能の一覧表示
gnome-extensions list

# 特定の拡張機能の状態確認
gnome-extensions info window-3split@fumitaka.github.io

# 有効な拡張機能のみ表示
gnome-extensions list --enabled
```

### キーバインディングの確認
- **左寄せ2/3**: `Ctrl + Super + Left`
- **右寄せ2/3**: `Ctrl + Shift + Super + Right`
- **右寄せ1/3**: `Ctrl + Super + Right`
- **左寄せ1/3**: `Ctrl + Shift + Super + Left`

## 4. トラブルシューティング

### ログの確認
```bash
# GNOME Shellのログを確認
journalctl -f -o cat /usr/bin/gnome-shell

# または
journalctl -f | grep -i "window3split"
```

### 完全な再起動が必要な場合
```bash
# GNOME Shellの再起動（Alt+F2で「r」を入力してEnter）
# または完全にログアウト/ログイン
```

### 拡張機能の削除
```bash
# 拡張機能を無効化
gnome-extensions disable window-3split@fumitaka.github.io

# ファイルを削除
rm -rf ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io
```

## 5. 開発時の便利なコマンド

### ワンライナーでの更新
```bash
# extension.jsの更新と再有効化を一度に実行
gnome-extensions disable window-3split@fumitaka.github.io && cp extension.js ~/.local/share/gnome-shell/extensions/window-3split@fumitaka.github.io/ && gnome-extensions enable window-3split@fumitaka.github.io
```

### 設定の確認
```bash
# 現在の設定値を確認
gsettings list-recursively org.gnome.shell.extensions.window-3split
```

## 注意事項
- ファイルを修正した後は必ず拡張機能の無効化→有効化を行ってください
- スキーマファイルを修正した場合は必ず再コンパイルが必要です
- エラーが発生した場合はログを確認してデバッグしてください
