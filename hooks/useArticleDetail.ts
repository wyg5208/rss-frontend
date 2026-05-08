"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ArticleDetail, ArticleDetailResponse } from "@/types";

export function useArticleDetail(id: number | string) {
  return useQuery({
    queryKey: ["article", "detail", id],
    queryFn: async () => {
      const res = await api.get<ArticleDetailResponse>(`/rss/articles/${id}?include_both=true`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
}
