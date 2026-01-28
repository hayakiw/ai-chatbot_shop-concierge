"use client";

import { useState } from "react";

type InitForm = {
  gender: string;
  residence: string;
  // agreed: boolean;
};

type Props = {
  onComplete: (form: InitForm) => void;
};

export default function ChatInit({ onComplete }: Props) {
  const [gender, setGender] = useState("");
  const [residence, setResidence] = useState("");
  // const [agreed, setAgreed] = useState(false);

  const canSubmit = gender && residence;

  return (
    <div className="p-4 space-y-4">

      <div className="px-4 py-2 rounded-lg break-words whitespace-pre-wrap bg-white">
        こんにちは。<br />お店をご案内するAIコンシェルジェです。<br />
        店舗情報やメニューなど、気になることをお気軽にお聞きください。<br />
        間違った情報を回答してしまうことがあるため、正確な情報は公式ページを参照ください。
      </div>

      {/* 利用規約 */}
      <a
        className="w-full py-2 rounded border border-blue-500 bg-white text-blue-500 block text-center hover:bg-blue-50 transition-colors"
        href="/terms"
        target="_blank"
        rel="noopener noreferrer"
      >
        利用規約
      </a>

      <div className="px-4 py-2 rounded-lg break-words whitespace-pre-wrap bg-white">
        上記の利用規約に同意した方は、以下のアンケートに回答をお願いします。
      </div>

      {/* 性別 */}
      <div className="px-4 py-2 rounded-lg text-sm break-words whitespace-pre-wrap bg-white">
        <div className="font-bold mb-2">性別を教えてください</div>
        <div className="flex flex-col gap-2">
          {[
            { label: "男性", value: "male" },
            { label: "女性", value: "female" },
            { label: "その他", value: "unknown" },
          ].map((item) => (
            <label
              key={item.value}
              className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                gender === item.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="gender"
                className="mr-3 h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                value={item.value}
                checked={gender === item.value}
                onChange={(e) => setGender(e.target.value)}
              />
              <span className="text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* お住まい */}
      <div className="px-4 py-2 rounded-lg text-sm break-words whitespace-pre-wrap bg-white">
        <div className="font-bold mb-1">お住まいを教えてください</div>
        <div className="flex flex-col gap-2">
          {[
            { label: "鳥取県内", value: "in_prefecture" },
            { label: "鳥取県外", value: "out_prefecture" },
          ].map((item) => (
            <label
              key={item.value}
              className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                residence === item.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="residence"
                className="mr-3 h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                value={item.value}
                checked={residence === item.value}
                onChange={(e) =>
                  setResidence(e.target.value as "in_prefecture" | "out_prefecture")
                }
              />
              <span className="text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 送信 */}
      <button
        type="button"
        disabled={!canSubmit}
        onClick={() =>
          onComplete({
            gender,
            residence,
            // agreed,
          })
        }
        className={`w-full py-2 rounded text-white ${
          canSubmit ? "bg-blue-600" : "bg-gray-400"
        }`}
      >
        チャットを開始
      </button>
    </div>
  );
}
