"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { useTags } from "@/hooks/useTags";
import { useTagFilterStore } from "@/store/useTagFilterStore";
import clsx from "clsx";

export default function TagsPage() {
  const router = useRouter();
  const { data: tags } = useTags(100);
  const { selectedTags, toggleTag, clearAllTags } = useTagFilterStore();

  const handleViewResults = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen pb-14">
      <header className="sticky top-0 z-30 bg-white safe-top border-b border-gray-100">
        <div className="h-[52px] flex items-center px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold ml-3">我的标签</h1>
          {selectedTags.length > 0 && (
            <button
              onClick={clearAllTags}
              className="ml-auto text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              清除全部
            </button>
          )}
        </div>
      </header>

      <div className="flex-1">
        {/* 选中标签预览区 */}
        {selectedTags.length > 0 && (
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-blue-600 font-medium">
                已选择 {selectedTags.length} 个标签
              </span>
              <button
                onClick={handleViewResults}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
              >
                查看文章
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedTags.map((name) => (
                <span
                  key={name}
                  className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 标签列表 */}
        <div className="p-4">
          <div className="flex flex-wrap gap-2.5">
            {tags?.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.name)}
                  style={{
                    backgroundColor: (tag.color || "#3b82f6") + (isSelected ? "30" : "15"),
                    color: tag.color || "#3b82f6",
                    borderColor: (tag.color || "#3b82f6") + (isSelected ? "60" : "30"),
                  }}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-all",
                    isSelected && "ring-2 ring-offset-1"
                  )}
                >
                  {tag.name}
                  <span className="ml-1 text-xs opacity-70">{tag.article_count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
