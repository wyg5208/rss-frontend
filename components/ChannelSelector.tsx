"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useChannelFilterStore } from '@/store/useChannelFilterStore';
import { CheckSquare, Square, X } from 'lucide-react';

interface RSSSource {
  id: number;
  name: string;
  category?: string;
  is_enabled: boolean;
}

interface ChannelSelectorProps {
  onClose: () => void;
}

export default function ChannelSelector({ onClose }: ChannelSelectorProps) {
  const { enabledSources, toggleSource, setAllSources, clearAllSources } = useChannelFilterStore();
  const [searchText, setSearchText] = useState('');
  
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
  
  // 全选
  const handleSelectAll = () => {
    setAllSources(sources?.map(s => s.id) || []);
  };
  
  // 清空
  const handleClearAll = () => {
    clearAllSources();
  };
  
  const enabledCount = enabledSources.length;
  const totalCount = sources?.length || 0;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div 
        className="bg-white w-full max-h-[80vh] rounded-t-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-bold">我的频道</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 统计和操作 */}
        <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            已选择 {enabledCount}/{totalCount} 个频道
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all"
            >
              全选
            </button>
            <button
              onClick={handleClearAll}
              className="text-xs px-3 py-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 active:scale-95 transition-all"
            >
              清空
            </button>
          </div>
        </div>
        
        {/* 搜索框 */}
        <div className="px-4 py-2 border-b">
          <input
            type="text"
            placeholder="搜索频道名称或分类..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* 频道列表 */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <div className="text-sm">加载中...</div>
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="text-sm">未找到匹配的频道</div>
            </div>
          ) : (
            filteredSources.map(source => {
              const isEnabled = enabledSources.includes(source.id);
              return (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50 transition-colors"
                >
                  {isEnabled ? (
                    <CheckSquare className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{source.name}</div>
                    {source.category && (
                      <div className="text-xs text-gray-400 mt-0.5">{source.category}</div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
        
        {/* 底部提示 */}
        <div className="px-4 py-2 bg-gray-50 text-center text-xs text-gray-400 border-t">
          取消勾选的频道将不再显示相关新闻
        </div>
      </div>
    </div>
  );
}
