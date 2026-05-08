import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "RSS新闻聚合",
  description: "RSS智能新闻聚合 - 移动端阅读体验",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "RSS新闻" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-100 text-gray-900 antialiased">
        <Providers>
          <div className="max-w-lg mx-auto min-h-screen bg-white relative">
            {children}
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}