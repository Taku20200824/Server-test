# IRIS Console (Server-test)

Server-test は、名前管理・バーコード検索のコンソールです。
現在のリポジトリには Vercel で動く Next.js 版を追加しています。登録、ユーザーID、バーコードデータ、付箋メモは Firebase Authentication + Firestore に保存します。

- `/login` 独立ログイン / アカウント登録画面（4桁ID）
- `/console` IRIS Console ホーム画面
- 未ログイン時は `/login` へ移動
- ログアウト対応
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

### Firebase Consoleで必要な作業

1. Authentication を開く
2. Sign-in method で Anonymous を有効化
3. Firestore Database の Rules に `firestore.rules` の内容を貼り付ける
4. Publish を押す

Firestore collections:

| Collection | 内容 |
|------------|------|
| `irisAccounts` | 4桁ID、表示名、Firebase Auth UID |
| `irisRecords` | バーコード、名前、メモ、登録者ID、Firebase Auth UID |
| `irisNotes` | アカウント別の付箋メモ、Firebase Auth UID |

Firestore Rules は認証済みユーザーだけが読み書きできます。公開の `allow read/write: if true` にはしていません。

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
