import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

const isDev = process.env.NODE_ENV === "development";

const nextConfig = withSerwist({
  // 仅在开发环境使用rewrites代理API（生产环境由Nginx或客户端直连）
  ...(isDev
    ? {
        async rewrites() {
          return [
            {
              source: "/api/v1/:path*",
              destination: "http://localhost:8001/api/v1/:path*",
            },
          ];
        },
      }
    : {}),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
});

export default nextConfig;
