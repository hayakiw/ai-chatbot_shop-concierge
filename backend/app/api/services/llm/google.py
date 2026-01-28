from sqlalchemy.orm import Session
from google import genai
from google.genai import types
from services.llm.tools.shop_tools import get_shop_tools
from utils.prompts import get_system_prompt

from config import Settings
import logging
logger = logging.getLogger(__name__)

class LlmGoogleService:

    async def generate_gemini_functioncalling(self, prompt: str, db: Session) -> str:
        client = genai.Client(api_key=Settings.GEMINI_API_KEY)

        tools, function_map = get_shop_tools(db)
        shop_concierge_prompt = get_system_prompt(prompt_type="shop_concierge")

        chat = client.chats.create(
            model=Settings.GEMINI_API_MODEL,
            config=types.GenerateContentConfig(
                tools=tools,
                system_instruction=(shop_concierge_prompt),
            )
        )

        response = chat.send_message(prompt)

        # Debug log
        logger.info("Debug functioncalling response")
        logger.info(response.text)
        logger.info(response.candidates[0].content.parts)

        # 検索する場合はfunctionを実行し情報を取得
        search_functions = {
            "get_shop_details": "店舗情報",
            "search_menus": "メニュー",
        }

        tool_responses = []

        for part in response.candidates[0].content.parts:
            if not part.function_call:
                continue
            
            func_call = part.function_call
            func = function_map.get(func_call.name)

            # 定義されていないfunction
            if not func or func_call.name not in search_functions:
                continue

            # Debug log
            logger.info("= " + func_call.name)
            logger.info(func_call.args)

            # ツールの処理
            tool_response = func(**func_call.args)
            tool_responses.append(tool_response)

        if tool_responses:
            return tool_responses

        return  [
            {
                "type": "text",
                "message": response.text
            }
        ]
