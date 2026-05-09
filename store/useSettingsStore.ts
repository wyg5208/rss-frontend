import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 设置状态管理
 * 
 * 功能：
 * - 字体大小设置
 * - 清除缓存功能
 * - 自动屏蔽已读和不看文章
 */
interface SettingsState {
  // 状态
  fontSize: 'small' | 'medium' | 'large';
  autoHideRead: boolean; // 自动屏蔽已读文章
  autoHideBlocked: boolean; // 自动屏蔽不看文章
  
  // Actions
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setAutoHideRead: (enabled: boolean) => void;
  setAutoHideBlocked: (enabled: boolean) => void;
  clearCache: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // 初始状态
      fontSize: 'medium',
      autoHideRead: true, // 默认开启自动屏蔽已读
      autoHideBlocked: true, // 默认开启自动屏蔽不看
      
      setFontSize: (size) => set({ fontSize: size }),
      
      setAutoHideRead: (enabled) => set({ autoHideRead: enabled }),
      
      setAutoHideBlocked: (enabled) => set({ autoHideBlocked: enabled }),
      
      clearCache: () => {
        if (typeof window !== 'undefined') {
          // 确认清除
          if (confirm('确定要清除收藏和历史记录吗？')) {
            localStorage.removeItem('favorites');
            localStorage.removeItem('read_history');
            // 刷新页面
            window.location.reload();
          }
        }
      },
    }),
    {
      name: 'rss-settings',
    }
  )
);
