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
} from "lucide-react";

export default function MePage() {
  const router = useRouter();
  const { user, isAuthenticated, isChecking, logout, checkAuth } =
    useAuthStore();
  const [favCount, setFavCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [subCount, setSubCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

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
      } catch {
        // stats unavailable
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [isAuthenticated]);

  const displayName = user?.nickname || user?.username || "RSS新闻用户";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen pb-14">
      <header className="bg-gradient-to-r from-red-500 to-red-400 text-white px-4 pt-12 pb-8 safe-top">
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
              className="flex items-center gap-1.5 bg-white text-red-500 px-6 py-2 rounded-full font-medium text-sm hover:bg-red-50 active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              立即登录
            </button>
          </div>
        )}
      </header>

      <div className="bg-white mt-2">
        <Link
          href="/me/favorites"
          className="flex items-center px-4 py-3.5 active:bg-gray-50 border-b border-gray-50"
        >
          <Heart className="w-5 h-5 text-red-400 mr-3" />
          <span className="flex-1 text-[15px]">我的收藏</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>
        <Link
          href="/me/history"
          className="flex items-center px-4 py-3.5 active:bg-gray-50 border-b border-gray-50"
        >
          <Clock className="w-5 h-5 text-blue-400 mr-3" />
          <span className="flex-1 text-[15px]">阅读历史</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>
        <Link
          href="/subscribe?tab=tags"
          className="flex items-center px-4 py-3.5 active:bg-gray-50 border-b border-gray-50"
        >
          <Tag className="w-5 h-5 text-purple-400 mr-3" />
          <span className="flex-1 text-[15px]">我的标签</span>
          <span className="text-xs text-gray-400 mr-1">{subCount}个</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>
        <Link
          href="/me/settings"
          className="flex items-center px-4 py-3.5 active:bg-gray-50 border-b border-gray-50"
        >
          <Settings className="w-5 h-5 text-gray-400 mr-3" />
          <span className="flex-1 text-[15px]">设置</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>
      </div>

      <div className="bg-white mt-2">
        <button
          onClick={() => {
            logout();
            router.refresh();
          }}
          className="flex items-center w-full px-4 py-3.5 active:bg-gray-50 border-b border-gray-50 text-red-500"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="flex-1 text-[15px] text-left">退出登录</span>
        </button>
      </div>
      <p className="text-center text-xs text-gray-300 mt-8">
        RSS新闻聚合 v0.1.0
      </p>
    </div>
  );
}
