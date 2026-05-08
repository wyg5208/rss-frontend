import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M8.464 15.536a5 5 0 010-7.072m7.072 0a5 5 0 010 7.072M12 8v4l2 2" />
        </svg>
      </div>
      <h2 className="text-lg font-medium text-gray-800 mb-2">当前无网络连接</h2>
      <p className="text-sm text-gray-500 mb-6">请检查网络后重试</p>
      <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm">
        重新加载
      </Link>
    </div>
  );
}
