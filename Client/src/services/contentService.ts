import { ContentItem, ContentStatus, ContentRevision, ContentComment, ContentTypeModel } from '../types/content';
import { INITIAL_CONTENT, INITIAL_CONTENT_TYPES, INITIAL_REVISIONS, INITIAL_COMMENTS } from './mockData';

// Simulated database storage in memory & localStorage for durability across page interactions
const STORAGE_KEY_CONTENT = 'kinetix_cms_content';
const STORAGE_KEY_TYPES = 'kinetix_cms_content_types';
const STORAGE_KEY_REVISIONS = 'kinetix_cms_revisions';
const STORAGE_KEY_COMMENTS = 'kinetix_cms_comments';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

let contentStore: ContentItem[] = loadFromStorage(STORAGE_KEY_CONTENT, INITIAL_CONTENT);
let contentTypeStore: ContentTypeModel[] = loadFromStorage(STORAGE_KEY_TYPES, INITIAL_CONTENT_TYPES);
let revisionStore: ContentRevision[] = loadFromStorage(STORAGE_KEY_REVISIONS, INITIAL_REVISIONS);
let commentStore: ContentComment[] = loadFromStorage(STORAGE_KEY_COMMENTS, INITIAL_COMMENTS);

// Simulate brief async network delay
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export interface ContentFilterOptions {
  search?: string;
  status?: ContentStatus | 'all';
  type?: string | 'all';
  category?: string | 'all';
  authorId?: string | 'all';
  sortBy?: 'updatedAt' | 'createdAt' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const contentService = {
  async getAllContent(options: ContentFilterOptions = {}): Promise<PaginatedResult<ContentItem>> {
    await delay(80);
    const {
      search = '',
      status = 'all',
      type = 'all',
      category = 'all',
      authorId = 'all',
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      page = 1,
      pageSize = 10
    } = options;

    let items = [...contentStore];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (status !== 'all') {
      items = items.filter(item => item.status === status);
    }

    if (type !== 'all') {
      items = items.filter(item => item.type === type);
    }

    if (category !== 'all') {
      items = items.filter(item => item.category === category);
    }

    if (authorId !== 'all') {
      items = items.filter(item => item.author.id === authorId);
    }

    items.sort((a, b) => {
      let aVal = a[sortBy] ?? '';
      let bVal = b[sortBy] ?? '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = items.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1
    };
  },

  async getContentById(id: string): Promise<ContentItem | null> {
    await delay(60);
    const item = contentStore.find(c => c.id === id);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  },

  async createContent(payload: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'revisionsCount' | 'commentsCount'>): Promise<ContentItem> {
    await delay(120);
    const now = new Date().toISOString();
    const newItem: ContentItem = {
      ...payload,
      id: `cnt-${Date.now().toString().slice(-6)}`,
      createdAt: now,
      updatedAt: now,
      revisionsCount: 1,
      commentsCount: 0
    };

    contentStore.unshift(newItem);
    saveToStorage(STORAGE_KEY_CONTENT, contentStore);

    // Initial revision snapshot
    const initialRev: ContentRevision = {
      id: `rev-${Date.now()}`,
      contentId: newItem.id,
      version: 1,
      author: newItem.author,
      createdAt: now,
      summary: 'Initial content creation',
      statusAtRevision: newItem.status,
      changes: [{ field: 'all', before: null, after: 'Draft created', changeType: 'added' }],
      snapshot: JSON.parse(JSON.stringify(newItem))
    };
    revisionStore.unshift(initialRev);
    saveToStorage(STORAGE_KEY_REVISIONS, revisionStore);

    return newItem;
  },

  async updateContent(id: string, updates: Partial<ContentItem>, revisionSummary?: string): Promise<ContentItem> {
    await delay(100);
    const index = contentStore.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Content with ID ${id} not found.`);

    const oldItem = contentStore[index];
    const updatedItem: ContentItem = {
      ...oldItem,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    contentStore[index] = updatedItem;
    saveToStorage(STORAGE_KEY_CONTENT, contentStore);

    // Create revision entry if meaningful update
    if (revisionSummary) {
      updatedItem.revisionsCount = (oldItem.revisionsCount || 1) + 1;
      const rev: ContentRevision = {
        id: `rev-${Date.now()}`,
        contentId: id,
        version: updatedItem.revisionsCount,
        author: updatedItem.author,
        createdAt: updatedItem.updatedAt,
        summary: revisionSummary,
        statusAtRevision: updatedItem.status,
        changes: Object.keys(updates).map(k => ({
          field: k,
          before: (oldItem as any)[k],
          after: (updates as any)[k],
          changeType: 'modified'
        })),
        snapshot: JSON.parse(JSON.stringify(updatedItem))
      };
      revisionStore.unshift(rev);
      saveToStorage(STORAGE_KEY_REVISIONS, revisionStore);
    }

    return updatedItem;
  },

  async deleteContent(id: string): Promise<void> {
    await delay(100);
    contentStore = contentStore.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEY_CONTENT, contentStore);
  },

  async bulkUpdateStatus(ids: string[], newStatus: ContentStatus): Promise<number> {
    await delay(150);
    let count = 0;
    const now = new Date().toISOString();
    contentStore = contentStore.map(item => {
      if (ids.includes(item.id)) {
        count++;
        return {
          ...item,
          status: newStatus,
          updatedAt: now,
          publishedAt: newStatus === 'published' ? (item.publishedAt || now) : item.publishedAt
        };
      }
      return item;
    });
    saveToStorage(STORAGE_KEY_CONTENT, contentStore);
    return count;
  },

  async bulkDelete(ids: string[]): Promise<number> {
    await delay(150);
    const prevLen = contentStore.length;
    contentStore = contentStore.filter(item => !ids.includes(item.id));
    saveToStorage(STORAGE_KEY_CONTENT, contentStore);
    return prevLen - contentStore.length;
  },

  // Revisions
  async getRevisionsByContentId(contentId: string): Promise<ContentRevision[]> {
    await delay(60);
    return revisionStore.filter(r => r.contentId === contentId);
  },

  async restoreRevision(contentId: string, revisionId: string): Promise<ContentItem> {
    await delay(120);
    const rev = revisionStore.find(r => r.id === revisionId && r.contentId === contentId);
    if (!rev) throw new Error('Revision not found');
    return this.updateContent(contentId, rev.snapshot, `Restored to Revision v${rev.version}`);
  },

  // Comments
  async getCommentsByContentId(contentId: string): Promise<ContentComment[]> {
    await delay(50);
    return commentStore.filter(c => c.contentId === contentId);
  },

  async addComment(contentId: string, body: string, author: ContentComment['author'], fieldAnchor?: string): Promise<ContentComment> {
    await delay(80);
    const newComment: ContentComment = {
      id: `cmt-${Date.now()}`,
      contentId,
      author,
      body,
      createdAt: new Date().toISOString(),
      resolved: false,
      fieldAnchor
    };
    commentStore.unshift(newComment);
    saveToStorage(STORAGE_KEY_COMMENTS, commentStore);

    // Increment commentsCount on content
    const item = contentStore.find(c => c.id === contentId);
    if (item) {
      item.commentsCount = (item.commentsCount || 0) + 1;
      saveToStorage(STORAGE_KEY_CONTENT, contentStore);
    }
    return newComment;
  },

  async toggleResolveComment(commentId: string, resolvedByName: string): Promise<ContentComment> {
    await delay(60);
    const c = commentStore.find(item => item.id === commentId);
    if (!c) throw new Error('Comment not found');
    c.resolved = !c.resolved;
    if (c.resolved) {
      c.resolvedBy = resolvedByName;
      c.resolvedAt = new Date().toISOString();
    } else {
      c.resolvedBy = undefined;
      c.resolvedAt = undefined;
    }
    saveToStorage(STORAGE_KEY_COMMENTS, commentStore);
    return c;
  },

  // Content Types / Schema
  async getContentTypes(): Promise<ContentTypeModel[]> {
    await delay(50);
    return [...contentTypeStore];
  },

  async saveContentType(model: ContentTypeModel): Promise<ContentTypeModel> {
    await delay(100);
    const idx = contentTypeStore.findIndex(m => m.id === model.id);
    if (idx >= 0) {
      contentTypeStore[idx] = model;
    } else {
      contentTypeStore.push(model);
    }
    saveToStorage(STORAGE_KEY_TYPES, contentTypeStore);
    return model;
  }
};
