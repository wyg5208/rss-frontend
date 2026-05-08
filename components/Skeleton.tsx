"use client";

interface SkeletonProps {
  className?: string;
}

export function ArticleSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`p-4 animate-pulse ${className}`}>
      <div className="flex gap-3">
        <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
          <div className="flex gap-2 pt-1">
            <div className="h-5 bg-gray-100 rounded-full w-12" />
            <div className="h-5 bg-gray-100 rounded-full w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArticleListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-gray-50">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="p-4 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="flex gap-3 text-gray-400 text-sm">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-48 bg-gray-200 rounded-lg" />
      <div className="space-y-2 pt-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

export function TagSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-2.5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="px-3 py-1.5 rounded-full bg-gray-200 animate-pulse"
            style={{ width: 60 + Math.random() * 40 }}
          />
        ))}
      </div>
    </div>
  );
}