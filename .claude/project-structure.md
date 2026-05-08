# プロジェクト構成

## 全体構成

```
ai-chatbot_shop-concierge/
├── docker-compose.yml    # db / api / frontend を統合起動
├── frontend/             # Next.js フロントエンド（Docker化済み）
├── backend/              # FastAPI バックエンド + MySQL
├── docs/                 # ドキュメント・データファイル・埋め込みサンプル
└── .claude/              # Claude Code 用ガイド
```

`docker-compose up -d --build` をプロジェクトルートで実行すれば、3 サービス（chatbot-db / chatbot-api / chatbot-frontend）がまとめて起動する。

---

## フロントエンド (`frontend/`)

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # ルートレイアウト
│   ├── page.tsx              # トップページ
│   ├── chat/
│   │   └── page.tsx          # チャット画面
│   └── admin/
│       └── logs/
│           └── page.tsx      # ログ管理画面
│
├── components/               # 再利用コンポーネント
│   ├── ChatLayout.tsx        # チャット画面レイアウト
│   ├── ChatInit.tsx          # 初期化フォーム（性別・居住地選択）
│   ├── ChatInput.tsx         # メッセージ入力欄
│   ├── ChatMessage.tsx       # メッセージ表示（テキスト/メニュー）
│   └── common/
│       └── Loading.tsx       # ローディングスピナー
│
├── public/                   # 静的ファイル
├── Dockerfile                # 開発モード用（npm run dev）
├── .dockerignore
├── .env                      # 環境変数（NEXT_PUBLIC_API_URL）
├── .env.dev                  # 環境変数テンプレート
├── package.json
└── tsconfig.json
```

### 主要ファイルの役割

| ファイル | 役割 |
|---------|------|
| `app/chat/page.tsx` | チャットのメイン画面。初期化→メッセージ送受信を管理 |
| `app/admin/logs/page.tsx` | 管理者用ログ一覧。検索・ページネーション対応 |
| `components/ChatMessage.tsx` | メッセージ表示。`type="menu"`の場合はメニューカード、本文中の URL は自動リンク化 |
| `components/ChatInit.tsx` | 初回利用時の性別・居住地選択フォーム |

---

## バックエンド (`backend/`)

```
backend/
├── app/
│   ├── api/
│   │   ├── main.py              # FastAPIエントリーポイント
│   │   ├── config.py            # 環境設定（Settings）
│   │   ├── logging_config.py    # ログ設定
│   │   │
│   │   ├── routers/             # APIエンドポイント
│   │   │   ├── root.py          # ヘルスチェック / /insert/menus（テスト用）
│   │   │   ├── chat.py          # /chat/init, /chat/request
│   │   │   └── admin_log.py     # /admin/logs
│   │   │
│   │   ├── services/            # ビジネスロジック
│   │   │   ├── chat_service.py  # チャット処理
│   │   │   ├── rate_limit_service.py  # レート制限
│   │   │   └── llm/
│   │   │       ├── google.py    # Gemini API連携 + Function Calling 実行
│   │   │       └── tools/
│   │   │           └── shop_tools.py  # Function Callingツール群
│   │   │
│   │   ├── repositories/        # データアクセス層
│   │   │   └── chat_repository.py
│   │   │
│   │   ├── models/              # DBモデル
│   │   │   ├── chat_user.py     # chat_usersテーブル
│   │   │   ├── chat_message.py  # chat_messagesテーブル
│   │   │   └── menu.py          # menusテーブル
│   │   │
│   │   ├── schemas/             # リクエスト/レスポンススキーマ
│   │   │   ├── chat.py          # ChatInitRequest, ChatRequest
│   │   │   └── search.py        # SearchRequest（ログ検索）
│   │   │
│   │   ├── enums/               # 列挙型
│   │   │   ├── gender.py        # Gender (male/female/unknown)
│   │   │   ├── residence.py     # Residence (in_prefecture/out_prefecture)
│   │   │   └── chat_message_role.py  # ChatMessageRole (USER/ASSISTANT)
│   │   │
│   │   ├── db/
│   │   │   └── database.py      # SQLAlchemy設定
│   │   │
│   │   ├── utils/
│   │   │   └── prompts.py       # システムプロンプト定義
│   │   │
│   │   ├── storage/
│   │   │   └── data/menus.xlsx  # メニュー取り込み元データ
│   │   │
│   │   ├── logs/api.log         # アプリログ
│   │   ├── .env                 # 環境変数
│   │   └── .env.dev             # 環境変数テンプレート
│   │
│   ├── Dockerfile
│   └── requirements.txt
│
└── mysql/
    ├── data/                    # MySQLデータ（永続化）
    ├── my.cnf
    └── initdb.d/                # 初期化SQL
        ├── 00_init_table.sql
        ├── 01_create_table.sql
        └── 02_create_menus_table.sql
```

### 主要ファイルの役割

| ファイル | 役割 |
|---------|------|
| `main.py` | FastAPIアプリ初期化、CORSミドルウェア、ルーター登録 |
| `config.py` | 環境変数読み込み（DB接続、APIキー、レート制限値） |
| `routers/chat.py` | チャットAPI（init/request）のエンドポイント定義 |
| `routers/root.py` | ヘルスチェック + `/insert/menus`（Excelをmenusへ取り込み） |
| `services/chat_service.py` | チャット処理のビジネスロジック |
| `services/llm/google.py` | Gemini API呼び出し、Function Calling 実行（`search_functions` ホワイトリストあり） |
| `services/llm/tools/shop_tools.py` | LLMが呼び出すツール定義と `function_map` |
| `repositories/chat_repository.py` | DB操作（ユーザー作成、メッセージ保存、ログ取得） |
| `utils/prompts.py` | LLMに渡すシステムプロンプト |

### LLM Function Calling ツール

`services/llm/tools/shop_tools.py` で定義されているツール：

| ツール名 | 用途 |
|---------|------|
| `get_shop_details` | 店舗情報（店名・営業時間・電話・住所）をテキストで返す |
| `get_shop_access` | 店舗の所在地と Google Map リンクをテキストで返す |
| `search_menus(name, category)` | menusテーブルを部分一致検索し、カード形式で返す |

> ツールを追加するときは `shop_tools.py` の `tools` 宣言・`function_map`、加えて `google.py` の `search_functions` の **3 箇所** を更新する必要がある（[common-tasks.md](common-tasks.md) 参照）。

---

## ドキュメント (`docs/`)

```
docs/
├── prompt.md                # システム再構築用の指示書（要件サマリ）
├── 各種データ/
│   ├── README.md            # データ取り込み手順
│   └── menus.xlsx           # メニューマスタデータ
└── sample/
    ├── chatbot-embed.js     # 既存サイト埋め込み用スクリプト
    └── index.html           # 埋め込みのサンプルページ
```

### 埋め込みウィジェット (`docs/sample/chatbot-embed.js`)

- 起動ボタン: 横長ピル型、インディゴ→パープル→ピンクのグラデーション（6秒周期）+ スパークルSVG + 「AIに質問」ラベル
- クリックで iframe が開き、`chatbotUrl` を表示
- チャットウィンドウのヘッダーもボタンと同じグラデーション
- `iconColor` オプションは現在グラデーションに置き換わったため未使用

---

## 処理フロー

### チャット初期化
```
[ユーザー] → ChatInit画面 → POST /chat/init
    → ChatService.init_chat_request()
    → ChatRepository.create_user()
    → UUID発行 → localStorage保存
```

### メッセージ送信
```
[ユーザー] → ChatInput → POST /chat/request
    → ChatService.process_chat_request()
        → ユーザー検証
        → メッセージ保存
        → レート制限チェック
        → LlmGoogleService.generate_gemini_functioncalling()
            → Gemini API呼び出し
            → Function Call検出時 → shop_tools実行
        → レスポンス保存
    → ChatMessage表示（text/menu）
```
