import os
from dotenv import load_dotenv
from os.path import join, dirname

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

class Settings:
    APP_DEBUG = os.environ.get("APP_DEBUG")
    APP_FRONTEND_URL = os.environ.get("APP_FRONTEND_URL", "http://localhost:3000")

    # DB接続情報
    DATABASE = os.environ.get("DATABASE")
    DB_USER = os.environ.get("DB_USER")
    DB_PASSWORD = os.environ.get("DB_PASSWORD")
    DB_HOST = os.environ.get("DB_HOST")
    DB_PORT = os.environ.get("DB_PORT")
    DB_NAME = os.environ.get("DB_NAME")

    # Paging
    ADMIN_PAGE_SIZE = os.environ.get("ADMIN_PAGE_SIZE")

    # Chat Limit
    CHAT_LIMIT_PER_HOUR = os.environ.get("CHAT_LIMIT_PER_HOUR")

    # LLM情報
    GEMINI_API_MODEL = os.environ.get("GEMINI_API_MODEL")
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
