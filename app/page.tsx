"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import ArticleList from "@/components/ArticleList";
import { useArticles } from "@/hooks/useArticles";

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
  { label: "经济学人", value: "经济学人" },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const urlTag = searchParams.get("tag");
  const [activeTab, setActiveTab] = useState(
    urlTag ? decodeURIComponent(urlTag) : "推荐"
  );

  // 推荐/全部不筛选，URL标签筛选优先，其他用 tag_category 筛选
  const filters = useMemo(() => {
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
