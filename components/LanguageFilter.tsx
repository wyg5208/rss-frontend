'use client';

import { useState, useRef, useEffect } from 'react';
import { useTagFilterStore } from '@/store/useTagFilterStore';
import { Globe } from 'lucide-react';

/**
 * 语言筛选下拉菜单组件
 * 搜索栏右侧的图标按钮，点击显示单选菜单
 */
export default function LanguageFilter() {
  const { languageFilter, setLanguageFilter } = useTagFilterStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: { value: 'zh' | 'en' | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: '全部', icon: '🌐' },
    { value: 'zh', label: '中文', icon: 'CN' },
    { value: 'en', label: 'English', icon: 'EN' },
  ];

  const currentOption = options.find(o => o.value === languageFilter) || options[0];

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        title={`语言筛选: ${currentOption.label}`}
      >
        <span className="text-xs font-medium text-gray-600">
          {currentOption.icon}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setLanguageFilter(opt.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors
                ${languageFilter === opt.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
            >
              <span>{opt.icon === '🌐' ? '🌐' : opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}