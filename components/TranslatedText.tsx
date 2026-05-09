"use client";

interface TranslatedTextProps {
  originalText: string;
  translatedText: string;
  originalLang: string;
  translatedLang: string;
}

/**
 * 翻译文本显示组件
 * 
 * 功能：
 * - 显示原文和翻译文本
 * - 原文和翻译有明显视觉区分
 * - 支持中英文双语显示
 */
export default function TranslatedText({ 
  originalText, 
  translatedText, 
  originalLang, 
  translatedLang 
}: TranslatedTextProps) {
  const originalLabel = originalLang === 'zh' ? '中文原文' : 'English Original';
  const translatedLabel = translatedLang === 'en' ? 'English Translation' : '中文翻译';

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
      {/* 原文 */}
      <div className="mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {originalLabel}
        </span>
        <p className="text-sm text-gray-700 mt-1 leading-relaxed">{originalText}</p>
      </div>
      
      {/* 分割线 */}
      <div className="my-2 border-t border-blue-200" />
      
      {/* 翻译 */}
      <div>
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
          {translatedLabel}
        </span>
        <p className="text-sm text-blue-900 mt-1 leading-relaxed">{translatedText}</p>
      </div>
    </div>
  );
}
