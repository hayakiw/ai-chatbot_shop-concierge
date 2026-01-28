from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy.sql.expression import func
from models.menu import MenuTable
from google.genai import types

def get_shop_tools(db: Session):
    f"""
    Geminiに提供するツール群
    Returns:
        type: text or menu
        message: メッセージ
        menu: メニュー(dict)
    """
    def get_shop_details():
        """
        店舗情報を表示します。
        """
        detail = """以下の店舗情報をご覧ください。

店舗名: ドッグサロンF
営業時間: 10時～17時（金曜定休日）
電話番号: 08012345678
住所: 〒683-0036 鳥取県米子市弥生町

最新情報は公式サイトをご確認ください。
"""

        return {
            "type": "text",
            "message": detail
        }

    def search_menus(
        name: Optional[str] = None, 
        category: Optional[str] = None
    ):
        """
        メニュー情報を検索します。
        
        Args:
            name: 名前やキーワード（例：といぷーどる）
            category: メニューのカテゴリ（例：カットシャンプー、シャンプー）
        """
        query = db.query(MenuTable)

        # フィルタリングロジック
        if name:
            query = query.filter(or_(
                MenuTable.name.contains(name),
                MenuTable.name_kana.contains(name)
            ))
        if category:
            query = query.filter(MenuTable.category.contains(category))

        # TODO ひとまずランダムで取得
        results = query.order_by(func.rand()).limit(10).all()

        # Geminiが理解しやすい辞書形式に変換
        formatted_results = []
        for s in results:
            menu_data = {
                "menu_id": s.menu_id,
                "name": s.name,
                "name_kana": s.name_kana,
                "category": s.category,
                "description": s.description,
                "price": s.price,
                "page_url": s.page_url,
                "thumbnail_url": s.thumbnail_url,
            }
            formatted_results.append(menu_data)

        return {
            "type": "menu",
            "message": "以下のメニューをご覧ください。" if formatted_results else "該当のメニューは見つかりませんでした",
            "menus": formatted_results
        }

    # === Geminiに渡す宣言 ===
    tools = [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="get_shop_details",
                    description="店舗情報を取得します",
                ),
                types.FunctionDeclaration(
                    name="search_menus",
                    description="メニュー情報を検索します",
                    parameters={
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "メニューのひらがな名称。例：といぷーどる"
                            },
                            "category": {
                                "type": "string",
                                "description": "メニューカテゴリの詳細説明。（例：シャンプーコース、カットコース、オプション、単品）"
                            },
                        }
                    }
                ),
            ]
        )
    ]

    # 実行用マップ
    function_map = {
        "get_shop_details": get_shop_details,
        "search_menus": search_menus,
    }

    return tools, function_map