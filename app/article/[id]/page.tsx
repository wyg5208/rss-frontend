"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Heart, Share2, ChevronLeft, ChevronRight, Home } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { useArticleDetail } from "@/hooks/useArticleDetail";
import { useArticleStore } from "@/store/useArticleStore";
import { useArticleNavStore } from "@/store/useArticleNavStore";
import SafeHTML from "@/components/SafeHTML";
import ImageWithFallback from "@/components/ImageWithFallback";
import ErrorBoundary from "@/components/ErrorBoundary";
import FloatingToolbar from "@/components/FloatingToolbar";
import BilingualToggle from "@/components/BilingualToggle";
import TranslatedText from "@/components/TranslatedText";
import AISummaryCard from "@/components/AISummaryCard";
import { api } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";

dayjs.locale("zh-cn");

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: article, isLoading, error } = useArticleDetail(id);
  const { toggleFavorite, isFavorite, addToHistory } = useArticleStore();
  const { getPrevId, getNextId, hasPrev, hasNext } = useArticleNavStore();
  const [aiData, setAiData] = useState<{ ai_summary?: string; ai_key_points?: string[]; ai_processed_at?: string }>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiVisible, setAiVisible] = useState(false); // 控制AI摘要显示/隐藏
  const [bilingualOn, setBilingualOn] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState<{
    translated_title?: string;
    translated_summary?: string;
  } | null>(null);
  const [showToast, setShowToast] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  const loadAIData = useCallback(async () => {
    if (!article?.id) return;
    try {
      const res = await api.get<{ success: boolean; data: Record<string, unknown> }>(`/ai/article/${article.id}`);
      if (res.success && res.data) {
        const aiSummary = res.data.ai_summary as string | undefined;
        setAiData({
          ai_summary: aiSummary,
          ai_key_points: res.data.ai_key_points as string[] | undefined,
          ai_processed_at: res.data.ai_processed_at as string | undefined
        });
        // 如果后端已有AI摘要，自动显示
        if (aiSummary) {
          setAiVisible(true);
        }
      }
    } catch {
      // AI数据加载失败不影响主功能
    }
  }, [article?.id]);

  useEffect(() => {
    if (article) {
      addToHistory(article);
      api.post(`/rss/articles/${id}/view`).catch(() => {});
      loadAIData();
    }
  }, [article, id, addToHistory, loadAIData]);

  // 生成 AI 摘要（供悬浮按钮调用）
  const handleGenerateAI = useCallback(async () => {
    if (!article?.id) return;
    
    // 如果已有AI摘要，切换显示/隐藏
    if (aiData.ai_summary) {
      setAiVisible(!aiVisible);
      return;
    }
    
    // 没有摘要，生成新的
    setAiLoading(true);
    try {
      const response = await api.post<{ success: boolean; message: string; data: Record<string, unknown> }>(`/ai/process/${article.id}`);
      if (response.success && response.data) {
        // 直接更新AI数据，无需再次请求
        const apiData = response.data;
        setAiData({
          ai_summary: apiData.ai_summary as string | undefined,
          ai_key_points: apiData.ai_key_points as string[] | undefined,
          ai_processed_at: apiData.ai_processed_at as string | undefined
        });
        // 生成成功后自动显示
        setAiVisible(true);
      }
    } catch {
      // 生成失败
    } finally {
      setAiLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id, aiData.ai_summary, aiVisible]);

  // Toast提示
  const showToastMessage = useCallback((msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(""), 2000);
  }, []);

  const handleBilingualToggle = async (enabled: boolean) => {
    setBilingualOn(enabled);
    
    if (enabled && article?.id) {
      // 开启双语，如果还没有翻译数据则进行翻译
      if (!translatedData) {
        setTranslating(true);
        try {
          // 根据文章语言动态设置目标语言：中文→英文，英文→中文
          const targetLang = article.language === 'en' ? 'zh' : 'en';
          
          // 翻译可能需要较长时间，设置 60 秒超时
          const response = await api.post<{ success: boolean; data: Record<string, unknown>; message?: string }>(
            `/ai/translate/${article.id}?target_lang=${targetLang}`,
            undefined,
            { timeout: 60000 } // 60 秒超时
          );
          
          if (response.success && response.data) {
            const title = response.data.translated_title as string | undefined;
            const summary = response.data.translated_summary as string | undefined;
            
            // 只要有任意一个翻译结果就认为成功
            if (title || summary) {
              setTranslatedData({
                translated_title: title,
                translated_summary: summary
              });
            } else {
              // 后端返回成功但没有翻译数据
              console.warn("翻译成功但未返回翻译数据");
              setBilingualOn(false);
              showToastMessage("未获取到翻译内容");
            }
          } else {
            // 后端返回失败
            console.warn("翻译 API 返回失败:", response);
            setBilingualOn(false);
            showToastMessage(response.message || "翻译失败，请稍后重试");
          }
        } catch (error) {
          console.error("翻译请求异常:", error);
          setBilingualOn(false);
          
          // 区分超时错误和其他错误
          if (error instanceof Error && error.name === 'AbortError') {
            showToastMessage("翻译超时，请稍后重试");
          } else {
            showToastMessage("翻译失败，请稍后重试");
          }
        } finally {
          setTranslating(false);
        }
      }
      // 如果 translatedData 已存在，直接显示，无需重新翻译
    } else if (!enabled) {
      // 关闭双语时，不清除 translatedData，以便再次开启时可以直接显示
      // 这样可以避免重复翻译
    }
  };

  // 切换黑名单状态
  const handleBlockToggle = useCallback(async () => {
    if (!article?.id) return;
    try {
      const response = await api.post<{ success: boolean; is_blocked: boolean; message?: string }>(
        `/user/blocks/${article.id}`
      );
      if (response.success) {
        setIsBlocked(response.is_blocked);
        if (response.is_blocked) {
          showToastMessage("已加入不看列表");
          
          // 自动跳转到下一篇文章
          const nextId = getNextId(article.id);
          if (nextId) {
            // 有下一篇文章，1秒后跳转
            setTimeout(() => {
              router.push("/article/" + nextId);
            }, 1000);
          } else {
            // 没有下一篇文章，返回上一页（列表页）
            // 列表页会自动过滤不看的文章并补充新文章
            setTimeout(() => {
              router.back();
            }, 1000);
          }
        } else {
          showToastMessage("已取消不看");
        }
      } else {
        showToastMessage(response.message || "操作失败");
      }
    } catch {
      showToastMessage("操作失败，请稍后重试");
    }
  }, [article?.id, router, showToastMessage, getNextId]);

  if (isLoading) return (
    <div className="p-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  );

  if (error || !article) return (
    <div className="p-4 text-center text-red-500">
      <p>加载失败</p>
      <button onClick={() => router.back()} className="text-blue-600 mt-2">返回</button>
    </div>
  );

  const a = article;
  const fav = isFavorite(a.id);
  const content = a.clean_content || ""; // 不再使用summary作为fallback，避免重复显示
  const hasHTML = !!a.raw_content;
  const time = a.published_at ? dayjs(a.published_at).format("YYYY-MM-DD HH:mm") : "";
  
  const prevId = getPrevId(a.id);
  const nextId = getNextId(a.id);
  const showPrev = hasPrev(a.id);
  const showNext = hasNext(a.id);
  const hasAIContent = !!(aiData.ai_summary);

  function handleShare() {
    if (navigator.share) navigator.share({ title: a.title, url: a.url }).catch(() => {});
    else navigator.clipboard.writeText(a.url).then(() => alert("链接已复制"));
  }

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        {/* Toast提示 */}
        {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gray-800 text-white text-sm rounded-full shadow-lg animate-pulse">
            {showToast}
          </div>
        )}

        {/* 顶部栏: 返回 | 来源名称 | 双语开关 + 查看原文 */}
        <header className="sticky top-0 z-30 bg-white px-3 py-3 flex items-center gap-2 border-b border-gray-100 safe-top">
          <button onClick={handleBack} className="p-1 -ml-1 flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600 flex-1 truncate">{a.source}</span>
          
          {/* 双语阅读开关 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500">双语</span>
            <BilingualToggle
              enabled={bilingualOn}
              onChange={handleBilingualToggle}
              loading={translating}
            />
          </div>
          
          {/* 查看原文 */}
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 flex-shrink-0"
          >
            <ExternalLink className="w-3 h-3" />
            原文
          </a>
        </header>

        {/* 文章内容 */}
        <article className="p-4 pb-24">
          <h1 className="text-xl font-bold text-gray-900 leading-relaxed mb-3">{a.title}</h1>
          
          {/* 双语标题 */}
          {bilingualOn && translatedData?.translated_title && (
            <TranslatedText
              translatedText={translatedData.translated_title}
              type="title"
            />
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            <span>{a.source}</span>
            {a.author && <span>{a.author}</span>}
            {time && <span>{time}</span>}
            {a.reading_time && <span>阅读{a.reading_time}分钟</span>}
          </div>
          {a.image_url && (<ImageWithFallback src={a.image_url} alt={a.title} width={600} height={360} className="w-full rounded-lg mb-4" />)}
          
          {/* AI摘要 - 显示在摘要之前、正文之前 */}
          {/* 只有当aiVisible为true时才显示 */}
          {aiVisible && (
            <AISummaryCard
              aiSummary={aiData.ai_summary}
              aiKeyPoints={aiData.ai_key_points}
              aiProcessedAt={aiData.ai_processed_at}
            />
          )}
          
          {/* 原文摘要（始终显示，如果有） */}
          {a.summary && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
              <p className="text-sm text-gray-600 leading-relaxed">{a.summary}</p>
            </div>
          )}
          
          {/* 双语摘要（开启双语时，在原文摘要下方显示翻译） */}
          {bilingualOn && translatedData?.translated_summary && (
            <TranslatedText
              translatedText={translatedData.translated_summary}
              type="summary"
            />
          )}
          
          {hasHTML && a.raw_content ? (<SafeHTML html={a.raw_content} />)
          : content ? (<div className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap">{content}</div>)
          : (<div className="text-center text-gray-400 py-10"><p>暂无正文内容</p><p className="text-sm mt-2">全文可能需要到原文查看</p></div>)}
        </article>

        {/* 浮动工具栏 - 包含7个功能按钮 */}
        <FloatingToolbar
          articleId={a.id}
          articleUrl={a.url}
          aiSummary={aiData.ai_summary}
          aiKeyPoints={aiData.ai_key_points}
          aiProcessedAt={aiData.ai_processed_at}
          bilingualOn={bilingualOn}
          isFavorite={fav}
          isBlocked={isBlocked}
          hasPrev={showPrev}
          hasNext={showNext}
          onAIGenerate={handleGenerateAI}
          onBilingualToggle={handleBilingualToggle}
          onPrev={() => prevId && router.push("/article/" + prevId)}
          onNext={() => nextId && router.push("/article/" + nextId)}
          onFavoriteToggle={() => toggleFavorite(a)}
          onBlockToggle={handleBlockToggle}
          aiLoading={aiLoading}
          aiVisible={aiVisible}
        />

        {/* 底部操作栏: 分享 | 返回 | 首页 */}
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-around z-40 safe-bottom">
          {/* 分享 */}
          <button onClick={handleShare} className="flex flex-col items-center gap-0.5 px-1 text-gray-600 active:text-blue-600">
            <Share2 className="w-5 h-5" />
            <span className="text-[10px]">分享</span>
          </button>

          {/* 返回上一页 */}
          <button onClick={() => router.back()} className="flex flex-col items-center gap-0.5 px-1 text-gray-600 active:text-blue-600">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[10px]">返回</span>
          </button>

          {/* 首页 */}
          <button onClick={() => router.push("/")} className="flex flex-col items-center gap-0.5 px-1 text-gray-600 active:text-blue-600">
            <Home className="w-5 h-5" />
            <span className="text-[10px]">首页</span>
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
}
