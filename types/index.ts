// ==================== 核心数据类型 ====================

export interface Article {
  id: number;
  title: string;
  summary?: string;
  url: string;
  published_at: string;
  source: string;
  category?: string;
  author?: string;
  tags: string[];
  image_url?: string;
  rss_source_id: number;
  language?: string;
  quality_score?: number;
  reading_time?: number;
  word_count?: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ArticleDetail extends Article {
  raw_content?: string;
  clean_content?: string;
  raw_summary?: string;
  clean_summary?: string;
  content_format?: "raw" | "clean";
  content_hash?: string;
  title_hash?: string;
  url_hash?: string;
  related_articles?: Article[];
  tag_details?: TagDetail[];
  // AI 字段 (Phase 2)
  ai_summary?: string;
  ai_key_points?: string[];
  ai_tags?: string[];
  ai_processed_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  description?: string;
  category?: string;
  color?: string;
  article_count: number;
  created_at?: string;
}

export interface TagDetail {
  id: number;
  name: string;
  description?: string;
  category?: string;
  color?: string;
}

export interface TagCategory {
  name: string;
  tag_count: number;
  article_count: number;
}

export interface RSSSource {
  id: number;
  name: string;
  url: string;
  description?: string;
  category?: string;
  language?: string;
  update_frequency?: string;
  is_active: boolean;
  status: string;
  last_collection_at?: string;
  last_successful_at?: string;
  total_articles: number;
  success_rate: number;
  created_at: string;
  updated_at?: string;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
}

export interface SourceListResponse {
  sources: RSSSource[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
}

export interface ArticleDetailResponse {
  success: boolean;
  data: ArticleDetail;
}

// ==================== API 错误类型 ====================

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
