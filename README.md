# IRIS Console — 名前マネージャー (Vercel + Firebase)

ローカル版（`C:\Front\laravel-front`, Laravel + IRIS）と同じ見た目・同じ操作を、
Vercel 上の Next.js + Firebase で再現したものです。
デザイントークンはローカル版の `resources/css/app.css` をそのまま移植しています。

## 画面

| ルート | 内容 |
|--------|------|
| `/login` | ユーザー名 + パスワードでログイン / アカウント作成 |
| `/console` | 名前マネージャー（検索・登録・更新・削除・CSV・付箋メモ） |
| `/` | `/login` へリダイレクト |

- 日英蒙の3言語切り替え（選択内容は保存される）
- ダークモード（選択内容は保存される。初回は OS 設定に従う）
- 付箋メモ：ドラッグで移動、4色、アカウントごとに Firestore へ保存

## ローカルでの起動

```bash
npm install
npm run dev     # http://localhost:3000
```

本番ビルドの確認:

```bash
npm run build
npm start
```

## Firebase 側の設定

Firebase project は `server-test-ef8cb` を使います。

1. **Authentication** を開く
2. Sign-in method で **メール / パスワード** を有効化
   （※ 旧版で使っていた匿名ログインはもう使いません）
3. **Firestore Database** の Rules に `firestore.rules` の内容を貼り付けて Publish
4. `irisRecords` の並び替えに `no` の昇順インデックスが必要な場合は、
   コンソールに表示されるリンクからインデックスを作成

### ユーザー名の扱い

Firebase Auth はメールアドレスでユーザーを識別するため、
入力されたユーザー名は内部で `<username>@iris-console.local` に変換しています
（`src/lib/account.ts`）。実際にメールは送信されません。

### 管理者にする方法

アカウント作成時の権限は必ず `member` です。
管理者にするときは Firebase Console で `irisUsers/{uid}` の `role` を
`admin` に書き換えてください。ルール上、アプリ側からは昇格できません。

## Firestore のコレクション

| Collection | 内容 | 読み取り | 書き込み |
|------------|------|----------|----------|
| `irisUsers/{uid}` | ユーザー名・表示名・権限 | 本人のみ | 本人のみ（`role` は変更不可） |
| `irisRecords/{id}` | no / barcode / 名前 / 漢字 / カタカナ / 住所 / 追加日時 | ログイン済み全員（共有台帳） | 登録者本人と管理者のみ |
| `irisNotes/{id}` | 付箋の本文・色・座標 | 本人のみ | 本人のみ |

## 未対応

- カメラスキャン（ボタンはあるが、押すと「未対応」の案内を出すだけ）

## 旧ローカル IRIS / Laravel 版

`setup.bat` / `IRIS-START.bat` / `nginx-iris-only-9000.conf` などは
ローカル PC・LAN 用の運用スクリプトです。本体の `laravel-front/` は
このリポジトリには含まれていないため、これらのスクリプトだけでは動きません。

`Test/*.cls` と `iris-mobile-api-with-register.cls` は InterSystems IRIS 側の
ObjectScript です。**この2つは同じクラス名 `Test.Barcode.MobileApi` を宣言しているので、
両方をインポートすると後から入れた方で上書きされます。**どちらか一方に統一してください。
