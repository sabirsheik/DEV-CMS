import { ContentItem, ContentStatus } from '../types/content';
import { WorkflowTransition, ReviewQueueItem } from '../types/workflow';
import { contentService } from './contentService';
import { activityService } from './activityService';

export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  { from: 'draft', to: 'in_review', label: 'Submit for Review', requiredRole: ['author', 'editor', 'admin', 'super_admin'], actionType: 'primary' },
  { from: 'in_review', to: 'approved', label: 'Approve Content', requiredRole: ['reviewer', 'editor', 'admin', 'super_admin'], actionType: 'primary' },
  { from: 'in_review', to: 'changes_requested', label: 'Request Changes', requiredRole: ['reviewer', 'editor', 'admin', 'super_admin'], actionType: 'secondary', requiresNote: true },
  { from: 'changes_requested', to: 'in_review', label: 'Re-submit for Review', requiredRole: ['author', 'editor', 'admin', 'super_admin'], actionType: 'primary' },
  { from: 'approved', to: 'scheduled', label: 'Schedule Deployment', requiredRole: ['publisher', 'admin', 'super_admin'], actionType: 'secondary' },
  { from: 'approved', to: 'published', label: 'Publish to Production', requiredRole: ['publisher', 'admin', 'super_admin'], actionType: 'primary' },
  { from: 'scheduled', to: 'published', label: 'Publish Immediately', requiredRole: ['publisher', 'admin', 'super_admin'], actionType: 'primary' },
  { from: 'published', to: 'archived', label: 'Archive Content', requiredRole: ['editor', 'admin', 'super_admin'], actionType: 'danger' },
  { from: 'archived', to: 'draft', label: 'Restore to Draft', requiredRole: ['editor', 'admin', 'super_admin'], actionType: 'secondary' }
];

export const workflowService = {
  getAvailableTransitions(currentStatus: ContentStatus, userRole: string): WorkflowTransition[] {
    return WORKFLOW_TRANSITIONS.filter(t => 
      t.from === currentStatus && 
      (t.requiredRole.includes(userRole) || userRole === 'super_admin')
    );
  },

  async getReviewQueue(): Promise<ReviewQueueItem[]> {
    const result = await contentService.getAllContent({ status: 'all', pageSize: 100 });
    const inReviewItems = result.data.filter(c => c.status === 'in_review' || c.status === 'changes_requested');
    
    return inReviewItems.map(item => ({
      id: `rev-q-${item.id}`,
      content: item,
      status: item.status,
      submittedAt: item.updatedAt,
      submittedBy: item.author,
      assignedTo: item.reviewAssignedTo,
      priority: item.tags.includes('Urgent') ? 'urgent' : 'high',
      reviewerNotes: item.reviewNotes,
      commentsCount: item.commentsCount
    }));
  },

  async transitionContent(
    contentId: string, 
    newStatus: ContentStatus, 
    actor: { id: string; name: string; email: string; role: string },
    note?: string,
    scheduledAt?: string
  ): Promise<ContentItem> {
    const updates: Partial<ContentItem> = {
      status: newStatus,
      reviewNotes: note || undefined
    };

    if (newStatus === 'scheduled' && scheduledAt) {
      updates.scheduledAt = scheduledAt;
    }

    if (newStatus === 'published') {
      updates.publishedAt = new Date().toISOString();
    }

    const updated = await contentService.updateContent(contentId, updates, `Status changed to ${newStatus}`);

    await activityService.logAction({
      actor: { id: actor.id, name: actor.name, email: actor.email, role: actor.role },
      action: newStatus === 'published' ? 'content.published' :
              newStatus === 'scheduled' ? 'content.scheduled' :
              newStatus === 'archived' ? 'content.archived' :
              newStatus === 'in_review' ? 'content.reviewed' : 'content.updated',
      resourceType: updated.type,
      resourceId: updated.id,
      resourceTitle: updated.title,
      details: { note: note || `Transitioned status to ${newStatus}` }
    });

    return updated;
  }
};
