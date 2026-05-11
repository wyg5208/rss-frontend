"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-[#fffdf7] w-[90%] max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="sticky top-0 bg-[#faf7f0] border-b border-[#e8e0d0] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#2c2416]">📖 阅读狂人使用手册</h2>
          <button
            onClick={onClose}
            className="text-2xl text-[#8b7355] hover:text-[#c45a3c] transition-colors"
          >
            ×
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-6 text-[#2c2416]">
          {/* 产品介绍 */}
          <section>
            <h3 className="text-lg font-bold text-[#c45a3c] mb-3">🎯 产品特点</h3>
            <div className="space-y-2 text-sm leading-relaxed">
              <p><strong>阅读狂人</strong>是一款专为深度阅读爱好者打造的智能RSS阅读工具，具有以下核心优势：</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>AI智能摘要</strong> - 自动生成中文摘要，快速了解文章核心内容</li>
                <li><strong>智能阅后即焚</strong> - 阅读过的文章自动隐藏，保持列表清爽</li>
                <li><strong>多源聚合</strong> - 聚合全球优质RSS源，一站式获取资讯</li>
                <li><strong>个性化定制</strong> - 自定义栏目、标签筛选、语言过滤</li>
                <li><strong>跨设备同步</strong> - 登录账号后配置自动同步</li>
                <li><strong>离线友好</strong> - 智能缓存，网络不佳也能流畅阅读</li>
              </ul>
            </div>
          </section>

          {/* 核心功能 */}
          <section>
            <h3 className="text-lg font-bold text-[#c45a3c] mb-3">🚀 核心功能</h3>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold text-[#3d3225]">1. 摘要栏目（默认首页）</h4>
                <p className="text-[#6b5d4f] ml-4">• 显示所有有AI中文摘要的文章</p>
                <p className="text-[#6b5d4f] ml-4">• 固定3行显示，点击摘要文字可展开/收起</p>
                <p className="text-[#6b5d4f] ml-4">• 点击&quot;原文&quot;按钮跳转详情页，返回后自动隐藏（阅后即焚）</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#3d3225]">2. 栏目TAB切换</h4>
                <p className="text-[#6b5d4f] ml-4">• 顶部TAB栏支持左右滑动切换</p>
                <p className="text-[#6b5d4f] ml-4">• 推荐TAB：个性化推荐文章</p>
                <p className="text-[#6b5d4f] ml-4">• 全部TAB：显示所有文章</p>
                <p className="text-[#6b5d4f] ml-4">• 分类TAB：按科技、经济、教育等分类浏览</p>
                <p className="text-[#6b5d4f] ml-4">• RSS源TAB：查看特定来源的文章</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#3d3225]">3. 智能阅读体验</h4>
                <p className="text-[#6b5d4f] ml-4">• <strong>阅后即焚</strong>：点击原文阅读后，文章自动从列表消失</p>
                <p className="text-[#6b5d4f] ml-4">• <strong>自动补位</strong>：隐藏后下方文章自动上移，无缝衔接</p>
                <p className="text-[#6b5d4f] ml-4">• <strong>位置记忆</strong>：返回列表时保持之前的滚动位置</p>
                <p className="text-[#6b5d4f] ml-4">• <strong>无限滚动</strong>：滚动到底部自动加载更多内容</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#3d3225]">4. 筛选与搜索</h4>
                <p className="text-[#6b5d4f] ml-4">• 搜索栏：关键词搜索标题和摘要</p>
                <p className="text-[#6b5d4f] ml-4">• 语言过滤：中文/英文/其他语言切换</p>
                <p className="text-[#6b5d4f] ml-4">• 标签筛选：点击标签查看相关文章</p>
              </div>
            </div>
          </section>

          {/* 使用技巧 */}
          <section>
            <h3 className="text-lg font-bold text-[#c45a3c] mb-3">💡 使用技巧</h3>
            <div className="space-y-2 text-sm text-[#6b5d4f]">
              <p><strong>快速浏览模式：</strong>在摘要栏目中，只需看AI摘要即可掌握要点，感兴趣再点原文</p>
              <p><strong>高效阅读流：</strong>摘要 → 原文 → 自动消失 → 下一篇文章，形成高效阅读循环</p>
              <p><strong>个性化定制：</strong>在&quot;我的&quot;页面管理账户，在&quot;阅读管理&quot;中配置栏目显示</p>
              <p><strong>标签管理：</strong>为文章添加标签，方便后续按主题筛选</p>
              <p><strong>滑动切换：</strong>在首页左右滑动手指，快速切换不同栏目</p>
            </div>
          </section>

          {/* 栏目配置 */}
          <section>
            <h3 className="text-lg font-bold text-[#c45a3c] mb-3">⚙️ 栏目配置</h3>
            <div className="space-y-2 text-sm text-[#6b5d4f]">
              <p>进入<strong>&quot;阅读管理&quot;</strong>页面，您可以：</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>添加/删除显示的栏目TAB</li>
                <li>调整栏目顺序（拖拽排序）</li>
                <li>配置RSS源订阅</li>
                <li>设置默认显示的栏目</li>
              </ul>
              <p className="mt-2 text-[#8b7355] italic">提示：登录账号后，配置会自动同步到所有设备</p>
            </div>
          </section>

          {/* 快捷键 */}
          <section>
            <h3 className="text-lg font-bold text-[#c45a3c] mb-3">⌨️ 操作要点</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-[#f5f1e8] p-3 rounded">
                <p className="font-semibold text-[#3d3225]">点击摘要</p>
                <p className="text-[#6b5d4f]">展开/收起全文</p>
              </div>
              <div className="bg-[#f5f1e8] p-3 rounded">
                <p className="font-semibold text-[#3d3225]">点击&quot;原文"</p>
                <p className="text-[#6b5d4f]">跳转详情页</p>
              </div>
              <div className="bg-[#f5f1e8] p-3 rounded">
                <p className="font-semibold text-[#3d3225]">左右滑动</p>
                <p className="text-[#6b5d4f]">切换栏目TAB</p>
              </div>
              <div className="bg-[#f5f1e8] p-3 rounded">
                <p className="font-semibold text-[#3d3225]">滚动到底</p>
                <p className="text-[#6b5d4f]">自动加载更多</p>
              </div>
            </div>
          </section>

          {/* 温馨提示 */}
          <section className="bg-[#f0e6d2] p-4 rounded-lg border border-[#d4c4a8]">
            <h3 className="text-base font-bold text-[#c45a3c] mb-2">💝 温馨提示</h3>
            <ul className="space-y-1 text-sm text-[#6b5d4f]">
              <li>• 建议先浏览AI摘要，再决定是否阅读原文，提高阅读效率</li>
              <li>• 阅后即焚功能让已读文章不干扰后续阅读，保持列表清爽</li>
              <li>• 定期查看&quot;推荐&quot;TAB，发现可能感兴趣的新内容</li>
              <li>• 遇到问题可在&quot;我的&quot;页面反馈，我们会持续优化体验</li>
            </ul>
          </section>
        </div>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-[#faf7f0] border-t border-[#e8e0d0] px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-[#c45a3c] text-white py-3 rounded-lg font-semibold hover:bg-[#a84832] transition-colors"
          >
            开始阅读
          </button>
        </div>
      </div>
    </div>
  );
}
