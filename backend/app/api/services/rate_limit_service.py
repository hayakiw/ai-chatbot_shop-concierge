from datetime import datetime, timedelta
from repositories.chat_repository import ChatRepository

class RateLimitService:
    def __init__(self, repository: ChatRepository, limit_per_hour: int):
        self.repository = repository
        self.limit_per_hour = limit_per_hour
    
    def check_rate_limit(self, chat_user_id: int) -> tuple[bool, int]:
        """レート制限チェック
        
        Returns:
            (is_within_limit, current_count)
        """
        one_hour_ago = datetime.now() - timedelta(hours=1)
        count = self.repository.count_recent_messages(chat_user_id, one_hour_ago)
        return count < self.limit_per_hour, count
