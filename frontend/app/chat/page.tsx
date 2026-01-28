"use client";

import { useState, useEffect } from "react";
import ChatLayout from "@/components/ChatLayout";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ChatInit from "@/components/ChatInit";

export default function ChatPage() {
  const [initialized, setInitialized] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; type: string; message: string; menus: any[] }[]
  >([]);

  useEffect(() => {
    const init = localStorage.getItem("ai_chatbot_uuid");
    if (!init) {
      setInitialized(false);
    }
  }, []);

  const sendChatInit = async (form: {
    gender: string;
    residence: string;
    // agreed: boolean;
  }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form)
      });
  
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json();
      if (data.status == "ok") {
        localStorage.setItem("ai_chatbot_uuid", data.chat_uid);
        setInitialized(true);
      } else {
        alert("初期化に失敗しました");
      }
    } catch (err) {
      console.error(err);
      alert("初期化に失敗しました");
    }
  };

  const sendMessage = async (text: string) => {
    setMessages((prev) => [...prev, { role: "user", type: "text", message: text, menus: [] }]);

    const aiChatbotUuid = localStorage.getItem("ai_chatbot_uuid");
    if (aiChatbotUuid === null) {
      window.location.reload();
      return;
    }

    setIsLoading(true);

    const formData = {
      chat_uid: aiChatbotUuid,
      prompt: text,
    };

    try {
      // Botからのストリームレスポンスを受信して表示する
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        setIsLoading(false);
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.status == "ok") {
        setIsLoading(false);
        for (const response of data.responses) {
          setMessages((prev) => [
            ...prev,
            { 
              role: "bot", 
              type: response.type, 
              message: response.message, 
              menus: response.menus || []
            }
          ]);
        }
      } else {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          { role: "bot", type: "text", message: "只今ご利用いただけません。時間をおいて、再度お試しください。", menus: [] }
        ]);
        if (data.type == "not_found") {
          // キーが存在しない場合は再生成
          localStorage.removeItem("ai_chatbot_uuid");
          setInitialized(false);
        }
      }

      // 自動スクロール
      // チャットメッセージ追加時に一番下までスクロールする
      // (ChatMessageエリアのrefが無ければ、setTimeoutでwindow.scrollTo)
      setTimeout(() => {
        const chatArea = document.getElementById('chat-area');
        if (chatArea) {
          chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: "smooth"
          });
          console.log("Scrolling to:", chatArea.scrollHeight);
        }
      }, 100);

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <ChatLayout>
      <div className="flex flex-col">
        {/* 初回登録 */}
        {!initialized && (
          <ChatInit onComplete={sendChatInit} />
        )}
        
        {/* チャット本体 */}
        {initialized && (<>
          <div className="flex-1 p-4 mb-[75px] h-auto max-h-[calc(100vh-80px)] overflow-y-auto" id="chat-area">
            {messages.map((m, i) => (
              <ChatMessage key={i} role={m.role} type={m.type} message={m.message} menus={m.menus} />
            ))}

            <div className="flex justify-end">
            {isLoading && (
              <div className="flex items-center space-x-2 mt-2">
                <svg
                  className="animate-spin h-5 w-5 text-[#4cbabf]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span className="text-xs text-gray-500">考え中...</span>
              </div>
            )}
            </div>
          </div>

          <ChatInput onSend={sendMessage} />
        </>)}
      </div>
    </ChatLayout>
  );
}
