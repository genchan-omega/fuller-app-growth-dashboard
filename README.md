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

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

`.env.local` にはSupabaseの接続情報を設定します。
Next.js 16では開発サーバーのデフォルトがTurbopackですが、このリポジトリではローカル開発時の安定性を優先して `next dev --webpack` を使います。

主なコマンド:

```bash
npm run lint
npm run test
npm run build
```

## Android

Android Studioで `android/` ディレクトリを開きます。

コマンドラインでビルドする場合:

```bash
cd android
./gradlew build
```

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

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 注意

`.env.local`、`local.properties`、ビルド生成物、IDEローカル設定はGit管理しません。
