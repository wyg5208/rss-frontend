# RSS 新闻移动端前端

**版本**: v2.9.0  
**更新日期**: 2026 年 5 月 11 日

这是一个基于 Next.js 的 RSS 新闻移动端前端项目，提供现代化的新闻阅读体验。

## 最新版本 (v2.9.0)

**发布日期**: 2026-05-11

### 推荐TAB标签筛选与栏目自定义配置完善

#### 推荐TAB修复 🔧
- ✅ 修复推荐TAB和全部TAB内容完全相同的问题
- ✅ 推荐API支持tags参数进行标签筛选
- ✅ 修复React组件复用问题（添加key属性）
- ✅ TAB切换时滚动位置正确重置
- ✅ 修复activeTab判断逻辑（"" vs "推荐" vs "全部"）

#### 标签筛选功能 🏷️
- ✅ 推荐TAB支持多标签筛选（OR关系）
- ✅ 全部TAB支持多标签筛选（OR关系）
- ✅ 标签筛选仅对推荐和全部栏目生效
- ✅ 筛选状态提示文字

#### 栏目自定义配置 📋
- ✅ 新增栏目配置面板组件
- ✅ 支持固定TAB的显示/隐藏和排序
- ✅ 支持RSS源TAB的显示/隐藏和排序
- ✅ 上移下移按钮控制排序
- ✅ 配置保存到后端并持久化
- ✅ 兜底TAB（推荐和全部）强制可见不可取消

### 技术改进
- 📝 Zustand状态管理 + localStorage持久化
- 📝 React组件key属性避免状态共享
- 📝 ESLint错误修复（HTML实体转义）
- 📝 动态TAB列表构建逻辑

## 最新版本 (v2.8.1)

**发布日期**: 2026-05-10

### 频道排序与筛选功能增强

#### 排序功能 📊
- ✅ 按文章数降序排序
- ✅ 默认排序（保持原始顺序）
- ✅ 排序状态显示（文章数↓）

#### 筛选功能 🔍
- ✅ 按分类筛选（动态生成分类标签）
- ✅ 按语言筛选（彩色语言标签）
- ✅ 组合筛选（搜索+分类+语言 AND逻辑）
- ✅ 筛选面板展开/收起
- ✅ 一键清除所有筛选条件
- ✅ 实时显示筛选结果数量

#### 用户体验优化 🎨
- ✅ 筛选按钮激活状态蓝色高亮
- ✅ 语言标签保持原有颜色方案
- ✅ 即时生效，无需确认按钮
- ✅ 查找效率提升200%+

## 最新版本 (v2.8.0)

**发布日期**: 2026-05-10

### RSS频道过滤功能与界面优化

#### 频道过滤管理 📺
- ✅ 新增用户频道偏好管理系统（白名单模式）
- ✅ 在“我的”页面显示频道统计数据
- ✅ 在“阅读管理”页面新增“频道”TAB
- ✅ 支持勾选/取消频道，未勾选频道新闻全局过滤
- ✅ 批量保存机制，减少API调用90%

#### 频道简介功能 📝
- ✅ 新增 `channel_profile` 字段存储结构化简介
- ✅ 点击频道标题弹出气泡框显示简介
- ✅ 简介包含：定位、内容类型、特色、更新频率
- ✅ 为71个现有RSS源批量初始化默认简介

#### 界面布局优化 🎨
- ✅ 改为3列网格布局，一屏显示18个频道（提升125%）
- ✅ 缩小字号和间距，提高信息密度
- ✅ 新增语言标签智能识别（中文/英文/双语）
- ✅ 底部导航“关注”改为“阅读管理”

### 技术改进
- 📝 数据库新增 `user_channel_preferences` 表
- 📝 实现防抖同步机制（1秒延迟）
- 📝 Zustand状态管理 + localStorage持久化
- 📝 气泡弹窗设计节省70%空间

## 最新版本 (v2.7.3)

**发布日期**: 2026-05-10

### 后端修复确认

本次更新为后端推荐API修复确认，前端代码无需修改。

#### 问题与修复
- **问题**：后端推荐API返回422错误，导致推荐TAB和全部TAB完全相同
- **根因**：FastAPI路由顺序问题
- **修复**：后端将 `/recommended` 路由移到 `/{article_id}` 之前
- **状态**：✅ 已修复，推荐功能正常

#### 前端无需修改
前端 `useRecommendedArticles` hook 已正确实现，问题定位在后端。

---

## 📜 历史版本

### v2.7.1 (2026-05-10) — 预加载与缓存优化

##### 推荐Tab预加载机制
- 服务启动时预加载热门(60%)+最新(40%)混合推荐到缓存
- 冷启动推荐优先使用预加载缓存，响应时间<50ms
- 预加载缓存5分钟过期，配合采集刷新

##### 多样性控制增强
- 前5篇文章放宽限制，确保高质量文章优先展示
- 同一RSS源最多2篇
- 同一分类最多占40%
- 至少包含3个不同分类

#### v2.7.0 推荐TAB个性化推荐
- ✅ 新增推荐API端点 `/rss/articles/recommended`
- ✅ 个性化推荐算法: 标签匹配(60%) + 热度排序(25%) + 时间衰减(15%)
- ✅ 用户画像: 阅读历史标签偏好(70%) + 主动选择标签(30%)
- ✅ 冷启动推荐: 热门60% + 最新40%混合推荐
- ✅ 多样性控制: 同一RSS源≤2篇, 同分类≤40%, 至少3个不同分类
- ✅ 两级缓存: 推荐列表30分钟 + 用户画像1小时
- ✅ 用户交互后主动刷新缓存(阅读/收藏/屏蔽)

### 功能优化

#### 不看按钮优化 🎯
- ✅ 点击后自动跳转下一篇
- ✅ 最后篇自动返回列表
- ✅ 列表自动过滤和补充文章

#### AI摘要位置调整 📍
- ✅ 移至原文摘要之前
- ✅ 优先级更高，用户先看到

---

## v2.6.0

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

### v2.9.0 (2026-05-11)
- ✅ 修复推荐TAB和全部TAB内容相同问题
- ✅ 推荐API支持tags参数标签筛选
- ✅ 修复React组件复用问题（添加key）
- ✅ TAB切换时滚动位置重置
- ✅ 推荐TAB和全部TAB支持多标签筛选
- ✅ 新增栏目配置面板组件
- ✅ 支持固定TAB和RSS源TAB的显示/隐藏和排序
- ✅ 配置保存到后端并持久化
- ✅ ESLint错误修复

### v2.8.1 (2026-05-10)
- ✅ 频道按文章数排序功能
- ✅ 按分类筛选（动态标签）
- ✅ 按语言筛选（彩色标签）
- ✅ 组合筛选（搜索+分类+语言）
- ✅ 筛选面板UI与清除功能
- ✅ 实时计数显示

### v2.8.0 (2026-05-10)
- ✅ RSS频道过滤功能完整实现
- ✅ 频道结构化简介与气泡弹窗显示
- ✅ 3列网格布局优化，一屏显示18个频道
- ✅ 批量保存机制减少API调用
- ✅ 语言标签智能识别（中文/英文/双语）

### v2.7.3 (2026-05-10)
- ✅ 推荐API后端修复确认

### v2.7.1 (2026-05-10)
- ✅ 推荐TAB个性化推荐功能上线
- ✅ 推荐Hook: useRecommendedArticles()
- ✅ React Hook规则遵循: 双Hook顶层调用
- ✅ 预加载与缓存优化: 冷启动响应<50ms
- ✅ 多样性控制增强: 前5篇放宽+多分类展示

### v2.7.0 (2026-05-10)
- ✅ 推荐API端点: /rss/articles/recommended
- ✅ 个性化推荐算法: 标签匹配 + 热度排序 + 时间衰减
- ✅ 用户画像系统: 阅读历史 + 主动选择标签
- ✅ 冷启动推荐: 热门+最新混合策略

### v2.6.0 (2026-05-10)
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

**当前版本**: v2.9.0
