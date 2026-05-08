"use client";

import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import ArticleList from "@/components/ArticleList";
import { useArticles } from "@/hooks/useArticles";
import { useTagCategories } from "@/hooks/useTags";

const FIXED_TABS = ["推荐", "全部"];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("推荐");
  const { data: categoriesData } = useTagCategories();

  // 合并固定TAB + 后端标签分类
  const categories = useMemo(() => {
    const backendCats = categoriesData?.map((c) => c.name) || [];
    return [...FIXED_TABS, ...backendCats.filter((c) => !FIXED_TABS.includes(c))];
  }, [categoriesData]);

  // 推荐和全部不筛选，其他用 tag_category 筛选（标签分类名如:技术/商业/地区）
  const filters = useMemo(() => {
    if (activeTab === "推荐" || activeTab === "全部") return {};
    return { tag_category: activeTab };
  }, [activeTab]);

  const { data: pages, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isLoading } = useArticles(filters);

  const articles = useMemo(() => pages?.pages.flat() || [], [pages]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-white safe-top">
        <div className="flex items-center h-[52px] px-4">
          <h1 className="text-lg font-bold text-gray-900 flex-shrink-0">RSS新闻</h1>
          <div className="flex-1 ml-3">
            <SearchBar placeholder="搜索新闻..." />
          </div>
        </div>
      </header>
      <CategoryTabs categories={categories} active={activeTab} onChange={setActiveTab} />
      <div className="flex-1 pb-14">
        <ArticleList
          articles={articles}
          loading={isFetchingNextPage || isFetching || isLoading}
          hasMore={!!hasNextPage}
          onLoadMore={() => fetchNextPage()}
          emptyText="暂无文章"
        />
      </div>
    </div>
  );
}
