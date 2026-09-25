import React, { useState, useRef, useEffect } from 'react';
import { useCmsStore, THEME_OPTIONS, ThemeId } from '../../stores/useCmsStore';
import { UserRole } from '../../types/user';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Building2, 
  Plus, 
  Shield, 
  Check, 
  Palette,
  Sun,
  Moon
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const { 
    activeRoute, 
    contentSubFilter, 
    sidebarCollapsed, 
    currentUser, 
    switchUserRole,
    currentWorkspace, 
    availableWorkspaces, 
    switchWorkspace, 
    setCommandPaletteOpen,
    unreadNotificationCount,
    navigateTo,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    theme,
    setTheme
  } = useCmsStore();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const wsRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wsRef.current && !wsRef.current.contains(e.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifMenuOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'super_admin', label: 'Super Admin', desc: 'Full root privileges & schema mutation' },
    { id: 'admin', label: 'Administrator', desc: 'Content, media & user administration' },
    { id: 'editor', label: 'Managing Editor', desc: 'Draft approvals & workflow direction' },
    { id: 'author', label: 'Author / Writer', desc: 'Draft authoring & revisions' },
    { id: 'reviewer', label: 'Compliance Reviewer', desc: 'Legal signoff & change requests' },
    { id: 'publisher', label: 'Release Publisher', desc: 'Deployment & scheduling to edge CDN' },
    { id: 'viewer', label: 'Read-Only Viewer', desc: 'Audit observer' }
  ];

  const getBreadcrumbs = () => {
    switch (activeRoute) {
      case 'dashboard':
        return ['Operations', 'Dashboard'];
      case 'content':
        return ['Editorial Engine', contentSubFilter ? `Content (${contentSubFilter.replace('_', ' ')})` : 'All Content'];
      case 'editor':
        return ['Editorial Engine', 'Editor Workspace'];
      case 'content-types':
        return ['Architecture', 'Content Models & Schemas'];
      case 'media':
        return ['Assets', 'Media Asset Library'];
      case 'pages':
        return ['Structure', 'Pages & Hierarchy'];
      case 'navigation':
        return ['Structure', 'Navigation Menus'];
      case 'workflow':
        return ['Editorial Engine', 'Workflow & Review Queue'];
      case 'users':
        return ['Governance', 'Team Directory & Access'];
      case 'roles':
        return ['Governance', 'Roles & Permission Matrix'];
      case 'activity':
        return ['Governance', 'Immutable Audit Logs'];
      case 'notifications':
        return ['System', 'Notification Center'];
      case 'settings':
        return ['System', 'Enterprise Configuration'];
      default:
        return ['DEV CMS', 'Console'];
    }
  };

  const breadcrumbs = getBreadcrumbs();
  const currentThemeConfig = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0];

  return (
    <header 
      className={`fixed top-0 right-0 z-20 h-14 bg-[var(--bg-topbar)] backdrop-blur-md border-b border-[var(--border-main)] flex items-center justify-between px-6 transition-all duration-200 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      {/* Zone 1: Workspace selector & Contextual Breadcrumb */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Workspace Dropdown */}
        <div className="relative" ref={wsRef}>
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-main)] text-xs font-medium text-[var(--text-primary)] hover:border-[var(--border-highlight)] transition-colors"
          >
            <Building2 
              className="w-3.5 h-3.5"
              style={{ color: 'var(--brand-accent)' }}
            />
            <span className="truncate max-w-[140px] md:max-w-[200px]">{currentWorkspace}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-72 bg-[var(--bg-elevated)] border border-[var(--border-main)] rounded-lg shadow-xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono">
                Select Workspace
              </div>
              {availableWorkspaces.map(ws => (
                <button
                  key={ws}
                  onClick={() => {
                    switchWorkspace(ws);
                    setWorkspaceMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left rounded text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <span className="truncate">{ws}</span>
                  {ws === currentWorkspace && (
                    <Check 
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: 'var(--brand-text)' }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Breadcrumb separator & Trail */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
          <span>/</span>
          <span>{breadcrumbs[0]}</span>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-medium">{breadcrumbs[1]}</span>
        </div>
      </div>

      {/* Zone 2: Global Search Command Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-main)] hover:border-[var(--border-highlight)] rounded text-xs text-[var(--text-secondary)] transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
            <span>Search content, media, schema...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-card-subtle)] text-[var(--text-muted)] rounded border border-[var(--border-subtle)]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions, Palette Switcher, Persona Switcher, Notifications, Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick New Content Button */}
        <button
          onClick={() => navigateTo('editor', { contentId: null })}
          style={{ backgroundColor: 'var(--brand-primary)' }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:opacity-95 rounded text-xs font-medium transition-all shadow-xs border border-white/10"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Content</span>
        </button>

        {/* Color Palette Switcher */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--border-highlight)] text-xs text-[var(--text-primary)] transition-colors"
            title="Switch Curated Palette"
          >
            <div 
              className="w-3 h-3 rounded-full border border-white/30 shrink-0" 
              style={{ backgroundColor: currentThemeConfig.accentHex }}
            />
            <span className="font-medium hidden md:inline">{currentThemeConfig.name}</span>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
          </button>

          {themeMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-[var(--bg-elevated)] border border-[var(--border-main)] rounded-lg shadow-xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Color Palette & Theme</span>
                <Palette className="w-3 h-3 text-[var(--text-muted)]" />
              </div>
              <div className="space-y-1 mt-1">
                {THEME_OPTIONS.map(opt => {
                  const isSelected = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id);
                        setThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 text-left rounded transition-colors ${
                        isSelected 
                          ? 'bg-[var(--bg-card-hover)] border border-[var(--brand-border)]' 
                          : 'hover:bg-[var(--bg-card-hover)] border border-transparent'
                      }`}
                    >
                      {/* Swatch circle with border */}
                      <div 
                        className="w-4 h-4 rounded-full border border-white/40 shrink-0 shadow-xs" 
                        style={{ backgroundColor: opt.accentHex }} 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[var(--text-primary)] flex items-center justify-between">
                          <span>{opt.name}</span>
                          {isSelected && (
                            <Check 
                              className="w-3.5 h-3.5 shrink-0" 
                              style={{ color: 'var(--brand-text)' }} 
                            />
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate">
                          {opt.tagline}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Persona / Role Simulator */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--border-highlight)] text-xs text-[var(--text-primary)] transition-colors"
            title="Switch Simulated Role"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize font-mono hidden sm:inline">{currentUser.role.replace('_', ' ')}</span>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-[var(--bg-elevated)] border border-[var(--border-main)] rounded-lg shadow-xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono">
                Simulate Role Permissions
              </div>
              <div className="space-y-0.5 max-h-64 overflow-y-auto">
                {roles.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      switchUserRole(r.id);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-start gap-2.5 px-2.5 py-2 text-left rounded transition-colors ${
                      currentUser.role === r.id ? 'bg-[var(--bg-card-hover)] text-[var(--brand-text)]' : 'hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold capitalize flex items-center justify-between text-[var(--text-primary)]">
                        <span>{r.label}</span>
                        {currentUser.role === r.id && (
                          <Check 
                            className="w-3.5 h-3.5 shrink-0" 
                            style={{ color: 'var(--brand-text)' }}
                          />
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span 
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-[var(--bg-topbar)]" 
                style={{ backgroundColor: 'var(--brand-accent)' }}
              />
            )}
          </button>

          {notifMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-[var(--bg-elevated)] border border-[var(--border-main)] rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-main)] bg-[var(--bg-card)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span 
                      style={{ backgroundColor: 'var(--brand-tint)', color: 'var(--brand-text)' }}
                      className="px-1.5 py-0.2 text-[10px] font-mono rounded"
                    >
                      {unreadNotificationCount} new
                    </span>
                  )}
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsAsRead()}
                    style={{ color: 'var(--brand-text)' }}
                    className="text-[11px] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-subtle)]">
                {notifications.slice(0, 5).map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className="p-3 text-xs transition-colors cursor-pointer hover:bg-[var(--bg-card-hover)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                        {!n.read && (
                          <span 
                            className="w-1.5 h-1.5 rounded-full inline-block" 
                            style={{ backgroundColor: 'var(--brand-accent)' }}
                          />
                        )}
                        <span>{n.title}</span>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[var(--text-secondary)] mt-1 text-[11px] leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-[var(--border-main)] bg-[var(--bg-card)] text-center">
                <button
                  onClick={() => {
                    setNotifMenuOpen(false);
                    navigateTo('notifications');
                  }}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
                >
                  View all notification history →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Menu */}
        <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-main)]">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-[var(--bg-card)] border border-[var(--border-main)]">
            {currentUser.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-[var(--text-primary)]">
                {currentUser.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-medium text-[var(--text-primary)] leading-tight truncate max-w-[120px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono leading-tight truncate max-w-[120px]">
              {currentUser.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
