export default function Loading() {
  return (
    <div className="p-4 animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="w-[120px] h-[80px] bg-gray-200 rounded-lg flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
