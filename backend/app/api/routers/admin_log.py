from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from repositories.chat_repository import ChatRepository
from schemas.admin_log import SearchRequest
from config import Settings

import logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/admin/logs")
async def AdminLog(
    request: SearchRequest, 
    db: Session = Depends(get_db)
):
    """管理画面：チャットログ取得API
    
    チャットメッセージの履歴をページング形式で取得します。
    ユーザーID、日付範囲での絞り込みが可能です。
    
    Args:
        request (SearchRequest): ログ取得リクエスト
            - page (int, optional): ページ番号（デフォルト: 1）
            - user_id (int, optional): ユーザーIDでの絞り込み
            - from_date (str, optional): 開始日（YYYY-MM-DD形式）
            - to_date (str, optional): 終了日（YYYY-MM-DD形式）
        db (Session): データベースセッション（DI経由で注入される）
    
    Returns:
        dict: レスポンスオブジェクト
            - status (str): "ok"
            - total_count (int): 総件数
            - page_size (int): 1ページあたりの件数
            - page (int): 現在のページ番号
            - messages (list): メッセージリスト
                - user_id (int): ユーザーID
                - chat_uid (str): チャットUID
                - gender (str): 性別
                - residence (str): 居住地
                - role (str): ロール（"user" または "assistant"）
                - message (str): メッセージ内容
                - menus_json (str): メニュー情報のJSON文字列
                - created_at (str): 作成日時（ISO 8601形式）
    """
    logger.info("Debug AdminLog Start")

    try:
        repository = ChatRepository(db)
        result = repository.get_admin_logs(
            page=getattr(request, "page", 1) or 1,
            page_size=int(Settings.ADMIN_PAGE_SIZE),
            user_id=request.user_id,
            from_date=request.from_date,
            to_date=request.to_date
        )
        
        return {"status": "ok", **result}
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return {
            "status": "error",
            "type": "internal_error",
            "response": {
                "type": "text",
                "message": "エラーが発生しました。しばらくしてから再度お試しください。"
            }
        }

