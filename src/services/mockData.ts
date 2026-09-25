import { ContentItem, ContentTypeModel, ContentRevision, ContentComment } from '../types/content';
import { MediaItem } from '../types/media';
import { UserItem, RoleDefinition } from '../types/user';
import { AuditLogEntry, MetricSummary } from '../types/activity';
import { NotificationItem } from '../types/notification';
import { SystemSettings, ApiKeyItem, WebhookConfig } from '../types/settings';
import { NavigationMenu, CmsPageItem } from '../types/navigation';

export const INITIAL_USERS: UserItem[] = [
  {
    id: 'usr-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@kinetix-enterprise.io',
    role: 'super_admin',
    status: 'active',
    avatarUrl: '/src/assets/images/avatar_editorial_lead_1790357015111.jpg',
    title: 'VP of Content Operations',
    department: 'Digital Publishing',
    lastActiveAt: '2026-09-25T10:14:00Z',
    createdAt: '2025-01-10T08:00:00Z',
    twoFactorEnabled: true,
    sessions: [
      { id: 'sess-1', device: 'MacBook Pro 16', browser: 'Chrome 130', ipAddress: '192.0.2.45', lastActive: 'Just now', isCurrent: true },
      { id: 'sess-2', device: 'iPhone 16 Pro', browser: 'Mobile Safari', ipAddress: '198.51.100.12', lastActive: '2 hours ago', isCurrent: false }
    ]
  },
  {
    id: 'usr-2',
    name: 'Marcus Vance',
    email: 'marcus.v@kinetix-enterprise.io',
    role: 'editor',
    status: 'active',
    avatarUrl: '/src/assets/images/avatar_content_eng_1790357025942.jpg',
    title: 'Lead Technical Editor',
    department: 'Developer Editorial',
    lastActiveAt: '2026-09-25T09:42:00Z',
    createdAt: '2025-02-14T09:30:00Z',
    twoFactorEnabled: true,
  },
  {
    id: 'usr-3',
    name: 'Elena Rostova',
    email: 'elena.r@kinetix-enterprise.io',
    role: 'reviewer',
    status: 'active',
    title: 'Compliance & Legal Reviewer',
    department: 'Legal & Risk',
    lastActiveAt: '2026-09-25T08:15:00Z',
    createdAt: '2025-03-01T11:00:00Z',
    twoFactorEnabled: true,
  },
  {
    id: 'usr-4',
    name: 'Julian Thorne',
    email: 'j.thorne@kinetix-enterprise.io',
    role: 'author',
    status: 'active',
    title: 'Senior Staff Writer',
    department: 'Product Marketing',
    lastActiveAt: '2026-09-24T18:20:00Z',
    createdAt: '2025-04-12T14:00:00Z',
    twoFactorEnabled: false,
  },
  {
    id: 'usr-5',
    name: 'Amara Okafor',
    email: 'amara.o@kinetix-enterprise.io',
    role: 'publisher',
    status: 'active',
    title: 'Global Release Manager',
    department: 'Content Distribution',
    lastActiveAt: '2026-09-25T07:55:00Z',
    createdAt: '2025-05-18T10:00:00Z',
    twoFactorEnabled: true,
  },
  {
    id: 'usr-6',
    name: 'David Kim',
    email: 'david.kim@partner-agency.com',
    role: 'viewer',
    status: 'invited',
    title: 'External Brand Auditor',
    department: 'Brand Consultancy',
    lastActiveAt: '2026-09-20T14:00:00Z',
    createdAt: '2026-09-20T14:00:00Z',
    twoFactorEnabled: false,
  }
];

export const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Unrestricted control over system infrastructure, security policies, API integrations, and tenant configuration.',
    isSystem: true,
    userCount: 2,
    permissions: [
      { resource: 'content', actions: ['create', 'read', 'update', 'delete', 'publish', 'schedule', 'approve', 'export'] },
      { resource: 'pages', actions: ['create', 'read', 'update', 'delete', 'publish', 'export'] },
      { resource: 'media', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'taxonomy', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'invite', 'export'] },
      { resource: 'roles', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'workflow', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { resource: 'settings', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'api_keys', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'audit_logs', actions: ['read', 'export'] }
    ]
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Operational lead with management capabilities across content, taxonomy, users, and media assets.',
    isSystem: true,
    userCount: 3,
    permissions: [
      { resource: 'content', actions: ['create', 'read', 'update', 'delete', 'publish', 'schedule', 'approve'] },
      { resource: 'pages', actions: ['create', 'read', 'update', 'delete', 'publish'] },
      { resource: 'media', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'taxonomy', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'users', actions: ['read', 'update', 'invite'] },
      { resource: 'workflow', actions: ['read', 'update', 'approve'] },
      { resource: 'settings', actions: ['read', 'update'] },
      { resource: 'audit_logs', actions: ['read'] }
    ]
  },
  {
    id: 'editor',
    name: 'Managing Editor',
    description: 'Responsible for editorial standards, content structure, approving drafts, and workflow stage routing.',
    isSystem: true,
    userCount: 5,
    permissions: [
      { resource: 'content', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { resource: 'pages', actions: ['read', 'update'] },
      { resource: 'media', actions: ['create', 'read', 'update'] },
      { resource: 'taxonomy', actions: ['read', 'update'] },
      { resource: 'workflow', actions: ['read', 'update', 'approve'] }
    ]
  },
  {
    id: 'author',
    name: 'Staff Author',
    description: 'Can draft, update, and submit original content for review. Cannot directly publish or alter system taxonomy.',
    isSystem: true,
    userCount: 12,
    permissions: [
      { resource: 'content', actions: ['create', 'read', 'update'] },
      { resource: 'media', actions: ['create', 'read'] },
      { resource: 'workflow', actions: ['read'] }
    ]
  },
  {
    id: 'reviewer',
    name: 'Compliance Reviewer',
    description: 'Reviews pending copy, requests revisions, leaves contextual legal/style comments, and approves for release.',
    isSystem: true,
    userCount: 4,
    permissions: [
      { resource: 'content', actions: ['read', 'update', 'approve'] },
      { resource: 'workflow', actions: ['read', 'approve'] }
    ]
  },
  {
    id: 'publisher',
    name: 'Release Publisher',
    description: 'Schedules and deploys approved content across production delivery channels.',
    isSystem: true,
    userCount: 3,
    permissions: [
      { resource: 'content', actions: ['read', 'publish', 'schedule'] },
      { resource: 'workflow', actions: ['read', 'update'] }
    ]
  },
  {
    id: 'viewer',
    name: 'Read-Only Stakeholder',
    description: 'Read-only access for cross-functional observers and external compliance auditors.',
    isSystem: true,
    userCount: 8,
    permissions: [
      { resource: 'content', actions: ['read'] },
      { resource: 'pages', actions: ['read'] },
      { resource: 'media', actions: ['read'] }
    ]
  }
];

export const INITIAL_CONTENT_TYPES: ContentTypeModel[] = [
  {
    id: 'article',
    name: 'Editorial Article',
    slug: 'article',
    description: 'Long-form editorial essays, thought leadership papers, and technical analysis.',
    iconName: 'FileText',
    itemCount: 42,
    createdAt: '2025-01-15T10:00:00Z',
    fields: [
      { id: 'f-1', name: 'Title', key: 'title', type: 'text', required: true, description: 'Primary headline for publication' },
      { id: 'f-2', name: 'Slug', key: 'slug', type: 'text', required: true, description: 'URL permalink path' },
      { id: 'f-3', name: 'Excerpt', key: 'excerpt', type: 'text', required: true, description: 'Brief synopsis used for card previews & RSS' },
      { id: 'f-4', name: 'Featured Image', key: 'featuredImage', type: 'image', required: false, description: 'Primary landscape visual hero' },
      { id: 'f-5', name: 'Category', key: 'category', type: 'select', required: true, options: [
        { label: 'Architecture & Systems', value: 'Architecture & Systems' },
        { label: 'Engineering Deep Dives', value: 'Engineering Deep Dives' },
        { label: 'Product Operations', value: 'Product Operations' },
        { label: 'Corporate News', value: 'Corporate News' }
      ]},
      { id: 'f-6', name: 'Estimated Read Time', key: 'readTimeMin', type: 'number', required: false },
      { id: 'f-7', name: 'Canonical URL', key: 'canonicalUrl', type: 'url', required: false }
    ]
  },
  {
    id: 'page',
    name: 'Standard Page',
    slug: 'page',
    description: 'Static corporate and transactional site pages with modular block configurations.',
    iconName: 'Layout',
    itemCount: 18,
    createdAt: '2025-01-15T10:00:00Z',
    fields: [
      { id: 'p-1', name: 'Page Title', key: 'title', type: 'text', required: true },
      { id: 'p-2', name: 'Page Slug', key: 'slug', type: 'text', required: true },
      { id: 'p-3', name: 'Parent Page', key: 'parentId', type: 'relation', required: false },
      { id: 'p-4', name: 'Show in Navigation', key: 'inNav', type: 'boolean', required: false, defaultValue: true },
      { id: 'p-5', name: 'Template Layout', key: 'template', type: 'select', required: true, options: [
        { label: 'Default Container', value: 'default' },
        { label: 'Edge-to-Edge Canvas', value: 'full_width' },
        { label: 'Documentation Sidebar', value: 'docs' }
      ]}
    ]
  },
  {
    id: 'case_study',
    name: 'Client Case Study',
    slug: 'case-study',
    description: 'Quantified customer transformation narratives, benchmark results, and testimonials.',
    iconName: 'Award',
    itemCount: 14,
    createdAt: '2025-02-01T12:00:00Z',
    fields: [
      { id: 'cs-1', name: 'Client Name', key: 'clientName', type: 'text', required: true },
      { id: 'cs-2', name: 'Primary Metric Achieved', key: 'metricResult', type: 'text', required: true },
      { id: 'cs-3', name: 'Industry Sector', key: 'industry', type: 'select', required: true, options: [
        { label: 'Financial Infrastructure', value: 'fintech' },
        { label: 'Aerospace & Transport', value: 'aerospace' },
        { label: 'Precision Biotech', value: 'biotech' }
      ]},
      { id: 'cs-4', name: 'Executive Quote', key: 'quote', type: 'rich_text', required: false }
    ]
  },
  {
    id: 'product_release',
    name: 'Product Release Note',
    slug: 'release-note',
    description: 'Versioned changelog entries, architectural upgrades, breaking change notices.',
    iconName: 'Package',
    itemCount: 29,
    createdAt: '2025-02-10T09:00:00Z',
    fields: [
      { id: 'pr-1', name: 'SemVer String', key: 'version', type: 'text', required: true },
      { id: 'pr-2', name: 'Release Classification', key: 'tier', type: 'select', required: true, options: [
        { label: 'Major Release', value: 'major' },
        { label: 'Feature Enhancement', value: 'minor' },
        { label: 'Security Patch', value: 'patch' }
      ]},
      { id: 'pr-3', name: 'Deployment Target', key: 'target', type: 'multi_select', required: true, options: [
        { label: 'Core API Gateway', value: 'api' },
        { label: 'Edge Runtime Network', value: 'edge' },
        { label: 'Management Console', value: 'console' }
      ]}
    ]
  }
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'med-1',
    filename: 'hero_editorial_arch_1790356991804.jpg',
    title: 'Civic Architecture Glass Facade',
    altText: 'Modern minimalist civic glass building with dramatic natural daylight and geometric shadows',
    caption: 'Global headquarters architectural study, shot on 35mm format',
    type: 'image',
    mimeType: 'image/jpeg',
    sizeBytes: 1845200,
    url: '/src/assets/images/hero_editorial_arch_1790356991804.jpg',
    thumbnailUrl: '/src/assets/images/hero_editorial_arch_1790356991804.jpg',
    dimensions: { width: 1920, height: 1080 },
    uploader: { id: 'usr-1', name: 'Sarah Chen' },
    folder: 'Editorial Banners',
    tags: ['Architecture', 'Hero', 'Facade', 'Corporate'],
    createdAt: '2026-09-24T14:30:00Z',
    updatedAt: '2026-09-24T14:30:00Z',
  },
  {
    id: 'med-2',
    filename: 'product_design_case_1790357003288.jpg',
    title: 'Industrial Titanium Audio Device',
    altText: 'Studio photography of matte titanium precision equipment on neutral cast concrete surface',
    caption: 'Hardware benchmark device showcase photo',
    type: 'image',
    mimeType: 'image/jpeg',
    sizeBytes: 1420800,
    url: '/src/assets/images/product_design_case_1790357003288.jpg',
    thumbnailUrl: '/src/assets/images/product_design_case_1790357003288.jpg',
    dimensions: { width: 1440, height: 1080 },
    uploader: { id: 'usr-2', name: 'Marcus Vance' },
    folder: 'Hardware & Case Studies',
    tags: ['Product', 'Titanium', 'Hardware', 'Industrial'],
    createdAt: '2026-09-24T16:15:00Z',
    updatedAt: '2026-09-24T16:15:00Z',
  },
  {
    id: 'med-3',
    filename: 'annual_report_q3_infrastructure.pdf',
    title: 'Enterprise Infrastructure Audit Q3',
    altText: 'Comprehensive infrastructure availability and latency report PDF',
    caption: 'Official compliance distribution document',
    type: 'document',
    mimeType: 'application/pdf',
    sizeBytes: 4890000,
    url: '#document-preview',
    thumbnailUrl: '',
    uploader: { id: 'usr-3', name: 'Elena Rostova' },
    folder: 'Compliance & Reports',
    tags: ['Report', 'PDF', 'Compliance', 'Q3'],
    createdAt: '2026-09-23T11:00:00Z',
    updatedAt: '2026-09-23T11:00:00Z',
  },
  {
    id: 'med-4',
    filename: 'brand_guidelines_v4_vector.svg',
    title: 'DEV CMS Enterprise Logo Asset Pack',
    altText: 'Official scalable vector logo marks and typography lockups',
    caption: 'Monochrome and full-color SVG master kit',
    type: 'image',
    mimeType: 'image/svg+xml',
    sizeBytes: 94200,
    url: '#svg-asset',
    thumbnailUrl: '',
    dimensions: { width: 800, height: 600 },
    uploader: { id: 'usr-1', name: 'Sarah Chen' },
    folder: 'Brand Assets',
    tags: ['Branding', 'Vector', 'Logo'],
    createdAt: '2026-09-22T09:10:00Z',
    updatedAt: '2026-09-22T09:10:00Z',
  }
];

export const INITIAL_CONTENT: ContentItem[] = [
  {
    id: 'cnt-101',
    title: 'Distributed State Synchronization Across Multi-Region Edge Clusters',
    slug: 'distributed-state-synchronization-edge-clusters',
    type: 'article',
    status: 'published',
    excerpt: 'An architectural breakdown of conflict-free replicated data types and consensus protocols at high concurrency.',
    featuredImageUrl: '/src/assets/images/hero_editorial_arch_1790356991804.jpg',
    category: 'Architecture & Systems',
    tags: ['Distributed Systems', 'Edge', 'CRDT', 'Consensus'],
    locale: 'en-US',
    author: {
      id: 'usr-2',
      name: 'Marcus Vance',
      email: 'marcus.v@dev-cms.internal',
      avatarUrl: '/src/assets/images/avatar_content_eng_1790357025942.jpg'
    },
    seo: {
      metaTitle: 'Distributed State Synchronization Across Edge Clusters | DEV CMS',
      metaDescription: 'Deep technical analysis of multi-region state convergence and conflict resolution mechanisms for high-throughput edge nodes.',
      canonicalUrl: 'https://dev-cms.internal/insights/distributed-state-synchronization-edge-clusters',
      focusKeywords: ['distributed systems', 'edge compute', 'state synchronization'],
      noIndex: false
    },
    blocks: [
      {
        id: 'blk-1',
        type: 'hero',
        order: 1,
        data: {
          headline: 'Distributed State Synchronization Across Multi-Region Edge Clusters',
          kicker: 'Systems Engineering Report',
          lead: 'Decentralized state convergence requires moving beyond simple clock-based reconciliation to deterministic conflict-free topologies.'
        }
      },
      {
        id: 'blk-2',
        type: 'text',
        order: 2,
        data: {
          content: 'Modern content delivery platforms operate across hundreds of heterogeneous edge pops. Traditional ACID database locks introduce unviable network latency when coordinating transactions across continental divides. In this paper, we document our migration toward hybrid vector clocks combined with state-based Delta-CRDT structures.'
        }
      },
      {
        id: 'blk-3',
        type: 'quote',
        order: 3,
        data: {
          quote: 'Deterministic ordering without centralized timestamp authorities is the single largest performance unlock for global edge operations.',
          attribution: 'Dr. Linus Valdemar',
          role: 'Chief Architect, Distributed Fabrics'
        }
      },
      {
        id: 'blk-4',
        type: 'code',
        order: 4,
        data: {
          language: 'typescript',
          code: `interface DeltaCRDT<T> {\n  readonly stateVector: Map<NodeId, LamportClock>;\n  merge(delta: DeltaBuffer<T>): MergeResult;\n  reconcilePartition(peer: NodeSocket): Promise<boolean>;\n}`
        }
      }
    ],
    createdAt: '2026-09-20T08:30:00Z',
    updatedAt: '2026-09-25T08:10:00Z',
    publishedAt: '2026-09-24T12:00:00Z',
    revisionsCount: 6,
    commentsCount: 3
  },
  {
    id: 'cnt-102',
    title: 'Migrating Global Financial Portals to Immutable Edge Cache Networks',
    slug: 'migrating-global-financial-portals-edge-cache',
    type: 'case_study',
    status: 'in_review',
    excerpt: 'How Apex Securities reduced p99 asset loading latency to 18 milliseconds while satisfying rigorous FINRA regulatory audits.',
    featuredImageUrl: '/src/assets/images/product_design_case_1790357003288.jpg',
    category: 'Product Operations',
    tags: ['Case Study', 'Fintech', 'Compliance', 'Security'],
    locale: 'en-US',
    author: {
      id: 'usr-4',
      name: 'Julian Thorne',
      email: 'j.thorne@kinetix-enterprise.io'
    },
    reviewAssignedTo: {
      id: 'usr-3',
      name: 'Elena Rostova',
      email: 'elena.r@kinetix-enterprise.io'
    },
    reviewNotes: 'Pending legal audit review on SLA disclosures in section 3.',
    seo: {
      metaTitle: 'Apex Securities Edge Migration Case Study | DEV CMS',
      metaDescription: 'Learn how Apex Securities eliminated 82% of origin request overhead with cryptographic asset pinning.',
      canonicalUrl: 'https://dev-cms.internal/case-studies/apex-securities-migration',
      focusKeywords: ['fintech case study', 'edge cache compliance'],
      noIndex: false
    },
    blocks: [
      {
        id: 'blk-1',
        type: 'hero',
        order: 1,
        data: {
          headline: 'Apex Securities: Sub-20ms Regulatory Compliance',
          kicker: 'Enterprise Customer Spotlight',
          lead: 'Eliminating origin overhead without forfeiting immutable audit logging.'
        }
      },
      {
        id: 'blk-2',
        type: 'text',
        order: 2,
        data: {
          content: 'When serving real-time balance disclosures to 3.8 million daily active institutional accounts, downtime or stale cache reads can induce multi-million dollar regulatory penalties. By leveraging cryptographic signed cache invalidation, Apex achieved zero-stale SLA adherence across 47 international exchanges.'
        }
      },
      {
        id: 'blk-3',
        type: 'callout',
        order: 3,
        data: {
          variant: 'info',
          title: 'Audited Metric Result',
          message: 'Zero origin cache misses during the September 2026 interest rate announcement volatility spike.'
        }
      }
    ],
    createdAt: '2026-09-23T14:00:00Z',
    updatedAt: '2026-09-25T09:15:00Z',
    revisionsCount: 3,
    commentsCount: 5
  },
  {
    id: 'cnt-103',
    title: 'Enterprise Single Sign-On and SCIM 2.0 Identity Federation Guide',
    slug: 'enterprise-sso-scim-directory-federation',
    type: 'article',
    status: 'draft',
    excerpt: 'Configuring Okta, Microsoft Entra ID, and PingIdentity automated user provisioning with fine-grained group mappings.',
    category: 'Engineering Deep Dives',
    tags: ['Security', 'Identity', 'SSO', 'SCIM'],
    locale: 'en-US',
    author: {
      id: 'usr-2',
      name: 'Marcus Vance',
      email: 'marcus.v@kinetix-enterprise.io',
      avatarUrl: '/src/assets/images/avatar_content_eng_1790357025942.jpg'
    },
    seo: {
      metaTitle: 'Enterprise SSO & SCIM 2.0 Federation Guide | DEV CMS Docs',
      metaDescription: 'Step-by-step setup for SAML 2.0 and automated SCIM provisioning across enterprise IdPs.',
      canonicalUrl: 'https://dev-cms.internal/guides/enterprise-sso-scim',
      focusKeywords: ['SCIM provisioning', 'SAML SSO', 'Entra ID'],
      noIndex: false
    },
    blocks: [
      {
        id: 'blk-1',
        type: 'text',
        order: 1,
        data: {
          content: 'Enterprise workforce management requires automated zero-touch deprovisioning whenever an employee departs the organization. SCIM 2.0 (RFC 7644) ensures immediate session revocation and token invalidation.'
        }
      }
    ],
    createdAt: '2026-09-24T17:20:00Z',
    updatedAt: '2026-09-25T10:02:00Z',
    revisionsCount: 2,
    commentsCount: 0
  },
  {
    id: 'cnt-104',
    title: 'Quarterly Infrastructure Governance & Compliance Disclosure Q4',
    slug: 'quarterly-infrastructure-governance-q4',
    type: 'article',
    status: 'approved',
    excerpt: 'SOC 2 Type II audit completion, ISO 27001 certificate renewal, and FedRAMP Moderate readiness milestones.',
    category: 'Corporate News',
    tags: ['Compliance', 'Audit', 'SOC2', 'ISO27001'],
    locale: 'en-US',
    author: {
      id: 'usr-3',
      name: 'Elena Rostova',
      email: 'elena.r@kinetix-enterprise.io'
    },
    reviewAssignedTo: {
      id: 'usr-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@kinetix-enterprise.io'
    },
    seo: {
      metaTitle: 'Quarterly Compliance & Governance Disclosure | DEV CMS',
      metaDescription: 'DEV CMS announces flawless SOC2 Type II certification renewal and expanded European data sovereignty enclaves.',
      canonicalUrl: 'https://dev-cms.internal/news/governance-q4',
      focusKeywords: ['SOC2 Type II', 'compliance audit'],
      noIndex: false
    },
    blocks: [
      {
        id: 'blk-1',
        type: 'text',
        order: 1,
        data: {
          content: 'Independent auditors at Schellman & Company have concluded our annual SOC 2 Type II examination with zero exceptions observed across all five Trust Services Criteria.'
        }
      }
    ],
    createdAt: '2026-09-22T10:00:00Z',
    updatedAt: '2026-09-24T19:00:00Z',
    revisionsCount: 4,
    commentsCount: 2
  },
  {
    id: 'cnt-105',
    title: 'Platform Kernel Release 4.12.0: Dynamic Schema Polymorphism',
    slug: 'platform-kernel-release-4-12-0',
    type: 'product_release',
    status: 'scheduled',
    scheduledAt: '2026-09-28T09:00:00Z',
    excerpt: 'Introducing polymorphic content field inheritance, nested component unions, and automated migration dry-runs.',
    category: 'Engineering Deep Dives',
    tags: ['Release Note', 'Schema', 'Kernel'],
    locale: 'en-US',
    author: {
      id: 'usr-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@kinetix-enterprise.io',
      avatarUrl: '/src/assets/images/avatar_editorial_lead_1790357015111.jpg'
    },
    seo: {
      metaTitle: 'Release Notes: Kernel v4.12.0 Polymorphic Schemas | DEV CMS',
      metaDescription: 'Detailed changelog and migration guide for DEV CMS Platform Kernel 4.12.0 release.',
      canonicalUrl: 'https://dev-cms.internal/releases/kernel-4-12-0',
      focusKeywords: ['release notes 4.12.0', 'content schema'],
      noIndex: false
    },
    blocks: [
      {
        id: 'blk-1',
        type: 'text',
        order: 1,
        data: {
          content: 'This minor release adds first-class support for runtime discriminated unions across content models, allowing editors to compose heterogeneous content streams with strict type safety.'
        }
      }
    ],
    createdAt: '2026-09-24T11:45:00Z',
    updatedAt: '2026-09-25T08:00:00Z',
    revisionsCount: 3,
    commentsCount: 1
  },
  {
    id: 'cnt-106',
    title: 'Retiring Legacy REST v1 Endpoints: Deprecation Timeline',
    slug: 'retiring-legacy-rest-v1-deprecation-schedule',
    type: 'announcement',
    status: 'archived',
    excerpt: 'Formal decommissioning notice for unversioned REST ingestion routes in favor of GraphQL v3 and gRPC streams.',
    category: 'Corporate News',
    tags: ['Deprecation', 'API', 'Legacy'],
    locale: 'en-US',
    author: {
      id: 'usr-2',
      name: 'Marcus Vance',
      email: 'marcus.v@dev-cms.internal'
    },
    seo: {
      metaTitle: 'REST v1 Deprecation Schedule | DEV CMS Developer Platform',
      metaDescription: 'Timeline for sunsetting legacy v1 ingestion APIs.',
      canonicalUrl: 'https://dev-cms.internal/announcements/rest-v1-sunset',
      focusKeywords: ['api sunset', 'rest v1'],
      noIndex: true
    },
    blocks: [
      {
        id: 'blk-1',
        type: 'text',
        order: 1,
        data: {
          content: 'As of December 31, 2026, legacy REST v1 gateways will cease routing requests. All enterprise integration partners must transition to GraphQL v3 or standard Webhook push.'
        }
      }
    ],
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    revisionsCount: 5,
    commentsCount: 0
  }
];

export const INITIAL_REVISIONS: ContentRevision[] = [
  {
    id: 'rev-3',
    contentId: 'cnt-101',
    version: 3,
    author: {
      id: 'usr-2',
      name: 'Marcus Vance',
      email: 'marcus.v@kinetix-enterprise.io',
      avatarUrl: '/src/assets/images/avatar_content_eng_1790357025942.jpg'
    },
    createdAt: '2026-09-25T08:10:00Z',
    summary: 'Refined Lamport clock code sample and clarified network partition handling in section 2.',
    statusAtRevision: 'published',
    changes: [
      { field: 'blocks[3].data.code', before: 'interface CRDT { merge(); }', after: 'interface DeltaCRDT<T> { ... }', changeType: 'modified' },
      { field: 'seo.metaDescription', before: 'Technical paper on edge nodes.', after: 'Deep technical analysis of multi-region state convergence...', changeType: 'modified' }
    ],
    snapshot: {
      title: 'Distributed State Synchronization Across Multi-Region Edge Clusters',
      status: 'published'
    }
  },
  {
    id: 'rev-2',
    contentId: 'cnt-101',
    version: 2,
    author: {
      id: 'usr-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@kinetix-enterprise.io',
      avatarUrl: '/src/assets/images/avatar_editorial_lead_1790357015111.jpg'
    },
    createdAt: '2026-09-24T11:30:00Z',
    summary: 'Editorial review approval with adjusted lead headline typography.',
    statusAtRevision: 'approved',
    changes: [
      { field: 'status', before: 'in_review', after: 'approved', changeType: 'modified' },
      { field: 'blocks[0].data.kicker', before: 'Technical Draft', after: 'Systems Engineering Report', changeType: 'modified' }
    ],
    snapshot: {
      title: 'Distributed State Synchronization Across Multi-Region Edge Clusters',
      status: 'approved'
    }
  },
  {
    id: 'rev-1',
    contentId: 'cnt-101',
    version: 1,
    author: {
      id: 'usr-2',
      name: 'Marcus Vance',
      email: 'marcus.v@kinetix-enterprise.io',
      avatarUrl: '/src/assets/images/avatar_content_eng_1790357025942.jpg'
    },
    createdAt: '2026-09-20T08:30:00Z',
    summary: 'Initial draft creation from engineering design document.',
    statusAtRevision: 'draft',
    changes: [
      { field: 'title', before: null, after: 'Distributed State Synchronization Across Multi-Region Edge Clusters', changeType: 'added' },
      { field: 'blocks', before: null, after: '4 initial blocks', changeType: 'added' }
    ],
    snapshot: {
      title: 'Distributed State Synchronization Across Multi-Region Edge Clusters',
      status: 'draft'
    }
  }
];

export const INITIAL_COMMENTS: ContentComment[] = [
  {
    id: 'cmt-1',
    contentId: 'cnt-102',
    author: {
      id: 'usr-3',
      name: 'Elena Rostova',
      email: 'elena.r@kinetix-enterprise.io',
      avatarUrl: undefined
    },
    body: 'Please confirm with compliance whether we have formal legal signoff to state the 18ms latency figure without an asterisk disclaimer.',
    fieldAnchor: 'blocks[1]',
    createdAt: '2026-09-25T08:30:00Z',
    resolved: false,
    replies: [
      {
        id: 'cmt-1-1',
        contentId: 'cnt-102',
        author: {
          id: 'usr-4',
          name: 'Julian Thorne',
          email: 'j.thorne@kinetix-enterprise.io'
        },
        body: 'Received written signoff from Apex General Counsel yesterday morning. Added link to the annex in revision 3.',
        createdAt: '2026-09-25T09:10:00Z',
        resolved: false
      }
    ]
  },
  {
    id: 'cmt-2',
    contentId: 'cnt-102',
    author: {
      id: 'usr-1',
      name: 'Sarah Chen',
      email: 'sarah.chen@kinetix-enterprise.io',
      avatarUrl: '/src/assets/images/avatar_editorial_lead_1790357015111.jpg'
    },
    body: 'Ensure the lead photo matches the new titanium design system guidelines.',
    fieldAnchor: 'featuredImageUrl',
    createdAt: '2026-09-24T16:00:00Z',
    resolved: true,
    resolvedBy: 'Marcus Vance',
    resolvedAt: '2026-09-24T16:45:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-991',
    actor: { id: 'usr-1', name: 'Sarah Chen', email: 'sarah.chen@kinetix-enterprise.io', role: 'Super Admin' },
    action: 'content.published',
    resourceType: 'article',
    resourceId: 'cnt-101',
    resourceTitle: 'Distributed State Synchronization Across Multi-Region Edge Clusters',
    timestamp: '2026-09-25T08:10:00Z',
    ipAddress: '192.0.2.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: { note: 'Promoted from Approved to Published production CDN' }
  },
  {
    id: 'aud-990',
    actor: { id: 'usr-2', name: 'Marcus Vance', email: 'marcus.v@kinetix-enterprise.io', role: 'Lead Editor' },
    action: 'content.updated',
    resourceType: 'article',
    resourceId: 'cnt-101',
    resourceTitle: 'Distributed State Synchronization Across Multi-Region Edge Clusters',
    timestamp: '2026-09-25T07:45:00Z',
    ipAddress: '198.51.100.88',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    details: { field: 'codeBlock', note: 'Updated TypeScript definition' }
  },
  {
    id: 'aud-989',
    actor: { id: 'usr-3', name: 'Elena Rostova', email: 'elena.r@kinetix-enterprise.io', role: 'Compliance Reviewer' },
    action: 'content.reviewed',
    resourceType: 'case_study',
    resourceId: 'cnt-102',
    resourceTitle: 'Migrating Global Financial Portals to Immutable Edge Cache Networks',
    timestamp: '2026-09-25T08:30:00Z',
    ipAddress: '203.0.113.19',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0',
    details: { note: 'Annotated SLA verification note for legal compliance' }
  },
  {
    id: 'aud-988',
    actor: { id: 'usr-1', name: 'Sarah Chen', email: 'sarah.chen@kinetix-enterprise.io', role: 'Super Admin' },
    action: 'media.uploaded',
    resourceType: 'media',
    resourceId: 'med-1',
    resourceTitle: 'Civic Architecture Glass Facade',
    timestamp: '2026-09-24T14:30:00Z',
    ipAddress: '192.0.2.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    details: { note: '1.8 MB High-res editorial asset ingested' }
  },
  {
    id: 'aud-987',
    actor: { id: 'usr-1', name: 'Sarah Chen', email: 'sarah.chen@kinetix-enterprise.io', role: 'Super Admin' },
    action: 'user.invited',
    resourceType: 'user',
    resourceId: 'usr-6',
    resourceTitle: 'David Kim',
    timestamp: '2026-09-20T14:00:00Z',
    ipAddress: '192.0.2.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    details: { note: 'Invited as external viewer with 30-day token expiration' }
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'review_requested',
    title: 'Review Requested',
    message: 'Julian Thorne submitted "Migrating Global Financial Portals to Immutable Edge Cache Networks" for compliance signoff.',
    read: false,
    createdAt: '2026-09-25T08:32:00Z',
    linkUrl: '/content/cnt-102',
    actor: { name: 'Julian Thorne' },
    priority: 'high'
  },
  {
    id: 'notif-2',
    type: 'content_published',
    title: 'Scheduled Release Live',
    message: '"Distributed State Synchronization" was successfully deployed across global edge points.',
    read: false,
    createdAt: '2026-09-25T08:10:00Z',
    linkUrl: '/content/cnt-101',
    actor: { name: 'Sarah Chen' },
    priority: 'normal'
  },
  {
    id: 'notif-3',
    type: 'changes_requested',
    title: 'Changes Requested on Draft',
    message: 'Elena Rostova added 2 review comments regarding financial SLA statements.',
    read: true,
    createdAt: '2026-09-24T16:20:00Z',
    linkUrl: '/content/cnt-102',
    actor: { name: 'Elena Rostova' },
    priority: 'normal'
  },
  {
    id: 'notif-4',
    type: 'system_alert',
    title: 'Edge Invalidation Cache Cleared',
    message: 'Fast purge executed across 14 European edge POPs in 142ms.',
    read: true,
    createdAt: '2026-09-24T12:00:00Z',
    priority: 'low'
  }
];

export const INITIAL_METRICS: MetricSummary = {
  totalContent: 103,
  draftContent: 14,
  pendingReview: 6,
  publishedToday: 3,
  scheduledContent: 5,
  storageUsedBytes: 42150000000, // 42.15 GB
  storageTotalBytes: 250000000000, // 250 GB
  activeUsers: 28
};

export const INITIAL_SETTINGS: SystemSettings = {
  general: {
    siteName: 'DEV CMS Digital Portal',
    siteUrl: 'https://dev-cms.internal',
    defaultLocale: 'en-US',
    supportedLocales: ['en-US', 'de-DE', 'ja-JP', 'fr-FR', 'es-ES'],
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD HH:mm'
  },
  workspace: {
    orgName: 'DEV CMS Global Technology Group',
    orgSlug: 'dev-cms-corp',
    billingTier: 'Enterprise',
    enforceSso: true,
    domainAllowlist: ['dev-cms.internal', 'partner-agency.com']
  },
  publishing: {
    requireReviewBeforePublish: true,
    autoArchiveDays: 365,
    enableScheduledPublishing: true,
    slugAutoGenerate: true
  },
  seo: {
    defaultTitleTemplate: '%s | DEV CMS',
    defaultMetaDescription: 'Official DEV CMS enterprise publishing and digital experience platform.',
    fallbackOgImage: '/src/assets/images/hero_editorial_arch_1790356991804.jpg',
    sitemapAutoGenerate: true,
    robotsTxtContent: 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://dev-cms.internal/sitemap.xml'
  },
  media: {
    maxUploadSizeBytes: 52428800, // 50MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf', 'video/mp4'],
    autoWebpConversion: true,
    imageQualityPercent: 88,
    cdnDomain: 'https://cdn.kinetix-enterprise.io'
  },
  security: {
    require2FA: true,
    sessionTimeoutMinutes: 120,
    passwordMinLength: 14,
    ipAllowlistEnabled: false
  }
};

export const INITIAL_API_KEYS: ApiKeyItem[] = [
  {
    id: 'key-1',
    name: 'CI/CD Publishing Deployer',
    keyPrefix: 'knx_live_94fa2...',
    scope: 'admin',
    createdAt: '2025-01-20T10:00:00Z',
    lastUsedAt: '2026-09-25T08:00:00Z',
    status: 'active'
  },
  {
    id: 'key-2',
    name: 'Next.js Frontend Read API',
    keyPrefix: 'knx_pub_32ec1...',
    scope: 'read-only',
    createdAt: '2025-03-01T12:00:00Z',
    lastUsedAt: 'Just now',
    status: 'active'
  }
];

export const INITIAL_WEBHOOKS: WebhookConfig[] = [
  {
    id: 'wh-1',
    name: 'Global Edge Invalidation Trigger',
    targetUrl: 'https://api.edge-gateway.internal/purge',
    secret: 'whsec_99410bf...',
    events: ['content.published', 'content.archived'],
    enabled: true,
    lastDeliveryStatus: 'success',
    lastDeliveryAt: '2026-09-25T08:10:05Z',
    createdAt: '2025-02-10T14:00:00Z'
  },
  {
    id: 'wh-2',
    name: 'Slack Editorial Newsroom Webhook',
    targetUrl: 'https://hooks.slack.com/services/T00/B00/X00',
    secret: 'whsec_54210ac...',
    events: ['content.review_requested', 'content.published'],
    enabled: true,
    lastDeliveryStatus: 'success',
    lastDeliveryAt: '2026-09-25T08:32:01Z',
    createdAt: '2025-04-18T10:00:00Z'
  }
];

export const INITIAL_PAGES: CmsPageItem[] = [
  { id: 'pg-1', title: 'Enterprise Overview', slug: 'overview', template: 'landing', status: 'published', author: 'Sarah Chen', depth: 0, updatedAt: '2026-09-24T12:00:00Z' },
  { id: 'pg-2', title: 'High-Concurrency Solutions', slug: 'solutions', template: 'default', status: 'published', author: 'Marcus Vance', depth: 0, updatedAt: '2026-09-22T10:00:00Z' },
  { id: 'pg-3', title: 'Financial Systems Fabric', slug: 'solutions/fintech', template: 'default', parentId: 'pg-2', status: 'published', author: 'Julian Thorne', depth: 1, updatedAt: '2026-09-23T11:00:00Z' },
  { id: 'pg-4', title: 'Global Edge Latency Benchmarks', slug: 'solutions/benchmarks', template: 'default', parentId: 'pg-2', status: 'draft', author: 'Marcus Vance', depth: 1, updatedAt: '2026-09-25T09:00:00Z' },
  { id: 'pg-5', title: 'Developer Documentation', slug: 'docs', template: 'docs', status: 'published', author: 'Marcus Vance', depth: 0, updatedAt: '2026-09-24T18:00:00Z' },
  { id: 'pg-6', title: 'Trust & Compliance Center', slug: 'trust', template: 'default', status: 'published', author: 'Elena Rostova', depth: 0, updatedAt: '2026-09-21T15:00:00Z' }
];

export const INITIAL_MENUS: NavigationMenu[] = [
  {
    id: 'menu-main',
    name: 'Primary Header Navigation',
    location: 'main_header',
    updatedAt: '2026-09-24T14:00:00Z',
    items: [
      { id: 'm-1', label: 'Platform', url: '/overview', order: 1, children: [
        { id: 'm-1-1', label: 'Architecture Fabric', url: '/overview#fabric', order: 1 },
        { id: 'm-1-2', label: 'Edge POP Network', url: '/overview#edge', order: 2 }
      ]},
      { id: 'm-2', label: 'Solutions', url: '/solutions', order: 2, children: [
        { id: 'm-2-1', label: 'Financial Services', url: '/solutions/fintech', order: 1 },
        { id: 'm-2-2', label: 'Telecom & Defense', url: '/solutions/defense', order: 2 }
      ]},
      { id: 'm-3', label: 'Documentation', url: '/docs', order: 3 },
      { id: 'm-4', label: 'Trust Center', url: '/trust', order: 4 },
      { id: 'm-5', label: 'Company', url: '/about', order: 5 }
    ]
  },
  {
    id: 'menu-footer',
    name: 'Global Footer Directory',
    location: 'footer_primary',
    updatedAt: '2026-09-20T10:00:00Z',
    items: [
      { id: 'mf-1', label: 'Security Disclosures', url: '/trust/security', order: 1 },
      { id: 'mf-2', label: 'SOC2 Whitepaper', url: '/trust/soc2', order: 2 },
      { id: 'mf-3', label: 'Privacy Policy', url: '/legal/privacy', order: 3 },
      { id: 'mf-4', label: 'Terms of Service', url: '/legal/terms', order: 4 }
    ]
  }
];
