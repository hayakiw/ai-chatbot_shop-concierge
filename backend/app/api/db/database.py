from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from config import Settings

DATABASE = '%s://%s:%s@%s:%s/%s?charset=utf8mb4' % (
    Settings.DATABASE,
    Settings.DB_USER,
    Settings.DB_PASSWORD,
    Settings.DB_HOST,
    Settings.DB_PORT,
    Settings.DB_NAME,
)

ENGINE = create_engine(
    DATABASE,
    echo=True,
    pool_pre_ping=True,     # 接続使用前にPingして生存確認（接続切れ対策）
    pool_recycle=280,       # 秒数。MySQLのwait_timeoutより短めに設定
    pool_size=10,           # 接続プールの最大数（任意で調整）
    max_overflow=20         # プールを超えて許容される最大接続数
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=ENGINE
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
