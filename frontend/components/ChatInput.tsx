"use client";

import { useState } from "react";

type Props = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div
      className="fixed bottom-0 left-0 w-full
                 p-2 bg-white dark:bg-zinc-900
                 border-t border-gray-200 dark:border-zinc-700"
    >
      <p className="mb-1 text-xs text-gray-600 dark:text-gray-400">
        質問を入力してください
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={disabled}
          placeholder="メニューを教えて"
          className="flex-1 px-3 py-2 text-sm rounded
                     bg-gray-100 dark:bg-zinc-700
                     text-black dark:text-white
                     placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={send}
          disabled={disabled}
          className="px-4 py-2 text-sm rounded bg-blue-500 text-white
                     hover:bg-blue-600 disabled:opacity-50"
        >
          送信
        </button>
      </div>
    </div>
  );
}
