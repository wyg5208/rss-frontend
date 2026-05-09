import { Serwist, NetworkOnly } from "serwist";
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope & typeof globalThis;

// 激活时清理旧版本缓存，保留当前版本 precache
// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => {
            // 只清理旧版本的 precache 和运行时缓存
            return (
              cacheName.includes("serwist-precache-v1") ||
              cacheName.includes("serwist-runtime")
            );
          })
          .map((cacheName) => {
            console.log(`[SW] 清理旧缓存: ${cacheName}`);
            return caches.delete(cacheName);
          })
      )
    )
  );
  // 立即接管所有页面
  (self as unknown as { clients: { claim: () => Promise<void> } }).clients.claim();
  console.log('[SW] Service Worker v2.2 已激活 - 修复页面导航问题');
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: defaultCache,
});

// API 请求直接走网络，不做缓存（避免 Service Worker 干扰跨域 API 请求导致 CORS 失败）
serwist.registerCapture(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkOnly(),
);

serwist.addEventListeners();
