/**
 * 栏目配置面板组件
 * 
 * 功能：
 * 1. 显示和管理固定TAB配置（显隐、排序）
 * 2. 显示和管理RSS源TAB配置（选择、排序）
 * 3. 兜底TAB（推荐、全部）强制可见，显示锁定图标
 * 4. 保存配置到后端
 */
"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useTabConfigStore } from '@/store/useTabConfigStore';
import { ChevronUp, ChevronDown, CheckSquare, Square, Save, Info, Lock, ArrowDown, ArrowRight } from 'lucide-react';

interface RSSSource {
  id: number;
  name: string;
  category?: string;
  update_frequency?: string;
  total_articles?: number;
  week_articles?: number;  // 近一周文章数
  language?: string;  // 语言代码：zh, en, etc.
}

export default function TabConfigPanel() {
  const { 
    fixedTabs, rssSourceTabs, isSyncing, hasChanges,
    toggleFixedTab, moveFixedTabUp, moveFixedTabDown,
    toggleRSSSourceTab, moveRSSSourceTabUp, moveRSSSourceTabDown,
    syncToBackend, loadFromBackend, visibleRSSCount
  } = useTabConfigStore();
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fixedSectionCollapsed, setFixedSectionCollapsed] = useState(false);
  const [rssSectionCollapsed, setRssSectionCollapsed] = useState(false);
  
  // 组件挂载时从后端加载配置（多设备同步）
  useEffect(() => {
    const loadConfig = async () => {
      // 等待token加载完成（最多等待3秒）
      let attempts = 0;
      const maxAttempts = 30; // 30 * 100ms = 3秒
      
      while (attempts < maxAttempts) {
        const authStorage = typeof window !== 'undefined' ? localStorage.getItem('rss-auth-storage') : null;
        if (authStorage) {
          break; // token已就绪
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // 检查是否有token
      const authStorage = typeof window !== 'undefined' ? localStorage.getItem('rss-auth-storage') : null;
      if (!authStorage) {
        console.log('[TabConfig] 未登录，跳过从后端加载配置');
        return;
      }
      
      try {
        console.log('[TabConfig] 开始从后端加载配置...');
        await loadFromBackend();
      } catch (error) {
        console.error('加载TAB配置失败:', error);
        // 加载失败时使用localStorage中的配置（降级）
      }
    };
    
    loadConfig();
  }, [loadFromBackend]);
  
  // 加载RSS源列表（用于显示名称和TAB选择）
  const { data: sources } = useQuery<RSSSource[]>({
    queryKey: ['rss-sources-enabled'],
    queryFn: async () => {
      const response = await api.get<{ sources: RSSSource[] }>('/rss/sources/?is_active=true&limit=1000');
      return response.sources || [];
    },
    staleTime: 5 * 60 * 1000,
  });
  
  // 获取语言标签
  const getLanguageLabel = (lang?: string): { text: string; color: string } => {
    if (!lang) return { text: '未知', color: 'bg-gray-100 text-gray-600' };
    
    const langLower = lang.toLowerCase();
    
    // 中文
    if (langLower === 'zh' || langLower === 'zh-cn' || langLower === 'zh-tw' || langLower.startsWith('zh')) {
      return { text: '中文', color: 'bg-red-50 text-red-600' };
    }
    
    // 英文
    if (langLower === 'en' || langLower === 'en-us' || langLower === 'en-gb' || langLower.startsWith('en')) {
      return { text: '英文', color: 'bg-blue-50 text-blue-600' };
    }
    
    // 双语（混合）
    if (langLower.includes('zh') && langLower.includes('en')) {
      return { text: '双语', color: 'bg-purple-50 text-purple-600' };
    }
    
    // 其他语言
    const langMap: Record<string, string> = {
      'ja': '日文',
      'ko': '韩文',
      'fr': '法文',
      'de': '德文',
      'es': '西文',
      'ru': '俄文',
      'ms': '马来文',
    };
    
    const text = langMap[langLower] || lang.toUpperCase();
    return { text, color: 'bg-gray-100 text-gray-600' };
  };
  
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // 保存配置
  const handleSave = async () => {
    setSaveStatus('idle');
    const success = await syncToBackend();
    setSaveStatus(success ? 'success' : 'error');
    // 3秒后清除状态提示
    setTimeout(() => setSaveStatus('idle'), 3000);
  };
  
  // 只在客户端渲染后计算这些值，避免水合错误
  const vRSSCount = isMounted ? visibleRSSCount() : 0;
  const hasUnsavedChanges = isMounted ? hasChanges() : false;
  
  return (
    <div className="flex flex-col">
      {/* 内容区域 - 可滚动 */}
      <div className="flex-1">
        {/* 固定栏目配置区 - 可折叠卡片 */}
        <div className="border-b border-gray-100">
          {/* 卡片标题行 */}
          <div className="px-3 py-3 flex items-center justify-between">
            <button
              onClick={() => setFixedSectionCollapsed(!fixedSectionCollapsed)}
              className="flex items-center gap-2 hover:text-gray-600 transition-colors flex-1"
            >
              {fixedSectionCollapsed ? (
                <ArrowRight className="w-4 h-4 text-gray-400" />
              ) : (
                <ArrowDown className="w-4 h-4 text-gray-400" />
              )}
              <h3 className="text-sm font-medium text-gray-700">
                固定栏目 
                <span className="text-xs text-gray-400 font-normal ml-1">(上→下 = 首页左→右)</span>
              </h3>
            </button>
            
            {/* 保存配置按钮 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {saveStatus === 'success' && (
                <span className="text-xs text-green-600">保存成功</span>
              )}
              {saveStatus === 'error' && (
                <span className="text-xs text-orange-600 font-medium">请先登录后再保存配置</span>
              )}
              <button
                onClick={handleSave}
                disabled={isSyncing || !hasUnsavedChanges}
                className={`text-xs px-3 py-1.5 rounded transition-all flex items-center gap-1 ${
                  isSyncing || !hasUnsavedChanges
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                }`}
              >
                <Save className="w-3 h-3" />
                {isSyncing ? '保存中...' : '保存配置'}
              </button>
            </div>
          </div>
                
          {/* 保存状态提示 */}
          {!hasUnsavedChanges && (
            <div className="px-3 pb-2 text-[10px] text-gray-400">所有更改已保存</div>
          )}
          {hasUnsavedChanges && (
            <div className="px-3 pb-2 text-[10px] text-orange-500">有未保存的更改，点击&quot;保存配置&quot;同步到云端</div>
          )}
          
          {/* 卡片内容区 */}
          {!fixedSectionCollapsed && (
            <div className="px-3 pb-3 space-y-1">
              {fixedTabs.map((tab, index) => (
                <div key={tab.label} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  {/* 兜底TAB显示锁定图标，不可操作 */}
                  {tab.isRequired ? (
                    <div className="w-4 h-4 flex items-center justify-center" title="必须显示">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  ) : (
                    <button 
                      onClick={() => toggleFixedTab(tab.label)}
                      className="cursor-pointer"
                    >
                      {tab.isVisible ? (
                        <CheckSquare className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  )}
                        
                  <span className={`flex-1 text-sm ${tab.isVisible ? 'text-gray-900' : 'text-gray-400'}`}>
                    {tab.label}
                    {tab.isRequired && (
                      <span className="ml-1 text-[10px] text-gray-400">(不可隐藏)</span>
                    )}
                  </span>
                        
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveFixedTabUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveFixedTabDown(index)}
                      disabled={index === fixedTabs.length - 1}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
              
        {/* RSS源栏目配置区 - 可折叠卡片 */}
        <div>
          {/* 卡片标题行 */}
          <button
            onClick={() => setRssSectionCollapsed(!rssSectionCollapsed)}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-700">RSS源栏目</h3>
              <span className={`text-xs ${vRSSCount >= 10 ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>
                (最多选择10个，已选 {vRSSCount})
              </span>
            </div>
            {rssSectionCollapsed ? (
              <ArrowRight className="w-4 h-4 text-gray-400" />
            ) : (
              <ArrowDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
                
          {/* 卡片内容区 */}
          {!rssSectionCollapsed && (
            <div className="px-3 pb-3">
              {vRSSCount >= 10 && (
                <div className="mb-2 px-2 py-1 bg-orange-50 border border-orange-200 rounded text-xs text-orange-600 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  已达到最大选择数量，取消一个后才能添加
                </div>
              )}
                    
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {sources?.map(source => {
                  const tabIndex = rssSourceTabs.findIndex(t => t.sourceId === source.id);
                  const isSelected = tabIndex !== -1;
                  const selectedTab = isSelected ? rssSourceTabs[tabIndex] : null;
                  const isVisible = selectedTab?.isVisible ?? false;
                  const canSelect = vRSSCount < 10 || isVisible;
                  const langLabel = getLanguageLabel(source.language);
                        
                  return (
                    <div key={source.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <button
                        onClick={() => {
                          if (canSelect) toggleRSSSourceTab(source.id, source.name);
                        }}
                        disabled={!canSelect}
                        className={!canSelect ? 'cursor-not-allowed' : ''}
                      >
                        {isVisible ? (
                          <CheckSquare className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                            
                      <div className="flex-1 min-w-0">
                        {/* RSS源名称 */}
                        <div className={`text-sm font-medium truncate ${isVisible ? 'text-gray-900' : 'text-gray-400'}`}>
                          {source.name}
                        </div>
                              
                        {/* 分类、语言、统计信息 */}
                        <div className="flex flex-wrap items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                          {source.category && (
                            <span className="px-1 py-0.5 bg-gray-100 rounded">{source.category}</span>
                          )}
                          {source.language && (
                            <span className={`px-1 py-0.5 rounded font-medium ${langLabel.color}`}>
                              {langLabel.text}
                            </span>
                          )}
                          {/* 近一周文章统计 - 蓝色强调标签 */}
                          {source.week_articles !== undefined && source.week_articles > 0 && (
                            <span className="px-1 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">
                              近一周 {source.week_articles} 篇
                            </span>
                          )}
                          {source.total_articles !== undefined && source.total_articles > 0 && (
                            <span>总计 {source.total_articles} 篇</span>
                          )}
                        </div>
                      </div>
                            
                      {isSelected && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => moveRSSSourceTabUp(tabIndex)}
                            disabled={tabIndex === 0}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveRSSSourceTabDown(tabIndex)}
                            disabled={tabIndex === rssSourceTabs.length - 1}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
              
        {/* 底部提示 */}
        <div className="px-3 py-1.5 bg-gray-50 text-center text-[10px] text-gray-400 border-t border-gray-100">
          配置修改后需点击&ldquo;保存配置&rdquo;按钮才会生效
        </div>
      </div>
    </div>
  );
}
