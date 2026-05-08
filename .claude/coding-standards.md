# コーディング規約

## バックエンド (Python/FastAPI)

### ディレクトリ構成
```
backend/app/api/
├── routers/       # APIエンドポイント定義
├── services/      # ビジネスロジック
├── repositories/  # データアクセス層
├── models/        # SQLAlchemyテーブル定義 + Pydanticモデル
├── schemas/       # リクエスト/レスポンスのバリデーション
├── enums/         # 列挙型定義
└── utils/         # ユーティリティ（プロンプト等）
```

### 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| クラス | PascalCase | `ChatService`, `ChatRepository` |
| 関数/メソッド | snake_case | `process_chat_request`, `get_user_by_chat_uid` |
| 変数 | snake_case | `chat_user`, `ip_address` |
| 定数 | UPPER_SNAKE_CASE | `CHAT_LIMIT_PER_HOUR` |
| テーブルクラス | `〇〇Table` | `ChatUserTable`, `ChatMessageTable` |
| 例外クラス | `〇〇Exception` | `UserNotFoundException`, `RateLimitExceededException` |
| Enumクラス | PascalCase | `Gender`, `Residence`, `ChatMessageRole` |

### コーディングパターン

**ルーター（routers/）:**
```python
@router.post("/chat/request")
async def ChatRequest(
    request: Request,
    chat_request: ChatRequest,
    db: Session = Depends(get_db)
):
    """APIのdocstring（日本語）

    Args:
        request: FastAPIのリクエストオブジェクト
        chat_request: リクエストボディ
        db: データベースセッション（DI経由）

    Returns:
        dict: レスポンスオブジェクト
    """
    # 依存性の手動組み立て
    repository = ChatRepository(db)
    chat_service = ChatService(repository, db)

    try:
        # サービス層に処理を委譲
        result = await chat_service.process_chat_request(...)
        return {"status": "ok", ...}
    except UserNotFoundException as e:
        return {"status": "error", "type": "not_found", ...}
```

**サービス層（services/）:**
```python
class ChatService:
    def __init__(self, repository: ChatRepository, db):
        self.repository = repository
        self.db = db

    async def process_chat_request(self, chat_uid: str, prompt: str, ...):
        """メソッドのdocstring

        Args:
            chat_uid: チャットユーザーのUID
            prompt: ユーザーからのプロンプト

        Returns:
            LLMからのレスポンス

        Raises:
            UserNotFoundException: ユーザーが見つからない場合
        """
        # ビジネスロジックを実装
```

**リポジトリ層（repositories/）:**
```python
class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_chat_uid(self, chat_uid: str):
        return self.db.query(ChatUserTable).filter(
            ChatUserTable.chat_uid == chat_uid
        ).first()
```

**Pydanticスキーマ（schemas/）:**
```python
class ChatRequest(BaseModel):
    """スキーマのdocstring"""
    chat_uid: str = Field(..., description="チャットUID")
    prompt: str = Field(..., description="質問文")

    @field_validator('prompt')
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('質問文を入力してください')  # 日本語
        return v.strip()
```

**SQLAlchemyモデル（models/）:**
```python
# テーブル定義
class ChatMessageTable(Base):
    __tablename__ = 'chat_messages'
    id = Column(Integer, primary_key=True, autoincrement=True)
    chat_user_id = Column(Integer, nullable=False)
    role = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(String(30), nullable=True)

# Pydanticモデル（同ファイル内）
class ChatMessage(BaseModel):
    id: int
    chat_user_id: int
    role: str
    message: str
    created_at: datetime
```

### ログ出力

```python
import logging
logger = logging.getLogger(__name__)

logger.info("Debug ChatRequest Start")
logger.warning(f"User not found: {str(e)}")
logger.error(f"Unexpected error: {str(e)}", exc_info=True)
```

---

## フロントエンド (Next.js/TypeScript)

### ディレクトリ構成
```
frontend/
├── app/              # App Routerページ
│   ├── chat/         # チャット画面
│   └── admin/logs/   # 管理画面
├── components/       # 再利用可能なコンポーネント
│   └── common/       # 汎用コンポーネント
└── public/           # 静的ファイル
```

### 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `ChatMessage`, `ChatInput` |
| ファイル名 | コンポーネント名.tsx | `ChatMessage.tsx` |
| 型定義 | PascalCase | `type Props`, `type Menu` |
| 変数/関数 | camelCase | `sendMessage`, `isLoading` |
| イベントハンドラ | on〇〇 / handle〇〇 | `onSend`, `handleSubmit` |

### コーディングパターン

**ページコンポーネント:**
```tsx
"use client";

import { useState, useEffect } from "react";
import ChatMessage from "@/components/ChatMessage";

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // 初期化処理
  }, []);

  const sendMessage = async (text: string) => {
    // API呼び出し
  };

  return (
    <div className="flex flex-col">
      {/* JSX */}
    </div>
  );
}
```

**コンポーネント:**
```tsx
// 型定義はファイル内で
export type Menu = {
  menu_id: number;
  name: string;
  price: number | null;
};

type Props = {
  role: "user" | "bot";
  message: string;
  menus: Menu[];
};

export default function ChatMessage({ role, message, menus }: Props) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {/* JSX */}
    </div>
  );
}
```

**API呼び出し:**
```tsx
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/request`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(formData),
});

if (!res.ok) {
  throw new Error(`HTTP error! status: ${res.status}`);
}

const data = await res.json();
if (data.status === "ok") {
  // 成功処理
}
```

**セッション管理:**
```tsx
// 保存
localStorage.setItem("ai_chatbot_uuid", data.chat_uid);

// 取得
const uuid = localStorage.getItem("ai_chatbot_uuid");
```

### スタイリング (Tailwind CSS)

```tsx
// テーマカラー
<div className="bg-[#4cbabf] text-white">  // アクセントカラー
<div className="text-[#4cbabf]">           // アクセントテキスト

// レスポンシブ
<div className="flex flex-col sm:flex-row">

// ダークモード対応
<div className="bg-white dark:bg-zinc-700 text-gray-900 dark:text-white">
```

---

## 共通ルール

### APIレスポンス形式
```json
// 成功
{
  "status": "ok",
  "responses": [...]
}

// エラー
{
  "status": "error",
  "type": "not_found",
  "responses": [{"type": "text", "message": "エラーメッセージ"}]
}
```

### エラーメッセージ
- ユーザー向けメッセージは**日本語**で記述
- 例: `"質問文を入力してください"`, `"ご利用回数の上限に達しました"`

### コメント・ドキュメント
- コメントは日本語可
- docstringはGoogle形式（Args, Returns, Raises）
- 例外クラスには日本語docstringを付与

### Git
- コミットメッセージ: `[種別] 内容`（例: `[modify] ログ管理画面読み込み時にローディング表示`）
- 種別: `modify`, `fixed`, `add`, `remove` など
