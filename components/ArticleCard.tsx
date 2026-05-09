"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import type { Article } from "@/types";
import ImageWithFallback from "./ImageWithFallback";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

interface Props { 
  article: Article; 
  onBeforeNavigate?: (articleId: number) => void; 
}

export default function ArticleCard({ article, onBeforeNavigate }: Props) {
  const router = useRouter();
  const timeAgo = article.published_at ? dayjs(article.published_at).fromNow() : "";
  const source = article.source || "未知来源";
  const hasImage = !!article.image_url;

  const handleClick = (e: React.MouseEvent) => {
    if (onBeforeNavigate) {
      e.preventDefault();
      onBeforeNavigate(article.id);
      router.push("/article/" + article.id);
    }
  };

  const content = (
    <>
      {hasImage ? (
        <article className="flex gap-3 px-4 py-3 bg-white active:bg-gray-50 border-b border-gray-50">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 mb-2">
              {article.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="text-gray-500">{source}</span>
              <span>·</span>
              {timeAgo && <span>{timeAgo}</span>}
              {article.view_count > 0 && <><span>·</span><span>{article.view_count}阅读</span></>}
            </div>
          </div>
          <div className="flex-shrink-0 w-[110px] h-[74px]">
            <ImageWithFallback src={article.image_url} alt={article.title} className="rounded-md object-cover w-full h-full" />
          </div>
        </article>
      ) : (
        <article className="px-4 py-3 bg-white active:bg-gray-50 border-b border-gray-50">
          <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 mb-1.5">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-[13px] text-gray-500 line-clamp-2 mb-1.5 leading-relaxed">{article.summary}</p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="text-gray-500">{source}</span>
            <span>·</span>
            {timeAgo && <span>{timeAgo}</span>}
            {article.view_count > 0 && <><span>·</span><span>{article.view_count}阅读</span></>}
            {article.tags?.slice(0, 1).map((tag) => (
              <span key={tag} className="ml-1 text-[11px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded-sm">{tag}</span>
            ))}
          </div>
        </article>
      )}
    </>
  );

  // 有导航回调时使用 div + onClick，否则使用 Link
  if (onBeforeNavigate) {
    return (
      <div onClick={handleClick} className="block cursor-pointer">
        {content}
      </div>
    );
  }

  return (
    <Link href={"/article/" + article.id} className="block">
      {content}
    </Link>
  );
}