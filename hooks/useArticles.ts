"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api, buildQuery } from "@/lib/api";
import type { Article } from "@/types";
import { useChannelFilterStore } from "@/store/useChannelFilterStore";

// Phase 3: PAGE_SIZE从10改为20，减少API往返次数
const PAGE_SIZE = 20;
// 安全限制：最多自动加载的页数，防止无限翻页导致请求风暴
const MAX_PAGES = 10;

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
  const { enabledSources } = useChannelFilterStore();
  
  const query = useInfiniteQuery<Article[]>({
    queryKey: ["articles", filters, enabledSources],
    queryFn: async ({ pageParam = 0 }) => {
      const params: Record<string, string | number | boolean | undefined> = {
        skip: Number(pageParam),
        limit: PAGE_SIZE,
        sort_by: "published_at",
        sort_order: "desc",
        ...filters,
      };
      
      // 添加频道过滤参数（空数组表示不过滤，显示所有频道）
      if (enabledSources && enabledSources.length > 0) {
        params.enabled_source_ids = enabledSources.join(',');
      }
      
      const path = buildQuery("/rss/articles/", params);
      return api.get<Article[]>(path);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      // 安全限制：超过最大页数后停止自动加载
      if (allPages.length >= MAX_PAGES) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,  // Phase 3: 改为5分钟，与Redis TTL一致
    gcTime: 30 * 60 * 1000,      // 30分钟缓存
    retry: 1,                    // 失败只重试1次，避免429雪崩
    retryDelay: 2000,            // 重试间隔2秒
  });

  // 注意：不再自动预取所有页面，改为由用户滚动触发
  // ArticleList.tsx 中通过 IntersectionObserver 调用 fetchNextPage
  // fetchingRef + 1秒冷却期 防止级联触发

  return query;
}

/**
 * 推荐文章专用Hook
 * 
 * v2.7.0新增
 * 用于"推荐"Tab，从后端推荐API获取个性化推荐或冷启动推荐
 * 返回格式与useArticles一致，兼容InfiniteQuery
 */
export function useRecommendedArticles() {
  return useInfiniteQuery<Article[]>({
    queryKey: ["articles", "recommended"],
    queryFn: async ({ pageParam = 0 }) => {
      // 推荐API已与列表API返回格式统一，直接返回数组
      const path = buildQuery("/rss/articles/recommended", {
        skip: Number(pageParam),
        limit: PAGE_SIZE,
      });
      return api.get<Article[]>(path);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      if (allPages.length >= MAX_PAGES) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
    staleTime: 30 * 60 * 1000,  // 30分钟，与后端推荐缓存TTL一致
    gcTime: 30 * 60 * 1000,
    retry: 1,
    retryDelay: 2000,
  });
}
