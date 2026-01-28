from sqlalchemy.orm import Session
from datetime import datetime
import json

from models.chat_user import ChatUserTable
from models.chat_message import ChatMessageTable
from enums.chat_message_role import ChatMessageRole

class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, uid: str, gender: str, residence: str):
        user = ChatUserTable(
            chat_uid=uid,
            gender=gender,
            residence=residence,
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        self.db.add(user)
        self.db.commit()
        return user
    
    def get_user_by_chat_uid(self, chat_uid: str):
        return self.db.query(ChatUserTable).filter(
            ChatUserTable.chat_uid == chat_uid
        ).first()

    def create_message(self, chat_user_id: int, role: str, message: str, menus: dict, ip: str):
        chat_message = ChatMessageTable(
            chat_user_id=chat_user_id,
            role=role,
            message=message,
            menus_json=json.dumps(menus, ensure_ascii=False),
            ip_address=ip,
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        self.db.add(chat_message)
        self.db.commit()
        return chat_message
    
    def count_recent_messages(self, chat_user_id: int, since: datetime):
        return self.db.query(ChatMessageTable).filter(
            ChatMessageTable.chat_user_id == chat_user_id,
            ChatMessageTable.role == ChatMessageRole.USER.value,
            ChatMessageTable.created_at >= since.strftime("%Y-%m-%d %H:%M:%S")
        ).count()

    def get_admin_logs(
            self, 
            page: int = 1,
            page_size: int = 100,
            user_id: int = None,
            from_date: str = None,
            to_date: str = None
        ):
            """管理画面用ログ取得
            
            Args:
                page: ページ番号
                page_size: ページサイズ
                user_id: ユーザーIDフィルタ
                from_date: 開始日フィルタ（YYYY-MM-DD）
                to_date: 終了日フィルタ（YYYY-MM-DD）
            
            Returns:
                total_count, page_size, page, messages を含む辞書
            """
            offset = (page - 1) * page_size
            
            query = (
                self.db.query(ChatMessageTable, ChatUserTable)
                .join(ChatUserTable, ChatMessageTable.chat_user_id == ChatUserTable.id)
            )
            
            if user_id:
                query = query.filter(ChatMessageTable.chat_user_id == user_id)
            
            if from_date:
                f_date = datetime.strptime(from_date, "%Y-%m-%d")
                query = query.filter(ChatMessageTable.created_at >= f_date)
            
            if to_date:
                t_date = datetime.strptime(to_date + " 23:59:59", "%Y-%m-%d %H:%M:%S")
                query = query.filter(ChatMessageTable.created_at <= t_date)
            
            query = query.order_by(ChatMessageTable.created_at.asc())
            
            total_count = query.count()
            messages = query.offset(offset).limit(page_size).all()
            
            results = [
                {
                    "user_id": user.id,
                    "chat_uid": user.chat_uid,
                    "gender": user.gender,
                    "residence": user.residence,
                    "role": message.role,
                    "message": message.message,
                    "menus_json": message.menus_json,
                    "created_at": message.created_at.isoformat(),
                }
                for message, user in messages
            ]
            
            return {
                "total_count": total_count,
                "page_size": page_size,
                "page": page,
                "messages": results,
            }