"use client";

import { create } from "zustand";

interface SettingsState {
  darkMode: boolean;
  fontSize: "small" | "medium" | "large";
  toggleDarkMode: () => void;
  setFontSize: (size: "small" | "medium" | "large") => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  darkMode: false,
  fontSize: "medium",
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  setFontSize: (fontSize) => set({ fontSize }),
}));