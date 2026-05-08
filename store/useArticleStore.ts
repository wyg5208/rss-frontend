"use client";

import { create } from "zustand";
import { storage } from "@/lib/storage";
import type { Article } from "@/types";

const MAX_HISTORY = 50;
const MAX_FAVORITES = 200;

interface ArticleState {
  favorites: Article[];
  readHistory: Article[];
  toggleFavorite: (article: Article) => Promise<void>;
  isFavorite: (id: number) => boolean;
  addToHistory: (article: Article) => Promise<void>;
  syncFavorites: () => Promise<void>;
  syncHistory: () => Promise<void>;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("rss-auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

async function syncWithBackend(
  endpoint: string,
  fallbackKey: string
): Promise<Article[]> {
  const token = getToken();
  if (!token) return storage.get<Article[]>(fallbackKey, []);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  try {
    const res = await fetch(`${apiBase}/api/v1${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      const articles = (data.items || []).map((item: any) => ({
        ...(item.article || {}),
        id: item.article_id,
      }));
      // Update local cache
      storage.set(fallbackKey, articles.slice(0, MAX_FAVORITES));
      return articles;
    }
  } catch {
    // fallback to local
  }
  return storage.get<Article[]>(fallbackKey, []);
}

async function toggleBackendFavorite(
  articleId: number,
  isFavorited: boolean
): Promise<boolean> {
  const token = getToken();
  if (!token) return !isFavorited;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  try {
    const res = await fetch(`${apiBase}/api/v1/user/favorites/${articleId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data.is_favorited;
    }
  } catch {
    // network error
  }
  return !isFavorited;
}

async function recordBackendHistory(articleId: number): Promise<void> {
  const token = getToken();
  if (!token) return;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  try {
    await fetch(`${apiBase}/api/v1/user/history/${articleId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // network error
  }
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  favorites: storage.get<Article[]>("favorites", []),
  readHistory: storage.get<Article[]>("read_history", []),

  toggleFavorite: async (article) => {
    const { favorites } = get();
    const exists = favorites.find((a) => a.id === article.id);
    let updated: Article[];

    if (exists) {
      updated = favorites.filter((a) => a.id !== article.id);
    } else {
      updated = [article, ...favorites].slice(0, MAX_FAVORITES);
    }
    storage.set("favorites", updated);
    set({ favorites: updated });

    // Sync with backend
    toggleBackendFavorite(article.id, !!exists);
  },

  isFavorite: (id) => get().favorites.some((a) => a.id === id),

  addToHistory: async (article) => {
    const { readHistory } = get();
    const filtered = readHistory.filter((a) => a.id !== article.id);
    const updated = [article, ...filtered].slice(0, MAX_HISTORY);
    storage.set("read_history", updated);
    set({ readHistory: updated });

    // Sync with backend
    recordBackendHistory(article.id);
  },

  syncFavorites: async () => {
    const articles = await syncWithBackend("/user/favorites", "favorites");
    set({ favorites: articles });
  },

  syncHistory: async () => {
    const articles = await syncWithBackend("/user/history", "read_history");
    set({ readHistory: articles });
  },
}));
