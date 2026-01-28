"use client";

import { useState, useEffect } from "react";

// APIレスポンスに基づいた型定義
interface LogMessage {
  user_id: number;
  chat_uid: string;
  gender: string;
  residence: string;
  role: string; // "user" or "assistant"
  message: string;
  menus_json: string;
  created_at: string;
}

export default function AdminLogsPage() {
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page_size, setPageSize] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // 検索クエリの状態管理
  const [userId, setUserId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/logs`, {
        method: "POST", // GETからPOSTに変更
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page: page,
          user_id: userId || null,
          from_date: fromDate || null, // 空文字の場合はnullを送信
          to_date: toDate || null,
        }),
      });

      const json = await res.json();
      
      if (json.status === "ok") {
        setMessages(json.messages);
        setTotalCount(json.total_count);
        setPageSize(json.page_size);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]); // ページ切り替え時に再取得

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // 検索時は1ページ目に戻す
    fetchLogs();
  };

  const totalPages = Math.ceil(totalCount / page_size);

  // 表示するページ番号の範囲を計算（例：現在のページの前後2〜3ページなど）
  const getPageNumbers = () => {
    const range = 2; // 現在のページの前後に表示する数
    const nums = [];
    for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
      nums.push(i);
    }
    return nums;
  };

  const pageNumbers = getPageNumbers();

  // メッセージの長さを判定して切り替えるコンポーネント
  const ExpandableMessage = ({ message, menus_json }: { message: string, menus_json?: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const THRESHOLD = 200; // 制限文字数

    let menus = [];
    if (menus_json && typeof menus_json === 'string' && menus_json != '') {
      try {
        // 1. Pythonの None を null に置換
        // 2. シングルクォートをダブルクォートに置換
        let sanitized = menus_json
          .replace(/None/g, 'null')
          .replace(/'/g, '"');

        menus = JSON.parse(sanitized);
          
        // もしデータがシングルクォーテーションを含む特殊な形式なら置換が必要な場合があります
        // 通常のJSONなら JSON.parse(menus_json) でOK
        // menus = JSON.parse(menus_json.replace(/'/g, '"')); 
      } catch (e) {
        console.error("JSONのパースに失敗しました", e);
      }
    }

    return (
      <div className="max-w-full">
        <label className="block">
          <input type="checkbox" className="peer hidden" />
          <div className="peer-checked:line-clamp-none line-clamp-3 whitespace-pre-wrap">
            <div>{message}</div>

            {/* menus がある場合のみリストを表示 */}
            {Array.isArray(menus) && menus.length > 0 && (
              <div className="mt-2 space-y-3 pt-1">
                {menus.map((menu: any, index: number) => (
                  <div key={index} className="bg-slate-50 p-1 rounded">
                    <div className="font-bold text-blue-700">{menu.name}</div>
                    <div className="text-sm text-gray-700 mt-1">{menu.description}</div>
                    <div className="text-sm text-gray-700 mt-1">{menu.price}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </label>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">チャットログ一覧</h1>
        
        {/* 日付検索フォーム */}
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3 bg-gray-50 p-3 rounded-lg border">
          <div>
            <label className="block text-xs text-gray-500 mb-1">ユーザーID</label>
            <input 
              type="text" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">開始日</label>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="self-center pt-4 text-gray-400">～</div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">終了日</label>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            type="submit"
            className="bg-slate-800 text-white px-4 py-1.5 rounded text-sm hover:bg-slate-700 transition"
          >
            検索
          </button>
        </form>
      </div>

      <div className="w-full overflow-hidden border rounded-lg bg-white shadow-sm">
        {/* table-fixed を指定し、各列の幅を固定します */}
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* 日時は140px固定 */}
              <th className="w-[140px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                送信日時
              </th>
              {/* ユーザーは最低80px、固定100px程度に設定 */}
              <th className="w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ユーザーID
              </th>
              {/* 属性は最低80px、固定100px程度に設定 */}
              <th className="w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                属性
              </th>
              {/* 送信者は80px固定 */}
              <th className="w-[80px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                送信者
              </th>
              {/* メッセージは幅を指定せず、残りの全幅を自動で使う */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メッセージ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {messages.map((log, index) => (
              <tr key={`${log.chat_uid}-${index}`} className="hover:bg-gray-50 transition">
                {/* 送信日時 */}
                <td className="px-4 py-4 break-words text-gray-500 text-xs">
                  {new Date(log.created_at).toLocaleString("ja-JP")}
                </td>

                {/* ユーザーID */}
                <td className="px-4 py-4 break-words text-gray-500 text-xs">
                  {log.user_id}
                </td>

                {/* 属性 (最低幅を確保しつつ改行を許可) */}
                <td className="px-4 py-4">
                  <div className="flex text-xs space-y-1">
                    <span className="text-gray-700 font-medium truncate">
                      {log.residence === 'in_prefecture' ? '県内' : log.residence === 'out_prefecture' ? '県外' : log.residence}
                    </span>
                    <span className="text-gray-400"> / </span>
                    <span className="text-gray-700 truncate">
                      {log.gender === 'male' ? '男性' : log.gender === 'female' ? '女性' : '不明'}
                    </span>
                  </div>
                </td>

                {/* 送信者 */}
                <td className="px-4 py-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    log.role === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {log.role.toUpperCase()}
                  </span>
                </td>

                {/* メッセージ (ここがメインで伸縮し、長い場合は折り返す) */}
                <td className="px-4 py-4 text-gray-700 break-words leading-relaxed">
                  <ExpandableMessage 
                    message={log.message} 
                    menus_json={log.menus_json} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ページネーション情報 */}
      <div className="flex items-center justify-between px-2 mt-6">
        <p className="text-sm text-gray-500">
          合計: <span className="font-bold text-gray-700">{totalCount}</span> 件 
          ({page} / {totalPages} ページ)
        </p>
        
        <div className="flex gap-1">
          {/* 最初へ */}
          <button
            disabled={page === 1}
            onClick={() => setPage(1)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-30 hover:bg-gray-100"
          >
            &laquo;
          </button>

          {/* 前へ */}
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-30 hover:bg-gray-100 mr-2"
          >
            前へ
          </button>

          {/* ページ番号（最大5つ程度表示） */}
          {pageNumbers[0] > 1 && <span className="px-2 py-1 text-gray-400">...</span>}
          
          {pageNumbers.map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-3 py-1 border rounded text-sm transition ${
                page === num 
                  ? "bg-slate-800 text-white border-slate-800" 
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              {num}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && <span className="px-2 py-1 text-gray-400">...</span>}

          {/* 次へ */}
          <button 
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-30 hover:bg-gray-100 ml-2"
          >
            次へ
          </button>

          {/* 最後へ */}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-30 hover:bg-gray-100"
          >
            &raquo;
          </button>
        </div>
      </div>

    </div>
  );
}