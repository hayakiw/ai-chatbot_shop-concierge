from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Numeric, Text
from pydantic import BaseModel, field_validator
from db.database import Base, ENGINE

# テーブル定義
class ChatUserTable(Base):
    __tablename__ = 'chat_users'
    id = Column(Integer, primary_key=True, autoincrement=True)

    chat_uid = Column(String(255), nullable=False)
    gender = Column(String(255), nullable=False)
    residence = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)

    created_at = Column(String(30), nullable=True)

# モデル定義
class ChatUser(BaseModel):
    id: int
    chat_uid: str
    gender: str
    residence: str
    age: int
    created_at: datetime

def main():
    # テーブル構築
    Base.metadata.create_all(bind=ENGINE)

if __name__ == "__main__":
    main()
