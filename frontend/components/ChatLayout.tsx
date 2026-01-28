import { ReactNode } from "react";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center items-center">
      <div className="w-full h-auto flex flex-col">
        <main className="flex-1 space-y-3">
          {children}
        </main>
      </div>
    </div>
  );
}
