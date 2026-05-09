'use client';

import { useTagFilterStore } from '@/store/useTagFilterStore';

/**
 * 语言筛选组件
 * 
 * 提供三种语言筛选选项：
 * - 混合（默认）：显示所有语言的文章
 * - 仅中文：只显示中文文章
 * - 仅英文：只显示英文文章
 */
export default function LanguageFilter() {
  const { languageFilter, setLanguageFilter } = useTagFilterStore();
  
  const options: { value: 'zh' | 'en' | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: '混合', icon: '🌐' },
    { value: 'zh', label: '仅中文', icon: '🇨🇳' },
    { value: 'en', label: '仅英文', icon: '🇺🇸' },
  ];
  
  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">语言:</span>
        <div className="flex gap-1.5">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLanguageFilter(opt.value)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium transition-all
                ${languageFilter === opt.value
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                }
              `}
            >
              <span className="mr-1">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}