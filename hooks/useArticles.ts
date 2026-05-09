"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api, buildQuery } from "@/lib/api";
import type { Article } from "@/types";

const PAGE_SIZE = 10;

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
  return useInfiniteQuery<Article[]>({
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
    staleTime: 10 * 60 * 1000,  // 10分钟内不重新获取
    gcTime: 30 * 60 * 1000,      // 30分钟缓存
  });
}
