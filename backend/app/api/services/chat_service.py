from repositories.chat_repository import ChatRepository
from services.rate_limit_service import RateLimitService
from enums.chat_message_role import ChatMessageRole

class UserNotFoundException(Exception):
    """ユーザーが見つからない場合の例外"""
    pass

class RateLimitExceededException(Exception):
    """レート制限超過時の例外"""
    pass

class ChatService:
    def __init__(
        self, 
        repository: ChatRepository,
        db 
    ):
        self.repository = repository
        self.db = db

    def init_chat_request(self, uid: str, gender: str, residence: str):
        """チャットユーザーを初期化
        
        新規ユーザー情報をデータベースに登録します。
        
        Args:
            uid (str): チャットUID（UUID形式）
            gender (str): 性別
            residence (str): 居住地（県内/県外）
        
        Returns:
            None
        """
        self.repository.create_user(
            uid,
            gender,
            residence
        )

    
    async def process_chat_request(self, chat_uid: str, prompt: str, ip_address: str, rate_limit_service: RateLimitService, llm_service):
        """チャットリクエストの処理
        
        Args:
            chat_uid: チャットユーザーのUID
            prompt: ユーザーからのプロンプト
            ip_address: リクエスト元のIPアドレス
            rate_limit_service: レート制限チェック
            llm_service: llm処理
            
        Returns:
            LLMからのレスポンス
            
        Raises:
            UserNotFoundException: ユーザーが見つからない場合
            RateLimitExceededException: レート制限を超えた場合
        """

        self.rate_limit_service = rate_limit_service
        self.llm_service = llm_service

        # ユーザー検索
        chat_user = self.repository.get_user_by_chat_uid(chat_uid)
        if not chat_user:
            raise UserNotFoundException("ユーザーが見つかりません")
        
        # メッセージ保存
        self.repository.create_message(
            chat_user.id,
            ChatMessageRole.USER.value,
            prompt,
            None,
            ip_address
        )
        
        # レート制限チェック
        is_allowed, count = self.rate_limit_service.check_rate_limit(chat_user.id)
        if not is_allowed:
            raise RateLimitExceededException(
                "ご利用回数の上限に達しました。しばらく時間をおいてから再度お試しください。"
            )
        
        # LLM処理（非同期で呼び出し）
        responses = await self.llm_service.generate_gemini_functioncalling(prompt, self.db)

        # メッセージ保存
        for response in responses:
            message = response.get("message")
            menus = response.get("menus")
            self.repository.create_message(
                chat_user.id,
                ChatMessageRole.ASSISTANT.value,
                message,
                menus,
                ip_address
            )

        return responses