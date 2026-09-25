import React, { useState, useEffect } from 'react';
import { useCmsStore } from '../../stores/useCmsStore';
import { contentService } from '../../services/contentService';
import { activityService } from '../../services/activityService';
import { workflowService } from '../../services/workflowService';
import { ContentItem } from '../../types/content';
import { AuditLogEntry, MetricSummary } from '../../types/activity';
import { ReviewQueueItem } from '../../types/workflow';
import { StatusBadge } from '../../components/common/Badge';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  HardDrive, 
  Users, 
  ArrowUpRight, 
  Plus, 
  Upload, 
  GitPullRequest, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { navigateTo } = useCmsStore();
  const [metrics, setMetrics] = useState<MetricSummary | null>(null);
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [m, c, rq, l] = await Promise.all([
        activityService.getDashboardMetrics(),
        contentService.getAllContent({ pageSize: 5, sortBy: 'updatedAt' }),
        workflowService.getReviewQueue(),
        activityService.getAuditLogs()
      ]);
      setMetrics(m);
      setRecentContent(c.data);
      setReviewQueue(rq.slice(0, 4));
      setRecentLogs(l.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-[var(--bg-card)] rounded w-1/4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)]"></div>
          ))}
        </div>
      </div>
    );
  }

  // Calculated distributions
  const storagePercent = ((metrics.storageUsedBytes / metrics.storageTotalBytes) * 100).toFixed(1);
  const storageGbUsed = (metrics.storageUsedBytes / 1e9).toFixed(1);
  const storageGbTotal = (metrics.storageTotalBytes / 1e9).toFixed(0);

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Operations Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-main)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Publishing Operations & Governance
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Real-time status of content production pipelines, compliance review gates, and edge delivery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('editor', { contentId: null })}
            style={{ backgroundColor: 'var(--brand-primary)' }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:opacity-95 rounded text-xs font-medium transition-all shadow-xs border border-white/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Article</span>
          </button>
          <button
            onClick={() => navigateTo('media')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-main)] rounded text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Upload Media</span>
          </button>
          <button
            onClick={() => navigateTo('workflow')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-main)] rounded text-xs font-medium transition-colors"
          >
            <GitPullRequest className="w-3.5 h-3.5 text-amber-400" />
            <span>Review Queue</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (High density, bespoke top color accents) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Content */}
        <div 
          onClick={() => navigateTo('content')}
          className="p-4 bg-[var(--bg-card)] border border-[var(--border-main)] border-t-2 border-t-[var(--brand-accent)] hover:border-[var(--border-highlight)] rounded-lg cursor-pointer transition-all duration-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
            <span>Total Content Records</span>
            <FileText className="w-4 h-4 text-[var(--brand-text)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono tracking-tight text-[var(--text-primary)] tabular-nums">
              {metrics.totalContent}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center">
              +8 this week
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)] flex items-center gap-2">
            <span>{metrics.draftContent} Drafts</span>
            <span>·</span>
            <span className="text-[var(--text-primary)] font-semibold">{metrics.totalContent - metrics.draftContent} Released</span>
          </div>
        </div>

        {/* Pending Review */}
        <div 
          onClick={() => navigateTo('workflow')}
          className="p-4 bg-[var(--bg-card)] border border-[var(--border-main)] border-t-2 border-t-amber-400 hover:border-amber-500/50 rounded-lg cursor-pointer transition-all duration-200 shadow-xs group"
        >
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
            <span>Compliance Review Queue</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono tracking-tight text-amber-400 tabular-nums">
              {metrics.pendingReview}
            </span>
            <span className="text-[11px] text-amber-400/90 font-mono">
              Action Required
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors flex items-center justify-between">
            <span>View 2 urgent sign-offs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Scheduled Deployments */}
        <div 
          onClick={() => navigateTo('content', { subFilter: 'scheduled' })}
          className="p-4 bg-[var(--bg-card)] border border-[var(--border-main)] border-t-2 border-t-sky-400 hover:border-sky-500/50 rounded-lg cursor-pointer transition-all duration-200 shadow-xs group"
        >
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
            <span>Scheduled Releases</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono tracking-tight text-sky-400 tabular-nums">
              {metrics.scheduledContent}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              Across 3 regions
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors flex items-center justify-between">
            <span>Next: Kernel 4.12.0</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Storage & Assets */}
        <div 
          onClick={() => navigateTo('media')}
          className="p-4 bg-[var(--bg-card)] border border-[var(--border-main)] border-t-2 border-t-emerald-400 hover:border-[var(--border-highlight)] rounded-lg cursor-pointer transition-all duration-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
            <span>Media Storage Quota</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold font-mono tracking-tight text-[var(--text-primary)] tabular-nums">
              {storagePercent}%
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              {storageGbUsed} / {storageGbTotal} GB
            </span>
          </div>
          <div className="mt-2.5 w-full bg-[var(--bg-card-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${storagePercent}%` }} />
          </div>
        </div>
      </div>

      {/* Operational Sections: Content Pipeline Velocity & Review Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Review Queue (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden flex flex-col shadow-xs">
          <div className="px-5 py-3.5 border-b border-[var(--border-main)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-semibold text-[var(--text-primary)]">
                Pending Editorial & Compliance Review
              </h2>
            </div>
            <button
              onClick={() => navigateTo('workflow')}
              style={{ color: 'var(--brand-text)' }}
              className="text-[11px] hover:underline font-medium flex items-center gap-1"
            >
              <span>Full Queue ({reviewQueue.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[var(--border-subtle)] overflow-x-auto">
            {reviewQueue.map(item => (
              <div 
                key={item.id}
                onClick={() => navigateTo('editor', { contentId: item.content.id })}
                className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer flex items-start justify-between gap-4 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className="text-xs font-semibold text-[var(--text-primary)] transition-colors"
                    >
                      {item.content.title}
                    </span>
                    <StatusBadge status={item.status} />
                    {item.priority === 'urgent' && (
                      <span className="px-1.5 py-0.2 bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono rounded">
                        Urgent SLA
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">
                    {item.content.excerpt}
                  </p>

                  <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--text-muted)] font-mono">
                    <span>Submitted by {item.submittedBy.name}</span>
                    <span>·</span>
                    <span>Assignee: {item.assignedTo?.name || 'Unassigned'}</span>
                    {item.commentsCount > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-amber-400">{item.commentsCount} comments</span>
                      </>
                    )}
                  </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('editor', { contentId: item.content.id });
                  }}
                  className="px-2.5 py-1 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] bg-[var(--bg-elevated)] border border-[var(--border-main)] rounded transition-colors shrink-0"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Publishing Velocity & Status Distribution */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-5 flex flex-col justify-between space-y-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <h2 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Publishing Distribution
              </h2>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Production CDN</span>
            </div>

            {/* Distribution Bars */}
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span>Published & Live</span>
                  <span className="font-mono text-emerald-400">82%</span>
                </div>
                <div className="w-full bg-[var(--bg-card-subtle)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span>In Review / Draft</span>
                  <span className="font-mono text-amber-400">14%</span>
                </div>
                <div className="w-full bg-[var(--bg-card-subtle)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '14%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span>Scheduled Rollouts</span>
                  <span className="font-mono text-sky-400">4%</span>
                </div>
                <div className="w-full bg-[var(--bg-card-subtle)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <div className="bg-sky-400 h-full rounded-full" style={{ width: '4%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Callout */}
          <div className="p-3.5 rounded bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-xs space-y-2">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>Edge P99 Invalidation</span>
              <span className="font-mono text-[var(--text-primary)]">142ms</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>Active Multi-Tenant Roles</span>
              <span className="font-mono text-[var(--text-primary)]">7 system roles</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>Security Enclave 2FA</span>
              <span className="font-mono text-emerald-400">Enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Content Table & Audit Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Content Table (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-[var(--border-main)] bg-[var(--bg-card-subtle)] flex items-center justify-between">
            <h2 className="text-xs font-semibold text-[var(--text-primary)]">
              Recent Content Updates
            </h2>
            <button
              onClick={() => navigateTo('content')}
              style={{ color: 'var(--brand-text)' }}
              className="text-[11px] hover:underline font-medium"
            >
              Browse All Content →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border-main)] bg-[var(--bg-card-subtle)] text-[11px] text-[var(--text-muted)] uppercase font-mono tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Title</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Author</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {recentContent.map(item => (
                  <tr 
                    key={item.id}
                    onClick={() => navigateTo('editor', { contentId: item.id })}
                    className="hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)] max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] capitalize font-mono text-[11px]">
                      {item.type.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {item.author.name}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[var(--text-muted)] text-[11px] tabular-nums">
                      {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Immutable Audit Feed (1 col) */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-5 flex flex-col shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
            <h2 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <ShieldCheck 
                className="w-4 h-4"
                style={{ color: 'var(--brand-accent)' }}
              />
              Audit Log Stream
            </h2>
            <button
              onClick={() => navigateTo('activity')}
              style={{ color: 'var(--brand-text)' }}
              className="text-[11px] hover:underline"
            >
              Full Trail
            </button>
          </div>

          <div className="mt-3 space-y-3.5 flex-1">
            {recentLogs.map(log => (
              <div key={log.id} className="text-xs space-y-1">
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">{log.actor.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div 
                  className="text-[11px] font-mono"
                  style={{ color: 'var(--brand-text)' }}
                >
                  {log.action}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">
                  {log.resourceTitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
