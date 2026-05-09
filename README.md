# RSS 新闻移动端前端

**版本**: v1.1.0  
**更新日期**: 2026 年 5 月 10 日

这是一个基于 Next.js 的 RSS 新闻移动端前端项目，提供现代化的新闻阅读体验。

## 最新版本 (v1.1.0)

**发布日期**: 2026-05-10

### 功能增强

#### 双语翻译功能优化 🌐
- ✅ 超长摘要优雅截断（≤3000 字符，句子边界截断）
- ✅ 翻译结果纯文本输出（自动清理 HTML 标签）
- ✅ API 超时控制机制（翻译请求 60 秒超时）
- ✅ 容错处理优化（部分翻译成功也显示）
- ✅ 错误提示优化（区分超时和其他错误）
- ✅ 状态管理改进（避免重复翻译）

### 技术改进
- 📝 提示词强化（明确要求纯文本、无 HTML）
- 📝 max_tokens 提升到 10000（确保翻译完整性）
- 🎨 JSON 解析增强（支持多种格式）
- 🔧 AbortController 超时控制实现
- 🛡️ 防御性编程实践（双重保障机制）

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
