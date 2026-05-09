import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserInfo {
  user_id: number;
  username: string;
  nickname?: string | null;
  email?: string | null;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isChecking: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: UserInfo | null) => void;
  login: (token: string, refreshToken?: string | null) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  getToken: () => string | null;
}

const API_URL = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_API_URL || ''
  : '';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isChecking: true,

      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
        if (!token) set({ user: null });
      },

      setUser: (user) => set({ user }),

      login: async (token: string, refreshToken?: string | null) => {
        set({ token, refreshToken: refreshToken || null, isAuthenticated: true, isChecking: false });
        try {
          const res = await fetch(`${API_URL}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const user = await res.json();
            set({ user });
          }
        } catch {
          // /auth/me 不可用时仅使用token
        }
      },

      logout: () => {
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false, isChecking: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rss-auth-storage');
        }
      },

      checkAuth: async () => {
        const { token, refreshToken } = get();
        if (!token) {
          set({ isChecking: false });
          return false;
        }
        try {
          const res = await fetch(`${API_URL}/api/v1/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.is_valid) {
            set({ isChecking: false });
            return true;
          }
          
          // Token无效，尝试刷新
          if (refreshToken) {
            console.log("Token invalid, attempting refresh...");
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
            const refreshRes = await fetch(`${apiBase}/api/v1/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
            
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.access_token) {
                // 刷新成功，更新token
                await get().login(refreshData.access_token, refreshData.refresh_token || null);
                console.log("Token refreshed successfully in checkAuth");
                return true;
              }
            }
          }
        } catch {
          // 网络错误，假设token有效（避免网络波动导致登出）
          set({ isChecking: false });
          return !!token;
        }
        
        // Token无效且刷新失败，清除登录状态
        get().logout();
        return false;
      },

      getToken: () => get().token,
    }),
    {
      name: 'rss-auth-storage',
      partialize: (state) => ({ token: state.token, refreshToken: state.refreshToken }),
    }
  )
);
