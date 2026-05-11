"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Languages, ExternalLink, ChevronUp, ChevronDown, Heart, EyeOff, Move, ArrowUpToLine } from "lucide-react";

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
  aiVisible?: boolean; // AI摘要是否可见
}

/**
 * 浮动工具栏组件
 * 
 * 功能：
 * - 9个图标纵向排列（拖拽、AI摘要、双语、原文、上篇、下篇、收藏、不看、返回顶部）
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
  aiVisible = false,
}: FloatingToolbarProps) {
  const [position, setPosition] = useState<'left' | 'right'>('left');
  const [verticalPosition, setVerticalPosition] = useState(50); // 垂直位置百分比 (0-100)
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);

  // 初始化时从 localStorage 读取位置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('toolbar-position');
      if (saved === 'right' || saved === 'left') {
        setPosition(saved);
      }
      const savedV = localStorage.getItem('toolbar-vertical');
      if (savedV) {
        const v = parseFloat(savedV);
        if (!isNaN(v) && v >= 0 && v <= 100) {
          setVerticalPosition(v);
        }
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
    const endY = e.changedTouches[0].clientY;
    const deltaX = Math.abs(endX - dragStartX.current);
    const deltaY = Math.abs(endY - dragStartY.current);
    
    // 水平拖拽：切换左右位置
    if (deltaX > 50 && deltaX > deltaY) {
      const screenWidth = window.innerWidth;
      const newPos = endX > screenWidth / 2 ? 'right' : 'left';
      setPosition(newPos);
      localStorage.setItem('toolbar-position', newPos);
    }
    // 垂直拖拽：调整上下位置
    else if (deltaY > 50 && deltaY > deltaX) {
      const screenHeight = window.innerHeight;
      const newV = (endY / screenHeight) * 100;
      const clampedV = Math.max(10, Math.min(90, newV)); // 限制在 10%-90% 范围
      setVerticalPosition(clampedV);
      localStorage.setItem('toolbar-vertical', clampedV.toString());
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
    
    // 水平拖拽：切换左右位置
    if (deltaX > 50 && deltaX > deltaY) {
      const screenWidth = window.innerWidth;
      const newPos = e.clientX > screenWidth / 2 ? 'right' : 'left';
      setPosition(newPos);
      localStorage.setItem('toolbar-position', newPos);
    }
    // 垂直拖拽：调整上下位置
    else if (deltaY > 50 && deltaY > deltaX) {
      const screenHeight = window.innerHeight;
      const newV = (e.clientY / screenHeight) * 100;
      const clampedV = Math.max(10, Math.min(90, newV)); // 限制在 10%-90% 范围
      setVerticalPosition(clampedV);
      localStorage.setItem('toolbar-vertical', clampedV.toString());
    }
    
    setIsDragging(false);
  };

  const hasAIContent = !!aiSummary;

  // 回到顶部功能
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const positionClass = position === 'left' 
    ? 'left-0 rounded-r-xl' 
    : 'right-0 rounded-l-xl';

  // 计算垂直位置样式
  const verticalStyle = {
    top: `${verticalPosition}%`,
    transform: 'translateY(-50%)',
  };

  return (
    <>
      {/* 浮动工具栏 */}
      <div
        style={verticalStyle}
        className={`fixed z-30 flex flex-col gap-1 p-1.5 
          bg-transparent border border-white/5 shadow-none
          transition-all duration-300 ${positionClass}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* 0. 拖拽指示器 - 提示用户可以拖拽 */}
        <div
          className="w-9 h-9 flex items-center justify-center rounded-lg 
            cursor-move opacity-60 hover:opacity-100 transition-opacity"
          title="拖拽此工具栏调整位置"
        >
          <Move className="w-4 h-4 text-gray-500" />
        </div>

        {/* 1. AI摘要 - 点击触发生成或切换显示 */}
        <button
          onClick={() => {
            // 无论是否有内容，都触发onAIGenerate（内部会判断是生成还是切换显示）
            onAIGenerate();
          }}
          disabled={aiLoading}
          className="w-9 h-9 flex items-center justify-center rounded-lg 
            hover:bg-white/80 active:bg-white transition-colors
            disabled:opacity-50"
          title={
            aiLoading ? "正在生成..." :
            !hasAIContent ? "生成AI摘要" :
            aiVisible ? "隐藏AI摘要" : "显示AI摘要"
          }
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

        {/* 8. 返回顶部 */}
        <button
          onClick={scrollToTop}
          className="w-9 h-9 flex items-center justify-center rounded-lg 
            hover:bg-white/80 active:bg-white transition-colors"
          title="返回顶部"
        >
          <ArrowUpToLine className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </>
  );
}
