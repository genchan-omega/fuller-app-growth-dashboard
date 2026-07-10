# fuller-app-growth-dashboard

Androidアプリのイベントログ送信側と、Supabase上のイベントログを可視化するWebダッシュボードをまとめたリポジトリです。

## 実装内容

- AndroidアプリからNext.js APIへイベントログを送信
- Supabaseの `events` テーブルにログを保存
- Next.jsダッシュボードで直近ログ、KPI、イベント種別グラフを表示
- ユーザー単位の順序付きファネル分析を表示
- ファネルとイベント集計に基づく改善施策ボードを表示
- Webの集計ロジックと主要UIをVitestでテスト
- GitHub ActionsでWeb/AndroidのCIを実行

## ディレクトリ構成

```text
fuller-app-growth-dashboard/
  web/      # Next.js dashboard
  android/  # Android Kotlin app
```

## Web

公開版はVercelで動作します。

- Production URL: https://fuller-app-growth-dashboard.vercel.app

ローカルで開発する場合:

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

`.env.local` にはSupabaseの接続情報を設定します。
このアプリはServer Components / Route HandlersからSupabaseへ接続するため、環境変数名は `SUPABASE_URL` と `SUPABASE_ANON_KEY` を使います。
Next.js 16では開発サーバーのデフォルトがTurbopackですが、このリポジトリではローカル開発時の安定性を優先して `next dev --webpack` を使います。

Supabase側では、SQL Editorで `web/supabase/schema.sql` を実行して `events` テーブルとRLSポリシーを作成します。

主なコマンド:

```bash
npm run lint
npm run test
npm run build
```

## Android

Android Studioで `android/` ディレクトリを開きます。
デフォルトの送信先はVercel本番APIです。そのため、ローカルで `npm run dev` を立てなくても、実機やエミュレータからイベント送信できます。

デフォルト送信先:

```text
https://fuller-app-growth-dashboard.vercel.app
```

別のデプロイ先やローカル開発サーバーへ送る場合だけ、`android/local.properties` にURLを設定します。

```properties
EVENT_API_BASE_URL=https://fuller-app-growth-dashboard.vercel.app
```

コマンドラインでビルドする場合:

```bash
cd android
./gradlew build
```

一時的にコマンドラインから送信先を指定する場合:

```bash
./gradlew assembleDebug -PEVENT_API_BASE_URL=https://fuller-app-growth-dashboard.vercel.app
```

## デプロイ方針

Next.jsのRoute Handlerを使ってAndroidからのイベントを受けるため、静的ホスティングではなくNext.jsのサーバー機能に対応した環境へデプロイします。
最小構成ではVercelを推奨します。Next.jsの対応が手厚く、GitHub連携、環境変数、HTTPS、Functionsを少ない設定で使えます。

Vercelで設定する場合:

- Root Directory: `web`
- Build Command: `npm run build`
- Output Directory: 未設定
- Environment Variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

Cloudflareで運用する場合は、Cloudflare Pagesの静的Next.jsではなく、OpenNext adapterを使うCloudflare Workers構成を選びます。

## イベントファネル

現在のファネルは、Androidアプリが送信するイベントに合わせて以下の順序で集計します。

1. `app_open`
2. `recipe_list_view`
3. `recipe_detail_view`
4. `favorite_add`

ユーザーごとにイベントを時系列で並べ、前のステップを通過したユーザーだけを次ステップの到達者として数えます。

## CI

`.github/workflows/ci.yml` で以下を実行します。

- Web: `npm ci`, `npm run lint`, `npm run test`, `npm run build`
- Android: `./gradlew testDebugUnitTest assembleDebug`

GitHub Actionsでは、Secrets未設定時でもWebのビルド確認だけは通るようにダミー値を使います。実データに接続して確認する場合は、以下のRepository Secretsを設定してください。

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 注意

`.env.local`、`local.properties`、ビルド生成物、IDEローカル設定はGit管理しません。
