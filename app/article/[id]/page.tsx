"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Heart, Share2, ChevronLeft, ChevronRight, Home, Type } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { useArticleDetail } from "@/hooks/useArticleDetail";
import { useArticleStore } from "@/store/useArticleStore";
import { useArticleNavStore } from "@/store/useArticleNavStore";
import SafeHTML from "@/components/SafeHTML";
import ImageWithFallback from "@/components/ImageWithFallback";
import ErrorBoundary from "@/components/ErrorBoundary";
import FloatingAISummary from "@/components/FloatingAISummary";
import { api } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";

dayjs.locale("zh-cn");

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: article, isLoading, error } = useArticleDetail(id);
  const { toggleFavorite, isFavorite, addToHistory } = useArticleStore();
  const { getPrevId, getNextId, hasPrev, hasNext } = useArticleNavStore();
  const [aiData, setAiData] = useState<{ ai_summary?: string; ai_key_points?: string[]; ai_processed_at?: string }>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [bilingualOn, setBilingualOn] = useState(false);
  const [showToast, setShowToast] = useState("");

  const loadAIData = useCallback(async () => {
    if (!article?.id) return;
    try {
      const res = await api.get<{ success: boolean; data: Record<string, unknown> }>(`/ai/article/${article.id}`);
      if (res.success && res.data) {
        setAiData({
          ai_summary: res.data.ai_summary as string | undefined,
          ai_key_points: res.data.ai_key_points as string[] | undefined,
          ai_processed_at: res.data.ai_processed_at as string | undefined
        });
      }
    } catch {
      // AI数据加载失败不影响主功能
    }
  }, [article?.id]);

  useEffect(() => {
    if (article) {
      addToHistory(article);
      api.post(`/rss/articles/${id}/view`).catch(() => {});
      loadAIData();
    }
  }, [article, id, addToHistory, loadAIData]);

  function handleAIPprocessed(data: { ai_summary: string; ai_key_points: string[] }) {
    setAiData({
      ai_summary: data.ai_summary,
      ai_key_points: data.ai_key_points,
      ai_processed_at: new Date().toISOString()
    });
  }

  // 生成AI摘要（供悬浮按钮调用）
  const handleGenerateAI = useCallback(async () => {
    if (!article?.id) return;
    setAiLoading(true);
    try {
      const response = await api.post<{ success: boolean; message: string; data: Record<string, unknown> }>(`/ai/process/${article.id}`);
      if (response.success && response.data) {
        handleAIPprocessed({
          ai_summary: (response.data.ai_summary as string) || "",
          ai_key_points: (response.data.key_points_success as boolean) ? (response.data.key_points as string[]) : []
        });
      }
    } catch {
      // 生成失败
    } finally {
      setAiLoading(false);
    }
  }, [article?.id]);

  // Toast提示
  const showToastMessage = useCallback((msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(""), 2000);
  }, []);

  const handleBilingualToggle = () => {
    if (!bilingualOn) {
      setBilingualOn(true);
      showToastMessage("双语阅读功能即将上线");
      // 延迟恢复开关状态
      setTimeout(() => setBilingualOn(false), 2000);
    }
  };

  if (isLoading) return (
    <div className="p-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  );

  if (error || !article) return (
    <div className="p-4 text-center text-red-500">
      <p>加载失败</p>
      <button onClick={() => router.back()} className="text-blue-600 mt-2">返回</button>
    </div>
  );

  const a = article;
  const fav = isFavorite(a.id);
  const content = a.clean_content || a.summary || "";
  const hasHTML = !!a.raw_content;
  const time = a.published_at ? dayjs(a.published_at).format("YYYY-MM-DD HH:mm") : "";
  
  const prevId = getPrevId(a.id);
  const nextId = getNextId(a.id);
  const showPrev = hasPrev(a.id);
  const showNext = hasNext(a.id);
  const hasAIContent = !!(aiData.ai_summary);

  function handleShare() {
    if (navigator.share) navigator.share({ title: a.title, url: a.url }).catch(() => {});
    else navigator.clipboard.writeText(a.url).then(() => alert("链接已复制"));
  }

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        {/* Toast提示 */}
        {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gray-800 text-white text-sm rounded-full shadow-lg animate-pulse">
            {showToast}
          </div>
        )}

        {/* 顶部栏: 返回 | 来源名称 | 双语开关 + 查看原文 */}
        <header className="sticky top-0 z-30 bg-white px-3 py-3 flex items-center gap-2 border-b border-gray-100 safe-top">
          <button onClick={handleBack} className="p-1 -ml-1 flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600 flex-1 truncate">{a.source}</span>
          
          {/* 双语阅读开关（UI占位） */}
          <button
            onClick={handleBilingualToggle}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
              bilingualOn ? 'bg-blue-50 text-blue-500' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="双语阅读"
          >
            <Type className="w-4 h-4" />
          </button>
          
          {/* 查看原文 */}
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 flex-shrink-0"
          >
            <ExternalLink className="w-3 h-3" />
            原文
          </a>
        </header>

        {/* 文章内容 */}
        <article className="p-4 pb-24">
          <h1 className="text-xl font-bold text-gray-900 leading-relaxed mb-3">{a.title}</h1>
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            <span>{a.source}</span>
            {a.author && <span>{a.author}</span>}
            {time && <span>{time}</span>}
            {a.reading_time && <span>阅读{a.reading_time}分钟</span>}
          </div>
          {a.image_url && (<ImageWithFallback src={a.image_url} alt={a.title} width={600} height={360} className="w-full rounded-lg mb-4" />)}
          {hasHTML && a.raw_content ? (<SafeHTML html={a.raw_content} />)
          : content ? (<div className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap">{content}</div>)
          : (<div className="text-center text-gray-400 py-10"><p>暂无正文内容</p><p className="text-sm mt-2">全文可能需要到原文查看</p></div>)}
        </article>

        {/* AI摘要悬浮按钮 */}
        <FloatingAISummary
          articleId={a.id}
          aiSummary={aiData.ai_summary}
          aiKeyPoints={aiData.ai_key_points}
          aiProcessedAt={aiData.ai_processed_at}
          onGenerate={handleGenerateAI}
          isLoading={aiLoading}
          hasContent={hasAIContent}
        />

        {/* 底部操作栏: 上篇 | 分享 | 返回 | 收藏 | 下篇 */}
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 px-2 py-2 flex items-center justify-around z-40 safe-bottom">
          {/* 上篇 */}
          <button
            onClick={() => prevId && router.push("/article/" + prevId)}
            disabled={!showPrev}
            className={`flex flex-col items-center gap-0.5 px-1 ${
              showPrev ? "text-gray-600 active:text-blue-600" : "text-gray-300 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[10px]">上篇</span>
          </button>

          {/* 分享 */}
          <button onClick={handleShare} className="flex flex-col items-center gap-0.5 px-1 text-gray-600 active:text-blue-600">
            <Share2 className="w-5 h-5" />
            <span className="text-[10px]">分享</span>
          </button>

          {/* 返回 */}
          <button onClick={handleBack} className="flex flex-col items-center gap-0.5 px-1 text-gray-600 active:text-blue-600">
            <Home className="w-5 h-5" />
            <span className="text-[10px]">返回</span>
          </button>

          {/* 收藏 */}
          <button
            onClick={() => toggleFavorite(a)}
            className={`flex flex-col items-center gap-0.5 px-1 ${fav ? "text-red-500" : "text-gray-600 active:text-red-500"}`}
          >
            <Heart className={`w-5 h-5 ${fav ? "fill-current" : ""}`} />
            <span className="text-[10px]">{fav ? "已收藏" : "收藏"}</span>
          </button>

          {/* 下篇 */}
          <button
            onClick={() => nextId && router.push("/article/" + nextId)}
            disabled={!showNext}
            className={`flex flex-col items-center gap-0.5 px-1 ${
              showNext ? "text-gray-600 active:text-blue-600" : "text-gray-300 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
            <span className="text-[10px]">下篇</span>
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
}
