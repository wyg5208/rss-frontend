"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTags } from "@/hooks/useTags";
import { useArticleStore } from "@/store/useArticleStore";
import { useTagFilterStore } from "@/store/useTagFilterStore";
import ArticleCard from "@/components/ArticleCard";
import { Heart, Clock, Tag, X, ArrowUpDown, Layers, Radio } from "lucide-react";
import ChannelList from "@/components/ChannelList";
import clsx from "clsx";

// 前端分类映射：覆盖后端 tag.category，将标签重新归类
const TAG_CATEGORY_MAP: Record<string, string> = {
  // === 科技/编程 ===
  AI: "科技", "artificial-intelligence": "科技", AGI: "科技", "ai-agent": "科技",
  llm: "科技", chatgpt: "科技", openai: "科技", claude: "科技", gemini: "科技",
  mcp: "科技", rag: "科技", machinelearning: "科技", "machine-learning": "科技",
  technology: "科技", tech: "科技", programming: "科技", python: "科技",
  javascript: "科技", typescript: "科技", react: "科技", java: "科技", rust: "科技",
  go: "科技", html: "科技", api: "科技", "software-development": "科技",
  "software-engineering": "科技", devops: "科技", docker: "科技", containers: "科技",
  linux: "科技", git: "科技", github: "科技", coding: "科技", code: "科技",
  database: "科技", cloud: "科技", aws: "科技", cli: "科技", webdev: "科技",
  architecture: "科技", agents: "科技", testing: "科技", qa: "科技",
  opensource: "科技", software: "科技",
  芯片: "科技", 半导体: "科技", 算力: "科技", 大模型: "科技", 机器人: "科技",
  cybersecurity: "科技", Security: "科技", privacy: "科技",
  CES: "科技", "钛媒体直击CES 2026": "科技", "2025 EDGE AWARDS 创新评选": "科技",
  "2025 T-EDGE全球对话": "科技", "TechCrunch Dissrupt 2026": "科技",
  "科技新闻": "科技", huawei: "科技", 华为: "科技", ios: "科技",
  microsoft: "科技", apple: "科技", "Mac": "科技",

  // === 商业/金融 ===
  Business: "商业", finance: "商业", money: "商业", 投资: "商业", 融资: "商业",
  IPO: "商业", 上市: "商业", cryptocurrency: "商业", blockchain: "商业",
  Venture: "商业", startup: "商业", Startups: "商业", 零售: "商业",
  消费: "商业", 银行: "商业", 港股: "商业", 营销: "商业", 广告: "商业",
  sales: "商业", marketing: "商业", growth: "商业",
  oil: "商业", cost: "商业",

  // === 地区/国家 ===
  Singapore: "地区", singapore: "地区", "Kuala Lumpur": "地区", 马来西亚: "地区",
  india: "地区", 印度: "地区", china: "地区", japan: "地区", 欧洲: "地区",
  Europe: "地区", eu: "地区", 美国: "地区", "Donald Trump": "地区",
  上海: "地区",
  "Malaysia's trade performance 2025": "地区",

  // === 社会/文化 ===
  government: "社会", politics: "社会", Policy: "社会", world: "社会",
  war: "社会", culture: "社会", Social: "社会", history: "社会",
  philosophy: "社会", education: "社会", students: "社会", career: "社会",
  leadership: "社会", management: "社会", community: "社会",
  health: "社会", life: "社会", work: "社会", "self-improvement": "社会",
  interview: "社会",

  // === 生活方式 ===
  Gaming: "生活", Entertainment: "生活", Gadgets: "生活", Gear: "生活",
  旅游: "生活", 餐饮: "生活", 游戏: "生活", Deals: "生活",
  productivity: "生活", office: "生活", mobile: "生活",

  // === 科学/学术 ===
  Science: "科学", space: "科学", data: "科学", "data-science": "科学",
  learning: "科学", energy: "科学", future: "科学",
};

// 获取标签的前端分类
function getTagCategory(tag: { name: string; category?: string }): string {
  return TAG_CATEGORY_MAP[tag.name] || TAG_CATEGORY_MAP[tag.name.toLowerCase()] || "其他";
}

type Tab = "channels" | "favorites" | "history" | "tags";

export default function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("tags");
  const { data: tags } = useTags(500); // 后端限制最大500
  const { favorites, readHistory } = useArticleStore();
  const { selectedTags, toggleTag, clearAllTags } = useTagFilterStore();
  
  // 排序方式
  const [sortBy, setSortBy] = useState<'default' | 'alpha' | 'category'>('default');

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "channels" || t === "favorites" || t === "history" || t === "tags") setTab(t);
  }, [searchParams]);

  const tabs: { key: Tab; label: string; icon: typeof Heart }[] = [
    { key: "channels", label: "频道", icon: Radio },
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
  
  // 按分类分组（使用前端分类映射）
  const groupedTags = useMemo(() => {
    if (sortBy !== 'category' || !sortedTags.length) return null;
    
    const groups: Record<string, typeof sortedTags> = {};
    sortedTags.forEach(tag => {
      const category = getTagCategory(tag);
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
        {tab === "channels" && <ChannelList />}
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