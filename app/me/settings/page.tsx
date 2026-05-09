"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function SettingsPage() {
  const router = useRouter();
  const { fontSize, setFontSize, clearCache } = useSettingsStore();

  const fontSizes: { value: 'small' | 'medium' | 'large'; label: string; size: string }[] = [
    { value: 'small', label: '小', size: 'text-sm' },
    { value: 'medium', label: '中', size: 'text-base' },
    { value: 'large', label: '大', size: 'text-lg' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-14">
      <header className="sticky top-0 z-30 bg-white safe-top border-b border-gray-100">
        <div className="h-[52px] flex items-center px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold ml-3">设置</h1>
        </div>
      </header>

      <div className="bg-white mt-2">
        {/* 字体大小设置 */}
        <div className="px-4 py-3.5 border-b border-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3">字体大小</h3>
          <div className="flex gap-3">
            {fontSizes.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFontSize(opt.value)}
                className={`flex-1 py-2.5 rounded-lg border transition-all ${
                  fontSize === opt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                } ${opt.size}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 清除缓存 */}
        <button
          onClick={clearCache}
          className="flex items-center w-full px-4 py-3.5 active:bg-gray-50 border-b border-gray-50 text-red-500"
        >
          <span className="flex-1 text-[15px] text-left">清除缓存</span>
          <span className="text-xs text-gray-400">收藏和历史记录</span>
        </button>
      </div>

      <p className="text-center text-xs text-gray-300 mt-8">
        RSS新闻聚合 v0.1.0
      </p>
    </div>
  );
}
