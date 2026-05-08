const STORAGE_PREFIX = "rss_news_";

function key(name: string): string {
  return `${STORAGE_PREFIX}${name}`;
}

export const storage = {
  get<T>(name: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key(name));
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  set(name: string, value: unknown): void {
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
    } catch {
      // localStorage 配额溢出，静默失败
    }
  },
  remove(name: string): void {
    localStorage.removeItem(key(name));
  },
};
