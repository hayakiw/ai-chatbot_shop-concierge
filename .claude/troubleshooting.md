# トラブルシューティング

> Docker コマンドはすべてプロジェクトルートで実行する前提（統合 `docker-compose.yml` がルートにある）。

## 環境構築時のエラー

### Docker関連

**エラー: `docker-compose up` でコンテナが起動しない**

対処法:
```bash
# コンテナとボリュームを完全に削除して再構築
docker-compose down -v
docker-compose up -d --build
```

> `-v` を付けると MySQL のデータ（backend/mysql/data 配下）も消える点に注意。

---

**エラー: コンテナ名が既に使用中**
```
Error response from daemon: Conflict. The container name "/chatbot-db" is already in use
```

対処法:
```bash
# 別プロジェクトで同名コンテナが残っている場合
docker rm -f chatbot-db chatbot-api chatbot-frontend
docker-compose up -d --build
```

---

**エラー: ポートが既に使用中**
```
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```

対処法:
```bash
# 使用中のプロセスを確認（PowerShell）
netstat -ano | Select-String ":3000.*LISTENING"

# 出てきた PID をプロセス名で確認してから停止
# 多くの場合は古い `next dev` プロセスが残っている
```

---

**エラー: API起動時に `ValueError: invalid literal for int() with base 10: 'None'`**

原因: `backend/app/api/.env` が未作成で DB 接続情報が読まれていない。

対処法:
```bash
cp -p backend/app/api/.env.dev backend/app/api/.env
docker-compose restart api
```

---

**エラー: フロントから `/chat/request` が 404**

原因: `frontend/.env` が未作成で `NEXT_PUBLIC_API_URL` が未設定。リクエストが `http://localhost:3000/chat/request` に飛んでいる。

対処法:
```bash
cp -p frontend/.env.dev frontend/.env
docker-compose restart frontend
# ブラウザはハードリロード（Ctrl+Shift+R）。NEXT_PUBLIC_* はビルド時に埋め込まれるため
```

---

### npm関連（ローカルでフロントを動かす場合のみ）

**エラー: `next` is not recognized**

原因: `node_modules` が未インストール。

対処法:
```bash
cd frontend
npm install
```

---

**エラー: Next.jsビルドエラー**

対処法:
```bash
cd frontend
rm -rf .next
npm run dev
```

---

## 実行時エラー

### API関連

**エラー: CORSエラー**
```
Access to fetch at 'http://localhost:8000/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

対処法:
1. `backend/app/api/main.py` のCORS設定を確認
2. `backend/app/api/.env` の `APP_FRONTEND_URL` が正しいか確認

---

**エラー: 500 Internal Server Error**

対処法:
```bash
# ログを確認
docker-compose logs -f api
# または backend/app/api/logs/api.log を直接見る

# よくある原因
# 1. .env未作成 → DB接続情報やGEMINI_API_KEYを確認
# 2. DBに接続できない → chatbot-dbが起動しているか確認
# 3. Gemini APIキーが無効 → キーを再発行
```

---

**エラー: `assistant` メッセージ保存時に `Column 'message' cannot be null`**

原因: Gemini が Function Call を返したが、対応するツールが `services/llm/google.py` の `search_functions` ホワイトリストに登録されておらず、`response.text` (=None) が DB に書こうとされた。

対処法: 新ツールを追加するときは以下の **3 箇所** を更新する。
1. `services/llm/tools/shop_tools.py` の `tools` 宣言
2. 同ファイル `function_map`
3. `services/llm/google.py` の `search_functions`

---

**エラー: `"status": "error", "type": "not_found"`**

原因: チャットセッション（chat_uid）が DB に存在しない（DB 削除後など）。

対処法: ブラウザのlocalStorageをクリアしてリロード。
```javascript
// 開発者ツールのConsoleで実行
localStorage.removeItem("ai_chatbot_uuid");
location.reload();
```

---

### Gemini API関連

**エラー: Gemini APIキーエラー**
```
google.api_core.exceptions.InvalidArgument: API key not valid
```

対処法:
1. `backend/app/api/.env` の `GEMINI_API_KEY` を確認
2. Google AI Studio で新しいキーを発行
3. APIコンテナ再起動

```bash
docker-compose restart api
```

---

**エラー: レート制限エラー**
```
"ご利用回数の上限に達しました"
```

対処法:
1. `backend/app/api/.env` の `CHAT_LIMIT_PER_HOUR` を増やす
2. APIコンテナ再起動
```bash
docker-compose restart api
```

---

**エラー: Function Calling が呼ばれない / 期待のツールが選ばれない**

対処法:
1. `services/llm/tools/shop_tools.py` のツール `description` をより具体的に書く（想定質問例を含める）
2. `utils/prompts.py` のシステムプロンプトでツール選択の指針を補強
3. Gemini のレスポンスを確認

```bash
docker-compose logs -f api | grep -i "functioncalling\|function_call"
```

---

### データベース関連

**エラー: テーブルが存在しない**
```
sqlalchemy.exc.ProgrammingError: Table 'dev.chat_users' doesn't exist
```

原因: `backend/mysql/data/` に古いデータが残っており、初期化SQLが実行されない。

対処法:
```bash
# データを消して initdb.d/*.sql を再実行
docker-compose down
rm -rf backend/mysql/data/*
docker-compose up -d --build
```

---

**エラー: 文字化け**

対処法: MySQLの文字コード設定を確認。
```bash
docker exec -it chatbot-db mysql -udev -pdev dev -e "SHOW VARIABLES LIKE 'character%';"
```

---

## フロントエンドエラー

**エラー: Hydration mismatch**

対処法:
1. `"use client"` ディレクティブを付ける
2. `localStorage` などクライアント専用APIは `useEffect` 内で参照する

```tsx
"use client";
useEffect(() => {
  const uuid = localStorage.getItem("ai_chatbot_uuid");
}, []);
```

---

**エラー: フロント側で変更したのに反映されない**

原因: Docker のボリューム経由でのファイル監視が効いていない、または `NEXT_PUBLIC_*` の値が古いビルドにキャッシュされている。

対処法:
```bash
# HMRが効かない場合
docker-compose restart frontend

# NEXT_PUBLIC_* を変更したあとは frontend を再起動 + ブラウザをハードリロード
```

---

## よくある質問

**Q: チャット履歴をリセットしたい**

A: ブラウザのlocalStorageから `ai_chatbot_uuid` を削除してリロード。完全にDBを初期化したい場合は `docker-compose down && rm -rf backend/mysql/data/* && docker-compose up -d`（メニューデータも消えるため `/insert/menus` で再投入が必要）。

---

**Q: 新しいメニューデータを追加したい**

A: マスター `docs/各種データ/menus.xlsx` を編集 → `backend/app/api/storage/data/menus.xlsx` にコピー → `curl http://localhost:8000/insert/menus`

---

**Q: システムプロンプトを変更したい**

A: `backend/app/api/utils/prompts.py` を編集。API は `--reload` で起動しているため自動反映。

---

**Q: レート制限の値を変更したい**

A: `backend/app/api/.env` の `CHAT_LIMIT_PER_HOUR` を変更 → `docker-compose restart api`

---

**Q: 埋め込みウィジェットの色を変えたい**

A: `docs/sample/chatbot-embed.js` の `.chatbot-icon` と `.chatbot-header` の `linear-gradient(...)` を編集する。`iconColor` オプションは現在使用されていない。
