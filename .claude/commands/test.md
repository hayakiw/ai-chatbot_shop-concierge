# /test - テスト実行

テストの実行と結果の確認を行います。

## 使用方法

```
/test [オプション]
```

## オプション

| オプション | 説明 |
|-----------|------|
| `api` | バックエンドAPIのテスト |
| `frontend` | フロントエンドのテスト |
| `e2e` | E2Eテスト |
| `all` | 全テスト実行 |

## バックエンドテスト

### 手動テスト

**Gemini API接続テスト:**
```bash
curl http://localhost:8000/chat/test
```

**チャット初期化テスト:**
```bash
curl -X POST http://localhost:8000/chat/init \
  -H "Content-Type: application/json" \
  -d '{"gender": "male", "residence": "in_prefecture"}'
```

**チャットリクエストテスト:**
```bash
curl -X POST http://localhost:8000/chat/request \
  -H "Content-Type: application/json" \
  -d '{"chat_uid": "取得したUUID", "prompt": "メニューを教えて"}'
```

**ログ取得テスト:**
```bash
curl -X POST http://localhost:8000/admin/logs \
  -H "Content-Type: application/json" \
  -d '{"page": 1}'
```

### Pythonテスト（pytest）

```bash
# APIコンテナに入る
docker exec -it chatbot-api /bin/bash

# テスト実行（pytestがインストールされている場合）
pytest tests/ -v

# 特定のテストのみ
pytest tests/test_chat.py -v

# カバレッジ付き
pytest tests/ --cov=api --cov-report=html
```

## フロントエンドテスト

### ビルドテスト

```bash
cd frontend

# ビルドが通るか確認
npm run build

# Lint
npm run lint
```

### 手動テスト

1. **初期化フロー**
   - http://localhost:3000/chat にアクセス
   - 性別・居住地を選択
   - チャットが開始されることを確認

2. **チャット機能**
   - メッセージを送信
   - レスポンスが表示されることを確認
   - メニュー検索時にカード表示されることを確認

3. **ログ管理画面**
   - http://localhost:3000/admin/logs にアクセス
   - 検索・ページネーションが動作することを確認

## E2Eテスト

### テストシナリオ

1. **正常系: チャットフロー**
   ```
   1. /chat にアクセス
   2. 性別「男性」、居住地「県内」を選択
   3. 「メニューを教えて」と入力
   4. メニュー一覧が表示される
   5. 「営業時間は？」と入力
   6. 店舗情報が表示される
   ```

2. **異常系: レート制限**
   ```
   1. 短時間に多数のメッセージを送信
   2. レート制限メッセージが表示される
   ```

3. **異常系: セッション切れ**
   ```
   1. localStorageをクリア
   2. メッセージを送信
   3. 初期化画面に戻る
   ```

## テスト結果の確認

### 期待される結果

**チャット初期化:**
```json
{
  "status": "ok",
  "chat_uid": "uuid-string"
}
```

**チャットリクエスト（テキスト応答）:**
```json
{
  "status": "ok",
  "responses": [
    {
      "type": "text",
      "message": "応答テキスト",
      "menus": null
    }
  ]
}
```

**チャットリクエスト（メニュー応答）:**
```json
{
  "status": "ok",
  "responses": [
    {
      "type": "menu",
      "message": null,
      "menus": [
        {
          "menu_id": 1,
          "name": "メニュー名",
          "category": "カテゴリ",
          "price": 1000
        }
      ]
    }
  ]
}
```

## トラブルシューティング

テスト失敗時は [troubleshooting.md](../troubleshooting.md) を参照。
