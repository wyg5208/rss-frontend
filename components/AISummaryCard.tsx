"use client";

import { Sparkles, Clock, Lightbulb } from "lucide-react";

interface Props {
  aiSummary?: string;
  aiKeyPoints?: string[];
  aiProcessedAt?: string;
}

/**
 * AI摘要内联显示组件（与双语翻译对齐）
 * 
 * 功能：
 * - 直接内联显示在文章内容中，不使用模态框
 * - 显示AI摘要和核心要点
 * - 简洁美观的视觉呈现
 */
export default function AISummaryCard({
  aiSummary,
  aiKeyPoints,
  aiProcessedAt,
}: Props) {
  // 如果没有AI摘要，不显示任何内容
  if (!aiSummary) {
    return null;
  }

  // 有摘要，直接内联显示
  return (
    <div className="mt-4 mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 animate-fadeIn">
      {/* 标题栏 - 明确标识为AI生成 */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <span className="font-semibold text-amber-800">AI 摘要</span>
        <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">AI生成</span>
        {aiProcessedAt && (
          <span className="text-xs text-amber-600 flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {formatTime(aiProcessedAt)}
          </span>
        )}
      </div>

      {/* 摘要内容 */}
      <div className="bg-white/60 rounded-lg p-3 mb-3">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
      </div>

      {/* 核心要点 */}
      {aiKeyPoints && aiKeyPoints.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-800">核心要点</span>
          </div>
          <ul className="space-y-1.5">
            {aiKeyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <span className="flex-1 whitespace-pre-wrap">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  function formatTime(isoString: string): string {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "刚刚";
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      if (days < 7) return `${days}天前`;
      return date.toLocaleDateString("zh-CN");
    } catch {
      return "";
    }
  }
}