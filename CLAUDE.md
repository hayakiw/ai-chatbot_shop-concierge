# CLAUDE.md

このファイルは、このリポジトリ内のコードを操作する際に Claude Code (claude.ai/code) にガイダンスを提供します。

## プロジェクト概要

ドッグサロン向けAIチャットボットコンシェルジュシステム。LLMのFunction Calling機能を活用し、顧客がサービスやメニュー情報を検索できる。

## 技術スタック

- **フロントエンド**: Next.js 16 (TypeScript), React 19, Tailwind CSS 4
- **バックエンド**: Python 3.12+, FastAPI
- **データベース**: MySQL (Docker経由)
- **AI**: Google Gemini + Function Calling (Google Gen AI SDK)

## 開発コマンド

### バックエンド (Docker)
```bash
cd backend
docker-compose up -d --build          # バックエンドサービス起動
docker exec -it chatbot-api /bin/bash # APIコンテナに入る
docker exec -it chatbot-db /bin/bash  # MySQLコンテナに入る
```
APIドキュメント: http://localhost:8000/docs

### フロントエンド
```bash
cd frontend
npm install
npm run dev      # 開発サーバー起動 (http://localhost:3000)
npm run build    # 本番ビルド
npm run lint     # ESLint実行
```

### 環境構築
```bash
cp -p backend/app/api/.env.dev backend/app/api/.env
cp -p frontend/.env.dev frontend/.env
# frontend/.env に GEMINI_API_KEY を設定
```

## アーキテクチャ

### バックエンド (`backend/app/api/`)

**エントリーポイント:**
- `main.py` - FastAPIアプリ（CORSミドルウェア設定）
- `config.py` - 環境設定（DB接続、レート制限、APIキー）

**APIルート:**
- `POST /chat/init` - チャットセッション初期化（性別・居住地登録）、UUID返却
- `POST /chat/request` - ユーザーメッセージをLLMで処理
- `POST /admin/logs` - 管理者用ログ取得（ページネーション・フィルタリング対応）

**サービス層:**
- `services/chat_service.py` - チャット処理（バリデーション、レート制限、LLM呼び出し、永続化）
- `services/llm/google.py` - Gemini連携（Function Calling対応）
- `services/rate_limit_service.py` - ユーザー毎の時間あたりメッセージ制限

**LLMツール** (`services/llm/tools/shop_tools.py`):
- `get_shop_details()` - 店舗情報を返却
- `search_menus(name, category)` - メニューテーブルを検索

**カスタマイズポイント:**
- `utils/prompts.py` - LLMの動作を制御するシステムプロンプト
- `services/llm/tools/` - Function Callingツールの追加・変更

**データ層:**
- `repositories/chat_repository.py` - データアクセス（ユーザー、メッセージ、ログ）
- `models/` - SQLAlchemyモデル: ChatUserTable, ChatMessageTable, MenuTable

### フロントエンド (`frontend/`)

**ページ:**
- `/chat` - メインチャット画面（初期化フロー含む）
- `/admin/logs` - 管理者用ログ閲覧画面（検索・ページネーション対応）

**チャットフロー:**
1. ユーザーが性別・居住地を選択 → `/chat/init` → UUIDをlocalStorageに保存
2. メッセージ送信 → `/chat/request` → レスポンス表示（テキストまたはメニューカード）

## データベーススキーマ

- `chat_users` - セッション情報（chat_uid, gender, residence）
- `chat_messages` - 会話履歴（role, message, menus_json）
- `menus` - 店舗メニュー（name, category, price, description, URLs）

## 開発ドキュメント（.claude/）

| ドキュメント | 内容 |
|-------------|------|
| [coding-standards.md](.claude/coding-standards.md) | コーディング規約・命名規則・コードパターン |
| [project-structure.md](.claude/project-structure.md) | ディレクトリ構成・主要ファイルの役割・処理フロー |
| [common-tasks.md](.claude/common-tasks.md) | よくある作業手順（環境構築、機能追加、デプロイ） |
| [troubleshooting.md](.claude/troubleshooting.md) | よくあるエラーと対処法・FAQ |

### カスタムコマンド（.claude/commands/）

| コマンド | 内容 |
|---------|------|
| [/review](.claude/commands/review.md) | コードレビュー（品質・セキュリティ・パフォーマンス） |
| [/test](.claude/commands/test.md) | テスト実行・動作確認手順 |

## コーディング規約（要点）

- エラーメッセージ・コメントは日本語
- APIレスポンスは `{ status: "ok" | "error", ... }` 形式
- バックエンド: PascalCaseクラス、snake_case関数、Google形式docstring
- フロントエンド: PascalCaseコンポーネント、Tailwind CSS、`"use client"`
- コミットメッセージ: `[種別] 内容`（例: `[modify] ログ管理画面修正`）
