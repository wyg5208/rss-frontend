"use client";

import { useMemo } from "react";
import type { Article } from "@/types";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useArticleStore } from "@/store/useArticleStore";

/**
 * 自动屏蔽Hook
 * 
 * 功能：
 * 1. 根据用户设置过滤已读和不看文章
 * 2. 支持自动补充机制
 * 
 * 注意：
 * - 不看文章已由后端API自动过滤（UserArticleInteraction BLOCK）
 * - 本hook只负责过滤已读文章
 */
export function useAutoFilter(articles: Article[]) {
  const { autoHideRead, autoHideBlocked } = useSettingsStore();
  const { readHistory } = useArticleStore();

  // 已读文章ID集合
  const readArticleIds = useMemo(() => {
    const ids = new Set<number>();
    readHistory.forEach(article => ids.add(article.id));
    return ids;
  }, [readHistory]);

  // 过滤后的文章列表
  const filteredArticles = useMemo(() => {
    if (!articles || articles.length === 0) return [];

    // 如果没有开启任何屏蔽，直接返回原文列表
    if (!autoHideRead && !autoHideBlocked) {
      return articles;
    }

    // 后端已经过滤了不看文章，这里只需要过滤已读文章
    if (autoHideRead) {
      return articles.filter(article => !readArticleIds.has(article.id));
    }
    
    return articles;
  }, [articles, autoHideRead, autoHideBlocked, readArticleIds]);

  return {
    filteredArticles,
    autoHideRead,
    autoHideBlocked,
  };
}
