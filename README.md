# IRIS Console (Server-test)

InterSystems IRIS をバックエンドにした名前管理・バーコード検索の Laravel フロントエンドです。

- ログイン / アカウント登録（4桁ID）
- バーコード検索・登録・更新・削除（カメラスキャン対応）
- CSV ダウンロード / アップロード
- 付箋メモ（背景ダブルクリック、アカウント単位でサーバー保存）
- コマンドパレット（Ctrl+K）/ ダークモード / 日英蒙 3言語

## 必要環境

| ソフト | バージョン目安 | 備考 |
|--------|---------------|------|
| PHP | 8.3+ | `php -v` で確認 |
| Composer | 2.x | |
| Node.js | 20+ | アセットビルド用 |
| nginx | 1.26+ | LAN公開・HTTPS(カメラ)用。ローカル確認だけなら不要 |
| IRIS | - | LAN内で REST API (`/test`) が動いていること |

## セットアップ（初回）

```bat
git clone https://github.com/Taku20200824/Server-test.git C:\Front
cd C:\Front
setup.bat
```

`setup.bat` が行うこと: `composer install` → `.env` 作成 → `php artisan key:generate` → `npm install` → `npm run build`

### .env の設定

`laravel-front\.env` を開いて自分の環境に合わせる:

```env
APP_URL=http://<このPCのIP>:9000   # nginx経由の公開URL
SESSION_LIFETIME=720
SESSION_COOKIE=iris_session_v2     # 変更しないこと
IRIS_URL=<IRISホスト>
IRIS_PORT=52775
IRIS_API_PATH=/test
IRIS_USER=<IRISユーザー>
IRIS_PASSWORD=<IRISパスワード>
```

## 起動

### 開発（ローカルのみ）

```bat
cd C:\Front\laravel-front
php artisan serve --host=127.0.0.1 --port=8000
```

→ http://127.0.0.1:8000

### LAN公開（nginx 経由・他PC/スマホから）

```bat
C:\Front\IRIS-START.bat
```

- HTTP: `http://<IP>:9000`
- HTTPS: `https://<IP>:9443`（カメラスキャンに必須。自己署名証明書 `iris-local.crt/key` が必要）

停止は `IRIS-STOP.bat`。

> BAT 内のパス（`C:\php-8.3.10`、`C:\Nginx\nginx-1.26.2` など）は環境に合わせて書き換えてください。

## 更新の反映

```bat
cd C:\Front
git pull
cd laravel-front
composer install
npm install
npm run build
php artisan optimize:clear
```

## データの保存場所（git管理外）

| ファイル | 内容 |
|---------|------|
| `laravel-front/storage/app/private/iris_accounts.json` | ログインアカウント |
| `laravel-front/storage/app/private/iris_notes.json` | 付箋メモ（ユーザー別） |

サーバー移行時はこの2ファイルをコピーすれば引き継げます。

## ディレクトリ構成

```
C:\Front
├── laravel-front/     # Laravel アプリ本体
├── Test/              # IRIS ObjectScript クラス（Test.*）
├── DEMO/              # IRIS ObjectScript クラス（デモ）
├── nginx-iris-only-9000.conf
├── IRIS-START.bat / IRIS-STOP.bat
└── setup.bat          # 初回セットアップ
```

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| 419 Page Expired | 自動でログイン画面に戻ります。続く場合は `php artisan optimize:clear` |
| ログインできない（ループ） | `.env` の `SESSION_COOKIE=iris_session_v2` を確認 |
| カメラが動かない | HTTPS (`:9443`) でアクセスしているか確認 |
| 検索が全部エラー | `.env` の `IRIS_*` 設定と IRIS 側の稼働を確認 |
