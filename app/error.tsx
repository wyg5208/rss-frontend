"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <p className="text-red-500 mb-4">页面加载出错</p>
      <p className="text-sm text-gray-500 mb-4">{error.message}</p>
      <button onClick={reset} className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm">重试</button>
    </div>
  );
}
