"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api, buildQuery } from "@/lib/api";
import type { Article } from "@/types";

const PAGE_SIZE = 20;
const MAX_PAGES = 50; // 摘要TAB允许更多页数

export function useSummaryArticles() {
  return useInfiniteQuery<Article[]>({
    queryKey: ["articles", "summary"],
    queryFn: async ({ pageParam = 0 }) => {
      const path = buildQuery("/rss/articles/", {
        skip: Number(pageParam),
        limit: PAGE_SIZE,
        has_summary: true, // 只获取有AI摘要的文章
        sort_by: "published_at",
        sort_order: "desc",
      });
      return api.get<Article[]>(path);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      if (allPages.length >= MAX_PAGES) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
    staleTime: 10 * 60 * 1000,  // 10分钟缓存
    gcTime: 60 * 60 * 1000,      // 1小时缓存
    retry: 1,
    retryDelay: 2000,
  });
}
