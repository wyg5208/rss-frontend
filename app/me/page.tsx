"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Heart,
  Clock,
  Settings,
  ChevronRight,
  LogIn,
  LogOut,
  Tag,
  RefreshCw,
  EyeOff,
  Radio,
} from "lucide-react";

export default function MePage() {
  const router = useRouter();
  const { user, isAuthenticated, isChecking, logout, checkAuth } =
    useAuthStore();
  const [favCount, setFavCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [subCount, setSubCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);
  const [channelCount, setChannelCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      setStatsLoading(false);
      return;
    }
    // 异步获取统计，不阻塞渲染
    const fetchStats = async () => {
      try {
        const { api } = await import("@/lib/api");
        const data = await api.get<{
          favorite_count: number;
          read_count: number;
        }>("/user/profile");
        setFavCount(data.favorite_count || 0);
        setReadCount(data.read_count || 0);
        
        // 获取关注标签数（从 useTagFilterStore 获取）
        const { useTagFilterStore } = await import("@/store/useTagFilterStore");
        const { selectedTags } = useTagFilterStore.getState();
        setSubCount(selectedTags.length);
        
        // 获取忽略文章数
        try {
          const blocksData = await api.get<{
            items: { interaction_id: number; article_id: number }[];
            total: number;
          }>("/user/blocks?page=1&size=1");
          setBlockedCount(blocksData.total || 0);
        } catch {
          // 忽略错误
        }
        
        // 获取频道统计
        try {
          const channelData = await api.get<{ total_enabled_sources: number }>("/user/channels/stats");
          setChannelCount(channelData.total_enabled_sources || 0);
        } catch {
          // 忽略错误
        }
      } catch {
        // stats unavailable
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [isAuthenticated]);

  const displayName = user?.nickname || user?.username || "阅读狂人用户";
  const initial = displayName.charAt(0).toUpperCase();

  const handleClearCache = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      // 1. 清除 Service Worker 缓存
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // 2. 注销 Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
      
      // 3. 清除 localStorage 中的应用缓存（保留用户登录状态）
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('serwist') || key?.includes('cache')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // 4. 强制刷新页面
      window.location.reload();
    } catch (error) {
      console.error('清除缓存失败:', error);
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen pb-14 bg-[#f5f1e8]">
      <header className="bg-gradient-to-r from-[#c45a3c] to-[#d4734e] text-white px-4 pt-12 pb-8 safe-top">
        {isChecking ? (
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-white/20" />
            <div className="space-y-2">
              <div className="h-5 w-24 bg-white/20 rounded" />
              <div className="h-4 w-16 bg-white/20 rounded" />
            </div>
          </div>
        ) : isAuthenticated ? (
          <>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {initial}
              </div>
              <div>
                <h1 className="text-xl font-bold">{displayName}</h1>
                <p className="text-sm text-white/80 mt-0.5">
                  {user?.email || "智能新闻聚合"}
                </p>
              </div>
            </div>
            <div className="flex justify-around mt-6 text-center">
              <div>
                <p className="text-xl font-bold">
                  {statsLoading ? "-" : favCount}
                </p>
                <p className="text-xs text-white/80">收藏</p>
              </div>
              <div>
                <p className="text-xl font-bold">
                  {statsLoading ? "-" : readCount}
                </p>
                <p className="text-xs text-white/80">历史</p>
              </div>
              <div>
                <p className="text-xl font-bold">
                  {statsLoading ? "-" : subCount}
                </p>
                <p className="text-xs text-white/80">关注标签</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-3">
              R
            </div>
            <p className="text-white/90 text-sm mb-3">登录后同步收藏和历史</p>
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-1.5 bg-white text-[#c45a3c] px-6 py-2 rounded-full font-medium text-sm hover:bg-[#faf7f0] active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              立即登录
            </button>
          </div>
        )}
      </header>

      <div className="bg-[#fffdf7] mt-2">
        <Link
          href="/me/favorites"
          className="flex items-center px-4 py-3.5 active:bg-[#f5f1e8] border-b border-[#e8e0d0]"
        >
          <Heart className="w-5 h-5 text-[#c45a3c] mr-3" />
          <span className="flex-1 text-[15px] text-[#2c2416]">我的收藏</span>
          <ChevronRight className="w-4 h-4 text-[#a89060]" />
        </Link>
        <Link
          href="/me/history"
          className="flex items-center px-4 py-3.5 active:bg-[#f5f1e8] border-b border-[#e8e0d0]"
        >
          <Clock className="w-5 h-5 text-[#8b6914] mr-3" />
          <span className="flex-1 text-[15px] text-[#2c2416]">阅读历史</span>
          <ChevronRight className="w-4 h-4 text-[#a89060]" />
        </Link>
        <Link
          href="/subscribe?tab=tags"
          className="flex items-center px-4 py-3.5 active:bg-[#f5f1e8] border-b border-[#e8e0d0]"
        >
          <Tag className="w-5 h-5 text-[#9b7bb0] mr-3" />
          <span className="flex-1 text-[15px] text-[#2c2416]">我的标签</span>
          <span className="text-xs text-[#a89060] mr-1">{subCount}个</span>
          <ChevronRight className="w-4 h-4 text-[#a89060]" />
        </Link>
        <Link
          href="/me/blocked"
          className="flex items-center px-4 py-3.5 active:bg-[#f5f1e8] border-b border-[#e8e0d0]"
        >
          <EyeOff className="w-5 h-5 text-[#8b7355] mr-3" />
          <span className="flex-1 text-[15px] text-[#2c2416]">忽略文章</span>
          <span className="text-xs text-[#a89060] mr-1">{statsLoading ? "-" : blockedCount}篇</span>
          <ChevronRight className="w-4 h-4 text-[#a89060]" />
        </Link>
        <Link
          href="/subscribe?tab=channels"
          className="flex items-center px-4 py-3.5 active:bg-[#f5f1e8] border-b border-[#e8e0d0]"
        >
          <Radio className="w-5 h-5 text-[#7a9b6e] mr-3" />
          <span className="flex-1 text-[15px] text-[#2c2416]">我的频道</span>
          <span className="text-xs text-[#a89060] mr-1">{statsLoading ? "-" : channelCount}个</span>
          <ChevronRight className="w-4 h-4 text-[#a89060]" />
        </Link>
        <Link
          href="/me/settings"
          className="flex items-center px-4 py-3.5 active:bg-[#f5f1e8] border-b border-[#e8e0d0]"
        >
          <Settings className="w-5 h-5 text-[#8b7355] mr-3" />
          <span className="flex-1 text-[15px] text-[#2c2416]">设置</span>
          <ChevronRight className="w-4 h-4 text-[#a89060]" />
        </Link>
        <button
          onClick={handleClearCache}
          disabled={isRefreshing}
          className="flex items-center w-full px-4 py-3.5 active:bg-[#f5f1e8] border-b border-[#e8e0d0] disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-[#7a9b6e] mr-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="flex-1 text-[15px] text-left text-[#2c2416]">{isRefreshing ? '刷新中...' : '刷新版本/清除缓存'}</span>
          <span className="text-xs text-[#a89060] mr-1">修复显示问题</span>
        </button>
      </div>

      <div className="bg-[#fffdf7] mt-2">
        <button
          onClick={() => {
            logout();
            router.refresh();
          }}
          className="flex items-center w-full px-4 py-3.5 active:bg-[#f5f1e8] border-b border-[#e8e0d0] text-[#c45a3c]"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="flex-1 text-[15px] text-left">退出登录</span>
        </button>
      </div>
      <p className="text-center text-xs text-[#a89060] mt-8">
        阅读狂人 v0.1.0
      </p>
    </div>
  );
}
