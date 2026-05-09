import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 设置状态管理
 * 
 * 首期实现：
 * - 字体大小设置
 * - 清除缓存功能
 */
interface SettingsState {
  // 状态
  fontSize: 'small' | 'medium' | 'large';
  
  // Actions
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  clearCache: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // 初始状态
      fontSize: 'medium',
      
      setFontSize: (size) => set({ fontSize: size }),
      
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
