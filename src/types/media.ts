export type MediaType = 'image' | 'video' | 'document' | 'audio' | 'archive';

export interface MediaItem {
  id: string;
  filename: string;
  title: string;
  altText: string;
  caption?: string;
  type: MediaType;
  mimeType: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl: string;
  dimensions?: {
    width: number;
    height: number;
  };
  uploader: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  folder: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MediaUploadProgress {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}
