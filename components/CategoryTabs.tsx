"use client";

import { useRef, useEffect } from "react";

export interface TabItem {
  label: string;      // 显示文本
  value: string;      // 内部值（传给后端筛选）
  type?: 'fixed' | 'rss';  // TAB类型
}

interface Props {
  tabs: TabItem[];
  active: string;
  onChange: (value: string) => void;
}

export default function CategoryTabs({ tabs, active, onChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const btn = btnRefs.current.get(active);
    if (btn && scrollRef.current) {
      const container = scrollRef.current;
      const scrollLeft = btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [active]);

  return (
    <div className="sticky top-[52px] z-20 bg-[#faf7f0] border-b border-[#e8e0d0]">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide px-2 gap-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            ref={(el) => { if (el) btnRefs.current.set(tab.value, el); }}
            onClick={() => onChange(tab.value)}
            className={[
              "flex-shrink-0 px-1.5 py-1 text-xs font-medium transition-colors relative",
              "min-w-[45px] max-w-[75px]",
              "leading-tight text-center",
              "break-words whitespace-normal",
              "m-0 border-0 outline-none",
              active === tab.value ? "text-red-500" : "text-gray-600"
            ].join(" ")}
          >
            {tab.label}
            {active === tab.value && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-red-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}