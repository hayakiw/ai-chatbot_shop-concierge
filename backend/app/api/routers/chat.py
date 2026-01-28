from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from db.database import get_db
import uuid
import logging
logger = logging.getLogger(__name__)

from services.chat_service import ChatService, UserNotFoundException, RateLimitExceededException
from services.rate_limit_service import RateLimitService
from services.llm.google import LlmGoogleService
from repositories.chat_repository import ChatRepository
from schemas.chat import ChatInitRequest, ChatRequest
from config import Settings

router = APIRouter()

@router.post("/chat/init")
async def ChatInit(
    request: ChatInitRequest, 
    db: Session = Depends(get_db)
):
    """チャット初期化API

    初回チャット利用時にユーザー情報を登録し、一意のチャットUIDを発行します。
    
    Args:
        request (ChatInitRequest): ユーザー情報
            - gender (str): 性別
            - residence (str): 居住地（県内/県外）
        db (Session): データベースセッション（DI経由で注入される）
    
    Returns:
        dict: レスポンスオブジェクト
            - status (str): "ok" または "error"
            - chat_uid (str): 新規発行されたチャットUID（UUID形式）
    """

    logger.info("Debug ChatInit Start")

    # 依存性の組み立て
    repository = ChatRepository(db)
    chat_service = ChatService(repository, db)

    uid = uuid.uuid4()
    try:
        response = chat_service.init_chat_request(
            uid,
            request.gender,
            request.residence
        )
        return {
            "status": "ok",
            "chat_uid": uid
        }

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return {
            "status": "error",
            "chat_uid": None
        }
        

@router.post("/chat/request")
async def ChatRequest(
    request: Request,
    chat_request: ChatRequest, 
    db: Session = Depends(get_db)
):
    """チャットリクエストAPI

    Args:
        request (Request): FastAPIのリクエストオブジェクト
        chat_request (ChatRequest): チャットリクエストの内容。ユーザーからのプロンプト等を含む
        db (Session): データベースセッション（DI経由で注入される）
    
    Returns:
        dict: レスポンスオブジェクト
            - status (str): "ok" または "error"
            - responses (list[dict]): 応答内容
                - type (str): "text" または "menu"
                - message (str): LLMから返された応答テキスト
                - menus (list, optional): メニュー情報の配列
    
    Raises:
        UserNotFoundException: ユーザーが見つからない場合
        RateLimitExceededException: レート制限を超えた場合
    """

    logger.info("Debug ChatRequest Start")
    
    # 依存性の組み立て
    repository = ChatRepository(db)
    chat_service = ChatService(repository, db)

    rate_limit_service = RateLimitService(
        repository, 
        int(Settings.CHAT_LIMIT_PER_HOUR)
    )
    llm_service = LlmGoogleService()

    try:
        responses = await chat_service.process_chat_request(
            chat_request.chat_uid,
            chat_request.prompt,
            request.client.host,
            rate_limit_service,
            llm_service
        )
        
        return {
            "status": "ok",
            "responses": responses
        }
    
    except UserNotFoundException as e:
        logger.warning(f"User not found: {str(e)}")
        return {
            "status": "error",
            "type": "not_found",
            "responses": [
                {
                    "type": "text",
                    "message": str(e)
                }
            ]
        }
    
    except RateLimitExceededException as e:
        logger.warning(f"Rate limit exceeded: {str(e)}")
        return {
            "status": "ok",
            "responses": [
                {
                    "type": "text",
                    "message": str(e)
                }
            ]
        }
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return {
            "status": "error",
            "type": "internal_error",
            "responses": [
                {
                    "type": "text",
                    "message": "エラーが発生しました。しばらくしてから再度お試しください。"
                }
            ]
        }

from google import genai
@router.get("/chat/test")
def ChatTest():
    client = genai.Client(api_key=Settings.GEMINI_API_KEY)

    response = client.models.generate_content(
        model='gemini-3-flash-preview', contents='モデルのバージョンを教えて'
    )

    return {"res":response.text}

