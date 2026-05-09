"use client";

interface TranslatedTextProps {
  translatedText: string;
  type?: 'title' | 'summary'; // 区分标题翻译还是摘要翻译
}

/**
 * 翻译文本显示组件
 * 
 * 功能：
 * - 显示翻译后的文本，带标签区分
 * - 翻译文本有淡入动画效果
 * - 简洁美观的视觉呈现
 */
export default function TranslatedText({ 
  translatedText,
  type = 'summary'
}: TranslatedTextProps) {
  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400 animate-fadeIn">
      {/* 标签 - 明确标识为翻译内容 */}
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
          {type === 'title' ? '译名' : '译文'}
        </span>
      </div>
      <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">
        {translatedText}
      </p>
    </div>
  );
}
