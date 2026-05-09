import { create } from 'zustand';

/**
 * 文章列表导航上下文
 * 
 * 记录用户从哪个文章列表进入详情页，实现"上一篇/下一篇"基于列表顺序的导航。
 * 首页、搜索页等列表页面在用户点击文章前调用 setListContext() 保存当前列表。
 */
interface ArticleNavState {
  listIds: number[];
  
  setListContext: (ids: number[]) => void;
  getPrevId: (currentId: number) => number | null;
  getNextId: (currentId: number) => number | null;
  hasPrev: (currentId: number) => boolean;
  hasNext: (currentId: number) => boolean;
}

export const useArticleNavStore = create<ArticleNavState>((set, get) => ({
  listIds: [],

  setListContext: (ids) => set({ listIds: ids }),

  getPrevId: (currentId) => {
    const { listIds } = get();
    const idx = listIds.indexOf(currentId);
    return idx > 0 ? listIds[idx - 1] : null;
  },

  getNextId: (currentId) => {
    const { listIds } = get();
    const idx = listIds.indexOf(currentId);
    return idx >= 0 && idx < listIds.length - 1 ? listIds[idx + 1] : null;
  },

  hasPrev: (currentId) => get().listIds.indexOf(currentId) > 0,

  hasNext: (currentId) => {
    const { listIds } = get();
    const idx = listIds.indexOf(currentId);
    return idx >= 0 && idx < listIds.length - 1;
  },
}));
