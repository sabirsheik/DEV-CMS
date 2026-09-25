import React, { useState } from 'react';
import { useCmsStore } from '../../stores/useCmsStore';
import { NotificationType, NotificationItem } from '../../types/notification';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  GitPullRequest, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  UserPlus, 
  SlidersHorizontal 
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    unreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    navigateTo 
  } = useCmsStore();

  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifs = notifications.filter(n => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return n.type === filterType;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'review_requested':
        return <GitPullRequest className="w-4 h-4 text-amber-400" />;
      case 'content_published':
      case 'scheduled_published':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'changes_requested':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'user_invited':
        return <UserPlus className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Notification & Event Center</span>
            {unreadNotificationCount > 0 && (
              <span className="text-xs font-mono font-normal text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                {unreadNotificationCount} unread
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed for editorial review requests, pipeline status changes, and tenant events.
          </p>
        </div>

        {unreadNotificationCount > 0 && (
          <button
            onClick={() => markAllNotificationsAsRead()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilterType('unread')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            filterType === 'unread' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Unread Only
        </button>
        <button
          onClick={() => setFilterType('review_requested')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            filterType === 'review_requested' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Review Requests
        </button>
        <button
          onClick={() => setFilterType('content_published')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            filterType === 'content_published' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Published Releases
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-[#0f172a]/60 border border-slate-800 rounded-lg divide-y divide-slate-800/80 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No notifications match your current filter criteria.
          </div>
        ) : (
          filteredNotifs.map(n => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`p-4 flex items-start gap-4 transition-colors cursor-pointer hover:bg-slate-800/40 ${
                !n.read ? 'bg-blue-950/15' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-100">{n.title}</span>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                    {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {n.message}
                </p>

                {n.linkUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo('workflow');
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 mt-2 font-medium"
                  >
                    View in Review Queue →
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
