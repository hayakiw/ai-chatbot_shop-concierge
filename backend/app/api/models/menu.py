from typing import Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Numeric, Text
from pydantic import BaseModel, field_validator
from db.database import Base, ENGINE

# テーブル定義
class MenuTable(Base):
    __tablename__ = 'menus'
    id = Column(Integer, primary_key=True, autoincrement=True)
    menu_id = Column(Integer, nullable=False)
    name = Column(String(255), nullable=False)
    name_kana = Column(String(255), nullable=True)
    category = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    price = Column(Integer, nullable=True)
    page_url = Column(String(255), nullable=True)
    thumbnail_url = Column(String(255), nullable=True)

    created_at = Column(String(30), nullable=True)

# モデル定義
class Menu(BaseModel):
    id: int
    menu_id: Optional[int] = None
    name: str
    name_kana: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    page_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: datetime

# 検索結果をリストで返す時用
class MenuList(BaseModel):
    results: list[Menu]

def main():
    # テーブル構築
    Base.metadata.create_all(bind=ENGINE)

if __name__ == "__main__":
    main()
