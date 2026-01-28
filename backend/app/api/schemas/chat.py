from pydantic import BaseModel, Field, field_validator
from enums.gender import Gender
from enums.residence import Residence

class ChatInitRequest(BaseModel):
    """チャット初期化リクエスト
    
    初回チャット利用時のユーザー情報登録。
    
    Attributes:
        gender: 性別（male/female/unknown）
        residence: 居住地（in_prefecture/out_prefecture）
    """
    gender: Gender = Field(..., description="性別（male/female/unknown）")
    residence: Residence = Field(..., description="居住地（in_prefecture/out_prefecture）")
    
    @field_validator('gender', mode='before')
    @classmethod
    def validate_gender(cls, v):
        if not v:
            raise ValueError('性別を選択してください')
        
        if v not in ['male', 'female', 'unknown']:
            raise ValueError('性別は male, female, unknown のいずれかを指定してください')
        return v
    
    @field_validator('residence', mode='before')
    @classmethod
    def validate_residence(cls, v):
        if not v:
            raise ValueError('居住地を選択してください')
        
        if v not in ['in_prefecture', 'out_prefecture']:
            raise ValueError('居住地は in_prefecture, out_prefecture のいずれかを指定してください')
        return v

class ChatRequest(BaseModel):
    """チャットリクエスト
    
    ユーザーからの質問をLLMに送信するリクエスト。
    
    Attributes:
        chat_uid: チャットUID（初期化時に発行されたUID）
        prompt: ユーザーからの質問文
    """
    chat_uid: str = Field(..., description="チャットUID")
    prompt: str = Field(..., description="質問文")

    @field_validator('prompt')
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        # 空チェック
        if not v or not v.strip():
            raise ValueError('質問文を入力してください')

        v_stripped = v.strip()

        # 文字数チェック
        if len(v_stripped) < 1:
            raise ValueError('質問文は1文字以上入力してください')
        if len(v_stripped) > 1000:
            raise ValueError('質問文は1000文字以内で入力してください')

        return v_stripped