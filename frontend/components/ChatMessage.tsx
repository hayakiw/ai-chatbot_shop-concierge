export type Menu = {
  menu_id: number
  name: string
  name_kana: string
  category: string
  description: string
  price: number | null
  page_url?: string
  thumbnail_url?: string
}

type Props = {
  role: "user" | "bot";
  type: string;
  message: string;
  menus: Menu[];
};

const linkify = (text: string) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};
  
export default function ChatMessage({ role, type, message, menus }: Props) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-lg text-sm break-words whitespace-pre-wrap
          ${isUser
            ? "bg-[#4cbabf] text-white"
            : "bg-white text-gray-900 dark:bg-zinc-700 dark:text-white"
          }`}
      >
        {linkify(message)}

        {type === "menu" && menus && Array.isArray(menus) && menus.length > 0 && (
          <div className="mt-3">
            {menus.map((menu: any, idx: number) => (
              <div
                key={idx}
                className="mb-4 flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <span className="inline-block px-2 py-0.5 mb-2 text-[10px] font-semibold tracking-wider uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                    {menu.category}
                  </span>

                  <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100 mb-1">
                    {menu.name}
                  </h3>

                  {menu.description && (
                    <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {menu.description}
                    </p>
                  )}
                </div>

                <div className="flex items-end sm:items-start justify-end">
                  {menu.price && (
                    <span className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                      <span className="text-xs font-normal mr-0.5">¥</span>
                      {menu.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
  