"use client";

interface TranslatedTextProps {
  translatedText: string;
}

/**
 * 翻译文本显示组件
 * 
 * 功能：
 * - 只显示翻译后的文本，无标签
 * - 翻译文本有淡入动画效果
 * - 简洁美观的视觉呈现
 */
export default function TranslatedText({ 
  translatedText 
}: TranslatedTextProps) {
  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400 animate-fadeIn">
      <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">
        {translatedText}
      </p>
    </div>
  );
}
