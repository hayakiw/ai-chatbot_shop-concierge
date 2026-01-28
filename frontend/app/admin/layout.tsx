// app/admin/layout.tsx
import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 共通ヘッダーメニュー */}
      <header className="bg-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左側：タイトル */}
            <div className="flex items-center">
              <Link href="/admin/logs" className="text-xl font-bold">
                AIコンシェルジュ 管理
              </Link>
            </div>

            {/* 右側：ナビゲーション */}
            <nav className="flex space-x-8">
              <Link 
                href="/admin/logs" 
                className="hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium"
              >
                チャットログ一覧
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ページ固有のコンテンツが入るエリア */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          {children}
        </div>
      </main>
    </div>
  );
}