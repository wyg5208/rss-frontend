"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

interface Props {
  articleId: number;
  aiSummary?: string;
  aiKeyPoints?: string[];
  aiProcessedAt?: string;
  onGenerate: () => void;
  isLoading?: boolean;
  hasContent: boolean;
}

/**
 * AI摘要悬浮按钮组件
 * 
 * 固定在屏幕左侧边缘垂直居中位置。
 * - 无摘要时：点击触发生成
 * - 有摘要时：点击弹出遮罩层显示摘要内容
 */
export default function FloatingAISummary({
  articleId: _articleId,
  aiSummary,
  aiKeyPoints,
  aiProcessedAt,
  onGenerate,
  isLoading = false,
  hasContent,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => {
          if (hasContent) {
            setIsOpen(true);
          } else {
            onGenerate();
          }
        }}
        disabled={isLoading}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30
          w-9 h-9 bg-white border border-amber-200 rounded-r-lg shadow-md
          flex items-center justify-center
          hover:bg-amber-50 active:bg-amber-100 transition-colors
          disabled:opacity-50"
        title={hasContent ? "查看AI摘要" : "生成AI摘要"}
      >
        {isLoading ? (
          <span className="animate-spin text-amber-500 text-sm">⏳</span>
        ) : (
          <Sparkles className="w-4 h-4 text-amber-500" />
        )}
      </button>

      {/* 摘要弹窗遮罩 */}
      {isOpen && hasContent && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗标题栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-amber-800">AI 摘要</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="overflow-y-auto p-4">
              {/* 摘要内容 */}
              {aiSummary && (
                <div className="bg-amber-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-700 leading-relaxed">{aiSummary}</p>
                </div>
              )}

              {/* 核心要点 */}
              {aiKeyPoints && aiKeyPoints.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">核心要点</h4>
                  <ul className="space-y-1.5">
                    {aiKeyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs flex items-center justify-center font-medium mt-0.5">
                          {index + 1}
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 生成时间 */}
              {aiProcessedAt && (
                <p className="text-xs text-gray-400 mt-4">
                  生成于 {new Date(aiProcessedAt).toLocaleString("zh-CN")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
