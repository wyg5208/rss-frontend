"use client";

import { useState, useMemo, useCallback, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import ArticleList from "@/components/ArticleList";
import SummaryArticleList from "@/components/SummaryArticleList";
import LanguageFilter from "@/components/LanguageFilter";
import { useArticles, useRecommendedArticles } from "@/hooks/useArticles";
import { useSummaryArticles } from "@/hooks/useSummaryArticles";
import { useTagFilterStore } from "@/store/useTagFilterStore";
import { useArticleNavStore } from "@/store/useArticleNavStore";
import { useAutoFilter } from "@/hooks/useAutoFilter";
import { useTabConfigStore } from "@/store/useTabConfigStore";
import type { TabItem } from "@/components/CategoryTabs";
import { api } from "@/lib/api";
import HelpModal from "@/components/HelpModal";

// 固定中文分类Tab，对应后端 tag_category 筛选
const CATEGORY_TABS = [
  { label: "推荐", value: "" },
  { label: "全部", value: "all" },
  { label: "经济学人", value: "经济学人" },
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
  const { selectedTags, languageFilter } = useTagFilterStore();
  const { fixedTabs, rssSourceTabs, loadFromBackend } = useTabConfigStore();
  
  // 页面加载时从后端拉取最新配置
  useEffect(() => {
    loadFromBackend();
  }, [loadFromBackend]);
  
  // 加载RSS源列表，用于匹配RSS源TAB的名称
  const { data: sources } = useQuery({
    queryKey: ['rss-sources-list'],
    queryFn: async () => {
      const response = await api.get<{ sources: Array<{ id: number; name: string }> }>(
        '/rss/sources/?is_active=true&limit=1000'
      );
      return response.sources || [];
    },
    staleTime: 5 * 60 * 1000,  // 5分钟内使用缓存
  });
  
  const [activeTab, setActiveTab] = useState(
    urlTag ? decodeURIComponent(urlTag) : "summary" // 默认显示摘要TAB
  );
  
  // 帮助弹窗状态
  const [showHelp, setShowHelp] = useState(false);
  
  // 触摸滑动相关状态
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const minSwipeDistance = 50; // 最小滑动距离（px）
  
  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(e.touches[0].clientX);
    setIsSwiping(true);
    setSwipeOffset(0);
  };
  
  // 触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    setTouchEndX(currentX);
    setSwipeOffset(touchStartX - currentX);
  };
  
  // 触摸结束
  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const swipeDistance = touchStartX - touchEndX;
    const currentIndex = dynamicTabs.findIndex(tab => tab.value === activeTab);
    
    // 左滑（手指向左移动）- 下一个TAB
    if (swipeDistance > minSwipeDistance && currentIndex < dynamicTabs.length - 1) {
      const nextTab = dynamicTabs[currentIndex + 1];
      setActiveTab(nextTab.value);
    }
    // 右滑（手指向右移动）- 上一个TAB
    else if (swipeDistance < -minSwipeDistance && currentIndex > 0) {
      const prevTab = dynamicTabs[currentIndex - 1];
      setActiveTab(prevTab.value);
    }
    
    // 重置触摸位置
    setTouchStartX(0);
    setTouchEndX(0);
    setIsSwiping(false);
    setSwipeOffset(0);
  };
  
  // 构建动态TAB列表（含兜底保障）
  const dynamicTabs = useMemo(() => {
    const tabs: TabItem[] = [];
    
    // 1. 添加可见的固定TAB(按displayOrder排序)
    const visibleFixed = fixedTabs
      .filter(tab => tab.isVisible || tab.isRequired)  // 兜底TAB强制包含
      .sort((a, b) => a.displayOrder - b.displayOrder);
    
    visibleFixed.forEach(tab => {
      tabs.push({ 
        label: tab.label, 
        value: tab.label === '推荐' ? '' : tab.label, 
        type: 'fixed' 
      });
    });
    
    // 2. 构建RSS源ID到名称的映射
    const sourceNameMap = new Map(
      (sources || []).map(s => [s.id, s.name])
    );
    
    // 3. 添加可见的RSS源TAB(按displayOrder排序)
    rssSourceTabs
      .filter(tab => tab.isVisible)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .forEach(tab => {
        // 动态匹配名称：优先使用sourceName，其次从sources中查找，最后使用默认格式
        const displayName = tab.sourceName || sourceNameMap.get(tab.sourceId) || `RSS-${tab.sourceId}`;
        tabs.push({ 
          label: displayName, 
          value: `rss_${tab.sourceId}`, 
          type: 'rss' 
        });
      });
    
    // 4. 兜底保障：确保至少“推荐”TAB存在
    if (tabs.length === 0 || !tabs.some(t => t.value === '')) {
      tabs.unshift({ label: '推荐', value: '', type: 'fixed' });
    }
        
    // 5. 插入“摘要”TAB到最左侧（索引0位置）
    tabs.splice(0, 0, { 
      label: '摘要', 
      value: 'summary', 
      type: 'fixed' 
    });
    
    return tabs;
  }, [fixedTabs, rssSourceTabs, sources]);

  // 构建筛选条件：多标签 OR + 语言筛选 + RSS源筛选
  const filters = useMemo(() => {
    const f: Record<string, string | number> = {};
    
    // 筛选优先级：
    // 1. RSS源TAB筛选（最高优先级）
    // 2. 分类Tab筛选
    // 3. 多标签筛选（OR关系）- 仅在“推荐”TAB时生效
    // 4. URL单标签筛选（兼容旧逻辑）
    // 注意：“全部”TAB 不受 selectedTags 影响，显示所有文章
    
    if (activeTab.startsWith('rss_')) {
      // RSS源TAB筛选
      const sourceId = parseInt(activeTab.replace('rss_', ''), 10);
      f.source_id = sourceId;
      console.log('[HomePage] RSS源筛选:', { sourceId, activeTab });
      // 注意：RSS源TAB不使用selectedTags，避免筛选冲突
    } else if (activeTab === '推荐') {
      // “推荐”TAB：应用多标签筛选（如果用户选择了标签）
      if (selectedTags.length > 0) {
        f.tags = selectedTags.join(",");
        console.log('[HomePage] 推荐TAB - 多标签筛选:', { tags: selectedTags });
      } else {
        console.log('[HomePage] 推荐TAB：无标签筛选');
      }
    } else if (activeTab === '' || activeTab === '全部' || activeTab === 'all') {
      // “全部”TAB：应用多标签筛选（如果用户选择了标签）
      if (selectedTags.length > 0) {
        f.tags = selectedTags.join(",");
        console.log('[HomePage] 全部TAB - 多标签筛选:', { tags: selectedTags });
      } else {
        console.log('[HomePage] 全部TAB：无筛选', { activeTab });
      }
    } else {
      // 分类Tab筛选（科技、经济、教育等）
      f.tag_category = activeTab;
      // console.log('[HomePage] 分类筛选:', { tag_category: activeTab });
      // 注意：分类TAB不使用selectedTags，避免筛选冲突
    }
    
    // 4. 语言筛选（如果不是默认的"全部"）
    if (languageFilter !== "all") {
      f.language = languageFilter;
    }
    
    // console.log('[HomePage] Filters:', f);
    return f;
  }, [activeTab, selectedTags, languageFilter]);

  // 两个Hook都调用（遵循React Hook的规则：不能条件性调用Hook）
  // 通过数据选择切换，activeTab === "推荐" 时使用推荐数据
  const { data: recommendPages, fetchNextPage: fetchNextPageRecommend, 
          hasNextPage: hasNextPageRecommend, isFetchingNextPage: isFetchingNextPageRecommend, 
          isFetching: isFetchingRecommend, isLoading: isLoadingRecommend } = useRecommendedArticles();
    
  // 摘要TAB的Hook
  const { 
    data: summaryPages, 
    fetchNextPage: fetchNextPageSummary, 
    hasNextPage: hasNextPageSummary, 
    isFetchingNextPage: isFetchingNextPageSummary, 
    isFetching: isFetchingSummary, 
    isLoading: isLoadingSummary 
  } = useSummaryArticles();
    
  const { data: pages, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isLoading } = useArticles(filters);

  // 原始文章列表
  const articles = useMemo(() => {
    // console.log('[HomePage] 数据选择逻辑:', {
    //   activeTab,
    //   hasRecommendPages: !!recommendPages,
    //   recommendPagesCount: recommendPages?.pages?.length || 0,
    //   hasSummaryPages: !!summaryPages,
    //   summaryPagesCount: summaryPages?.pages?.length || 0,
    //   hasPages: !!pages,
    //   pagesCount: pages?.pages?.length || 0
    // });
      
    // "摘要"Tab使用摘要API数据
    if (activeTab === 'summary' && summaryPages) {
      const summaryArticles = summaryPages.pages.flat();
      // console.log('[HomePage] ✅ 使用摘要TAB数据:', { count: summaryArticles.length });
      return summaryArticles;
    }
      
    // “推荐”Tab使用推荐API数据，其他Tab使用筛选API数据
    if ((activeTab === '推荐' || activeTab === '') && recommendPages) {
      const recommendArticles = recommendPages.pages.flat();
      // console.log('[HomePage] ✅ 使用推荐TAB数据:', { 
      //   count: recommendArticles.length, 
      //   pages: recommendPages.pages.length,
      //   firstArticle: recommendArticles[0] ? {
      //     id: recommendArticles[0].id,
      //     title: recommendArticles[0].title?.substring(0, 30)
      //   } : null
      // });
      return recommendArticles;
    }
    const listArticles = pages?.pages.flat() || [];
    // if (activeTab === '全部' || activeTab === 'all') {
    //   console.log('[HomePage] ✅ 使用全部TAB数据:', { 
    //     count: listArticles.length,
    //     firstArticle: listArticles[0] ? {
    //       id: listArticles[0].id,
    //       title: listArticles[0].title?.substring(0, 30)
    //     } : null
    //   });
    // }
    return listArticles;
  }, [activeTab, pages, recommendPages, summaryPages]);
  
  // 推荐Tab、摘要Tab和其他Tab的加载状态
  const isLoadingArticles = (activeTab === '推荐' || activeTab === '') 
    ? (isFetchingNextPageRecommend || isFetchingRecommend || isLoadingRecommend)
    : activeTab === 'summary'
      ? (isFetchingNextPageSummary || isFetchingSummary || isLoadingSummary)
      : (isFetchingNextPage || isFetching || isLoading);
  
  const hasMoreArticles = (activeTab === '推荐' || activeTab === '') 
    ? hasNextPageRecommend 
    : activeTab === 'summary' 
      ? hasNextPageSummary 
      : hasNextPage;
  
  const loadMoreArticles = (activeTab === '推荐' || activeTab === '') 
    ? fetchNextPageRecommend 
    : activeTab === 'summary'
      ? fetchNextPageSummary
      : fetchNextPage;
  
  // 应用自动屏蔽过滤
  const { filteredArticles } = useAutoFilter(articles);
  
  // 自动补充机制：如果过滤后文章数量少于10篇，自动加载更多
  const articleIds = useMemo(() => filteredArticles.map(a => a.id), [filteredArticles]);
  
  useEffect(() => {
    // 当过滤后文章少于10篇且还有更多文章可加载时，自动加载
    // 但要确保不是初始加载状态，避免无限循环
    // 并且已经加载过至少一页（filteredArticles.length > 0 或 isLoadingArticles 为 false）
    const hasLoadedAtLeastOnce = !isLoadingArticles || filteredArticles.length > 0;
    
    if (hasLoadedAtLeastOnce && filteredArticles.length < 10 && hasNextPage && !isFetchingNextPage && !isFetching) {
      console.log('[HomePage] 自动补充加载:', { 
        filteredCount: filteredArticles.length, 
        hasNextPage, 
        isFetchingNextPage, 
        isFetching 
      });
      fetchNextPage();
    }
  }, [filteredArticles.length, hasNextPage, isFetchingNextPage, isFetching, fetchNextPage, isLoadingArticles]);

  const handleArticleNavigate = useCallback((articleId: number) => {
    useArticleNavStore.getState().setListContext(articleIds);
  }, [articleIds]);

  return (
    <div 
      className="flex flex-col min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <header className="sticky top-0 z-30 bg-[#faf7f0] border-b border-[#e8e0d0] safe-top">
        <div className="flex items-center h-[52px] px-4">
          <h1 className="text-lg font-bold text-[#3d3225] flex-shrink-0">阅读狂人</h1>
          <div className="flex-1 ml-3 flex items-center gap-2">
            <div className="flex-1">
              <SearchBar placeholder="搜索新闻..." />
            </div>
            <LanguageFilter />
            {/* 帮助图标 */}
            <button
              onClick={() => setShowHelp(true)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e8e0d0] transition-colors"
              title="查看使用手册"
            >
              <svg
                className="w-5 h-5 text-[#8b7355]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <CategoryTabs
        tabs={dynamicTabs}
        active={activeTab}
        onChange={setActiveTab}
      />
      <div className="flex-1 pb-14 bg-[#f5f1e8]">
        <div
          key={activeTab}
          className="animate-fadeIn"
          style={{
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {activeTab === 'summary' ? (
            // 摘要TAB使用专用SummaryArticleList
            <SummaryArticleList
              articles={filteredArticles}
              loading={isLoadingArticles}
              hasMore={!!hasMoreArticles}
              onLoadMore={() => loadMoreArticles()}
              onArticleNavigate={handleArticleNavigate}
            />
          ) : (
            // 其他TAB使用普通ArticleList
            <ArticleList
              articles={filteredArticles}
              loading={isLoadingArticles}
              hasMore={!!hasMoreArticles}
              onLoadMore={() => loadMoreArticles()}
              emptyText={
                selectedTags.length > 0 
                  ? "暂无符合筛选条件的文章" 
                  : activeTab.startsWith('rss_')
                    ? "该栏目暂无文章"
                    : "暂无文章"
              }
              onArticleNavigate={handleArticleNavigate}
            />
          )}
        </div>
      </div>
      
      {/* 帮助弹窗 */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
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
