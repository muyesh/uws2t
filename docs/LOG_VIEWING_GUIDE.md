# GNOME Shell拡張機能 Window 3Split - ログ確認ガイド

## ログの確認方法

このGNOME Shell拡張機能では、標準的なGNOME Shellロギングシステムを使用しています。以下の方法でログを確認できます。

### 1. リアルタイムログ監視

拡張機能の動作をリアルタイムで監視するには：

```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

このコマンドを実行すると、GNOME Shellのログがリアルタイムで表示されます。拡張機能のショートカットを押すと、`[Window3Split]`で始まるログエントリが表示されます。

### 2. 拡張機能固有のログ検索

Window 3Split拡張機能のログのみを表示するには：

```bash
journalctl -g "Window3Split"
```

または、より詳細な検索：

```bash
journalctl -g "\[Window3Split\]"
```

### 3. 時間範囲を指定したログ検索

特定の時間範囲のログを確認するには：

```bash
# 過去1時間のログ
journalctl --since "1 hour ago" -g "Window3Split"

# 今日のログ
journalctl --since today -g "Window3Split"

# 特定の日時以降のログ
journalctl --since "2025-01-07 10:00:00" -g "Window3Split"
```

### 4. Looking Glass（デバッグコンソール）

GNOME Shellの内蔵デバッグツールを使用：

1. `Alt + F2` を押す
2. `lg` と入力してEnterを押す
3. Looking Glassが開きます
4. ここでJavaScriptコードを実行したり、ログを確認できます

### 5. ログレベルについて

拡張機能では以下のログレベルを使用しています：

- **INFO**: 一般的な情報（拡張機能の有効化/無効化、設定変更など）
- **DEBUG**: デバッグ情報（ショートカット呼び出し、詳細な動作情報）
- **ERROR**: エラー情報（例外、失敗した操作など）

### 6. ログ出力例

ショートカットを押したときの典型的なログ出力：

```
[Window3Split][DEBUG] 2025-01-07T05:44:00.000Z: 左寄せ2/3機能が呼び出されました
[Window3Split][INFO] 2025-01-07T05:44:00.001Z: === ウィンドウ情報 (左寄せ2/3) ===
[Window3Split][INFO] 2025-01-07T05:44:00.002Z: 現在のターゲットウィンドウ: 1200x800
[Window3Split][INFO] 2025-01-07T05:44:00.003Z: 現在の作業領域: 1920x1080
[Window3Split][INFO] 2025-01-07T05:44:00.004Z: 計算された1/3幅: 640px
[Window3Split][INFO] 2025-01-07T05:44:00.005Z: 計算された2/3幅: 1280px
[Window3Split][INFO] 2025-01-07T05:44:00.006Z: 左寄せ開始位置: (0, 0)
[Window3Split][INFO] 2025-01-07T05:44:00.007Z: 右寄せ開始位置: (640, 0)
[Window3Split][INFO] 2025-01-07T05:44:00.008Z: 対象の配置位置: (0, 0)
[Window3Split][INFO] 2025-01-07T05:44:00.009Z: 対象のサイズ: 1280x1080
```

### 7. トラブルシューティング

ログが表示されない場合：

1. 拡張機能が有効になっているか確認
2. GNOME Shellを再起動: `Alt + F2` → `r` → Enter
3. システムログサービスが動作しているか確認: `systemctl status systemd-journald`

### 8. ログファイルの場所

システムログは通常以下の場所に保存されます：
- `/var/log/journal/` (永続化されている場合)
- `/run/log/journal/` (一時的な場合)

ログの永続化設定は `/etc/systemd/journald.conf` で確認できます。

## 現在の機能

現在、拡張機能は以下のショートカットで動作します（リサイズ機能は無効化されており、情報表示のみ）：

- `Ctrl + Super + Left`: 左寄せ2/3の情報表示
- `Ctrl + Shift + Super + Right`: 右寄せ2/3の情報表示  
- `Ctrl + Super + Right`: 右寄せ1/3の情報表示
- `Ctrl + Shift + Super + Left`: 左寄せ1/3の情報表示

各ショートカットを押すと、ウィンドウの詳細情報がログに出力され、通知で要約が表示されます。
