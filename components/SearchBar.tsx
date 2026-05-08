"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface Props {
  initialValue?: string;
  onSearch?: (keyword: string) => void;
  placeholder?: string;
}

export default function SearchBar({ initialValue = "", onSearch, placeholder = "搜索文章" }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const keyword = value.trim();
      if (!keyword) return;
      if (onSearch) onSearch(keyword);
      else router.push("/search?q=" + encodeURIComponent(keyword));
    },
    [value, onSearch, router]
  );

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-7 py-1.5 bg-gray-100 rounded-full text-sm outline-none focus:bg-gray-50 focus:ring-1 focus:ring-red-200 placeholder:text-gray-400"
      />
      {value && (
        <button type="button" onClick={() => setValue("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      )}
    </form>
  );
}