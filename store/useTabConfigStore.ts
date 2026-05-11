/**
 * 用户TAB栏目配置Store
 * 
 * 功能：
 * 1. 管理固定TAB和RSS源TAB的配置
 * 2. 支持localStorage持久化
 * 3. 支持与后端API同步
 * 4. 兜底TAB（推荐、全部）强制可见，不可取消
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

// ==================== 类型定义 ====================

export interface FixedTabConfig {
  label: string;
  displayOrder: number;
  isVisible: boolean;
  isRequired: boolean;  // 兜底TAB标记，不可取消
}

export interface RSSSourceTabConfig {
  sourceId: number;
  sourceName: string;
  displayOrder: number;
  isVisible: boolean;
}

interface TabConfigState {
  // 状态
  fixedTabs: FixedTabConfig[];
  rssSourceTabs: RSSSourceTabConfig[];
  isSyncing: boolean;
  lastSavedState: string | null;  // 用于计算是否有变更
  
  // Actions - 固定TAB
  toggleFixedTab: (label: string) => void;
  moveFixedTabUp: (index: number) => void;
  moveFixedTabDown: (index: number) => void;
  
  // Actions - RSS源TAB
  toggleRSSSourceTab: (sourceId: number, sourceName?: string) => void;
  moveRSSSourceTabUp: (index: number) => void;
  moveRSSSourceTabDown: (index: number) => void;
  
  // 计算属性
  hasChanges: () => boolean;
  visibleRSSCount: () => number;
  
  // 同步操作
  syncToBackend: () => Promise<boolean>;
  loadFromBackend: () => Promise<void>;
  updateRSSSourceNames: (sourceMap: Map<number, string>) => void;
}

// ==================== 默认配置 ====================

const DEFAULT_FIXED_TABS: FixedTabConfig[] = [
  { label: "推荐", displayOrder: 0, isVisible: true, isRequired: true },
  { label: "全部", displayOrder: 1, isVisible: true, isRequired: true },
  { label: "经济学人", displayOrder: 2, isVisible: true, isRequired: false },
  { label: "科技", displayOrder: 3, isVisible: true, isRequired: false },
  { label: "经济", displayOrder: 4, isVisible: true, isRequired: false },
  { label: "教育", displayOrder: 5, isVisible: true, isRequired: false },
  { label: "政治", displayOrder: 6, isVisible: true, isRequired: false },
  { label: "全球", displayOrder: 7, isVisible: true, isRequired: false },
  { label: "生活", displayOrder: 8, isVisible: true, isRequired: false },
];

// ==================== 工具函数 ====================

/**
 * 生成状态快照（用于变更检测）
 */
function getStateSnapshot(state: Pick<TabConfigState, 'fixedTabs' | 'rssSourceTabs'>): string {
  return JSON.stringify({
    fixed: state.fixedTabs.map(t => ({ l: t.label, v: t.isVisible, o: t.displayOrder })),
    rss: state.rssSourceTabs.map(t => ({ id: t.sourceId, v: t.isVisible, o: t.displayOrder })),
  });
}

// ==================== Store 创建 ====================

export const useTabConfigStore = create<TabConfigState>()(
  persist(
    (set, get) => ({
      // 初始状态
      fixedTabs: DEFAULT_FIXED_TABS,
      rssSourceTabs: [],
      isSyncing: false,
      lastSavedState: getStateSnapshot({ fixedTabs: DEFAULT_FIXED_TABS, rssSourceTabs: [] }),
      
      // ==================== 固定TAB操作 ====================
      
      /**
       * 切换固定TAB的可见性
       * 兜底TAB（isRequired=true）不可取消
       */
      toggleFixedTab: (label) => {
        const { fixedTabs } = get();
        const targetTab = fixedTabs.find(t => t.label === label);
        if (targetTab?.isRequired) return;  // 兜底TAB不可取消
        
        set({
          fixedTabs: fixedTabs.map(tab =>
            tab.label === label ? { ...tab, isVisible: !tab.isVisible } : tab
          )
        });
      },
      
      /**
       * 上移固定TAB
       */
      moveFixedTabUp: (index) => {
        const { fixedTabs } = get();
        if (index === 0) return;
        const newTabs = [...fixedTabs];
        [newTabs[index - 1], newTabs[index]] = [newTabs[index], newTabs[index - 1]];
        set({ fixedTabs: newTabs.map((tab, i) => ({ ...tab, displayOrder: i })) });
      },
      
      /**
       * 下移固定TAB
       */
      moveFixedTabDown: (index) => {
        const { fixedTabs } = get();
        if (index === fixedTabs.length - 1) return;
        const newTabs = [...fixedTabs];
        [newTabs[index], newTabs[index + 1]] = [newTabs[index + 1], newTabs[index]];
        set({ fixedTabs: newTabs.map((tab, i) => ({ ...tab, displayOrder: i })) });
      },
      
      // ==================== RSS源TAB操作 ====================
      
      /**
       * 切换RSS源TAB的可见性
       * 最多显示10个RSS源TAB
       */
      toggleRSSSourceTab: (sourceId, sourceName = '') => {
        const { rssSourceTabs } = get();
        const exists = rssSourceTabs.find(t => t.sourceId === sourceId);
        const visibleCount = rssSourceTabs.filter(t => t.isVisible).length;
        
        if (exists) {
          // 已存在，切换可见性
          set({
            rssSourceTabs: rssSourceTabs.map(tab =>
              tab.sourceId === sourceId ? { ...tab, isVisible: !tab.isVisible } : tab
            )
          });
        } else if (visibleCount < 10) {
          // 不存在且未超过限制，添加新TAB
          set({
            rssSourceTabs: [...rssSourceTabs, {
              sourceId,
              sourceName,
              displayOrder: rssSourceTabs.length,
              isVisible: true
            }]
          });
        }
      },
      
      /**
       * 上移RSS源TAB
       */
      moveRSSSourceTabUp: (index) => {
        const { rssSourceTabs } = get();
        if (index === 0) return;
        const newTabs = [...rssSourceTabs];
        [newTabs[index - 1], newTabs[index]] = [newTabs[index], newTabs[index - 1]];
        set({ rssSourceTabs: newTabs.map((tab, i) => ({ ...tab, displayOrder: i })) });
      },
      
      /**
       * 下移RSS源TAB
       */
      moveRSSSourceTabDown: (index) => {
        const { rssSourceTabs } = get();
        if (index === rssSourceTabs.length - 1) return;
        const newTabs = [...rssSourceTabs];
        [newTabs[index], newTabs[index + 1]] = [newTabs[index + 1], newTabs[index]];
        set({ rssSourceTabs: newTabs.map((tab, i) => ({ ...tab, displayOrder: i })) });
      },
      
      // ==================== 计算属性 ====================
      
      /**
       * 检查是否有未保存的变更
       */
      hasChanges: () => {
        const state = get();
        const current = getStateSnapshot(state);
        return current !== state.lastSavedState;
      },
      
      /**
       * 获取可见的RSS源TAB数量
       */
      visibleRSSCount: () => {
        return get().rssSourceTabs.filter(t => t.isVisible).length;
      },
      
      // ==================== 同步操作 ====================
      
      /**
       * 同步配置到后端
       */
      syncToBackend: async () => {
        const { fixedTabs, rssSourceTabs, hasChanges } = get();
        if (!hasChanges()) return true;  // 无变更不请求
        
        set({ isSyncing: true });
        
        try {
          await api.post('/user/tabs/sync', {
            fixed_tabs: fixedTabs.map(t => ({
              tab_value: t.label,
              display_order: t.displayOrder,
              is_visible: t.isVisible
            })),
            rss_source_tabs: rssSourceTabs.map(t => ({
              tab_value: String(t.sourceId),
              display_order: t.displayOrder,
              is_visible: t.isVisible
            }))
          });
          
          const newSnapshot = getStateSnapshot({ fixedTabs, rssSourceTabs });
          set({ isSyncing: false, lastSavedState: newSnapshot });
          return true;
        } catch (error: any) {
          console.error('同步TAB配置失败:', error);
          set({ isSyncing: false });
          
          // 如果是401错误，提示用户登录
          if (error?.response?.status === 401 || error?.message?.includes('401')) {
            alert('请先登录后再保存配置');
          }
          
          return false;
        }
      },
      
      /**
       * 从后端加载配置
       */
      loadFromBackend: async () => {
        try {
          // 检查token是否存在
          const authStorage = typeof window !== 'undefined' ? localStorage.getItem('rss-auth-storage') : null;
          if (!authStorage) {
            console.log('[TabConfig] 未登录，跳过从后端加载配置');
            return; // 未登录，不加载
          }
          
          const data = await api.get<{
            fixed_tabs: Array<{ tab_value: string; display_order: number; is_visible: boolean }>;
            rss_source_tabs: Array<{ tab_value: string; display_order: number; is_visible: boolean }>;
          }>('/user/tabs/');
          
          console.log('[TabConfig] 从后端加载配置成功:', data);
          
          // 1. 合并后端固定TAB配置与默认配置
          const backendFixedMap = new Map(data.fixed_tabs.map(t => [t.tab_value, t]));
          const mergedFixedTabs = DEFAULT_FIXED_TABS.map(defaultTab => {
            const backendTab = backendFixedMap.get(defaultTab.label);
            if (backendTab) {
              return {
                ...defaultTab,
                displayOrder: backendTab.display_order,
                isVisible: defaultTab.isRequired ? true : backendTab.is_visible,
              };
            }
            return defaultTab;
          });
          
          // 2. 加载RSS源TAB配置
          const mergedRSSTabs: RSSSourceTabConfig[] = data.rss_source_tabs.map(t => ({
            sourceId: parseInt(t.tab_value, 10),
            sourceName: '',  // 从RSS源列表动态获取
            displayOrder: t.display_order,
            isVisible: t.is_visible,
          }));
          
          const newState = {
            fixedTabs: mergedFixedTabs,
            rssSourceTabs: mergedRSSTabs,
          };
          
          set({
            ...newState,
            lastSavedState: getStateSnapshot(newState),
          });
        } catch (error: any) {
          // 401表示未登录，静默处理
          if (error?.status === 401) {
            console.log('[TabConfig] 未登录，使用localStorage配置');
            return;
          }
          console.error('加载TAB配置失败:', error);
          // 加载失败保持当前localStorage中的配置
        }
      },
      
      /**
       * 更新RSS源名称（从RSS源列表匹配）
       */
      updateRSSSourceNames: (sourceMap) => {
        const { rssSourceTabs } = get();
        
        // 直接更新所有RSS源TAB的名称
        const updatedTabs = rssSourceTabs.map(tab => ({
          ...tab,
          sourceName: sourceMap.get(tab.sourceId) || tab.sourceName || `RSS-${tab.sourceId}`,
        }));
        
        // 强制更新（移除hasChanged检查，确保名称总是最新的）
        set({ rssSourceTabs: updatedTabs });
      },
    }),
    {
      name: 'tab-config-storage',
      partialize: (state) => ({
        fixedTabs: state.fixedTabs,
        rssSourceTabs: state.rssSourceTabs,
        lastSavedState: state.lastSavedState,
      }),
    }
  )
);
