import React from 'react';
import { useCmsStore, NavRoute } from '../../stores/useCmsStore';
import { 
  LayoutDashboard, 
  FileText, 
  Layers, 
  Image as ImageIcon, 
  FolderTree, 
  Menu as MenuIcon, 
  Users, 
  ShieldCheck, 
  GitPullRequest, 
  Activity, 
  Bell, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CheckCircle2,
  FileEdit,
  Archive
} from 'lucide-react';

interface NavItem {
  id: NavRoute;
  label: string;
  icon: React.ElementType;
  subFilter?: string;
  badge?: number | string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { 
    activeRoute, 
    contentSubFilter, 
    sidebarCollapsed, 
    toggleSidebar, 
    navigateTo, 
    unreadNotificationCount 
  } = useCmsStore();

  const navSections: NavSection[] = [
    {
      title: 'Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Content Engine',
      items: [
        { id: 'content', label: 'All Content', icon: FileText, subFilter: 'all' },
        { id: 'content', label: 'Drafts', icon: FileEdit, subFilter: 'draft', badge: '14' },
        { id: 'content', label: 'In Review', icon: Clock, subFilter: 'in_review', badge: '6' },
        { id: 'content', label: 'Scheduled', icon: Clock, subFilter: 'scheduled', badge: '5' },
        { id: 'content', label: 'Published', icon: CheckCircle2, subFilter: 'published' },
        { id: 'content', label: 'Archived', icon: Archive, subFilter: 'archived' }
      ]
    },
    {
      title: 'Architecture & Media',
      items: [
        { id: 'content-types', label: 'Content Models', icon: Layers },
        { id: 'media', label: 'Media Library', icon: ImageIcon },
        { id: 'pages', label: 'Pages & Hierarchy', icon: FolderTree },
        { id: 'navigation', label: 'Navigation Menus', icon: MenuIcon }
      ]
    },
    {
      title: 'Workflow & Team',
      items: [
        { id: 'workflow', label: 'Review Queue', icon: GitPullRequest, badge: '6' },
        { id: 'users', label: 'Team Directory', icon: Users },
        { id: 'roles', label: 'Roles & Access', icon: ShieldCheck },
        { id: 'activity', label: 'Audit Trail', icon: Activity }
      ]
    },
    {
      title: 'System',
      items: [
        { 
          id: 'notifications', 
          label: 'Notifications', 
          icon: Bell, 
          badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined 
        },
        { id: 'settings', label: 'Configuration', icon: Settings }
      ]
    }
  ];

  return (
    <aside 
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-main)] transition-all duration-200 select-none ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-[var(--border-main)] bg-[var(--bg-sidebar)]">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* Bespoke Geometric Architectural Logomark */}
            <div 
              className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs border border-white/20"
              style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))' }}
            >
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-semibold text-xs tracking-wider text-[var(--text-primary)] font-mono uppercase">
                DEV CMS
              </span>
              <span className="text-[9px] text-[var(--text-muted)] font-mono tracking-widest uppercase">
                Enterprise Core
              </span>
            </div>
          </div>
        )}

        {sidebarCollapsed && (
          <div 
            className="w-7 h-7 mx-auto rounded-md flex items-center justify-center text-white font-bold text-xs shadow-xs border border-white/20"
            style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))' }}
          >
            <Layers className="w-4 h-4 text-white" />
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-0.5">
            {!sidebarCollapsed && (
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                {section.title}
              </div>
            )}
            {section.items.map((item, itemIdx) => {
              const Icon = item.icon;
              const isContentRoute = item.id === 'content';
              const isActive = isContentRoute
                ? activeRoute === 'content' && (contentSubFilter === item.subFilter || (!item.subFilter && contentSubFilter === 'all'))
                : activeRoute === item.id;

              return (
                <button
                  key={itemIdx}
                  onClick={() => {
                    navigateTo(item.id, { subFilter: item.subFilter });
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                  style={isActive ? { 
                    backgroundColor: 'var(--brand-tint)', 
                    color: 'var(--brand-text)', 
                    borderColor: 'var(--brand-border)' 
                  } : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors group relative ${
                    isActive 
                      ? 'border font-medium shadow-2xs' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-transparent'
                  }`}
                >
                  <Icon 
                    className="w-4 h-4 shrink-0 transition-colors" 
                    style={{ color: isActive ? 'var(--brand-text)' : undefined }}
                  />
                  
                  {!sidebarCollapsed && (
                    <span className="truncate flex-1 text-left">
                      {item.label}
                    </span>
                  )}

                  {!sidebarCollapsed && item.badge && (
                    <span 
                      style={isActive ? { 
                        backgroundColor: 'var(--brand-tint)', 
                        color: 'var(--brand-text)' 
                      } : undefined}
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isActive 
                          ? 'border border-[var(--brand-border)]' 
                          : typeof item.badge === 'number' && item.badge > 0
                            ? 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-semibold'
                            : 'text-[var(--text-muted)] bg-[var(--bg-card)]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {sidebarCollapsed && item.badge && (
                    <span 
                      className="absolute top-1 right-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--brand-primary)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-[var(--border-main)] bg-[var(--bg-sidebar)] text-[11px] text-[var(--text-muted)] flex items-center justify-between font-mono">
          <span>v4.12.0-ent</span>
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Cluster Synced
          </span>
        </div>
      )}
    </aside>
  );
};
