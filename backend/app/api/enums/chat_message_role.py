from enum import Enum

class ChatMessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

    @property
    def label(self) -> str:
        return {
            ChatMessageRole.USER: "ユーザー",
            ChatMessageRole.ASSISTANT: "アシスタント",
        }[self]
