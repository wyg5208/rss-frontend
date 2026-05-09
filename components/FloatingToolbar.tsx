"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Languages, ExternalLink, ChevronUp, ChevronDown, Heart, EyeOff, X } from "lucide-react";

interface FloatingToolbarProps {
  articleId: number;
  articleUrl: string;
  aiSummary?: string;
  aiKeyPoints?: string[];
  aiProcessedAt?: string;
  bilingualOn: boolean;
  isFavorite: boolean;
  isBlocked: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  onAIGenerate: () => void;
  onBilingualToggle: (enabled: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  onFavoriteToggle: () => void;
  onBlockToggle: () => void;
  aiLoading?: boolean;
}

/**
 * 浮动工具栏组件
 * 
 * 功能：
 * - 7个图标纵向排列（AI摘要、双语、原文、上篇、下篇、收藏、不看）
 * - 默认固定在左侧边缘垂直居中
 * - 支持拖拽到右侧边缘（记录到 localStorage）
 * - 半透明背景，hover/active 效果
 * - 每个图标点击触发对应功能
 */
export default function FloatingToolbar({
  articleId,
  articleUrl,
  aiSummary,
  aiKeyPoints,
  aiProcessedAt,
  bilingualOn,
  isFavorite,
  isBlocked,
  hasPrev,
  hasNext,
  onAIGenerate,
  onBilingualToggle,
  onPrev,
  onNext,
  onFavoriteToggle,
  onBlockToggle,
  aiLoading = false,
}: FloatingToolbarProps) {
  const [position, setPosition] = useState<'left' | 'right'>('left');
  const [isDragging, setIsDragging] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);

  // 初始化时从 localStorage 读取位置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('toolbar-position');
      if (saved === 'right' || saved === 'left') {
        setPosition(saved);
      }
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const endX = e.changedTouches[0].clientX;
    const deltaX = Math.abs(endX - dragStartX.current);
    const deltaY = Math.abs(e.changedTouches[0].clientY - dragStartY.current);
    
    // 只有水平移动超过 50px 且大于垂直移动时才触发拖拽
    if (deltaX > 50 && deltaX > deltaY) {
      const screenWidth = window.innerWidth;
      const newPos = endX > screenWidth / 2 ? 'right' : 'left';
      setPosition(newPos);
      localStorage.setItem('toolbar-position', newPos);
    }
    
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    setIsDragging(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = Math.abs(e.clientX - dragStartX.current);
    const deltaY = Math.abs(e.clientY - dragStartY.current);
    
    if (deltaX > 50 && deltaX > deltaY) {
      const screenWidth = window.innerWidth;
      const newPos = e.clientX > screenWidth / 2 ? 'right' : 'left';
      setPosition(newPos);
      localStorage.setItem('toolbar-position', newPos);
    }
    
    setIsDragging(false);
  };

  const hasAIContent = !!aiSummary;

  const positionClass = position === 'left' 
    ? 'left-0 rounded-r-xl' 
    : 'right-0 rounded-l-xl';

  return (
    <>
      {/* 浮动工具栏 */}
      <div
        className={`fixed top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1 p-1.5 
          bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg
          transition-all duration-300 ${positionClass}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* 1. AI摘要 */}
        <button
          onClick={() => {
            if (hasAIContent) {
              setAiModalOpen(true);
            } else {
              onAIGenerate();
            }
          }}
          disabled={aiLoading}
          className="w-9 h-9 flex items-center justify-center rounded-lg 
            hover:bg-white/80 active:bg-white transition-colors
            disabled:opacity-50"
          title={hasAIContent ? "查看AI摘要" : "生成AI摘要"}
        >
          {aiLoading ? (
            <span className="animate-spin text-amber-500 text-sm">⏳</span>
          ) : (
            <Sparkles className={`w-4 h-4 ${hasAIContent ? 'text-amber-500' : 'text-gray-400'}`} />
          )}
        </button>

        {/* 2. 双语 */}
        <button
          onClick={() => onBilingualToggle(!bilingualOn)}
          className="w-9 h-9 flex items-center justify-center rounded-lg 
            hover:bg-white/80 active:bg-white transition-colors"
          title={bilingualOn ? "关闭双语" : "开启双语"}
        >
          <Languages className={`w-4 h-4 ${bilingualOn ? 'text-blue-500' : 'text-gray-400'}`} />
        </button>

        {/* 3. 原文 */}
        <a
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 flex items-center justify-center rounded-lg 
            hover:bg-white/80 active:bg-white transition-colors"
          title="查看原文"
        >
          <ExternalLink className="w-4 h-4 text-blue-500" />
        </a>

        {/* 4. 上篇 */}
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className={`w-9 h-9 flex items-center justify-center rounded-lg 
            transition-colors
            ${hasPrev ? 'hover:bg-white/80 active:bg-white text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          title="上一篇文章"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        {/* 5. 下篇 */}
        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`w-9 h-9 flex items-center justify-center rounded-lg 
            transition-colors
            ${hasNext ? 'hover:bg-white/80 active:bg-white text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
          title="下一篇文章"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* 6. 收藏 */}
        <button
          onClick={onFavoriteToggle}
          className="w-9 h-9 flex items-center justify-center rounded-lg 
            hover:bg-white/80 active:bg-white transition-colors"
          title={isFavorite ? "取消收藏" : "收藏"}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
        </button>

        {/* 7. 不看 */}
        <button
          onClick={onBlockToggle}
          className="w-9 h-9 flex items-center justify-center rounded-lg 
            hover:bg-white/80 active:bg-white transition-colors"
          title={isBlocked ? "取消不看" : "不看此文章"}
        >
          <EyeOff className={`w-4 h-4 ${isBlocked ? 'text-gray-700' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* AI摘要弹窗 */}
      {aiModalOpen && hasAIContent && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => setAiModalOpen(false)}
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
                onClick={() => setAiModalOpen(false)}
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
