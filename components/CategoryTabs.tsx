"use client";

import { useRef, useEffect } from "react";

interface Props {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryTabs({ categories, active, onChange }: Props) {
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
    <div className="sticky top-[52px] z-20 bg-white">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide px-3 gap-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            ref={(el) => { if (el) btnRefs.current.set(cat, el); }}
            onClick={() => onChange(cat)}
            className={["flex-shrink-0 px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors relative", active === cat ? "text-red-500" : "text-gray-600"].join(" ")}
          >
            {cat}
            {active === cat && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-red-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}