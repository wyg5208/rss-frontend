import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { debounce } from 'lodash';

/**
 * 标签筛选状态管理
 * 
 * 功能:
 * - 管理选中的标签列表
 * - 管理语言筛选状态
 * - 同步到后端（登录用户）
 * - 本地持久化（localStorage）
 * 
 * 使用防抖(debounce)避免频繁API调用
 */
interface TagFilterState {
  // 状态
  selectedTags: string[];
  languageFilter: 'zh' | 'en' | 'all';
  isSyncing: boolean;
  lastSyncTime: number | null;
  
  // Actions
  setSelectedTags: (tags: string[]) => void;
  toggleTag: (tagName: string) => void;
  setLanguageFilter: (lang: 'zh' | 'en' | 'all') => void;
  clearAllTags: () => void;
  
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
const createDebouncedSync = () => debounce(async (tagNames: string[], set: (state: Partial<TagFilterState>) => void) => {
  const token = getToken();
  if (!token) return;
  
  try {
    const res = await fetch(`${apiBase}/api/v1/user/tag-preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ tag_ids: tagNames }),
    });
    
    if (res.ok) {
      set({ isSyncing: false, lastSyncTime: Date.now() });
    }
  } catch (error) {
    console.error('同步标签偏好失败:', error);
    set({ isSyncing: false });
  }
}, 1000);

export const useTagFilterStore = create<TagFilterState>()(
  devtools(
    persist(
      (set, get) => {
        const debouncedSync = createDebouncedSync();
        
        return {
          // 初始状态
          selectedTags: [],
          languageFilter: 'all' as const,
          isSyncing: false,
          lastSyncTime: null,
          
          setSelectedTags: (tags) => set({ selectedTags: tags }),
          
          toggleTag: (tagName) => {
            const { selectedTags } = get();
            const exists = selectedTags.includes(tagName);
            const newTags = exists 
              ? selectedTags.filter(t => t !== tagName)
              : [...selectedTags, tagName];
            
            set({ selectedTags: newTags, isSyncing: true });
            
            // 防抖同步到后端
            debouncedSync(newTags, set);
          },
          
          setLanguageFilter: (lang) => set({ languageFilter: lang }),
          
          clearAllTags: () => {
            set({ selectedTags: [], isSyncing: true });
            debouncedSync([], set);
          },
          
          syncToBackend: async () => {
            const { selectedTags } = get();
            set({ isSyncing: true });
            debouncedSync(selectedTags, set);
          },
          
          loadFromBackend: async () => {
            const token = getToken();
            if (!token) return;
            
            try {
              const res = await fetch(`${apiBase}/api/v1/user/tag-preferences`, {
                headers: { 'Authorization': `Bearer ${token}` },
              });
              
              if (res.ok) {
                const data = await res.json();
                // 使用后端返回的标签名称（更可靠）
                set({ selectedTags: data.tag_names || [] });
              }
            } catch (error) {
              console.error('加载标签偏好失败:', error);
            }
          },
        };
      },
      {
        name: 'tag-filter-storage',
        partialize: (state) => ({
          selectedTags: state.selectedTags,
          languageFilter: state.languageFilter,
        }),
      }
    ),
    { name: 'TagFilterStore' }
  )
);