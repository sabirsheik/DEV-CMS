import { create } from 'zustand';
import { UserItem, UserRole } from '../types/user';
import { NotificationItem } from '../types/notification';
import { INITIAL_USERS, INITIAL_NOTIFICATIONS } from '../services/mockData';

export type NavRoute = 
  | 'dashboard'
  | 'content'
  | 'editor'
  | 'content-types'
  | 'media'
  | 'pages'
  | 'navigation'
  | 'users'
  | 'roles'
  | 'workflow'
  | 'activity'
  | 'notifications'
  | 'settings';

export type ThemeId = 'teal' | 'cobalt' | 'copper' | 'light';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  accentHex: string;
  bgHex: string;
}

export const THEME_OPTIONS: ThemeConfig[] = [
  {
    id: 'teal',
    name: 'Verdant Obsidian',
    tagline: 'Deep Petrol & Emerald Mint',
    accentHex: '#0d9488',
    bgHex: '#070c14'
  },
  {
    id: 'cobalt',
    name: 'Midnight Cobalt',
    tagline: 'Deep Navy & Electric Azure',
    accentHex: '#2563eb',
    bgHex: '#070b16'
  },
  {
    id: 'copper',
    name: 'Warm Copper',
    tagline: 'Titanium Slate & Editorial Amber',
    accentHex: '#d97706',
    bgHex: '#0d0e12'
  },
  {
    id: 'light',
    name: 'Swiss Studio',
    tagline: 'Daylight High-Contrast Pure White',
    accentHex: '#0f766e',
    bgHex: '#f8fafc'
  }
];

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
}

interface CmsState {
  // Navigation & View
  activeRoute: NavRoute;
  contentSubFilter?: string; // e.g. 'all' | 'draft' | 'in_review' | 'published' | 'scheduled' | 'archived'
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;

  // Active Editor State
  editingContentId: string | null;
  newContentType: string;

  // Active User & Permissions
  currentUser: UserItem;
  allUsers: UserItem[];

  // Workspace
  currentWorkspace: string;
  availableWorkspaces: string[];

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;

  // Global Toast
  toasts: ToastMessage[];

  // Theme & Appearance
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;

  // Actions
  navigateTo: (route: NavRoute, options?: { contentId?: string | null; subFilter?: string; contentType?: string }) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  switchUserRole: (role: UserRole) => void;
  setCurrentUser: (user: UserItem) => void;
  switchWorkspace: (org: string) => void;
  
  // Notification actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt'>) => void;

  // Toast actions
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const useCmsStore = create<CmsState>((set, get) => ({
  activeRoute: 'dashboard',
  contentSubFilter: 'all',
  sidebarCollapsed: false,
  commandPaletteOpen: false,

  editingContentId: null,
  newContentType: 'article',

  currentUser: INITIAL_USERS[0], // Sarah Chen (Super Admin)
  allUsers: INITIAL_USERS,

  currentWorkspace: 'DEV CMS Global Workspace',
  availableWorkspaces: [
    'DEV CMS Global Workspace',
    'Apex Financial Portal Project',
    'Developer Documentation Enclave'
  ],

  notifications: INITIAL_NOTIFICATIONS,
  unreadNotificationCount: INITIAL_NOTIFICATIONS.filter(n => !n.read).length,

  toasts: [],

  theme: 'teal',
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      try {
        localStorage.setItem('kinetix_theme', theme);
      } catch (e) {
        // ignore
      }
    }
    const themeObj = THEME_OPTIONS.find(t => t.id === theme);
    get().showToast({
      type: 'info',
      title: `Theme: ${themeObj?.name || theme}`,
      message: `${themeObj?.tagline} color scheme applied`
    });
  },

  navigateTo: (route, options) => {
    set({
      activeRoute: route,
      editingContentId: options?.contentId !== undefined ? options.contentId : get().editingContentId,
      contentSubFilter: options?.subFilter !== undefined ? options.subFilter : 'all',
      newContentType: options?.contentType || get().newContentType
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  switchUserRole: (role) => {
    const userWithRole = get().allUsers.find(u => u.role === role) || {
      ...get().currentUser,
      role
    };
    set({ currentUser: userWithRole });
    get().showToast({
      type: 'info',
      title: `Switched Persona to ${role.replace('_', ' ').toUpperCase()}`,
      message: `Simulating access policies for ${userWithRole.name} (${userWithRole.title})`
    });
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  switchWorkspace: (org) => {
    set({ currentWorkspace: org });
    get().showToast({
      type: 'info',
      title: 'Switched Workspace',
      message: `Active environment: ${org}`
    });
  },

  markNotificationAsRead: (id) => {
    set(state => {
      const updated = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
      return {
        notifications: updated,
        unreadNotificationCount: updated.filter(n => !n.read).length
      };
    });
  },

  markAllNotificationsAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadNotificationCount: 0
    }));
  },

  addNotification: (notif) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    set(state => {
      const list = [newNotif, ...state.notifications];
      return {
        notifications: list,
        unreadNotificationCount: list.filter(n => !n.read).length
      };
    });
  },

  showToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    set(state => ({ toasts: [...state.toasts, newToast] }));
    const dur = toast.duration || 4000;
    setTimeout(() => {
      get().dismissToast(id);
    }, dur);
  },

  dismissToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  }
}));
