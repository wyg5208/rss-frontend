"use client";

import { useRef, useCallback } from "react";
import type { Article } from "@/types";
import ArticleCard from "./ArticleCard";
import ErrorBoundary from "./ErrorBoundary";

interface Props {
  articles: Article[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  emptyText?: string;
}

export default function ArticleList({ articles, loading, hasMore, onLoadMore, emptyText = "暂无文章" }: Props) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) onLoadMore();
      }, { rootMargin: "100px" });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, onLoadMore]
  );

  if (!loading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-300">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p className="text-sm">{emptyText}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div>
        {articles.map((article, idx) => {
          const isLast = idx === articles.length - 1;
          return (
            <div key={article.id} ref={isLast ? lastElementRef : null}>
              <ArticleCard article={article} />
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!hasMore && articles.length > 0 && (
          <p className="text-center text-gray-300 text-xs py-8">已加载全部</p>
        )}
      </div>
    </ErrorBoundary>
  );
}