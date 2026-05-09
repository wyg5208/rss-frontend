"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTags } from "@/hooks/useTags";
import { useArticleStore } from "@/store/useArticleStore";
import { useTagFilterStore } from "@/store/useTagFilterStore";
import ArticleCard from "@/components/ArticleCard";
import { Heart, Clock, Tag, X, ArrowUpDown, Layers } from "lucide-react";
import clsx from "clsx";

type Tab = "favorites" | "history" | "tags";

export default function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("tags");
  const { data: tags } = useTags(200); // 后端限制最大200
  const { favorites, readHistory } = useArticleStore();
  const { selectedTags, toggleTag, clearAllTags } = useTagFilterStore();
  
  // 排序方式
  const [sortBy, setSortBy] = useState<'default' | 'alpha' | 'category'>('default');

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "favorites" || t === "history" || t === "tags") setTab(t);
  }, [searchParams]);

  const tabs: { key: Tab; label: string; icon: typeof Heart }[] = [
    { key: "tags", label: "标签", icon: Tag },
    { key: "favorites", label: "收藏", icon: Heart },
    { key: "history", label: "历史", icon: Clock },
  ];

  // 跳转到首页查看筛选结果
  const handleViewResults = () => {
    router.push("/");
  };
  
  // 排序和分组标签
  const sortedTags = useMemo(() => {
    if (!tags) return [];
    
    if (sortBy === 'alpha') {
      // 按字母顺序排序
      return [...tags].sort((a, b) => a.name.localeCompare(b.name, 'zh'));
    }
    
    if (sortBy === 'category' && tags.length > 0) {
      // 按分类分组（保持原顺序，在渲染时处理）
      return tags;
    }
    
    // 默认排序（按文章数降序）
    return tags;
  }, [tags, sortBy]);
  
  // 按分类分组
  const groupedTags = useMemo(() => {
    if (sortBy !== 'category' || !sortedTags.length) return null;
    
    const groups: Record<string, typeof sortedTags> = {};
    sortedTags.forEach(tag => {
      const category = tag.category || '未分类';
      if (!groups[category]) groups[category] = [];
      groups[category].push(tag);
    });
    
    return groups;
  }, [sortedTags, sortBy]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 safe-top">
        <div className="h-[52px] flex items-center px-4">
          <h1 className="text-lg font-bold text-gray-900">关注</h1>
          {selectedTags.length > 0 && tab === 'tags' && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleViewResults}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
              >
                查看文章
              </button>
              <button
                onClick={clearAllTags}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                清除全部
              </button>
            </div>
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
            
            {/* 排序选项 */}
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">排序:</span>
                <button
                  onClick={() => setSortBy('default')}
                  className={`px-2 py-1 text-xs rounded ${
                    sortBy === 'default' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  文章数
                </button>
                <button
                  onClick={() => setSortBy('alpha')}
                  className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                    sortBy === 'alpha' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  <ArrowUpDown className="w-3 h-3" />
                  字母
                </button>
                <button
                  onClick={() => setSortBy('category')}
                  className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                    sortBy === 'category' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  分类
                </button>
              </div>
            </div>
            
            {/* 标签列表 */}
            <div className="p-4">
              {sortBy === 'category' && groupedTags ? (
                // 按分类分组显示
                <div className="space-y-4">
                  {Object.entries(groupedTags).map(([category, categoryTags]) => (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {category}
                        <span className="text-xs text-gray-400">({categoryTags.length})</span>
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {categoryTags.map((tag) => {
                          const isSelected = selectedTags.includes(tag.name);
                          return (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag.name)}
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
                  ))}
                </div>
              ) : (
                // 普通列表显示
                <div className="flex flex-wrap gap-2.5">
                  {sortedTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.name);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.name)}
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
              )}
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