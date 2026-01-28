from pydantic import BaseModel
from typing import Optional

class SearchRequest(BaseModel):
    """検索リクエストスキーマ
    
    ページング機能と各種フィルタリングオプションを持つ検索リクエスト。
    
    Attributes:
        page: ページ番号（デフォルト: 1）
        user_id: ユーザーIDでフィルタリング（オプション）
        from_date: 開始日でフィルタリング（YYYY-MM-DD形式、オプション）
        to_date: 終了日でフィルタリング（YYYY-MM-DD形式、オプション）
    """
    page: int = 1
    user_id: Optional[int] = None
    from_date: Optional[str] = None
    to_date: Optional[str] = None
