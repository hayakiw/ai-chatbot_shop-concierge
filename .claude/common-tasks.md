# よくある作業手順

## 環境構築

### 初回セットアップ

```bash
# 1. 環境変数ファイルをコピー
cp -p backend/app/api/.env.dev backend/app/api/.env
cp -p frontend/.env.dev frontend/.env

# 2. backend/app/api/.env に GEMINI_API_KEY を設定
# GEMINI_API_KEY=your_api_key_here

# 3. 全サービス起動（プロジェクトルートで実行）
docker-compose up -d --build

# 4. メニュー初期データ投入
curl http://localhost:8000/insert/menus
```

### 動作確認URL
- フロントエンド: http://localhost:3000
- チャット画面: http://localhost:3000/chat
- ログ管理画面: http://localhost:3000/admin/logs
- APIドキュメント: http://localhost:8000/docs
- 埋め込みサンプル: docs/sample/index.html をブラウザで直接開く

---

## 開発作業

### Dockerコンテナの操作（ルートから実行）

```bash
# 起動
docker-compose up -d --build

# 停止
docker-compose down

# サービス別ログ確認
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f db

# コンテナに入る
docker exec -it chatbot-api /bin/bash
docker exec -it chatbot-frontend /bin/sh
docker exec -it chatbot-db /bin/bash

# 個別再起動
docker-compose restart api
docker-compose restart frontend
```

### コード変更の反映

- **バックエンド (api)**: `--reload` 付きで起動しているため、`backend/app/api/` 配下のファイル保存で自動リロード
- **フロントエンド (frontend)**: `next dev` のホットリロードで自動反映（`WATCHPACK_POLLING` を有効化済み）
- **依存関係を変更したとき**: `docker-compose up -d --build`（イメージ再ビルド）

### ローカル（非Docker）でフロントエンドを起動する場合

```bash
cd frontend
npm install
npm run dev
```

ただし通常は Docker の `frontend` サービスで完結するため、特別な事情がない限り Docker 起動を推奨。

---

## 新機能追加

### 新しいAPIエンドポイントを追加

1. **スキーマ定義** (`schemas/`に追加)
```python
# schemas/new_feature.py
from pydantic import BaseModel, Field

class NewFeatureRequest(BaseModel):
    """リクエストスキーマ"""
    param: str = Field(..., description="パラメータ説明")
```

2. **サービス層** (`services/`に追加)
```python
# services/new_feature_service.py
class NewFeatureService:
    def __init__(self, repository, db):
        self.repository = repository
        self.db = db

    def process(self, param: str):
        """処理を実装"""
        pass
```

3. **ルーター** (`routers/`に追加)
```python
# routers/new_feature.py
from fastapi import APIRouter, Depends
router = APIRouter()

@router.post("/new-feature")
async def NewFeature(request: NewFeatureRequest, db: Session = Depends(get_db)):
    service = NewFeatureService(repository, db)
    return {"status": "ok", "data": service.process(request.param)}
```

4. **ルーター登録** (`main.py`を編集)
```python
from routers import new_feature
app.include_router(new_feature.router)
```

### 新しいLLMツールを追加

LLMツールを追加するには **3箇所** の更新が必要です（このプロジェクト固有）。

1. **ツール関数を実装** (`services/llm/tools/shop_tools.py`内 `get_shop_tools()`)
```python
def new_tool(param: str):
    """ツールの説明（Geminiに渡される）

    Args:
        param: パラメータ説明
    """
    return {
        "type": "text",
        "message": "..."
    }
```

2. **ツール宣言を追加** (同ファイル内 `tools` リスト)
```python
types.FunctionDeclaration(
    name="new_tool",
    description="ツールの利用シーンを具体的に記述",
    parameters={...}
),
```

3. **`function_map` に追加**
```python
function_map = {
    ...,
    "new_tool": new_tool,
}
```

4. **`services/llm/google.py` の `search_functions` ホワイトリストにも追加**
```python
search_functions = {
    ...,
    "new_tool": "新ツール",
}
```

> ⚠️ `search_functions` への追加忘れがあると Function Call が無視され、`message: None` で DB エラーになる。

### 新しいフロントエンドページを追加

1. **ページ作成** (`app/`にディレクトリ作成)
```tsx
// app/new-page/page.tsx
"use client";

export default function NewPage() {
  return <div>新しいページ</div>;
}
```

2. **コンポーネント作成** (必要に応じて`components/`に追加)
```tsx
// components/NewComponent.tsx
type Props = {
  title: string;
};

export default function NewComponent({ title }: Props) {
  return <h1>{title}</h1>;
}
```

---

## データ管理

### メニューデータの更新

1. マスター: `docs/各種データ/menus.xlsx` を編集
2. APIが読みに行く場所にコピー: `backend/app/api/storage/data/menus.xlsx`
3. 取り込みAPIを叩く

```bash
curl http://localhost:8000/insert/menus
```

レスポンスが `{"res":"OK"}` なら成功。menus テーブルは TRUNCATE → INSERT で全件入れ替え。

### データベース直接操作

```bash
# MySQLにログイン（dev ユーザー）
docker exec -it chatbot-db mysql -udev -pdev dev

# よく使うクエリ
USE dev;
SHOW TABLES;
SELECT id, name, category, price FROM menus LIMIT 10;
SELECT * FROM chat_users ORDER BY created_at DESC LIMIT 10;
SELECT id, role, LEFT(message, 50) FROM chat_messages ORDER BY id DESC LIMIT 20;
```

接続情報は `backend/app/api/.env`（DB_USER=dev / DB_PASSWORD=dev / DB_NAME=dev）。

---

## テスト・デバッグ

### API動作確認

```bash
# ヘルスチェック
curl http://localhost:8000/

# Swagger UI
open http://localhost:8000/docs
```

### ログ確認

```bash
# バックエンドログ（リアルタイム）
docker-compose logs -f api

# エラーのみ
docker-compose logs -f api 2>&1 | grep -i error
```

詳細ログは `backend/app/api/logs/api.log` にも保存される。

### チャットセッションリセット

ブラウザのlocalStorageをクリア:
1. 開発者ツール(F12) → Application → Local Storage
2. `ai_chatbot_uuid` を削除
3. ページをリロード

---

## デプロイ

### 環境変数の本番設定

```bash
# backend/app/api/.env
APP_DEBUG=false
APP_FRONTEND_URL=https://your-domain.com
GEMINI_API_KEY=your_production_key

# frontend/.env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### 本番ビルド

```bash
# 全サービス起動（本番用 compose を別途用意する想定）
docker-compose -f docker-compose.prod.yml up -d --build
```

> 現状リポジトリには本番用の `docker-compose.prod.yml` は含まれていない。本番運用する際は、frontend サービスを `next build` + `next start` 構成に切り替え、HMR ボリュームマウントを外したものを別ファイルで定義する。
