import { SystemSettings, ApiKeyItem, WebhookConfig } from '../types/settings';
import { NavigationMenu, CmsPageItem } from '../types/navigation';
import { 
  INITIAL_SETTINGS, 
  INITIAL_API_KEYS, 
  INITIAL_WEBHOOKS, 
  INITIAL_PAGES, 
  INITIAL_MENUS 
} from './mockData';

const STORAGE_KEY_SETTINGS = 'kinetix_cms_settings';
const STORAGE_KEY_KEYS = 'kinetix_cms_api_keys';
const STORAGE_KEY_WEBHOOKS = 'kinetix_cms_webhooks';
const STORAGE_KEY_PAGES = 'kinetix_cms_pages';
const STORAGE_KEY_MENUS = 'kinetix_cms_menus';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

let settingsStore: SystemSettings = loadFromStorage(STORAGE_KEY_SETTINGS, INITIAL_SETTINGS);
let apiKeysStore: ApiKeyItem[] = loadFromStorage(STORAGE_KEY_KEYS, INITIAL_API_KEYS);
let webhooksStore: WebhookConfig[] = loadFromStorage(STORAGE_KEY_WEBHOOKS, INITIAL_WEBHOOKS);
let pagesStore: CmsPageItem[] = loadFromStorage(STORAGE_KEY_PAGES, INITIAL_PAGES);
let menusStore: NavigationMenu[] = loadFromStorage(STORAGE_KEY_MENUS, INITIAL_MENUS);

const delay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));

export const settingsService = {
  async getSettings(): Promise<SystemSettings> {
    await delay(50);
    return JSON.parse(JSON.stringify(settingsStore));
  },

  async updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    await delay(80);
    settingsStore = {
      ...settingsStore,
      ...updates
    };
    saveToStorage(STORAGE_KEY_SETTINGS, settingsStore);
    return settingsStore;
  },

  async getApiKeys(): Promise<ApiKeyItem[]> {
    await delay(40);
    return [...apiKeysStore];
  },

  async createApiKey(name: string, scope: ApiKeyItem['scope']): Promise<ApiKeyItem> {
    await delay(80);
    const newKey: ApiKeyItem = {
      id: `key-${Date.now().toString().slice(-4)}`,
      name,
      keyPrefix: `knx_${scope.slice(0, 3)}_${Math.random().toString(36).slice(2, 8)}...`,
      scope,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    apiKeysStore.unshift(newKey);
    saveToStorage(STORAGE_KEY_KEYS, apiKeysStore);
    return newKey;
  },

  async revokeApiKey(id: string): Promise<void> {
    await delay(60);
    apiKeysStore = apiKeysStore.map(k => k.id === id ? { ...k, status: 'revoked' } : k);
    saveToStorage(STORAGE_KEY_KEYS, apiKeysStore);
  },

  async getWebhooks(): Promise<WebhookConfig[]> {
    await delay(40);
    return [...webhooksStore];
  },

  async createWebhook(name: string, targetUrl: string, events: string[]): Promise<WebhookConfig> {
    await delay(80);
    const newWebhook: WebhookConfig = {
      id: `wh-${Date.now().toString().slice(-4)}`,
      name,
      targetUrl,
      secret: `whsec_${Math.random().toString(36).slice(2, 10)}`,
      events,
      enabled: true,
      createdAt: new Date().toISOString()
    };
    webhooksStore.unshift(newWebhook);
    saveToStorage(STORAGE_KEY_WEBHOOKS, webhooksStore);
    return newWebhook;
  },

  async toggleWebhook(id: string): Promise<WebhookConfig> {
    await delay(50);
    const idx = webhooksStore.findIndex(w => w.id === id);
    if (idx === -1) throw new Error('Webhook not found');
    webhooksStore[idx].enabled = !webhooksStore[idx].enabled;
    saveToStorage(STORAGE_KEY_WEBHOOKS, webhooksStore);
    return webhooksStore[idx];
  },

  // Pages
  async getPages(): Promise<CmsPageItem[]> {
    await delay(50);
    return [...pagesStore];
  },

  async createPage(page: Omit<CmsPageItem, 'id' | 'updatedAt'>): Promise<CmsPageItem> {
    await delay(80);
    const newPage: CmsPageItem = {
      ...page,
      id: `pg-${Date.now().toString().slice(-4)}`,
      updatedAt: new Date().toISOString()
    };
    pagesStore.push(newPage);
    saveToStorage(STORAGE_KEY_PAGES, pagesStore);
    return newPage;
  },

  // Navigation Menus
  async getMenus(): Promise<NavigationMenu[]> {
    await delay(50);
    return [...menusStore];
  },

  async updateMenu(menuId: string, items: NavigationMenu['items']): Promise<NavigationMenu> {
    await delay(70);
    const idx = menusStore.findIndex(m => m.id === menuId);
    if (idx === -1) throw new Error('Menu not found');
    menusStore[idx].items = items;
    menusStore[idx].updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEY_MENUS, menusStore);
    return menusStore[idx];
  }
};
