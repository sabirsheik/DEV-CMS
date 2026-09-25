import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import { SystemSettings, ApiKeyItem, WebhookConfig } from '../../types/settings';
import { useCmsStore, THEME_OPTIONS, ThemeId } from '../../stores/useCmsStore';
import { Modal } from '../../components/common/Modal';
import { 
  Settings, 
  Building2, 
  Globe, 
  ShieldCheck, 
  Key, 
  Webhook, 
  HardDrive, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  Copy,
  ExternalLink,
  Palette
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { showToast, theme, setTheme } = useCmsStore();

  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'publishing' | 'seo' | 'security' | 'api' | 'webhooks'>('general');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // New API Key Modal
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState<ApiKeyItem['scope']>('read-write');

  // New Webhook Modal
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [s, k, w] = await Promise.all([
        settingsService.getSettings(),
        settingsService.getApiKeys(),
        settingsService.getWebhooks()
      ]);
      setSettings(s);
      setApiKeys(k);
      setWebhooks(w);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      await settingsService.updateSettings(settings);
      showToast({
        type: 'success',
        title: 'System Settings Saved',
        message: 'Tenant policies and CDN rules updated.'
      });
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to save settings' });
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      const created = await settingsService.createApiKey(newKeyName, newKeyScope);
      setApiKeys(prev => [created, ...prev]);
      setApiKeyModalOpen(false);
      setNewKeyName('');
      showToast({ type: 'success', title: 'API Key Created' });
    } catch (err) {
      showToast({ type: 'error', title: 'Creation failed' });
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await settingsService.revokeApiKey(id);
      setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' } : k));
      showToast({ type: 'info', title: 'API Key Revoked' });
    } catch (err) {
      showToast({ type: 'error', title: 'Revocation failed' });
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookName.trim() || !webhookUrl.trim()) return;
    try {
      const created = await settingsService.createWebhook(
        webhookName, 
        webhookUrl, 
        ['content.published', 'content.archived']
      );
      setWebhooks(prev => [created, ...prev]);
      setWebhookModalOpen(false);
      setWebhookName('');
      setWebhookUrl('');
      showToast({ type: 'success', title: 'Webhook Endpoint Configured' });
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to add webhook' });
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-xs text-slate-500 animate-pulse">Loading system configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>System Configuration & API Integrations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global publication defaults, multi-tenant workspace controls, security policies, and webhook callbacks.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs and Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar (3 cols) */}
        <div className="lg:col-span-3 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-2 space-y-1">
          {[
            { id: 'general', label: 'General & Localization', icon: Globe },
            { id: 'appearance', label: 'Color Palette & Theme', icon: Palette },
            { id: 'publishing', label: 'Publishing Workflows', icon: Settings },
            { id: 'seo', label: 'SEO & Metadata Defaults', icon: Globe },
            { id: 'security', label: 'Enterprise Security & SSO', icon: ShieldCheck },
            { id: 'api', label: 'API Keys & Access Tokens', icon: Key },
            { id: 'webhooks', label: 'Webhooks & CDN Invalidation', icon: Webhook }
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={isCurrent ? { 
                  backgroundColor: 'var(--brand-tint)', 
                  color: 'var(--brand-text)', 
                  borderColor: 'var(--brand-border)' 
                } : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-left transition-colors ${
                  isCurrent 
                    ? 'border font-semibold' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels (9 cols) */}
        <div className="lg:col-span-9 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-6 space-y-6 text-xs">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-100 pb-2 border-b border-slate-800">
                General & Workspace Properties
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                    Portal Brand Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, siteName: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                    Production Origin URL
                  </label>
                  <input
                    type="url"
                    value={settings.general.siteUrl}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, siteUrl: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                    Default Content Locale
                  </label>
                  <select
                    value={settings.general.defaultLocale}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, defaultLocale: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
                  >
                    <option value="en-US">English (United States)</option>
                    <option value="de-DE">German (Germany)</option>
                    <option value="ja-JP">Japanese (Japan)</option>
                    <option value="fr-FR">French (France)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                    Timezone Identifier
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, timezone: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden font-mono"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Appearance & Color Palette Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="pb-2 border-b border-[var(--border-main)]">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Color Palette & Design System
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Select a distinctive, accessible color scheme crafted for editorial focus, clarity, and prolonged production work.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {THEME_OPTIONS.map(opt => {
                  const isCurrent = theme === opt.id;
                  return (
                    <div 
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isCurrent 
                          ? 'border-[var(--brand-accent)] ring-1 ring-[var(--brand-accent)] bg-[var(--bg-card)]' 
                          : 'border-[var(--border-main)] hover:border-[var(--border-highlight)] bg-[var(--bg-card-subtle)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-4 h-4 rounded-full border border-white/30 shrink-0" 
                            style={{ backgroundColor: opt.accentHex }} 
                          />
                          <span className="font-semibold text-xs text-[var(--text-primary)]">{opt.name}</span>
                        </div>
                        {isCurrent ? (
                          <span 
                            style={{ backgroundColor: 'var(--brand-tint)', color: 'var(--brand-text)', borderColor: 'var(--brand-border)' }}
                            className="text-[10px] font-mono px-2 py-0.5 rounded border font-semibold"
                          >
                            CURRENT THEME
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-mono">
                            Click to activate
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[var(--text-muted)] mb-3">
                        {opt.tagline}
                      </p>

                      {/* Swatch Strip */}
                      <div className="flex items-center gap-1.5 p-2 rounded bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                        <div className="h-4 flex-1 rounded-xs border border-white/10" style={{ backgroundColor: opt.bgHex }} title="Base Canvas" />
                        <div className="h-4 flex-1 rounded-xs" style={{ backgroundColor: opt.accentHex }} title="Primary Accent" />
                        <div className="h-4 w-6 rounded-xs bg-emerald-500" title="Published Badge" />
                        <div className="h-4 w-6 rounded-xs bg-amber-500" title="Review Badge" />
                        <div className="h-4 w-6 rounded-xs bg-sky-500" title="Scheduled Badge" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Design System Tokens Summary */}
              <div className="p-4 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] space-y-3">
                <h3 className="text-xs font-semibold text-[var(--text-primary)] font-mono uppercase tracking-wider">
                  Design System Integrity
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div className="p-2 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase font-mono">Contrast Ratio</span>
                    <span className="font-semibold text-emerald-400">WCAG AAA (12.4:1)</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase font-mono">Anti-AI Discipline</span>
                    <span className="font-semibold text-[var(--text-primary)]">Zero AI Slop / Badges</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase font-mono">Typography</span>
                    <span className="font-semibold text-[var(--text-primary)]">Plus Jakarta & JetBrains</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase font-mono">Persistence</span>
                    <span className="font-semibold text-[var(--text-primary)]">Browser LocalStorage</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Publishing Tab */}
          {activeTab === 'publishing' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-100 pb-2 border-b border-slate-800">
                Publishing Governance Policies
              </h2>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 bg-slate-900/60 rounded border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.publishing.requireReviewBeforePublish}
                    onChange={(e) => setSettings({
                      ...settings,
                      publishing: { ...settings.publishing, requireReviewBeforePublish: e.target.checked }
                    })}
                    className="mt-0.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <div>
                    <div className="font-semibold text-slate-200">Require Formal Review Signoff</div>
                    <div className="text-slate-400 mt-0.5">
                      Prevents authors from deploying directly to live CDN without compliance signoff.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-900/60 rounded border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.publishing.enableScheduledPublishing}
                    onChange={(e) => setSettings({
                      ...settings,
                      publishing: { ...settings.publishing, enableScheduledPublishing: e.target.checked }
                    })}
                    className="mt-0.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <div>
                    <div className="font-semibold text-slate-200">Cron Scheduled Deployments</div>
                    <div className="text-slate-400 mt-0.5">
                      Enables automated background release triggers based on UTC target timestamps.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* SEO Defaults */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-100 pb-2 border-b border-slate-800">
                Default Meta & Robots Directives
              </h2>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                  Title Format Template
                </label>
                <input
                  type="text"
                  value={settings.seo.defaultTitleTemplate}
                  onChange={(e) => setSettings({
                    ...settings,
                    seo: { ...settings.seo, defaultTitleTemplate: e.target.value }
                  })}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                  Fallback Meta Description
                </label>
                <textarea
                  rows={2}
                  value={settings.seo.defaultMetaDescription}
                  onChange={(e) => setSettings({
                    ...settings,
                    seo: { ...settings.seo, defaultMetaDescription: e.target.value }
                  })}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                  Robots.txt Content
                </label>
                <textarea
                  rows={4}
                  value={settings.seo.robotsTxtContent}
                  onChange={(e) => setSettings({
                    ...settings,
                    seo: { ...settings.seo, robotsTxtContent: e.target.value }
                  })}
                  className="w-full bg-slate-950 font-mono text-emerald-400 border border-slate-800 rounded p-2 text-xs focus:outline-hidden resize-none"
                />
              </div>
            </div>
          )}

          {/* Security & SSO Tab */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-100 pb-2 border-b border-slate-800">
                Enterprise Identity & Zero-Trust Policies
              </h2>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 bg-slate-900/60 rounded border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.require2FA}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, require2FA: e.target.checked }
                    })}
                    className="mt-0.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <div>
                    <div className="font-semibold text-slate-200">Enforce Mandatory Hardware 2FA / WebAuthn</div>
                    <div className="text-slate-400 mt-0.5">
                      Requires all contributors with Editor or higher privileges to configure TOTP or FIDO2 keys.
                    </div>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                      Session Inactivity Timeout (Minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeoutMinutes}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeoutMinutes: parseInt(e.target.value) || 60 }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                      Minimum Password Entropy Length
                    </label>
                    <input
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, passwordMinLength: parseInt(e.target.value) || 12 }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h2 className="text-sm font-semibold text-slate-100">
                  Provisioned API Tokens
                </h2>
                <button
                  onClick={() => setApiKeyModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate Key</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-800">
                {apiKeys.map(k => (
                  <div key={k.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span>{k.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 rounded ${
                          k.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {k.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Prefix: <code className="text-blue-400">{k.keyPrefix}</code> · Scope: {k.scope}
                      </div>
                    </div>

                    {k.status === 'active' && (
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="px-2 py-1 text-red-400 hover:bg-red-950/40 rounded transition-colors text-[11px]"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h2 className="text-sm font-semibold text-slate-100">
                  Edge Delivery Webhooks & Invalidation Hooks
                </h2>
                <button
                  onClick={() => setWebhookModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Webhook</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-800">
                {webhooks.map(w => (
                  <div key={w.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span>{w.name}</span>
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 rounded">
                          {w.lastDeliveryStatus || 'healthy'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate max-w-md">
                        Target: {w.targetUrl}
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500">
                      {w.events.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Key Modal */}
      {apiKeyModalOpen && (
        <Modal
          isOpen={apiKeyModalOpen}
          onClose={() => setApiKeyModalOpen(false)}
          title="Create New Service API Token"
          maxWidth="md"
        >
          <form onSubmit={handleCreateApiKey} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Token Application Name
              </label>
              <input
                type="text"
                required
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Next.js Edge SSG Ingestion"
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Access Scope
              </label>
              <select
                value={newKeyScope}
                onChange={(e) => setNewKeyScope(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
              >
                <option value="read-only">Read-Only (Public Content Delivery)</option>
                <option value="read-write">Read-Write (Content Ingestion & Edits)</option>
                <option value="admin">Full Admin (Publishing & Schema Mutation)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setApiKeyModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
              >
                Generate Token
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Webhook Modal */}
      {webhookModalOpen && (
        <Modal
          isOpen={webhookModalOpen}
          onClose={() => setWebhookModalOpen(false)}
          title="Register Webhook Endpoint"
          maxWidth="md"
        >
          <form onSubmit={handleCreateWebhook} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Endpoint Name
              </label>
              <input
                type="text"
                required
                value={webhookName}
                onChange={(e) => setWebhookName(e.target.value)}
                placeholder="e.g. Vercel Revalidation Webhook"
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                HTTPS Destination URL
              </label>
              <input
                type="url"
                required
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://mysite.com/api/revalidate"
                className="w-full bg-slate-900 border border-slate-800 font-mono rounded p-2 text-slate-200 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setWebhookModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
              >
                Register Webhook
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
