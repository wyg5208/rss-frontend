import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { debounce } from 'lodash';

/**
 * 频道过滤状态管理
 * 
 * 功能:
 * - 管理用户启用的RSS源ID列表
 * - 同步到后端（登录用户）
 * - 本地持久化（localStorage）
 * 
 * 设计说明:
 * - 空数组表示默认全选（隐式订阅所有频道）
 * - 使用防抖(debounce)避免频繁API调用
 * - 未登录用户仅使用本地存储
 */
interface ChannelFilterState {
  // 状态
  enabledSources: number[];  // 启用的RSS源ID列表（空=全选）
  isSyncing: boolean;
  lastSyncTime: number | null;
  
  // Actions
  toggleSource: (sourceId: number) => void;
  setAllSources: (sourceIds: number[]) => void;
  clearAllSources: () => void;
  
  // 异步操作
  syncToBackend: () => Promise<void>;
  loadFromBackend: () => Promise<void>;
}

// 获取认证Token
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('rss-auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

// 获取API基础URL
const apiBase = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || '')
  : '';

// 防抖同步函数（1秒延迟）
const createDebouncedSync = () => debounce(async (enabledSources: number[], set: (state: Partial<ChannelFilterState>) => void) => {
  const token = getToken();
  if (!token) return;  // 未登录不同步
  
  try {
    const res = await fetch(`${apiBase}/api/v1/user/channels/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ source_ids: enabledSources }),
    });
    
    if (res.ok) {
      set({ isSyncing: false, lastSyncTime: Date.now() });
    }
  } catch (error) {
    console.error('同步频道偏好失败:', error);
    set({ isSyncing: false });
  }
}, 1000);

export const useChannelFilterStore = create<ChannelFilterState>()(
  persist(
    (set, get) => {
      const debouncedSync = createDebouncedSync();
      
      return {
        // 初始状态
        enabledSources: [],  // 空数组表示全选（隐式默认）
        isSyncing: false,
        lastSyncTime: null,
        
        toggleSource: (sourceId) => {
          const { enabledSources } = get();
          const exists = enabledSources.includes(sourceId);
          const newSources = exists 
            ? enabledSources.filter(id => id !== sourceId)
            : [...enabledSources, sourceId];
          
          set({ enabledSources: newSources, isSyncing: true });
          
          // 防抖同步到后端
          debouncedSync(newSources, set);
        },
        
        setAllSources: (sourceIds) => {
          set({ enabledSources: sourceIds, isSyncing: true });
          debouncedSync(sourceIds, set);
        },
        
        clearAllSources: () => {
          set({ enabledSources: [], isSyncing: true });
          debouncedSync([], set);
        },
        
        syncToBackend: async () => {
          const { enabledSources } = get();
          set({ isSyncing: true });
          debouncedSync(enabledSources, set);
        },
        
        loadFromBackend: async () => {
          const token = getToken();
          if (!token) {
            // 未登录用户：如果是首次使用（空数组），不做任何操作（保持全选）
            return;
          }
          
          try {
            const res = await fetch(`${apiBase}/api/v1/user/channels/`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (res.ok) {
              const data = await res.json();
              // 如果后端返回空数组，表示用户从未设置偏好，应该全选
              // 但我们在初始化时已经是空数组（全选），所以不需要特别处理
              set({ enabledSources: data.enabled_source_ids || [] });
            }
          } catch (error) {
            console.error('加载频道偏好失败:', error);
          }
        },
      };
    },
    {
      name: 'channel-filter-storage',
      partialize: (state) => ({
        enabledSources: state.enabledSources,
      }),
    }
  )
);
