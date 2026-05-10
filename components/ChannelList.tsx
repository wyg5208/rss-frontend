"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useChannelFilterStore } from '@/store/useChannelFilterStore';
import { CheckSquare, Square, Search, CheckCircle, XCircle, Info, Save } from 'lucide-react';

interface RSSSource {
  id: number;
  name: string;
  category?: string;
  is_enabled: boolean;
  description?: string;
  channel_profile?: string;  // JSON字符串
  update_frequency?: string;
  total_articles?: number;
  language?: string;  // 语言代码：zh, en, etc.
}

interface ChannelProfile {
  positioning?: string;      // 频道定位
  content_type?: string;     // 内容类型
  features?: string;         // 特色说明
  update_frequency?: string; // 更新频率说明
}

/**
 * 内联频道列表组件
 * 直接在页面中显示，不使用模态框
 */
export default function ChannelList() {
  const { enabledSources, toggleSource, setAllSources, clearAllSources } = useChannelFilterStore();
  const [searchText, setSearchText] = useState('');
  const [pendingChanges, setPendingChanges] = useState<Set<number>>(new Set());  // 待保存的变更
  const [activeBubbleId, setActiveBubbleId] = useState<number | null>(null);  // 当前显示气泡的频道ID
  
  // 加载所有启用的RSS源
  const { data: sources, isLoading } = useQuery<RSSSource[]>({
    queryKey: ['rss-sources-enabled'],
    queryFn: async () => {
      const response = await api.get<{ sources: RSSSource[]; total: number }>('/rss/sources/?is_active=true&limit=1000');
      return response.sources || [];
    },
    staleTime: 5 * 60 * 1000,  // 5分钟缓存
  });
  
  // 过滤后的源列表（支持搜索）
  const filteredSources = sources?.filter(s =>
    s.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(searchText.toLowerCase()))
  ) || [];
  
  const enabledCount = enabledSources.length;
  const totalCount = sources?.length || 0;
  const isAllSelected = enabledCount === totalCount;
  
  // 解析频道简介
  const parseChannelProfile = (profileJson?: string): ChannelProfile | null => {
    if (!profileJson) return null;
    try {
      return JSON.parse(profileJson);
    } catch {
      return null;
    }
  };
  
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
  
  // 切换气泡显示
  const toggleBubble = (sourceId: number) => {
    setActiveBubbleId(prev => prev === sourceId ? null : sourceId);
  };
  
  // 切换频道（本地暂存，不立即同步）
  const handleToggleSource = (sourceId: number) => {
    toggleSource(sourceId);
    setPendingChanges(prev => {
      const next = new Set(prev);
      if (next.has(sourceId)) {
        next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });
  };
  
  // 全选（本地暂存）
  const handleSelectAll = () => {
    setAllSources(sources?.map(s => s.id) || []);
    setPendingChanges(new Set(sources?.map(s => s.id) || []));
  };
  
  // 清空（本地暂存）
  const handleClearAll = () => {
    clearAllSources();
    setPendingChanges(new Set(sources?.map(s => s.id) || []));
  };
  
  // 保存所有变更到后端
  const handleSaveChanges = async () => {
    const { enabledSources: currentSources } = useChannelFilterStore.getState();
    
    try {
      const token = localStorage.getItem('rss-auth-storage');
      const tokenObj = token ? JSON.parse(token) : null;
      const authToken = tokenObj?.state?.token;
      
      if (!authToken) {
        // 未登录用户，直接清除待保存标记
        setPendingChanges(new Set());
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/channels/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ source_ids: currentSources }),
      });
      
      if (response.ok) {
        setPendingChanges(new Set());
        alert('保存成功！');
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      alert('保存失败，请重试');
    }
  };
  
  return (
    <div className="flex flex-col">
      {/* 顶部操作栏 */}
      <div className="px-3 py-2 bg-white border-b border-gray-100">
        {/* 统计信息 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {isAllSelected ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-orange-500" />
            )}
            <span className="text-xs font-medium text-gray-700">
              已选择 <span className="text-blue-600 font-bold">{enabledCount}</span> / {totalCount} 个频道
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleSelectAll}
              disabled={isAllSelected}
              className={`text-xs px-2 py-1 rounded transition-all ${
                isAllSelected 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
              }`}
            >
              全选
            </button>
            <button
              onClick={handleClearAll}
              disabled={enabledCount === 0}
              className={`text-xs px-2 py-1 rounded transition-all ${
                enabledCount === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95'
              }`}
            >
              清空
            </button>
            {pendingChanges.size > 0 && (
              <button
                onClick={handleSaveChanges}
                className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 active:scale-95 transition-all flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                保存 ({pendingChanges.size})
              </button>
            )}
          </div>
        </div>
        
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索频道名称或分类..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>
      
      {/* 频道列表 */}
      <div className="flex-1 overflow-y-auto bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-gray-400">加载中...</div>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="w-12 h-12 text-gray-300 mb-3" />
            <div className="text-sm text-gray-400">未找到匹配的频道</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 p-2">
            {filteredSources.map(source => {
              const isEnabled = enabledSources.length === 0 || enabledSources.includes(source.id);
              const profile = parseChannelProfile(source.channel_profile);
              const showBubble = activeBubbleId === source.id;
              
              return (
                <div key={source.id} className="relative">
                  {/* 频道卡片 */}
                  <div className="border border-gray-100 rounded p-1.5 hover:border-gray-200 transition-colors">
                    {/* 复选框和标题 */}
                    <div className="flex items-start gap-1">
                      <button
                        onClick={() => handleToggleSource(source.id)}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {isEnabled ? (
                          <CheckSquare className="w-3 h-3 text-blue-500" />
                        ) : (
                          <Square className="w-3 h-3 text-gray-300" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        {/* 频道名称（可点击显示气泡） */}
                        <button
                          onClick={() => toggleBubble(source.id)}
                          className="text-[11px] font-medium text-gray-900 truncate w-full text-left hover:text-blue-600 transition-colors"
                        >
                          {source.name}
                        </button>
                        
                        {/* 分类、语言和统计 */}
                        <div className="flex flex-wrap items-center gap-1 text-[9px] text-gray-500 mt-0.5">
                          {source.category && (
                            <span className="px-1 py-0.5 bg-gray-50 rounded">{source.category}</span>
                          )}
                          {source.language && (
                            <span className={`px-1 py-0.5 rounded font-medium ${getLanguageLabel(source.language).color}`}>
                              {getLanguageLabel(source.language).text}
                            </span>
                          )}
                          {source.total_articles !== undefined && source.total_articles > 0 && (
                            <span>{source.total_articles}篇</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 气泡弹窗 */}
                  {showBubble && profile && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-[9px] space-y-1">
                      {profile.positioning && (
                        <div>
                          <span className="text-gray-400">定位：</span>
                          <span className="text-gray-700">{profile.positioning}</span>
                        </div>
                      )}
                      {profile.content_type && (
                        <div>
                          <span className="text-gray-400">内容：</span>
                          <span className="text-gray-700">{profile.content_type}</span>
                        </div>
                      )}
                      {profile.features && (
                        <div>
                          <span className="text-gray-400">特色：</span>
                          <span className="text-gray-700">{profile.features}</span>
                        </div>
                      )}
                      {profile.update_frequency && (
                        <div>
                          <span className="text-gray-400">更新：</span>
                          <span className="text-gray-700">{profile.update_frequency}</span>
                        </div>
                      )}
                      {/* 气泡箭头 */}
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* 底部提示 */}
      <div className="px-3 py-1.5 bg-gray-50 text-center text-[10px] text-gray-400 border-t border-gray-100">
        {pendingChanges.size > 0 
          ? `有 ${pendingChanges.size} 个频道变更待保存`
          : '取消勾选的频道将不再显示相关新闻'}
      </div>
    </div>
  );
}
