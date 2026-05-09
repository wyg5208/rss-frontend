"use client";

interface TranslatedTextProps {
  translatedText: string;
  translatedLang: string;
}

/**
 * 翻译文本显示组件
 * 
 * 功能：
 * - 只显示翻译后的文本
 * - 翻译文本有蓝色背景高亮显示
 * - 支持中英文翻译显示
 */
export default function TranslatedText({ 
  translatedText, 
  translatedLang 
}: TranslatedTextProps) {
  const translatedLabel = translatedLang === 'en' ? 'English Translation' : '中文翻译';

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
      {/* 翻译文本 */}
      <div>
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
          {translatedLabel}
        </span>
        <p className="text-sm text-blue-900 mt-1 leading-relaxed">{translatedText}</p>
      </div>
    </div>
  );
}
