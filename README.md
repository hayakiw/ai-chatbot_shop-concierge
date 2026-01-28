# AI Chatbot
当AIチャットボットは最低限必要な実装のみとなっています。  
backend/app/api/utils/prompts.ty 内のプロンプトや、
backend/app/api/services/llm/ 内のツールを適時変更してください。

## 使用技術
本プロジェクトでは、以下の技術スタックを採用しています。

- **Frontend**: Next.js (TypeScript) 
- **Backend**: Python(3.12+) / FastAPI
- **AI**: Gemini 2.5 Flash (Google Gen AI SDK)
    - **Features**: Function Calling を活用した外部ツールとの連携

## ディレクトリの構成
```
frontend/
├── app/
│   ├── admin/
│   │   └── logs/
│   └── chat/
├── components/
├── public/
└── node_modules/
```
```
backend/
├── app/
│   ├── api/
│   │   ├── db/
│   │   ├── enums/
│   │   ├── logs/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   └── llm/
│   │   │       └── tools/
│   │   ├── storage/
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── main.py
│   │   └── logging_config.py
│   ├── Dockerfile
│   └── requirements.txt
└── mysql/
    ├── data/
    │   └── (MySQLデータベースファイル群)
    └── initdb.d/
```

## 環境構築手順
### 1. 設定ファイル
```
cp -p backend/app/api/.env.dev backend/app/api/.env
cp -p frontend/.env.dev frontend/.env
```

* frontend/.env 編集  
gemini api keyを取得し、`GEMINI_API_KEY` に設定

### 2. バックエンド設定
* Docker Desktop インストール
* docker起動
```
cd backend
docker-compose up -d --build
```

以下へアクセスできればOK  
http://localhost:8000/docs

* apiコンテナに入る場合
```
docker exec -it chatbot-api /bin/bash
```

* mysqlコンテナに入る場合
```
docker exec -it chatbot-db /bin/bash
```

### 3. フロントエンド設定
```
cd frontend
npm install
npm run dev
```

以下へアクセスできればOK  
http://localhost:3000/


## ログ管理画面
以下にてログの確認が可能  
http://localhost:3000/admin/logs


## 既存サイトへの設定例
docs/sample/ 参考  
`<head>`タグの下部に以下を設定してください。
 
```
<script src="chatbot-embed.js"></script>
<script>
    const chatbot = new ChatbotEmbed({
        chatbotUrl: 'http://localhost:3000/chat',  // チャットボットURL
        chatbotTitle: 'AIコンシェルジュ',
        position: 'bottom-right',
        iconColor: '#4cbabf',
        width: '400px',
        height: '80%'
    });
</script>
```
