from datetime import datetime

class PromptTemplate:
    """プロンプトテンプレートの基底クラス"""
    
    def __init__(self, template: str):
        self.template = template
    
    def format(self, **kwargs) -> str:
        """テンプレートに変数を埋め込む"""
        return self.template.format(**kwargs)


class SystemPrompts:
    """システムプロンプト集"""

    DEFAULT = """あなたは親切で有能なAIアシスタントです。
ユーザーの質問に対して、正確で分かりやすい回答を提供してください。

現在の日時: {current_time}
"""

    SHOP_CONCIERGE_PROMPT = """あなたは店舗情報の案内に特化したAIチャットボットです。

現在の日時: {current_time}

# ツール使用ルール
・店舗情報、メニューに関する情報はツールを使用してください
・一般的な説明のみの場合はツール不要です

# 回答ルール
・必ず日本語で簡潔で分かりやすく回答してください
・出力はプレーンテキストのみでMarkdown記法（#, *, -, _, `, > など）は一切使用しないでください

# 移動案内ルール
・出発地と目的地を含む移動案内では、GoogleMapリンクを表示してください

# 注意事項
・営業時間、定休日、料金、イベント情報など変動する可能性がある内容に触れる場合は
　「最新情報は公式サイトをご確認ください」と必ず補足してください
・不確かな情報は断定せず、慎重に表現してください

# 制限事項
・お店に関係しない質問には「申し訳ありませんが、お店に関するご質問のみお答えできます」のみ表示してください
"""

def get_system_prompt(
    prompt_type: str = "default",
    **kwargs
) -> str:
    """
    システムプロンプトを取得
    
    Args:
        prompt_type: "default"
        **kwargs: テンプレート変数
    
    Returns:
        フォーマット済みプロンプト
    """
    prompts = {
        "default": SystemPrompts.DEFAULT,
        "shop_concierge": SystemPrompts.SHOP_CONCIERGE_PROMPT
    }
    
    template = prompts.get(prompt_type, SystemPrompts.DEFAULT)
    
    # デフォルト値を設定
    defaults = {
        "current_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    defaults.update(kwargs)
    
    return template.format(**defaults)