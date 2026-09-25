import { AuditLogEntry, MetricSummary } from '../types/activity';
import { INITIAL_AUDIT_LOGS, INITIAL_METRICS } from './mockData';

const STORAGE_KEY_AUDIT = 'kinetix_cms_audit_logs';

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

let auditStore: AuditLogEntry[] = loadFromStorage(STORAGE_KEY_AUDIT, INITIAL_AUDIT_LOGS);
const delay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));

export const activityService = {
  async getAuditLogs(filter?: { action?: string; resourceType?: string; search?: string }): Promise<AuditLogEntry[]> {
    await delay(60);
    let logs = [...auditStore];
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      logs = logs.filter(l => 
        l.resourceTitle.toLowerCase().includes(q) ||
        l.actor.name.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
      );
    }
    if (filter?.action && filter.action !== 'all') {
      logs = logs.filter(l => l.action === filter.action);
    }
    if (filter?.resourceType && filter.resourceType !== 'all') {
      logs = logs.filter(l => l.resourceType === filter.resourceType);
    }
    return logs;
  },

  async logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress' | 'userAgent'>): Promise<AuditLogEntry> {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      ipAddress: '192.0.2.45',
      userAgent: 'DEV CMS Console/4.12'
    };
    auditStore.unshift(newEntry);
    saveToStorage(STORAGE_KEY_AUDIT, auditStore);
    return newEntry;
  },

  async getDashboardMetrics(): Promise<MetricSummary> {
    await delay(70);
    return { ...INITIAL_METRICS };
  }
};
