class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
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

async function apiFetch<T>(path: string, options?: RequestInit & { timeout?: number }): Promise<T> {
  const isAbsolute = path.startsWith("http");
  // 生产环境使用相对路径 /api/v1/... 由 Vercel rewrite 转发
  // 开发环境使用 NEXT_PUBLIC_API_URL（如 http://localhost:8001）
  let apiBase = "";
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  }
  const url = isAbsolute ? path : `${apiBase}/api/v1${path}`;

  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 创建 AbortController 用于超时控制
  const controller = new AbortController();
  const timeout = options?.timeout || 30000; // 默认 30 秒超时
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { 
      ...options, 
      headers,
      signal: controller.signal 
    });
    
    if (!res.ok) {
      let msg = "";
      try {
        msg = await res.text();
      } catch {
        msg = res.statusText;
      }
      throw new ApiError(res.status, msg);
    }
    return res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: <T>(path: string, options?: RequestInit & { timeout?: number }) => apiFetch<T>(path, options),
  post: <T>(path: string, body?: unknown, options?: RequestInit & { timeout?: number }) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  delete: <T>(path: string, options?: RequestInit & { timeout?: number }) => apiFetch<T>(path, { method: "DELETE", ...options }),
};

export function buildQuery(
  path: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
    )
    .join("&");
  return query ? `${path}?${query}` : path;
}
