# 多言語対応ガイド (Internationalization Guide)

## 概要

Window 3Split拡張機能は以下の言語に対応しています：

- 英語 (en) - ベース言語
- 日本語 (ja)
- 中国語簡体字 (zh_CN)
- 中国語繁体字台湾 (zh_TW)
- 中国語繁体字香港 (zh_HK)
- ベトナム語 (vi)
- 韓国語 (ko)

## ファイル構造

```
window_3split_extention/
├── locale/                     # 翻訳ファイル（バイナリ）
│   ├── en/LC_MESSAGES/
│   ├── ja/LC_MESSAGES/
│   ├── zh_CN/LC_MESSAGES/
│   ├── zh_TW/LC_MESSAGES/
│   ├── zh_HK/LC_MESSAGES/
│   ├── vi/LC_MESSAGES/
│   └── ko/LC_MESSAGES/
├── po/                         # 翻訳ソースファイル
│   ├── window-3split.pot       # 翻訳テンプレート
│   ├── en.po                   # 英語翻訳
│   ├── ja.po                   # 日本語翻訳
│   ├── zh_CN.po               # 中国語簡体字翻訳
│   ├── zh_TW.po               # 中国語繁体字（台湾）翻訳
│   ├── zh_HK.po               # 中国語繁体字（香港）翻訳
│   ├── vi.po                   # ベトナム語翻訳
│   └── ko.po                   # 韓国語翻訳
├── convenience.js              # 翻訳ヘルパー関数
├── Makefile                    # 翻訳管理用Makefile
└── INTERNATIONALIZATION_GUIDE.md
```

## 翻訳の仕組み

### 1. 翻訳システムの初期化

```javascript
// convenience.jsから翻訳機能をインポート
const Convenience = Me.imports.convenience;
let _;

function init() {
    _ = Convenience.initTranslations();
}
```

### 2. 翻訳可能文字列の使用

```javascript
// 翻訳前
label: 'Keyboard Shortcut Settings'

// 翻訳後
label: _('Keyboard Shortcut Settings')
```

### 3. 言語の自動検出

システムのロケール設定に基づいて自動的に適切な言語が選択されます：

- `LANG=ja_JP.UTF-8` → 日本語
- `LANG=zh_CN.UTF-8` → 中国語簡体字
- `LANG=zh_TW.UTF-8` → 中国語繁体字（台湾）
- `LANG=zh_HK.UTF-8` → 中国語繁体字（香港）
- `LANG=vi_VN.UTF-8` → ベトナム語
- `LANG=ko_KR.UTF-8` → 韓国語
- その他 → 英語（フォールバック）

## 翻訳管理

### Makefileの使用

```bash
# すべての翻訳ファイルをビルド
make all

# 翻訳統計を表示
make stats

# 翻訳ファイルをクリーン
make clean

# ヘルプを表示
make help
```

### 手動での翻訳ファイル生成

```bash
# POファイルからMOファイルを生成
cd po
for lang in en ja zh_CN zh_TW zh_HK vi ko; do
    msgfmt -o ../locale/${lang}/LC_MESSAGES/window-3split.mo ${lang}.po
done
```

## 新しい言語の追加

### 1. ディレクトリ構造の作成

```bash
mkdir -p locale/[LANG_CODE]/LC_MESSAGES
```

### 2. POファイルの作成

```bash
# テンプレートから新しい言語のPOファイルを作成
msginit --locale=[LANG_CODE] --input=po/window-3split.pot --output=po/[LANG_CODE].po
```

### 3. 翻訳の追加

`po/[LANG_CODE].po`ファイルを編集して翻訳を追加：

```po
#: prefs.js:20
msgid "Keyboard Shortcut Settings"
msgstr "[翻訳されたテキスト]"
```

### 4. MOファイルの生成

```bash
msgfmt -o locale/[LANG_CODE]/LC_MESSAGES/window-3split.mo po/[LANG_CODE].po
```

### 5. Makefileの更新

`Makefile`の`LANGUAGES`変数に新しい言語コードを追加：

```makefile
LANGUAGES = en ja zh_CN zh_TW zh_HK vi ko [LANG_CODE]
```

## 翻訳対象の文字列

### UI要素
- キーボードショートカット設定
- 各機能のラベルと説明
- ボタンラベル（設定、キャンセル、クリア）
- ダイアログメッセージ

### 通知メッセージ
- エラーメッセージ
- ウィンドウ情報
- 状態メッセージ

### ログメッセージ
- 開発者向けのため英語で統一

## トラブルシューティング

### 翻訳が表示されない場合

1. **MOファイルの確認**
   ```bash
   find locale -name "*.mo" -ls
   ```

2. **ロケール設定の確認**
   ```bash
   echo $LANG
   locale
   ```

3. **拡張機能の再起動**
   ```bash
   # GNOME Shellの再起動
   Alt+F2 → "r" → Enter
   ```

### POファイルのエラー

```bash
# POファイルの構文チェック
msgfmt --check po/[LANG_CODE].po
```

## 開発者向け情報

### 新しい翻訳可能文字列の追加

1. コード内で`_()`関数を使用
2. POTファイルの更新（手動またはxgettextを使用）
3. 各POファイルの更新
4. MOファイルの再生成

### 翻訳テストの方法

```bash
# 特定のロケールでテスト
LANG=ja_JP.UTF-8 gnome-shell --replace &
```

## 貢献について

翻訳の改善や新しい言語の追加については、GitHubリポジトリにプルリクエストを送信してください。

翻訳品質の向上にご協力いただける方を歓迎します。
