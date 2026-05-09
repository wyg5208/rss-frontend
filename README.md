# RSS 新闻移动端前端

**版本**: v2.2.0  
**更新日期**: 2026 年 5 月 10 日

这是一个基于 Next.js 的 RSS 新闻移动端前端项目，提供现代化的新闻阅读体验。

## 最新版本 (v2.2.0)

**发布日期**: 2026-05-10

### Bug修复

#### 429请求风暴修复 🔧
- ✅ 移除useArticles自动预取useEffect，防止级联请求
- ✅ IntersectionObserver添加fetchingRef防重复触发守卫
- ✅ 添加MAX_PAGES=10安全限制（最多200条文章）
- ✅ retry限制为1次，避免429雪崩式重试

#### AI摘要显示修复 🤖
- ✅ 修复首次生成后无法显示的问题（process接口不返回内容）
- ✅ AI摘要从弹窗改为内联显示（新增AISummaryCard组件）
- ✅ 已有摘要时切换显示/隐藏，不再重复生成

### 功能增强

#### 悬浮工具栏优化 🛠️
- ✅ 背景完全透明（bg-transparent），移除毛玻璃效果
- ✅ 新增垂直拖拽功能，支持上下移动位置
- ✅ 垂直位置localStorage持久化

#### 其他优化
- ✅ 黑名单操作后智能跳转（下一篇/返回上一页）
- ✅ 双语翻译标签区分"译名"和"译文"
- ✅ TranslatedText组件新增type属性

---

## v2.1.0

**发布日期**: 2026-05-10

### 功能增强

#### 移动端悬浮工具栏 🛠️
- ✅ 7个功能图标纵向排列（AI摘要、双语、原文、上篇、下篇、收藏、不看）
- ✅ 支持左右边缘拖拽切换位置
- ✅ 图标状态颜色反馈
- ✅ 黑名单功能（不看文章自动过滤）

#### 底部导航优化 📱
- ✅ 新增首页按钮（快速返回首页）
- ✅ 返回按钮改为返回上一页
- ✅ 分享按钮保持不变

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

### v2.2.0 (2026-05-10)
- ✅ 修复429请求风暴（双重防护：安全限制+防级联触发）
- ✅ AI摘要改为内联显示（新增AISummaryCard组件）
- ✅ 修复AI摘要首次生成后无法显示
- ✅ 悬浮工具栏完全透明+垂直拖拽
- ✅ 黑名单智能跳转优化
- ✅ 双语翻译标签区分"译名"和"译文"

### v2.1.0 (2026-05-10)
- ✅ 7个功能图标悬浮工具栏
- ✅ 左右拖拽切换位置
- ✅ 底部导航优化（首页+返回）

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

**当前版本**: v2.2.0
