"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Tag, TagCategory } from "@/types";

export function useTags(limit = 50, category?: string) {
  return useQuery({
    queryKey: ["tags", limit, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (category) params.set("category", category);
      return api.get<Tag[]>(`/rss/tags/?${params.toString()}`);
    },
    staleTime: 60 * 60 * 1000,
  });
}

export function useHotTags(limit = 20, days = 7) {
  return useQuery({
    queryKey: ["tags", "hot", limit, days],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("days", String(days));
      return api.get<Tag[]>(`/rss/tags/hot?${params.toString()}`);
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useTagCategories() {
  return useQuery({
    queryKey: ["tags", "categories"],
    queryFn: () => api.get<TagCategory[]>("/rss/tags/categories"),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
