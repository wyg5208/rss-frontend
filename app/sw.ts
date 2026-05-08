import { Serwist, NetworkOnly } from "serwist";
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope & typeof globalThis;

// 激活时清理所有旧缓存
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          console.log(`[SW] 清理旧缓存: ${cacheName}`);
          return caches.delete(cacheName);
        })
      )
    )
  );
  // 立即接管所有页面
  (self as unknown as { clients: { claim: () => Promise<void> } }).clients.claim();
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
