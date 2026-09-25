import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { contentService } from '../../services/contentService';
import { ContentRevision, ContentItem } from '../../types/content';
import { StatusBadge } from '../../components/common/Badge';
import { History, RotateCcw, Clock, ArrowRight, Check } from 'lucide-react';

interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  onRestored: (restoredItem: ContentItem) => void;
}

export const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  isOpen,
  onClose,
  contentId,
  onRestored
}) => {
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [selectedRev, setSelectedRev] = useState<ContentRevision | null>(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (isOpen && contentId) {
      loadRevisions();
    }
  }, [isOpen, contentId]);

  const loadRevisions = async () => {
    setLoading(true);
    try {
      const revs = await contentService.getRevisionsByContentId(contentId);
      setRevisions(revs);
      if (revs.length > 0) setSelectedRev(revs[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (revId: string) => {
    setRestoring(true);
    try {
      const restored = await contentService.restoreRevision(contentId, revId);
      onRestored(restored);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revision History & State Comparison"
      subtitle="Inspect immutable snapshots, view field-level diffs, and revert safely."
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
        {/* Left: Revision List */}
        <div className="border border-slate-800 rounded-lg overflow-y-auto divide-y divide-slate-800/80 bg-slate-900/30">
          {loading ? (
            <div className="p-4 text-xs text-slate-500">Loading revisions...</div>
          ) : revisions.length === 0 ? (
            <div className="p-4 text-xs text-slate-500">No previous revisions recorded.</div>
          ) : (
            revisions.map(rev => {
              const isSelected = selectedRev?.id === rev.id;
              return (
                <button
                  key={rev.id}
                  onClick={() => setSelectedRev(rev)}
                  className={`w-full p-3 text-left transition-colors flex flex-col gap-1 ${
                    isSelected ? 'bg-blue-600/15 border-l-2 border-blue-500' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 font-mono">
                      v{rev.version}.0
                    </span>
                    <StatusBadge status={rev.statusAtRevision} showDot={false} />
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-1">
                    {rev.summary}
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                    <span>{rev.author.name}</span>
                    <span>·</span>
                    <span>{new Date(rev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right: Selected Revision Inspection & Diff View */}
        <div className="md:col-span-2 border border-slate-800 rounded-lg p-4 bg-slate-950/40 flex flex-col justify-between overflow-y-auto">
          {selectedRev ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-400" />
                    <span>Snapshot v{selectedRev.version}.0</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Captured on {new Date(selectedRev.createdAt).toLocaleString()} by {selectedRev.author.name}
                  </div>
                </div>

                <button
                  onClick={() => handleRestore(selectedRev.id)}
                  disabled={restoring}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore This Version</span>
                </button>
              </div>

              {/* Summary */}
              <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Revision Notes
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedRev.summary}</p>
              </div>

              {/* Diff Changes */}
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-2">
                  Field Modifications
                </span>
                <div className="space-y-2">
                  {selectedRev.changes.map((c, i) => (
                    <div key={i} className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-blue-300 font-medium">{c.field}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                          c.changeType === 'added' ? 'bg-emerald-500/20 text-emerald-300' :
                          c.changeType === 'removed' ? 'bg-red-500/20 text-red-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {c.changeType}
                        </span>
                      </div>

                      {c.before !== null && c.before !== undefined && (
                        <div className="text-[11px] font-mono text-red-400/90 line-through bg-red-950/20 p-1.5 rounded">
                          - {String(c.before).slice(0, 160)}
                        </div>
                      )}
                      <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/20 p-1.5 rounded">
                        + {String(c.after).slice(0, 160)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-slate-500">
              Select a revision from the left timeline to inspect diffs.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
