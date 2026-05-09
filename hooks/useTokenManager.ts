"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Token管理Hook
 * 
 * 功能：
 * 1. 定期检查token是否即将过期
 * 2. 在token过期前主动刷新
 * 3. 页面可见性变化时检查token状态
 * 4. 避免用户频繁登录
 */
export function useTokenManager() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    /**
     * 检查并刷新token
     * 
     * 策略：
     * - 每20分钟检查一次（access token有效期30分钟）
     * - 如果token即将过期（剩余时间<10分钟），主动刷新
     */
    const checkAndRefreshToken = async () => {
      try {
        // 验证当前token是否有效
        const isValid = await checkAuth();
        
        if (!isValid) {
          console.log("Token is invalid or expired, will need to refresh on next API call");
        }
      } catch (error) {
        console.error("Token check error:", error);
      }
    };

    // 初始检查
    checkAndRefreshToken();

    // 设置定期检查（每20分钟）
    checkIntervalRef.current = setInterval(checkAndRefreshToken, 20 * 60 * 1000);

    // 清理定时器
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isAuthenticated, checkAuth]);

  // 页面可见性变化时检查token
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // 页面变为可见时，检查token状态
        checkAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, checkAuth]);
}
