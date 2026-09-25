export type ContentStatus = 
  | 'draft'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'archived';

export type ContentTypeId = 'article' | 'page' | 'case_study' | 'product_release' | 'announcement';

export interface ContentFieldDefinition {
  id: string;
  name: string;
  key: string;
  type: 
    | 'text'
    | 'rich_text'
    | 'number'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'image'
    | 'file'
    | 'select'
    | 'multi_select'
    | 'relation'
    | 'url'
    | 'email'
    | 'json';
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string }[];
  description?: string;
  validationRegex?: string;
}

export interface ContentTypeModel {
  id: ContentTypeId | string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  fields: ContentFieldDefinition[];
  createdAt: string;
  itemCount: number;
}

export type BlockType = 
  | 'hero'
  | 'text'
  | 'image'
  | 'gallery'
  | 'quote'
  | 'callout'
  | 'code'
  | 'table'
  | 'faq'
  | 'cta';

export interface ContentBlock {
  id: string;
  type: BlockType;
  order: number;
  data: Record<string, any>;
}

export interface ContentRevision {
  id: string;
  contentId: string;
  version: number;
  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  createdAt: string;
  summary: string;
  statusAtRevision: ContentStatus;
  changes: {
    field: string;
    before: any;
    after: any;
    changeType: 'added' | 'removed' | 'modified';
  }[];
  snapshot: Partial<ContentItem>;
}

export interface ContentComment {
  id: string;
  contentId: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  body: string;
  createdAt: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  fieldAnchor?: string; // e.g. "title", "blocks[1]", "seo.metaDescription"
  replies?: ContentComment[];
}

export interface SeoMetadata {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage?: string;
  focusKeywords: string[];
  noIndex: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: ContentTypeId | string;
  status: ContentStatus;
  excerpt: string;
  blocks: ContentBlock[];
  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  featuredImageUrl?: string;
  category: string;
  tags: string[];
  locale: string;
  seo: SeoMetadata;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  reviewAssignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  reviewNotes?: string;
  revisionsCount: number;
  commentsCount: number;
}
