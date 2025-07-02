# One-Line URL Summarizer

このアプリケーションは、URLを入力して受け取った記事をGoogle Gemini AIを使って1行（50文字以内）で要約するWebアプリケーションです。

## 🚀 セットアップ

### 1. 環境変数の設定

`.env`ファイルを作成し、以下の変数を設定してください：

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. パッケージのインストール

```bash
npm install
```

### 3. ローカル開発

```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## 🧪 テストの実行

```bash
npm run test
```

## 🚀 デプロイ

このアプリケーションはVercel/Renderでデプロイできます。以下のコマンドでVercelにデプロイできます：

```bash
vercel
```

## 🛠️ API エンドポイント

### URL要約 API

```bash
curl -X POST http://localhost:3000/api/summary \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

### 応答

```json
{
  "summary": "要約テキスト"
}
```

## 📝 ライセンス

MIT
