import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { ContentComment } from '../../types/content';
import { useCmsStore } from '../../stores/useCmsStore';
import { MessageSquare, CheckCircle, Send, Check } from 'lucide-react';

interface ContentCommentsPanelProps {
  contentId: string;
}

export const ContentCommentsPanel: React.FC<ContentCommentsPanelProps> = ({ contentId }) => {
  const { currentUser, showToast } = useCmsStore();
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [newCommentBody, setNewCommentBody] = useState('');
  const [selectedAnchor, setSelectedAnchor] = useState<string>('general');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contentId) {
      loadComments();
    }
  }, [contentId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const list = await contentService.getCommentsByContentId(contentId);
      setComments(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentBody.trim()) return;

    try {
      const newComment = await contentService.addComment(
        contentId,
        newCommentBody,
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl
        },
        selectedAnchor === 'general' ? undefined : selectedAnchor
      );
      setComments(prev => [newComment, ...prev]);
      setNewCommentBody('');
      showToast({ type: 'success', title: 'Review Comment Posted' });
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to post comment' });
    }
  };

  const handleToggleResolve = async (commentId: string) => {
    try {
      const updated = await contentService.toggleResolveComment(commentId, currentUser.name);
      setComments(prev => prev.map(c => c.id === commentId ? updated : c));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          <span>Editorial Comments ({comments.length})</span>
        </div>
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleAddComment} className="space-y-2">
        <div className="flex items-center gap-2">
          <select
            value={selectedAnchor}
            onChange={(e) => setSelectedAnchor(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-hidden"
          >
            <option value="general">General Review Note</option>
            <option value="title">Anchor: Primary Title</option>
            <option value="excerpt">Anchor: Executive Excerpt</option>
            <option value="blocks[1]">Anchor: Technical Blocks</option>
            <option value="seo.metaDescription">Anchor: SEO Description</option>
          </select>
        </div>

        <textarea
          rows={3}
          value={newCommentBody}
          onChange={(e) => setNewCommentBody(e.target.value)}
          placeholder="Leave review feedback or compliance request..."
          className="w-full bg-slate-900/80 border border-slate-800 focus:border-slate-700 rounded p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden resize-none"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newCommentBody.trim()}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs font-medium transition-colors"
          >
            <Send className="w-3 h-3" />
            <span>Post Comment</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 pt-2 divide-y divide-slate-800/80">
        {loading ? (
          <div className="text-slate-500 py-4 text-center">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-slate-500 py-4 text-center">No comments yet.</div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="pt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span>{c.author.name}</span>
                  {c.fieldAnchor && (
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 px-1 rounded">
                      {c.fieldAnchor}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleToggleResolve(c.id)}
                  className={`p-1 rounded text-[11px] flex items-center gap-1 transition-colors ${
                    c.resolved ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={c.resolved ? 'Reopen comment' : 'Mark as resolved'}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{c.resolved ? 'Resolved' : 'Resolve'}</span>
                </button>
              </div>

              <p className={`text-xs leading-relaxed ${c.resolved ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                {c.body}
              </p>

              <div className="text-[10px] text-slate-500 font-mono">
                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {c.resolvedBy && ` · Resolved by ${c.resolvedBy}`}
              </div>

              {/* Threaded replies */}
              {c.replies && c.replies.length > 0 && (
                <div className="pl-3 border-l border-slate-800 space-y-2 mt-2">
                  {c.replies.map(r => (
                    <div key={r.id} className="text-[11px] text-slate-300">
                      <span className="font-semibold text-slate-200">{r.author.name}: </span>
                      <span>{r.body}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
