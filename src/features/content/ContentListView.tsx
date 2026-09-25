import React, { useState, useEffect } from 'react';
import { useCmsStore } from '../../stores/useCmsStore';
import { contentService, PaginatedResult } from '../../services/contentService';
import { ContentItem, ContentStatus } from '../../types/content';
import { StatusBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  Search, 
  Filter, 
  Plus, 
  SlidersHorizontal, 
  Trash2, 
  CheckCircle2, 
  Archive, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  FileText,
  Clock,
  Eye,
  Edit3,
  Calendar,
  Layers
} from 'lucide-react';

export const ContentListView: React.FC = () => {
  const { contentSubFilter, navigateTo, showToast } = useCmsStore();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PaginatedResult<ContentItem>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(contentSubFilter || 'all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title' | 'status'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Sync subFilter if changed from sidebar
  useEffect(() => {
    if (contentSubFilter) {
      setStatusFilter(contentSubFilter);
      setCurrentPage(1);
    }
  }, [contentSubFilter]);

  useEffect(() => {
    fetchContent();
  }, [searchQuery, statusFilter, typeFilter, categoryFilter, sortBy, sortOrder, currentPage]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await contentService.getAllContent({
        search: searchQuery,
        status: (statusFilter === 'all' ? 'all' : statusFilter) as ContentStatus,
        type: typeFilter,
        category: categoryFilter,
        sortBy,
        sortOrder,
        page: currentPage,
        pageSize: 10
      });
      setResult(res);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to load content records' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === result.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(result.data.map(i => i.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk Operations
  const handleBulkStatusChange = async (newStatus: ContentStatus) => {
    if (selectedIds.length === 0) return;
    try {
      const count = await contentService.bulkUpdateStatus(selectedIds, newStatus);
      showToast({
        type: 'success',
        title: 'Bulk Update Successful',
        message: `Updated status to "${newStatus}" for ${count} content records.`
      });
      setSelectedIds([]);
      fetchContent();
    } catch (err) {
      showToast({ type: 'error', title: 'Bulk status update failed' });
    }
  };

  const handleBulkDelete = async () => {
    const idsToDelete = deleteTargetId ? [deleteTargetId] : selectedIds;
    if (idsToDelete.length === 0) return;
    try {
      const count = await contentService.bulkDelete(idsToDelete);
      showToast({
        type: 'success',
        title: 'Records Deleted',
        message: `Permanently removed ${count} content records.`
      });
      setSelectedIds([]);
      setDeleteTargetId(null);
      fetchContent();
    } catch (err) {
      showToast({ type: 'error', title: 'Deletion failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-main)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <span>Content Records</span>
            <span className="text-xs font-mono font-normal text-[var(--text-muted)] px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-main)]">
              {result.total} total
            </span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Browse, filter, edit, and orchestrate publications across multi-channel endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('editor', { contentId: null })}
            style={{ backgroundColor: 'var(--brand-primary)' }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:opacity-95 rounded text-xs font-medium transition-all shadow-xs border border-white/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Content</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border-main)] shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by title, slug, excerpt, or tag..."
            className="w-full pl-9 pr-4 py-1.5 bg-[var(--bg-input)] border border-[var(--border-main)] focus:border-[var(--border-highlight)] rounded text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-[var(--bg-input)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] rounded focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
            <option value="changes_requested">Changes Requested</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-[var(--bg-input)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] rounded focus:outline-hidden"
          >
            <option value="all">All Content Types</option>
            <option value="article">Editorial Article</option>
            <option value="case_study">Case Study</option>
            <option value="page">Standard Page</option>
            <option value="product_release">Product Release</option>
            <option value="announcement">Announcement</option>
          </select>

          {/* Sort By */}
          <button
            onClick={() => {
              setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--bg-input)] border border-[var(--border-main)] hover:border-[var(--border-highlight)] text-xs text-[var(--text-secondary)] rounded transition-colors"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="font-mono">{sortOrder.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Strip (visible when items selected) */}
      {selectedIds.length > 0 && (
        <div 
          style={{ backgroundColor: 'var(--brand-tint)', borderColor: 'var(--brand-border)' }}
          className="flex items-center justify-between px-4 py-2 border rounded-lg text-xs animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold font-mono" style={{ color: 'var(--brand-text)' }}>{selectedIds.length}</span>
            <span className="text-[var(--text-primary)]">records selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange('published')}
              className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded transition-colors"
            >
              Publish Selected
            </button>
            <button
              onClick={() => handleBulkStatusChange('archived')}
              className="px-2.5 py-1 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border-main)] rounded transition-colors"
            >
              Archive
            </button>
            <button
              onClick={() => {
                setDeleteTargetId(null);
                setConfirmDeleteOpen(true);
              }}
              className="px-2.5 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 rounded transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-[var(--bg-card-subtle)] rounded"></div>
            ))}
          </div>
        ) : result.data.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Content Records Found"
            description="Try changing your search terms or filters, or compose a new article."
            actionLabel="Create New Content"
            onAction={() => navigateTo('editor', { contentId: null })}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border-main)] bg-[var(--bg-card-subtle)] text-[11px] text-[var(--text-muted)] uppercase font-mono tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === result.data.length}
                      onChange={toggleSelectAll}
                      className="rounded bg-[var(--bg-input)] border-[var(--border-main)] text-[var(--brand-primary)] focus:ring-0"
                    />
                  </th>
                  <th className="px-4 py-3">Title & Slug</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 font-mono">Last Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {result.data.map(item => (
                  <tr 
                    key={item.id}
                    onClick={() => navigateTo('editor', { contentId: item.id })}
                    className={`hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors ${
                      selectedIds.includes(item.id) ? 'bg-[var(--bg-card-hover)]' : ''
                    }`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectOne(item.id)}
                        className="rounded bg-[var(--bg-input)] border-[var(--border-main)] text-[var(--brand-primary)] focus:ring-0"
                      />
                    </td>

                    <td className="px-4 py-3 min-w-[280px] max-w-md">
                      <div className="font-semibold text-[var(--text-primary)] transition-colors truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono truncate mt-0.5">
                        /{item.slug}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-[var(--text-muted)] capitalize">
                      {item.type.replace('_', ' ')}
                    </td>

                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      <div className="font-medium text-[var(--text-primary)]">{item.author.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">{item.category}</div>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                      {new Date(item.updatedAt).toLocaleDateString()} {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigateTo('editor', { contentId: item.id })}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded transition-colors"
                          title="Open Editor"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTargetId(item.id);
                            setConfirmDeleteOpen(true);
                          }}
                          className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--bg-elevated)] rounded transition-colors"
                          title="Delete Content"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-[var(--border-main)] bg-[var(--bg-card-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="font-mono">
            Showing <span className="text-[var(--text-primary)]">{(result.page - 1) * result.pageSize + 1}</span> to{' '}
            <span className="text-[var(--text-primary)]">{Math.min(result.page * result.pageSize, result.total)}</span> of{' '}
            <span className="text-[var(--text-primary)]">{result.total}</span> records
          </div>

          <div className="flex items-center gap-1 font-mono">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">Page {currentPage} of {result.totalPages}</span>
            <button
              disabled={currentPage >= result.totalPages}
              onClick={() => setCurrentPage(p => Math.min(result.totalPages, p + 1))}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Content Record(s)"
        message="This action is permanent and will remove these records from all distribution channels and invalidation caches."
        confirmLabel="Permanently Delete"
        isDestructive
      />
    </div>
  );
};
