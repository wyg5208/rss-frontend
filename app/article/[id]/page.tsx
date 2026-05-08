"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Heart, Share2 } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { useArticleDetail } from "@/hooks/useArticleDetail";
import { useArticleStore } from "@/store/useArticleStore";
import SafeHTML from "@/components/SafeHTML";
import ImageWithFallback from "@/components/ImageWithFallback";
import ErrorBoundary from "@/components/ErrorBoundary";
import { api } from "@/lib/api";
import { useEffect } from "react";

dayjs.locale("zh-cn");

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: article, isLoading, error } = useArticleDetail(id);
  const { toggleFavorite, isFavorite, addToHistory } = useArticleStore();

  useEffect(() => {
    if (article) {
      addToHistory(article);
      api.post(`/rss/articles/${id}/view`).catch(() => {});
    }
  }, [article, id, addToHistory]);

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

  function handleShare() {
    if (navigator.share) navigator.share({ title: a.title, url: a.url }).catch(() => {});
    else navigator.clipboard.writeText(a.url).then(() => alert("链接已复制"));
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen pb-16">
        <header className="sticky top-0 z-30 bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
          <button onClick={() => router.back()} className="p-1 -ml-1"><ArrowLeft className="w-5 h-5" /></button>
          <span className="text-sm text-gray-500 flex-1 truncate">{a.source}</span>
        </header>
        <article className="p-4">
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
          <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 mt-6 py-3 text-sm text-blue-600 border border-blue-200 rounded-lg">
            <ExternalLink className="w-4 h-4" /> 查看原文
          </a>
        </article>
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-around">
          <button onClick={handleShare} className="flex flex-col items-center gap-1 text-gray-500 active:text-blue-600">
            <Share2 className="w-5 h-5" /><span className="text-[11px]">分享</span>
          </button>
          <button onClick={() => toggleFavorite(a)} className={`flex flex-col items-center gap-1 ${fav ? "text-red-500" : "text-gray-500"}`}>
            <Heart className={`w-5 h-5 ${fav ? "fill-current" : ""}`} /><span className="text-[11px]">{fav ? "已收藏" : "收藏"}</span>
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
}
