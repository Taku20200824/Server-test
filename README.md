# IRIS Console (Server-test)

Server-test は、名前管理・バーコード検索のコンソールです。
現在のリポジトリには Vercel で動く Next.js 版を追加しています。登録、ユーザーID、バーコードデータ、付箋メモは Firebase Firestore に保存します。

- ログイン / アカウント登録（4桁ID）
- バーコード検索・登録・更新・削除
- CSV ダウンロード
- 付箋メモ（アカウント単位でFirebase保存）
- ダークモード / 日英蒙 3言語

## Vercel / Firebase 版

Vercel はリポジトリ直下の Next.js アプリをビルドします。

```bash
npm install
npm run build
npm run dev
```

Firebase project は `server-test-ef8cb` を使います。Web設定は `.env.example` に入っています。Vercel側で環境変数を入れなくても動くように、同じFirebase Web configをコード側にもfallbackとして設定済みです。

Firestore collections:

| Collection | 内容 |
|------------|------|
| `irisAccounts` | 4桁IDと表示名 |
| `irisRecords` | バーコード、名前、メモ、登録者ID |
| `irisNotes` | アカウント別の付箋メモ |

Firestore Rules は `firestore.rules` に入れています。Firebase Console の Firestore Rules に貼り付けて公開してください。

## 旧ローカル IRIS / Laravel 版メモ

以下は、元READMEにあったローカルPC・LAN用の説明です。今のアップロードには `laravel-front/` 本体が入っていないため、この手順だけではVercelでは動きません。

### 必要環境

| ソフト | バージョン目安 | 備考 |
|--------|---------------|------|
| PHP | 8.3+ | `php -v` で確認 |
| Composer | 2.x | |
| Node.js | 20+ | アセットビルド用 |
| nginx | 1.26+ | LAN公開・HTTPS(カメラ)用。ローカル確認だけなら不要 |
| IRIS | - | LAN内で REST API (`/test`) が動いていること |

### セットアップ（初回）

```bat
git clone https://github.com/Taku20200824/Server-test.git C:\Front
cd C:\Front
setup.bat
```

`setup.bat` が行うこと: `composer install` → `.env` 作成 → `php artisan key:generate` → `npm install` → `npm run build`

### .env の設定

`laravel-front\.env` を開いて自分の環境に合わせる:

```env
APP_URL=http://<このPCのIP>:9000
SESSION_LIFETIME=720
SESSION_COOKIE=iris_session_v2
IRIS_URL=<IRISホスト>
IRIS_PORT=52775
IRIS_API_PATH=/test
IRIS_USER=<IRISユーザー>
IRIS_PASSWORD=<IRISパスワード>
```

### 起動

```bat
cd C:\Front\laravel-front
php artisan serve --host=127.0.0.1 --port=8000
```

LAN公開は `C:\Front\IRIS-START.bat`、停止は `IRIS-STOP.bat` を使います。

### データの保存場所（旧版）

| ファイル | 内容 |
|---------|------|
| `laravel-front/storage/app/private/iris_accounts.json` | ログインアカウント |
| `laravel-front/storage/app/private/iris_notes.json` | 付箋メモ（ユーザー別） |
