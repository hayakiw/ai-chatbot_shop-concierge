from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Numeric, Text
from pydantic import BaseModel, field_validator
from db.database import Base, ENGINE

# テーブル定義
class ChatMessageTable(Base):
    __tablename__ = 'chat_messages'
    id = Column(Integer, primary_key=True, autoincrement=True)

    chat_user_id = Column(Integer, nullable=False)
    role = Column(String(255), nullable=False)      # 'user', 'assistant'
    message = Column(Text, nullable=False)
    menus_json = Column(Text, nullable=True)

    ip_address = Column(String(255), nullable=True)
    created_at = Column(String(30), nullable=True)

# モデル定義
class ChatMessage(BaseModel):
    id: int
    chat_user_id: int
    role: str
    message: str
    menus_json: str
    ip_address: str
    created_at: datetime

def main():
    # テーブル構築
    Base.metadata.create_all(bind=ENGINE)

if __name__ == "__main__":
    main()
