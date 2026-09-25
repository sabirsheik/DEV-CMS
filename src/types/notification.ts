export type NotificationType =
  | 'content_submitted'
  | 'review_requested'
  | 'content_approved'
  | 'changes_requested'
  | 'content_published'
  | 'scheduled_published'
  | 'user_invited'
  | 'role_changed'
  | 'system_alert';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  linkUrl?: string;
  actor?: {
    name: string;
    avatarUrl?: string;
  };
  priority: 'low' | 'normal' | 'high';
}
