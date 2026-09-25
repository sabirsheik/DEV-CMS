import { MediaItem, MediaType, MediaUploadProgress } from '../types/media';
import { INITIAL_MEDIA } from './mockData';

const STORAGE_KEY_MEDIA = 'kinetix_cms_media';

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

let mediaStore: MediaItem[] = loadFromStorage(STORAGE_KEY_MEDIA, INITIAL_MEDIA);
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export interface MediaFilterOptions {
  search?: string;
  type?: MediaType | 'all';
  folder?: string | 'all';
  sortBy?: 'createdAt' | 'sizeBytes' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export const mediaService = {
  async getMedia(options: MediaFilterOptions = {}): Promise<MediaItem[]> {
    await delay(70);
    const {
      search = '',
      type = 'all',
      folder = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    let items = [...mediaStore];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(m => 
        m.title.toLowerCase().includes(q) ||
        m.filename.toLowerCase().includes(q) ||
        m.altText.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (type !== 'all') {
      items = items.filter(m => m.type === type);
    }

    if (folder !== 'all') {
      items = items.filter(m => m.folder === folder);
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

    return items;
  },

  async getMediaById(id: string): Promise<MediaItem | null> {
    await delay(50);
    const item = mediaStore.find(m => m.id === id);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  },

  async updateMedia(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
    await delay(80);
    const idx = mediaStore.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Media asset not found');

    const updated = {
      ...mediaStore[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    mediaStore[idx] = updated;
    saveToStorage(STORAGE_KEY_MEDIA, mediaStore);
    return updated;
  },

  async deleteMedia(id: string): Promise<void> {
    await delay(90);
    mediaStore = mediaStore.filter(m => m.id !== id);
    saveToStorage(STORAGE_KEY_MEDIA, mediaStore);
  },

  // Simulates realistic multi-stage upload progress
  simulateUpload(
    file: File,
    onProgress: (progress: MediaUploadProgress) => void,
    uploader: { id: string; name: string }
  ): Promise<MediaItem> {
    const uploadId = `upl-${Date.now()}`;
    return new Promise((resolve) => {
      let p = 0;
      const interval = setInterval(() => {
        p += 25;
        if (p < 100) {
          onProgress({
            id: uploadId,
            file,
            name: file.name,
            size: file.size,
            progress: p,
            status: 'uploading'
          });
        } else if (p === 100) {
          onProgress({
            id: uploadId,
            file,
            name: file.name,
            size: file.size,
            progress: 100,
            status: 'processing'
          });
        } else {
          clearInterval(interval);
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          let detectedType: MediaType = 'document';
          if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(ext)) detectedType = 'image';
          else if (['mp4', 'mov', 'webm'].includes(ext)) detectedType = 'video';
          else if (['mp3', 'wav', 'aac'].includes(ext)) detectedType = 'audio';

          const newMedia: MediaItem = {
            id: `med-${Date.now()}`,
            filename: file.name,
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            altText: `Asset: ${file.name}`,
            caption: '',
            type: detectedType,
            mimeType: file.type || 'application/octet-stream',
            sizeBytes: file.size || 1500000,
            url: URL.createObjectURL(file),
            thumbnailUrl: URL.createObjectURL(file),
            dimensions: detectedType === 'image' ? { width: 1600, height: 900 } : undefined,
            uploader,
            folder: 'Uploads',
            tags: ['Uploaded', detectedType],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          mediaStore.unshift(newMedia);
          saveToStorage(STORAGE_KEY_MEDIA, mediaStore);

          onProgress({
            id: uploadId,
            file,
            name: file.name,
            size: file.size,
            progress: 100,
            status: 'completed'
          });

          resolve(newMedia);
        }
      }, 150);
    });
  }
};
