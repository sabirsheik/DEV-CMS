export interface AuditLogEntry {
  id: string;
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
  action: 
    | 'content.created'
    | 'content.updated'
    | 'content.published'
    | 'content.scheduled'
    | 'content.archived'
    | 'content.reviewed'
    | 'content.deleted'
    | 'media.uploaded'
    | 'media.deleted'
    | 'user.invited'
    | 'user.role_changed'
    | 'role.permissions_updated'
    | 'settings.updated';
  resourceType: string;
  resourceId: string;
  resourceTitle: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details?: {
    field?: string;
    before?: any;
    after?: any;
    note?: string;
  };
}

export interface MetricSummary {
  totalContent: number;
  draftContent: number;
  pendingReview: number;
  publishedToday: number;
  scheduledContent: number;
  storageUsedBytes: number;
  storageTotalBytes: number;
  activeUsers: number;
}
