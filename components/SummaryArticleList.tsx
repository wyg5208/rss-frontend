"use client";

import { useEffect, useRef } from "react";
import SummaryCard from "./SummaryCard";
import type { Article } from "@/types";

interface Props {
  articles: Article[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onArticleNavigate?: (articleId: number) => void;
}

export default function SummaryArticleList({
  articles,
  loading,
  hasMore,
  onLoadMore,
  onArticleNavigate,
}: Props) {
  const observerRef = useRef<HTMLDivElement>(null);
  const lastLoadedCount = useRef(0);

  // 智能加载：每看10条加载10条
  useEffect(() => {
    const viewedCount = articles.length;
    const shouldLoadMore = viewedCount >= lastLoadedCount.current + 10;

    if (shouldLoadMore && hasMore && !loading) {
      onLoadMore();
      lastLoadedCount.current = viewedCount;
    }
  }, [articles.length, hasMore, loading, onLoadMore]);

  // 70%滚动位置预加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      {
        rootMargin: "70%", // 滚动到70%时触发
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <div>
      {articles.map((article) => (
        <SummaryCard
          key={article.id}
          article={article}
          onNavigate={onArticleNavigate}
        />
      ))}

      {/* 加载指示器 */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-6 h-6 border-2 border-[#c45a3c] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 观察点 - 滚动到70%时触发 */}
      <div ref={observerRef} className="h-1" />

      {/* 没有更多数据 */}
      {!hasMore && articles.length > 0 && (
        <div className="text-center py-8 text-xs text-[#a89060]">
          已加载全部摘要文章
        </div>
      )}

      {/* 空状态 */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-20 text-[#8b7355]">
          <p className="text-base mb-2">暂无摘要文章</p>
          <p className="text-xs">请稍后再试</p>
        </div>
      )}
    </div>
  );
}
