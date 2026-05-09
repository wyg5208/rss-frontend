/**
 * API请求封装
 * 
 * 功能：
 * 1. 自动添加Bearer token
 * 2. 自动刷新过期token（用户无感知）
 * 3. 请求超时控制
 * 4. 错误处理
 */

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// 刷新token的锁，防止并发刷新
let refreshPromise: Promise<boolean> | null = null;

function getAuthStorage(): any {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("rss-auth-storage");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getToken(): string | null {
  const storage = getAuthStorage();
  return storage?.state?.token || null;
}

function getRefreshToken(): string | null {
  const storage = getAuthStorage();
  return storage?.state?.refreshToken || null;
}

function setTokens(token: string, refreshToken: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const storage = getAuthStorage();
    if (storage && storage.state) {
      storage.state.token = token;
      if (refreshToken) {
        storage.state.refreshToken = refreshToken;
      }
      localStorage.setItem("rss-auth-storage", JSON.stringify(storage));
    }
  } catch (e) {
    console.error("Failed to save tokens:", e);
  }
}

/**
 * 刷新access token
 * 
 * 使用refresh token向madechango后端请求新的access token
 * 实现了并发锁，防止多个请求同时刷新
 */
async function refreshAccessToken(): Promise<boolean> {
  // 如果已经有刷新请求在进行，等待它完成
  if (refreshPromise) {
    return refreshPromise;
  }

  // 创建新的刷新请求
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.warn("No refresh token available");
        return false;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiBase}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        console.error("Token refresh failed:", response.status);
        return false;
      }

      const data = await response.json();
      
      // 保存新token
      if (data.access_token) {
        setTokens(data.access_token, data.refresh_token || null);
        console.log("Token refreshed successfully");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    } finally {
      // 释放锁
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function apiFetch<T>(path: string, options?: RequestInit & { timeout?: number; skipAuthRefresh?: boolean }): Promise<T> {
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
    
    // 如果返回401（未授权），尝试刷新token
    if (res.status === 401 && token && !options?.skipAuthRefresh) {
      clearTimeout(timeoutId);
      
      // 尝试刷新token
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        // 刷新成功，使用新token重试请求
        const newToken = getToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
        }
        
        // 重试原请求
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);
        
        try {
          const retryRes = await fetch(url, {
            ...options,
            headers,
            signal: retryController.signal,
          });
          
          if (!retryRes.ok) {
            let msg = "";
            try {
              msg = await retryRes.text();
            } catch {
              msg = retryRes.statusText;
            }
            throw new ApiError(retryRes.status, msg);
          }
          
          return retryRes.json();
        } finally {
          clearTimeout(retryTimeoutId);
        }
      } else {
        // 刷新失败，清除登录状态
        if (typeof window !== "undefined") {
          localStorage.removeItem('rss-auth-storage');
        }
        throw new ApiError(401, "登录已过期，请重新登录");
      }
    }
    
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
  get: <T>(path: string, options?: RequestInit & { timeout?: number; skipAuthRefresh?: boolean }) => apiFetch<T>(path, options),
  post: <T>(path: string, body?: unknown, options?: RequestInit & { timeout?: number; skipAuthRefresh?: boolean }) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  delete: <T>(path: string, options?: RequestInit & { timeout?: number; skipAuthRefresh?: boolean }) => apiFetch<T>(path, { method: "DELETE", ...options }),
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
