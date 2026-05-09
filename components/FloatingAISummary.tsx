"use client";
import { useState, useEffect, useRef } from "react";
import { Sparkles, X, RefreshCw } from "lucide-react";

interface Props {
  articleId: number;
  aiSummary?: string;
  aiKeyPoints?: string[];
  aiProcessedAt?: string;
  onGenerate: () => void;
  isLoading?: boolean;
  hasContent: boolean;
  autoOpen?: boolean; // 生成完成后自动打开
}

/**
 * AI摘要悬浮按钮组件
 * 
 * 固定在屏幕左侧边缘垂直居中位置。
 * - 无摘要时：点击触发生成
 * - 有摘要时：点击弹出遮罩层显示摘要内容
 */
export default function FloatingAISummary({
  articleId,
  aiSummary,
  aiKeyPoints,
  aiProcessedAt,
  onGenerate,
  isLoading = false,
  hasContent,
  autoOpen = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [internalAutoOpen, setInternalAutoOpen] = useState(false);
  const prevHasContentRef = useRef(false);

  // 当autoOpen变为true且有内容时，自动打开弹窗
  useEffect(() => {
    // 如果内容从无变有（生成完成），且autoOpen为true，自动打开
    if (autoOpen && hasContent && !prevHasContentRef.current) {
      setIsOpen(true);
      setInternalAutoOpen(false); // 重置
    }
    prevHasContentRef.current = hasContent;
  }, [autoOpen, hasContent]);

  // 点击触发生成或打开弹窗
  const handleClick = () => {
    if (isLoading) return;
    if (hasContent) {
      // 有内容时直接打开查看，不触发生成
      setIsOpen(true);
    } else {
      // 无内容时才触发生成
      setShowError(false);
      setErrorMsg("");
      onGenerate();
    }
  };

  // 重新生成按钮
  const handleRegenerate = () => {
    if (isLoading) return;
    setIsOpen(false);
    setShowError(false);
    setErrorMsg("");
    onGenerate();
  };

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={handleClick}
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
        ) : hasContent ? (
          <Sparkles className="w-4 h-4 text-amber-500" />
        ) : (
          <Sparkles className="w-4 h-4 text-amber-400" />
        )}
      </button>

      {/* 错误提示toast */}
      {showError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-500 text-white text-sm rounded-full shadow-lg">
          {errorMsg}
        </div>
      )}

      {/* 摘要弹窗遮罩 */}
      {isOpen && hasContent && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col shadow-xl"
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
            <div className="overflow-y-auto p-4 flex-1">
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


            {/* 底部操作按钮 */}
            <div className="px-4 py-3 border-t border-gray-100 space-y-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                关闭
              </button>
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="w-full py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>重新生成</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
