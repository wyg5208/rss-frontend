"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTags } from "@/hooks/useTags";
import { useArticleStore } from "@/store/useArticleStore";
import ArticleCard from "@/components/ArticleCard";
import { Heart, Clock, Tag } from "lucide-react";

type Tab = "favorites" | "history" | "tags";

export default function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("tags");
  const { data: tags } = useTags(100);
  const { favorites, readHistory } = useArticleStore();

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "favorites" || t === "history" || t === "tags") setTab(t);
  }, [searchParams]);

  const tabs: { key: Tab; label: string; icon: typeof Heart }[] = [
    { key: "tags", label: "标签", icon: Tag },
    { key: "favorites", label: "收藏", icon: Heart },
    { key: "history", label: "历史", icon: Clock },
  ];

  // 点击标签跳转到首页并筛选该标签的文章
  const handleTagClick = (tagName: string) => {
    router.push(`/?tag=${encodeURIComponent(tagName)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 safe-top">
        <div className="h-[52px] flex items-center px-4">
          <h1 className="text-lg font-bold text-gray-900">关注</h1>
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
          <div className="p-4"><div className="flex flex-wrap gap-2.5">
            {tags?.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.name)}
                style={{ backgroundColor: (tag.color || "#3b82f6") + "15", color: tag.color || "#3b82f6", borderColor: (tag.color || "#3b82f6") + "30" }}
                className="px-3 py-1.5 rounded-full text-sm border cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
              >
                {tag.name}
                <span className="ml-1 text-xs opacity-70">{tag.article_count}</span>
              </button>
            ))}
          </div></div>
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