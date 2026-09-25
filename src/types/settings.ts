export interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    defaultLocale: string;
    supportedLocales: string[];
    timezone: string;
    dateFormat: string;
  };
  workspace: {
    orgName: string;
    orgSlug: string;
    billingTier: 'Enterprise' | 'Scale' | 'Team';
    enforceSso: boolean;
    domainAllowlist: string[];
  };
  publishing: {
    requireReviewBeforePublish: boolean;
    autoArchiveDays: number;
    enableScheduledPublishing: boolean;
    slugAutoGenerate: boolean;
  };
  seo: {
    defaultTitleTemplate: string;
    defaultMetaDescription: string;
    fallbackOgImage: string;
    sitemapAutoGenerate: boolean;
    robotsTxtContent: string;
  };
  media: {
    maxUploadSizeBytes: number;
    allowedMimeTypes: string[];
    autoWebpConversion: boolean;
    imageQualityPercent: number;
    cdnDomain: string;
  };
  security: {
    require2FA: boolean;
    sessionTimeoutMinutes: number;
    passwordMinLength: number;
    ipAllowlistEnabled: boolean;
  };
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  scope: 'read-only' | 'read-write' | 'admin';
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  status: 'active' | 'revoked';
}

export interface WebhookConfig {
  id: string;
  name: string;
  targetUrl: string;
  secret: string;
  events: string[];
  enabled: boolean;
  lastDeliveryStatus?: 'success' | 'failed';
  lastDeliveryAt?: string;
  createdAt: string;
}
