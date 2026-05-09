"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import ArticleList from "@/components/ArticleList";
import { useArticles } from "@/hooks/useArticles";
import { useSearchStore } from "@/store/useSearchStore";
import { useArticleNavStore } from "@/store/useArticleNavStore";
import { X, Clock } from "lucide-react";

function SearchContent() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const [keyword, setKeyword] = useState(q);
  const { history, addSearch, clearHistory } = useSearchStore();

  const {
    data: pages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useArticles({ search: keyword });

  const handleSearch = useCallback((kw: string) => {
    addSearch(kw);
    setKeyword(kw);
  }, [addSearch]);

  const articles = pages?.pages.flat() || [];
  const showResults = keyword.length > 0;
  const articleIds = useMemo(() => articles.map(a => a.id), [articles]);

  const handleArticleNavigate = useCallback((_articleId: number) => {
    useArticleNavStore.getState().setListContext(articleIds);
  }, [articleIds]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-white px-4 py-3 border-b border-gray-100">
        <SearchBar initialValue={keyword} onSearch={handleSearch} />
      </header>

      {showResults ? (
        <div className="flex-1">
          <div className="px-4 py-2 text-xs text-gray-500">
            搜索 &quot;{keyword}&quot; {articles.length > 0 ? `找到 ${articles.length} 条结果` : ""}
          </div>
          <ArticleList
            articles={articles}
            loading={isFetchingNextPage || isFetching}
            hasMore={!!hasNextPage}
            onLoadMore={() => fetchNextPage()}
            emptyText="未找到相关文章"
            onArticleNavigate={handleArticleNavigate}
          />
        </div>
      ) : (
        <div className="flex-1 p-4">
          {history.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">搜索历史</h3>
                <button onClick={clearHistory} className="text-xs text-gray-400"><X className="w-3 h-3 inline" /> 清空</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((h) => (
                  <button key={h} onClick={() => handleSearch(h)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-full active:bg-gray-200">
                    <Clock className="w-3 h-3" /> {h}
                  </button>
                ))}
              </div>
            </>
          )}
          {history.length === 0 && (
            <div className="text-center text-gray-400 py-20">
              <p className="text-sm">输入关键词搜索你感兴趣的文章</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">加载中...</div>}>
      <SearchContent />
    </Suspense>
  );
}
