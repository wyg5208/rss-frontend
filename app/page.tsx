"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import ArticleList from "@/components/ArticleList";
import LanguageFilter from "@/components/LanguageFilter";
import { useArticles } from "@/hooks/useArticles";
import { useTagFilterStore } from "@/store/useTagFilterStore";

// 固定中文分类Tab，对应后端 tag_category 筛选
const CATEGORY_TABS = [
  { label: "推荐", value: "" },
  { label: "全部", value: "all" },
  { label: "科技", value: "科技" },
  { label: "经济", value: "经济" },
  { label: "教育", value: "教育" },
  { label: "政治", value: "政治" },
  { label: "全球", value: "全球" },
  { label: "生活", value: "生活" },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const urlTag = searchParams.get("tag");
  const { selectedTags, languageFilter, loadFromBackend } = useTagFilterStore();
  
  const [activeTab, setActiveTab] = useState(
    urlTag ? decodeURIComponent(urlTag) : "推荐"
  );

  // 页面加载时从后端加载标签偏好
  useEffect(() => {
    loadFromBackend();
  }, [loadFromBackend]);

  // 构建筛选条件：多标签 OR + 语言筛选
  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    
    // 1. 多标签筛选（OR关系）
    if (selectedTags.length > 0) {
      f.tags = selectedTags.join(",");
    }
    // 2. URL单标签筛选（兼容旧逻辑）
    else if (urlTag) {
      f.tag = decodeURIComponent(urlTag);
    }
    // 3. 分类Tab筛选
    else if (activeTab !== "推荐" && activeTab !== "全部") {
      f.tag_category = activeTab;
    }
    
    // 4. 语言筛选（如果不是默认的"全部"）
    if (languageFilter !== "all") {
      f.language = languageFilter;
    }
    
    return f;
  }, [activeTab, urlTag, selectedTags, languageFilter]);

  const { data: pages, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isLoading } = useArticles(filters);

  const articles = useMemo(() => pages?.pages.flat() || [], [pages]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-white safe-top">
        <div className="flex items-center h-[52px] px-4">
          <h1 className="text-lg font-bold text-gray-900 flex-shrink-0">RSS新闻</h1>
          <div className="flex-1 ml-3 flex items-center gap-2">
            <div className="flex-1">
              <SearchBar placeholder="搜索新闻..." />
            </div>
            <LanguageFilter />
          </div>
        </div>
      </header>
      <CategoryTabs
        categories={CATEGORY_TABS.map((t) => t.label)}
        active={activeTab}
        onChange={setActiveTab}
      />
      <div className="flex-1 pb-14">
        <ArticleList
          articles={articles}
          loading={isFetchingNextPage || isFetching || isLoading}
          hasMore={!!hasNextPage}
          onLoadMore={() => fetchNextPage()}
          emptyText={selectedTags.length > 0 ? "暂无符合筛选条件的文章" : "暂无文章"}
        />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex flex-col min-h-screen"><div className="h-[52px]" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
