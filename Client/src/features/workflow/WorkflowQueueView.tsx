import React, { useState, useEffect } from 'react';
import { workflowService } from '../../services/workflowService';
import { ReviewQueueItem } from '../../types/workflow';
import { ContentStatus } from '../../types/content';
import { useCmsStore } from '../../stores/useCmsStore';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { 
  GitPullRequest, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  UserCheck, 
  ArrowRight,
  Filter,
  Check,
  Send,
  Eye
} from 'lucide-react';

export const WorkflowQueueView: React.FC = () => {
  const { currentUser, navigateTo, showToast } = useCmsStore();

  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Action Dialog
  const [activeItem, setActiveItem] = useState<ReviewQueueItem | null>(null);
  const [actionTargetStatus, setActionTargetStatus] = useState<ContentStatus | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const items = await workflowService.getReviewQueue();
      setQueue(items);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to load review queue' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAction = (item: ReviewQueueItem, targetStatus: ContentStatus) => {
    setActiveItem(item);
    setActionTargetStatus(targetStatus);
    setActionNote('');
    setDialogOpen(true);
  };

  const handleExecuteTransition = async () => {
    if (!activeItem || !actionTargetStatus) return;

    try {
      await workflowService.transitionContent(
        activeItem.content.id,
        actionTargetStatus,
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role
        },
        actionNote
      );

      showToast({
        type: 'success',
        title: `Transition to ${actionTargetStatus.toUpperCase()} Succeeded`,
        message: `Content record updated and logged to audit trail.`
      });

      setDialogOpen(false);
      loadQueue();
    } catch (err) {
      showToast({ type: 'error', title: 'Workflow transition failed' });
    }
  };

  const stages: { status: ContentStatus; label: string; desc: string }[] = [
    { status: 'in_review', label: 'Compliance & Editorial Review', desc: 'Pending legal, factual and tone verification' },
    { status: 'changes_requested', label: 'Changes Requested', desc: 'Returned to author for editorial revisions' },
    { status: 'approved', label: 'Approved for Release', desc: 'Passed verification; awaiting publishing or scheduling' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Workflow & Review Queue</span>
            <span className="text-xs font-mono font-normal text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              {queue.length} active tickets
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enforce separation of duties between Authors, Compliance Reviewers, and Release Publishers.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <span>Active Role:</span>
          <span className="text-slate-200 uppercase font-semibold">{currentUser.role.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Visual Workflow Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stages.map(stage => {
          const itemsInStage = queue.filter(q => q.status === stage.status);

          return (
            <div 
              key={stage.status}
              className="bg-[#0f172a]/60 border border-slate-800 rounded-lg flex flex-col max-h-[700px] overflow-hidden"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800 bg-[#0b0f17]/50 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold text-slate-100">{stage.label}</h2>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{stage.desc}</p>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {itemsInStage.length}
                </span>
              </div>

              {/* Items in Column */}
              <div className="p-3 overflow-y-auto space-y-3 flex-1">
                {itemsInStage.length === 0 ? (
                  <div className="p-6 text-center text-slate-600 text-xs italic">
                    No items in this stage.
                  </div>
                ) : (
                  itemsInStage.map(item => (
                    <div 
                      key={item.id}
                      className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-100 hover:text-blue-400 cursor-pointer line-clamp-2" onClick={() => navigateTo('editor', { contentId: item.content.id })}>
                          {item.content.title}
                        </span>
                        {item.priority === 'urgent' && (
                          <span className="text-[10px] font-mono text-red-400 bg-red-950/40 border border-red-800/40 px-1.5 rounded shrink-0">
                            Urgent
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                        <span>By {item.submittedBy.name}</span>
                        <span>{new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {item.reviewerNotes && (
                        <div className="p-2 rounded bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-300">
                          {item.reviewerNotes}
                        </div>
                      )}

                      {/* Action buttons based on status & role */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                        <button
                          onClick={() => navigateTo('editor', { contentId: item.content.id })}
                          className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {item.status === 'in_review' && (
                            <>
                              <button
                                onClick={() => handleOpenAction(item, 'changes_requested')}
                                className="px-2 py-1 text-[11px] bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 rounded transition-colors"
                              >
                                Request Changes
                              </button>
                              <button
                                onClick={() => handleOpenAction(item, 'approved')}
                                className="px-2 py-1 text-[11px] bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-300 border border-emerald-500/40 rounded transition-colors"
                              >
                                Approve
                              </button>
                            </>
                          )}

                          {item.status === 'changes_requested' && (
                            <button
                              onClick={() => handleOpenAction(item, 'in_review')}
                              className="px-2 py-1 text-[11px] bg-blue-600/40 hover:bg-blue-600/60 text-blue-200 border border-blue-500/40 rounded transition-colors"
                            >
                              Re-Submit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Transition Action Dialog with Note */}
      {dialogOpen && activeItem && actionTargetStatus && (
        <Modal
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={`Transition Content to ${actionTargetStatus.replace('_', ' ').toUpperCase()}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-900 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Target Article</span>
              <div className="font-semibold text-slate-200 mt-0.5">{activeItem.content.title}</div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Reviewer Rationale & Audit Note
              </label>
              <textarea
                rows={3}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="State reason for changes requested or approval justification..."
                className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-slate-200 placeholder-slate-500 focus:outline-hidden resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTransition}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Transition</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
