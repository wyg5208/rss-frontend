"use client";

interface BilingualToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  loading?: boolean;
}

/**
 * 双语阅读开关组件
 * 
 * 功能：
 * - Toggle Switch滑动开关
 * - 开启/关闭状态视觉反馈
 * - 加载状态显示
 */
export default function BilingualToggle({ enabled, onChange, loading = false }: BilingualToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      disabled={loading}
      className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-500' : 'bg-gray-300'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={enabled ? "关闭双语" : "开启双语"}
      aria-label="双语阅读开关"
    >
      <span className="sr-only">双语阅读</span>
      
      {/* 滑块 */}
      <span
        className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      
      {/* 加载指示器 */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </span>
      )}
    </button>
  );
}
