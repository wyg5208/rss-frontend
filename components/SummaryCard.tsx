"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import type { Article } from "@/types";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

interface Props {
  article: Article;
  onNavigate?: (articleId: number) => void;
}

export default function SummaryCard({ article, onNavigate }: Props) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const timeAgo = article.published_at ? dayjs(article.published_at).fromNow() : "";

  // 使用AI摘要字段
  const aiSummary = (article as unknown as Record<string, unknown>).ai_summary as string | undefined || article.summary;

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(article.id);
      router.push("/article/" + article.id);
    } else {
      router.push("/article/" + article.id);
    }
  };

  // 点击摘要区域切换展开/收起
  const handleSummaryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (aiSummary && aiSummary.length > 100) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleOriginalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push("/article/" + article.id);
  };

  return (
    <article
      className="bg-[#fffdf7] border-b border-[#e8e0d0] px-4 py-4 active:bg-[#f5f1e8] cursor-pointer transition-colors"
      onClick={handleClick}
    >
      {/* AI摘要区域 - 固定3行或展开 */}
      {aiSummary ? (
        <div
          className={`text-sm text-[#6b5d4f] leading-relaxed mb-3 cursor-pointer ${
            isExpanded ? "" : "line-clamp-3"
          }`}
          onClick={handleSummaryClick}
        >
          {aiSummary}
        </div>
      ) : (
        <div className="text-sm text-[#8b7355] mb-3 italic">暂无AI摘要</div>
      )}

      {/* 底部信息 */}
      <div className="flex items-center justify-between gap-2 text-xs text-[#8b7355]">
        {/* 左侧：来源、时间、阅读次数、类型、语言 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#6b5d4f]">{article.source}</span>
          <span>·</span>
          {timeAgo && <span>{timeAgo}</span>}
          {article.view_count > 0 && (
            <>
              <span>·</span>
              <span>{article.view_count}阅读</span>
            </>
          )}
          {article.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="ml-1 text-[11px] px-1.5 py-0.5 bg-[#f0e6d2] text-[#8b6914] rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 右侧：原文标签 */}
        <button
          onClick={handleOriginalClick}
          className="text-xs px-2 py-0.5 bg-[#c45a3c] text-white rounded-sm hover:bg-[#a84832] transition-colors whitespace-nowrap"
        >
          原文
        </button>
      </div>
    </article>
  );
}
