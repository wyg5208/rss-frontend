"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api, buildQuery } from "@/lib/api";
import type { Article } from "@/types";

const PAGE_SIZE = 10;

interface ArticleFilters {
  category?: string;
  tag?: string;
  tag_category?: string;
  source_id?: number;
  search?: string;
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
