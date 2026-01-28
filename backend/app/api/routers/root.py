from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from db.database import get_db
from datetime import datetime
from models.menu import MenuTable

router = APIRouter()

@router.get("/")
def Hello(request: Request):
    client_host = request.client.host
    return {"Hello":client_host}

# テスト用
@router.get("/insert/menus")
def InsertMenus(db: Session = Depends(get_db)):
    import pandas as pd
    import numpy as np
    from sqlalchemy import text

    # Excelファイルのパス
    excel_path = "storage/data/menus.xlsx"

    # Excelファイルを読み込む
    try:
        df = pd.read_excel(excel_path)
        # 全体の NaN を None に一括置換
        # これにより、JSON変換時にエラーにならず 'null' として出力されます
        df_clean = df.replace({np.nan: None})

        # A～O列のデータを1行筒読み込む
        rows = []
        for _, row in df_clean.iterrows():
            # 0〜15列目を取得してリスト化
            values = row.iloc[0:16].tolist()
            rows.append(values)

        # menusテーブルをtruncateして初期化
        try:
            db.execute(text("TRUNCATE TABLE menus"))
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"menusテーブルの初期化に失敗しました: {str(e)}")

        # データをDBに登録
        for row in rows:
            menu = MenuTable(
                menu_id=row[0],
                name=row[1],
                name_kana=row[2],
                category=row[3],
                description=row[4],
                price=row[5],
                page_url=row[6],
                thumbnail_url=row[7],
                created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            )
            db.add(menu)
        db.commit()
        return {"res":"OK"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"ファイルの読み込みに失敗しました: {str(e)}")
