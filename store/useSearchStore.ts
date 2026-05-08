"use client";

import { create } from "zustand";
import { storage } from "@/lib/storage";

interface SearchState {
  history: string[];
  addSearch: (keyword: string) => void;
  clearHistory: () => void;
}

const MAX_SEARCH = 20;

export const useSearchStore = create<SearchState>((set, get) => ({
  history: storage.get<string[]>("search_history", []),

  addSearch: (keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    const { history } = get();
    const filtered = history.filter((h) => h !== trimmed);
    const updated = [trimmed, ...filtered].slice(0, MAX_SEARCH);
    storage.set("search_history", updated);
    set({ history: updated });
  },

  clearHistory: () => {
    storage.remove("search_history");
    set({ history: [] });
  },
}));
