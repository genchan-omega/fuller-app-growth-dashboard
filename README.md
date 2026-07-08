# fuller-app-growth-dashboard

Androidアプリのイベントログ送信側と、Supabase上のイベントログを可視化するWebダッシュボードをまとめたリポジトリです。

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

## Android

Android Studioで `android/` ディレクトリを開きます。

コマンドラインでビルドする場合:

```bash
cd android
./gradlew build
```

## 注意

`.env.local`、`local.properties`、ビルド生成物、IDEローカル設定はGit管理しません。
