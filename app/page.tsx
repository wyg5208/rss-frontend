"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import ArticleList from "@/components/ArticleList";
import { useArticles } from "@/hooks/useArticles";
import { useTagCategories } from "@/hooks/useTags";

const FIXED_TABS = ["推荐", "全部"];

function HomeContent() {
  const searchParams = useSearchParams();
  const urlTag = searchParams.get("tag");  // 从URL读取标签筛选
  const [activeTab, setActiveTab] = useState(urlTag ? decodeURIComponent(urlTag) : "推荐");
  const { data: categoriesData } = useTagCategories();

  // 合并固定TAB + 后端标签分类
  const categories = useMemo(() => {
    const backendCats = categoriesData?.map((c) => c.name) || [];
    return [...FIXED_TABS, ...backendCats.filter((c) => !FIXED_TABS.includes(c))];
  }, [categoriesData]);

  // 推荐/全部不筛选，URL标签筛选优先，其他用 tag_category 筛选
  const filters = useMemo(() => {
    // 如果URL有tag参数，优先使用tag筛选
    if (urlTag) {
      return { tag: decodeURIComponent(urlTag) };
    }
    if (activeTab === "推荐" || activeTab === "全部") return {};
    return { tag_category: activeTab };
  }, [activeTab, urlTag]);

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

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex flex-col min-h-screen"><div className="h-[52px]" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
