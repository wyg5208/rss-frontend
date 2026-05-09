"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTags } from "@/hooks/useTags";
import { useArticleStore } from "@/store/useArticleStore";
import { useTagFilterStore } from "@/store/useTagFilterStore";
import ArticleCard from "@/components/ArticleCard";
import { Heart, Clock, Tag, X } from "lucide-react";
import clsx from "clsx";

type Tab = "favorites" | "history" | "tags";

export default function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("tags");
  const { data: tags } = useTags(100);
  const { favorites, readHistory } = useArticleStore();
  const { selectedTags, toggleTag, clearAllTags } = useTagFilterStore();

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "favorites" || t === "history" || t === "tags") setTab(t);
  }, [searchParams]);

  const tabs: { key: Tab; label: string; icon: typeof Heart }[] = [
    { key: "tags", label: "标签", icon: Tag },
    { key: "favorites", label: "收藏", icon: Heart },
    { key: "history", label: "历史", icon: Clock },
  ];

  // 点击标签切换选中状态（不再跳转页面）
  const handleTagClick = (tagName: string) => {
    toggleTag(tagName);
  };

  // 跳转到首页查看筛选结果
  const handleViewResults = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 safe-top">
        <div className="h-[52px] flex items-center px-4">
          <h1 className="text-lg font-bold text-gray-900">关注</h1>
          {selectedTags.length > 0 && (
            <button
              onClick={clearAllTags}
              className="ml-auto text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              清除
            </button>
          )}
        </div>
        <div className="flex">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={["flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium relative", tab === key ? "text-red-500" : "text-gray-500"].join(" ")}
            >
              <Icon className="w-4 h-4" />{label}
              {tab === key && <span className="absolute bottom-0 w-8 h-[3px] bg-red-500 rounded-full" />}
            </button>
          ))}
        </div>
      </header>
      <div className="flex-1 pb-14">
        {tab === "tags" && (
          <div>
            {/* 选中标签预览区 */}
            {selectedTags.length > 0 && (
              <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-blue-600 font-medium">
                    已选择 {selectedTags.length} 个标签
                  </span>
                  <button
                    onClick={handleViewResults}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
                  >
                    查看文章
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((name) => (
                    <span
                      key={name}
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* 标签列表 */}
            <div className="p-4">
              <div className="flex flex-wrap gap-2.5">
                {tags?.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag.name)}
                      style={{ 
                        backgroundColor: (tag.color || "#3b82f6") + (isSelected ? "30" : "15"),
                        color: tag.color || "#3b82f6",
                        borderColor: (tag.color || "#3b82f6") + (isSelected ? "60" : "30"),
                      }}
                      className={clsx(
                        "px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-all",
                        isSelected && "ring-2 ring-offset-1"
                      )}
                    >
                      {tag.name}
                      <span className="ml-1 text-xs opacity-70">{tag.article_count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {tab === "favorites" && (favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-300">
            <Heart className="w-14 h-14 mb-3" /><p className="text-sm">暂无收藏文章</p>
          </div>
        ) : favorites.map((a) => <ArticleCard key={a.id} article={a} />))}
        {tab === "history" && (readHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-300">
            <Clock className="w-14 h-14 mb-3" /><p className="text-sm">暂无阅读记录</p>
          </div>
        ) : readHistory.map((a) => <ArticleCard key={a.id} article={a} />))}
      </div>
    </div>
  );
}