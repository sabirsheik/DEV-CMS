import { ContentItem, ContentStatus } from './content';

export interface WorkflowTransition {
  from: ContentStatus;
  to: ContentStatus;
  label: string;
  requiredRole: string[];
  actionType: 'primary' | 'secondary' | 'danger';
  requiresNote?: boolean;
}

export interface ReviewQueueItem {
  id: string;
  content: ContentItem;
  status: ContentStatus;
  submittedAt: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  priority: 'urgent' | 'high' | 'normal' | 'low';
  dueDate?: string;
  reviewerNotes?: string;
  commentsCount: number;
}
