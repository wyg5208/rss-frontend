"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Clock, Lightbulb } from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  articleId: number;
  aiSummary?: string;
  aiKeyPoints?: string[];
  aiProcessedAt?: string;
  onProcessed?: (data: { ai_summary: string; ai_key_points: string[] }) => void;
}

export default function AISummaryCard({
  articleId,
  aiSummary,
  aiKeyPoints,
  aiProcessedAt,
  onProcessed
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 如果没有AI摘要，显示生成按钮
  if (!aiSummary) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-amber-800">AI 智能摘要</span>
        </div>
        <p className="text-sm text-amber-700 mb-3">
          这篇文章还没有AI摘要，AI可以帮你快速了解文章核心内容
        </p>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>正在生成...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>一键生成摘要</span>
            </>
          )}
        </button>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  // 有摘要，显示摘要卡片
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-amber-800">AI 摘要</span>
          {aiProcessedAt && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(aiProcessedAt)}
            </span>
          )}
        </div>
        <button className="p-1 text-amber-600">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded ? (
        <div className="mt-3 space-y-3">
          {/* 摘要内容 */}
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-sm text-gray-700 leading-relaxed">{aiSummary}</p>
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
                    <span className="flex-1">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{aiSummary}</p>
      )}
    </div>
  );

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ success: boolean; message: string; data: any }>(`/ai/process/${articleId}`);
      const data = response;

      if (data.success && onProcessed) {
        onProcessed({
          ai_summary: data.data?.ai_summary || "",
          ai_key_points: data.data?.key_points_success ? data.data?.key_points : []
        });
      } else {
        setError(data.message || "生成失败");
      }
    } catch (err: any) {
      setError(err?.message || "请求失败，请重试");
    } finally {
      setIsLoading(false);
    }
  }

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