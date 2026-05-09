"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api, buildQuery } from "@/lib/api";
import type { Article } from "@/types";

// Phase 3: PAGE_SIZE从10改为20，减少API往返次数
const PAGE_SIZE = 20;

interface ArticleFilters {
  category?: string;
  tag?: string;        // 单标签筛选（模糊匹配）
  tags?: string;       // 多标签筛选，逗号分隔，OR关系
  tag_category?: string;
  source_id?: number;
  search?: string;
  language?: string;    // 语言筛选：zh/en/other/all
  sort_by?: string;
  sort_order?: string;
}

export function useArticles(filters: ArticleFilters = {}) {
  const query = useInfiniteQuery<Article[]>({
    queryKey: ["articles", filters],
    queryFn: async ({ pageParam = 0 }) => {
      const params: Record<string, string | number | boolean | undefined> = {
        skip: Number(pageParam),
        limit: PAGE_SIZE,
        sort_by: "published_at",
        sort_order: "desc",
        ...filters,
      };
      const path = buildQuery("/rss/articles/", params);
      return api.get<Article[]>(path);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,  // Phase 3: 改为5分钟，与Redis TTL一致
    gcTime: 30 * 60 * 1000,      // 30分钟缓存
  });

  // Phase 3: 自动预取下一页
  useEffect(() => {
    if (query.hasNextPage && !query.isFetchingNextPage && query.data) {
      // 当用户接近底部时，预取下一页
      const nextPageParam = query.data.pages.length * PAGE_SIZE;
      query.fetchNextPage();
    }
  }, [query.data?.pages.length, query.hasNextPage, query.isFetchingNextPage]);

  return query;
}
