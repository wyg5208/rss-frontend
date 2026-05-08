"use client";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const online = useNetworkStatus();
  if (online) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200 px-4 py-1.5 flex items-center justify-center gap-2">
      <WifiOff className="w-3.5 h-3.5 text-yellow-600" />
      <span className="text-xs text-yellow-700">当前处于离线状态</span>
    </div>
  );
}
