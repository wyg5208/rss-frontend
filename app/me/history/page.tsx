"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useArticleStore } from "@/store/useArticleStore";
import ArticleCard from "@/components/ArticleCard";

export default function HistoryPage() {
  const router = useRouter();
  const { readHistory } = useArticleStore();

  return (
    <div className="flex flex-col min-h-screen pb-14">
      <header className="sticky top-0 z-30 bg-white safe-top border-b border-gray-100">
        <div className="h-[52px] flex items-center px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold ml-3">阅读历史</h1>
        </div>
      </header>

      <div className="flex-1">
        {readHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-300">
            <p className="text-sm">暂无阅读记录</p>
          </div>
        ) : (
          readHistory.map((a) => <ArticleCard key={a.id} article={a} />)
        )}
      </div>
    </div>
  );
}
