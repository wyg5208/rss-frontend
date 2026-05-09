"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

interface BlockedArticle {
  interaction_id: number;
  article_id: number;
  created_at: string;
  article: {
    id: number;
    title: string;
    original_url: string | null;
    published_at: string | null;
  } | null;
}

export default function BlockedPage() {
  const router = useRouter();
  const [blockedArticles, setBlockedArticles] = useState<BlockedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  // 获取不看列表
  const fetchBlockedArticles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<{
        items: BlockedArticle[];
        total: number;
        page: number;
        size: number;
        has_next: boolean;
      }>("/user/blocks?page=1&size=100");
      
      setBlockedArticles(response.items || []);
    } catch (error) {
      console.error("获取不看列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlockedArticles();
  }, [fetchBlockedArticles]);

  // 取消不看（恢复可见）
  const handleUnblock = async (articleId: number) => {
    setProcessing(articleId);
    try {
      const response = await api.post<{ 
        success: boolean; 
        is_blocked: boolean; 
        message?: string 
      }>(`/user/blocks/${articleId}`);
      
      if (response.success && !response.is_blocked) {
        // 从列表中移除
        setBlockedArticles(prev => prev.filter(item => item.article_id !== articleId));
      }
    } catch (error) {
      console.error("取消不看失败:", error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-14">
      <header className="sticky top-0 z-30 bg-white safe-top border-b border-gray-100">
        <div className="h-[52px] flex items-center px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold ml-3">忽略文章</h1>
          <span className="ml-auto text-sm text-gray-500">
            {blockedArticles.length} 篇
          </span>
        </div>
      </header>

      <div className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            <p className="text-sm text-gray-400 mt-3">加载中...</p>
          </div>
        ) : blockedArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-300">
            <p className="text-sm">暂无忽略的文章</p>
            <p className="text-xs text-gray-400 mt-2">在文章详情页点击"不看"按钮可添加</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {blockedArticles.map((item) => (
              <div
                key={item.interaction_id}
                className="px-4 py-3 bg-white active:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      {item.article?.title || "文章已删除"}
                    </h3>
                    {item.article?.published_at && (
                      <p className="text-xs text-gray-400">
                        {dayjs(item.article.published_at).format("YYYY-MM-DD HH:mm")}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      忽略于 {dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnblock(item.article_id)}
                    disabled={processing === item.article_id}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-300 rounded-full hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processing === item.article_id ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></span>
                        处理中
                      </span>
                    ) : (
                      "恢复显示"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
