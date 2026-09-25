import React from 'react';
import { ContentStatus } from '../../types/content';

interface StatusBadgeProps {
  status: ContentStatus | string;
  className?: string;
  showDot?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; dotColor: string; textColor: string; bgColor: string }> = {
  published: {
    label: 'Published',
    dotColor: 'bg-emerald-400',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20'
  },
  approved: {
    label: 'Approved',
    dotColor: 'bg-teal-400',
    textColor: 'text-teal-300',
    bgColor: 'bg-teal-500/10 border-teal-500/20'
  },
  scheduled: {
    label: 'Scheduled',
    dotColor: 'bg-blue-400',
    textColor: 'text-blue-300',
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  },
  in_review: {
    label: 'In Review',
    dotColor: 'bg-amber-400',
    textColor: 'text-amber-300',
    bgColor: 'bg-amber-500/10 border-amber-500/20'
  },
  changes_requested: {
    label: 'Changes Requested',
    dotColor: 'bg-orange-400',
    textColor: 'text-orange-300',
    bgColor: 'bg-orange-500/10 border-orange-500/20'
  },
  draft: {
    label: 'Draft',
    dotColor: 'bg-slate-400',
    textColor: 'text-slate-300',
    bgColor: 'bg-slate-500/10 border-slate-500/20'
  },
  archived: {
    label: 'Archived',
    dotColor: 'bg-zinc-500',
    textColor: 'text-zinc-400',
    bgColor: 'bg-zinc-500/10 border-zinc-500/20'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showDot = true }) => {
  const config = STATUS_CONFIG[status] || {
    label: status.replace(/_/g, ' '),
    dotColor: 'bg-slate-400',
    textColor: 'text-slate-300',
    bgColor: 'bg-slate-500/10 border-slate-500/20'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded border ${config.bgColor} ${config.textColor} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} aria-hidden="true" />}
      <span className="capitalize">{config.label}</span>
    </span>
  );
};
