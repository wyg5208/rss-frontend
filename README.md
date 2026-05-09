# RSS 新闻移动端前端

**版本**: v2.1.0  
**更新日期**: 2026 年 5 月 10 日

这是一个基于 Next.js 的 RSS 新闻移动端前端项目，提供现代化的新闻阅读体验。

## 最新版本 (v2.1.0)

**发布日期**: 2026-05-10

### 功能增强

#### 移动端悬浮工具栏 🛠️
- ✅ 7个功能图标纵向排列（AI摘要、双语、原文、上篇、下篇、收藏、不看）
- ✅ 支持左右边缘拖拽切换位置
- ✅ 半透明背景设计（85%透明度）
- ✅ 图标状态颜色反馈
- ✅ 黑名单功能（不看文章自动过滤）

#### 底部导航优化 📱
- ✅ 新增首页按钮（快速返回首页）
- ✅ 返回按钮改为返回上一页
- ✅ 分享按钮保持不变

### 技术改进
- 🎨 FloatingToolbar 组件全新实现
- 💾 localStorage 位置持久化
- 🔄 拖拽手势优化（50px 阈值）
- 🎯 图标语义化设计
- 📦 组件化架构优化

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 版本历史

### v1.1.0 (2026-05-10)
- ✅ 超长摘要优雅截断（≤3000 字符）
- ✅ 翻译结果纯文本输出（HTML 标签清理）
- ✅ API 超时控制机制（30s/60s）
- ✅ 容错处理优化（部分成功处理）
- ✅ 错误提示优化（超时区分）
- ✅ 状态管理改进（避免重复翻译）
- ✅ 提示词强化（纯文本要求）
- ✅ max_tokens 提升到 10000
- ✅ JSON 解析增强（多格式支持）

## 当前版本

**当前版本**: v1.1.0
