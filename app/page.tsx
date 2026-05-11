"use client";

import { useState, useMemo, useCallback, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import ArticleList from "@/components/ArticleList";
import LanguageFilter from "@/components/LanguageFilter";
import { useArticles, useRecommendedArticles } from "@/hooks/useArticles";
import { useTagFilterStore } from "@/store/useTagFilterStore";
import { useArticleNavStore } from "@/store/useArticleNavStore";
import { useAutoFilter } from "@/hooks/useAutoFilter";
import { useTabConfigStore } from "@/store/useTabConfigStore";
import type { TabItem } from "@/components/CategoryTabs";
import { api } from "@/lib/api";

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
    urlTag ? decodeURIComponent(urlTag) : "推荐"
  );
  
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
    
    // 4. 兜底保障：确保至少"推荐"TAB存在
    if (tabs.length === 0 || !tabs.some(t => t.value === '')) {
      tabs.unshift({ label: '推荐', value: '', type: 'fixed' });
    }
    
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
      console.log('[HomePage] 分类筛选:', { tag_category: activeTab });
      // 注意：分类TAB不使用selectedTags，避免筛选冲突
    }
    
    // 4. 语言筛选（如果不是默认的"全部"）
    if (languageFilter !== "all") {
      f.language = languageFilter;
    }
    
    console.log('[HomePage] Filters:', f);
    return f;
  }, [activeTab, selectedTags, languageFilter]);

  // 两个Hook都调用（遵循React Hook规则：不能条件性调用Hook）
  // 通过数据选择切换，activeTab === "推荐" 时使用推荐数据
  const { data: recommendPages, fetchNextPage: fetchNextPageRecommend, 
          hasNextPage: hasNextPageRecommend, isFetchingNextPage: isFetchingNextPageRecommend, 
          isFetching: isFetchingRecommend, isLoading: isLoadingRecommend } = useRecommendedArticles();
  
  const { data: pages, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isLoading } = useArticles(filters);

  // 原始文章列表
  const articles = useMemo(() => {
    console.log('[HomePage] 数据选择逻辑:', {
      activeTab,
      hasRecommendPages: !!recommendPages,
      recommendPagesCount: recommendPages?.pages?.length || 0,
      hasPages: !!pages,
      pagesCount: pages?.pages?.length || 0
    });
    
    // “推荐”Tab使用推荐API数据，其他Tab使用筛选API数据
    if ((activeTab === '推荐' || activeTab === '') && recommendPages) {
      const recommendArticles = recommendPages.pages.flat();
      console.log('[HomePage] ✅ 使用推荐TAB数据:', { 
        count: recommendArticles.length, 
        pages: recommendPages.pages.length,
        firstArticle: recommendArticles[0] ? {
          id: recommendArticles[0].id,
          title: recommendArticles[0].title?.substring(0, 30)
        } : null
      });
      return recommendArticles;
    }
    const listArticles = pages?.pages.flat() || [];
    if (activeTab === '全部' || activeTab === 'all') {
      console.log('[HomePage] ✅ 使用全部TAB数据:', { 
        count: listArticles.length,
        firstArticle: listArticles[0] ? {
          id: listArticles[0].id,
          title: listArticles[0].title?.substring(0, 30)
        } : null
      });
    }
    return listArticles;
  }, [activeTab, pages, recommendPages]);
  
  // 推荐Tab和其他Tab的加载状态
  const isLoadingArticles = (activeTab === '推荐' || activeTab === '') 
    ? (isFetchingNextPageRecommend || isFetchingRecommend || isLoadingRecommend)
    : (isFetchingNextPage || isFetching || isLoading);
  
  const hasMoreArticles = (activeTab === '推荐' || activeTab === '') ? hasNextPageRecommend : hasNextPage;
  
  const loadMoreArticles = (activeTab === '推荐' || activeTab === '') 
    ? fetchNextPageRecommend 
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
        tabs={dynamicTabs}
        active={activeTab}
        onChange={setActiveTab}
      />
      <div className="flex-1 pb-14">
        <ArticleList
          key={activeTab}  // 强制TAB切换时重新创建组件，避免状态共享
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
