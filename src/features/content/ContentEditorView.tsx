import React, { useState, useEffect, useRef } from 'react';
import { useCmsStore } from '../../stores/useCmsStore';
import { contentService } from '../../services/contentService';
import { workflowService } from '../../services/workflowService';
import { ContentItem, ContentStatus, ContentBlock } from '../../types/content';
import { BlockEditor } from './blocks/BlockEditor';
import { RevisionHistoryModal } from '../revisions/RevisionHistoryModal';
import { ContentCommentsPanel } from '../comments/ContentCommentsPanel';
import { StatusBadge } from '../../components/common/Badge';
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  History, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Calendar, 
  Globe, 
  Image as ImageIcon, 
  Tag, 
  Sliders, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Search,
  Lock
} from 'lucide-react';

export const ContentEditorView: React.FC = () => {
  const { 
    editingContentId, 
    newContentType, 
    navigateTo, 
    currentUser, 
    showToast 
  } = useCmsStore();

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentItem | null>(null);

  // Auto-save & sync states
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date());
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Panels
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'workflow' | 'comments'>('content');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [revisionsModalOpen, setRevisionsModalOpen] = useState(false);

  useEffect(() => {
    loadOrInitContent();
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [editingContentId]);

  const loadOrInitContent = async () => {
    setLoading(true);
    try {
      if (editingContentId) {
        const item = await contentService.getContentById(editingContentId);
        if (item) {
          setContent(item);
        } else {
          showToast({ type: 'error', title: 'Content item not found' });
          navigateTo('content');
        }
      } else {
        // Initialize new content record
        const newItem: ContentItem = {
          id: '',
          title: 'Untitled Content Draft',
          slug: 'untitled-draft',
          type: newContentType || 'article',
          status: 'draft',
          excerpt: '',
          blocks: [
            {
              id: `blk-${Date.now()}`,
              type: 'hero',
              order: 1,
              data: {
                headline: 'Untitled Content Draft',
                kicker: 'Editorial Overview',
                lead: 'Add your introductory overview copy here.'
              }
            },
            {
              id: `blk-${Date.now() + 1}`,
              type: 'text',
              order: 2,
              data: {
                content: 'Start writing your comprehensive article here...'
              }
            }
          ],
          author: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            avatarUrl: currentUser.avatarUrl
          },
          category: 'Architecture & Systems',
          tags: ['Production', 'Enterprise'],
          locale: 'en-US',
          seo: {
            metaTitle: 'Untitled Content Draft',
            metaDescription: '',
            canonicalUrl: '',
            focusKeywords: ['Enterprise', 'CMS'],
            noIndex: false
          },
          revisionsCount: 1,
          commentsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setContent(newItem);
      }
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Error loading editor item' });
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (updates: Partial<ContentItem>) => {
    if (!content) return;
    const updated = { ...content, ...updates, updatedAt: new Date().toISOString() };
    setContent(updated);
    setSaveStatus('unsaved');

    // Trigger debounced auto-save (every 3 seconds of inactivity)
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      persistContent(updated, false);
    }, 3000);
  };

  const persistContent = async (itemToSave: ContentItem, isExplicitUserAction = false) => {
    setSaveStatus('saving');
    try {
      if (!itemToSave.title.trim()) {
        showToast({ type: 'warning', title: 'Validation Warning', message: 'Article headline cannot be blank.' });
        setSaveStatus('unsaved');
        return;
      }

      let saved: ContentItem;
      if (!itemToSave.id) {
        saved = await contentService.createContent(itemToSave);
        showToast({ type: 'success', title: 'Content Draft Created', message: `Record stored: ${saved.title}` });
      } else {
        saved = await contentService.updateContent(itemToSave.id, itemToSave);
        if (isExplicitUserAction) {
          showToast({ type: 'success', title: 'Changes Saved', message: 'Draft persisted to edge datastore' });
        }
      }

      setContent(saved);
      setSaveStatus('saved');
      setLastSavedAt(new Date());
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      showToast({ type: 'error', title: 'Save Failed', message: 'Network or database error during persistence' });
    }
  };

  const handleStatusTransition = async (nextStatus: ContentStatus) => {
    if (!content || !content.id) {
      showToast({ type: 'warning', title: 'Please save draft before changing workflow state.' });
      return;
    }

    try {
      const updated = await workflowService.transitionContent(content.id, nextStatus, currentUser);
      setContent(updated);
      showToast({
        type: 'success',
        title: `Workflow Advanced to "${nextStatus.replace('_', ' ').toUpperCase()}"`,
        message: 'Status gate updated and logged in immutable audit stream.'
      });
    } catch (err) {
      showToast({ type: 'error', title: 'Status Transition Denied', message: 'Policy rejected state mutation.' });
    }
  };

  if (loading || !content) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-8 bg-[var(--bg-card)] rounded w-1/3"></div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-[var(--bg-card)] rounded-lg"></div>
          <div className="col-span-1 h-96 bg-[var(--bg-card)] rounded-lg"></div>
        </div>
      </div>
    );
  }

  const availableTransitions = workflowService.getAvailableTransitions(content.status, currentUser.role);

  return (
    <div className="space-y-6 pb-20">
      {/* Editor Top Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--border-main)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('content')}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded transition-colors"
            title="Back to Content Table"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono text-[var(--text-muted)] font-semibold tracking-wider">
                {content.type.replace('_', ' ')}
              </span>
              <StatusBadge status={content.status} />
              
              {/* Auto-save status indicator */}
              <div className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1.5 ml-2">
                {saveStatus === 'saving' && (
                  <span className="animate-pulse" style={{ color: 'var(--brand-accent)' }}>Saving changes...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Saved {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                )}
                {saveStatus === 'unsaved' && (
                  <span className="text-amber-400">Unsaved edits</span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Save error</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Actions: Preview Toggle, Revisions, Manual Save, Workflow Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            style={previewMode ? { backgroundColor: 'var(--brand-primary)', color: '#ffffff' } : undefined}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              previewMode 
                ? 'border-transparent shadow-xs' 
                : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border-[var(--border-main)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'Exit Preview' : 'Live Preview'}</span>
          </button>

          {content.id && (
            <button
              onClick={() => setRevisionsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border-main)] rounded text-xs font-medium transition-colors"
            >
              <History className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Revisions ({content.revisionsCount || 1})</span>
            </button>
          )}

          <button
            onClick={() => persistContent(content, true)}
            disabled={saveStatus === 'saving'}
            style={{ backgroundColor: 'var(--brand-primary)' }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-white hover:opacity-95 rounded text-xs font-medium transition-all shadow-xs border border-white/10"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout: Left Content Editor + Right Contextual Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor or Live Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {previewMode ? (
            /* Live Rendered Preview Container */
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-8 shadow-xl max-w-3xl mx-auto space-y-6 font-sans">
              <div className="border-b border-[var(--border-main)] pb-4">
                <div 
                  className="text-xs uppercase font-mono tracking-wider mb-2 font-semibold"
                  style={{ color: 'var(--brand-accent)' }}
                >
                  {content.category} · {content.type}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  {content.title}
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                  {content.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono mt-4">
                  <span>Author: {content.author.name}</span>
                  <span>·</span>
                  <span>{new Date(content.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {content.featuredImageUrl && (
                <div className="rounded-lg overflow-hidden border border-[var(--border-main)]">
                  <img 
                    src={content.featuredImageUrl} 
                    alt={content.title} 
                    className="w-full h-80 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Rendered Blocks Preview */}
              <div className="space-y-6 text-[var(--text-secondary)]">
                {content.blocks.map(b => (
                  <div key={b.id}>
                    {b.type === 'hero' && (
                      <div className="bg-[var(--bg-card-subtle)] p-6 rounded-lg border border-[var(--border-main)]">
                        <span className="text-xs font-mono uppercase" style={{ color: 'var(--brand-text)' }}>{b.data.kicker}</span>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-1">{b.data.headline}</h2>
                        <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{b.data.lead}</p>
                      </div>
                    )}
                    {b.type === 'text' && (
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
                        {b.data.content}
                      </p>
                    )}
                    {b.type === 'quote' && (
                      <blockquote 
                        style={{ borderLeftColor: 'var(--brand-primary)' }}
                        className="p-4 border-l-2 bg-[var(--bg-card-subtle)] rounded-r text-sm italic text-[var(--text-primary)]"
                      >
                        "{b.data.quote}"
                        <footer className="text-xs font-mono text-[var(--text-muted)] not-italic mt-2">
                          — {b.data.attribution}, {b.data.role}
                        </footer>
                      </blockquote>
                    )}
                    {b.type === 'code' && (
                      <pre className="p-4 rounded bg-[var(--bg-input)] border border-[var(--border-main)] text-xs font-mono text-emerald-400 overflow-x-auto">
                        <code>{b.data.code}</code>
                      </pre>
                    )}
                    {b.type === 'callout' && (
                      <div 
                        style={{ backgroundColor: 'var(--brand-tint)', borderColor: 'var(--brand-border)' }}
                        className="p-4 rounded border text-xs"
                      >
                        <div className="font-semibold" style={{ color: 'var(--brand-text)' }}>{b.data.title}</div>
                        <div className="text-[var(--text-primary)] mt-1">{b.data.message}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Standard Editable Document Mode */
            <div className="space-y-6">
              {/* Title & Slug */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-5 space-y-4 shadow-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono mb-1">
                    Content Title
                  </label>
                  <input
                    type="text"
                    value={content.title}
                    onChange={(e) => handleContentChange({ title: e.target.value })}
                    placeholder="Enter descriptive editorial headline..."
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] focus:border-[var(--border-highlight)] rounded p-3 text-lg font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono mb-1">
                      URL Permalink Slug
                    </label>
                    <div className="flex items-center bg-[var(--bg-input)] border border-[var(--border-main)] rounded px-3 py-1.5 text-xs font-mono text-[var(--text-muted)]">
                      <span>/</span>
                      <input
                        type="text"
                        value={content.slug}
                        onChange={(e) => handleContentChange({ slug: e.target.value })}
                        className="w-full bg-transparent text-[var(--text-primary)] focus:outline-hidden ml-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono mb-1">
                      Content Classification
                    </label>
                    <select
                      value={content.category}
                      onChange={(e) => handleContentChange({ category: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] rounded px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-hidden"
                    >
                      <option value="Architecture & Systems">Architecture & Systems</option>
                      <option value="Engineering Deep Dives">Engineering Deep Dives</option>
                      <option value="Product Operations">Product Operations</option>
                      <option value="Corporate News">Corporate News</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono mb-1">
                    Editorial Excerpt / Abstract
                  </label>
                  <textarea
                    rows={2}
                    value={content.excerpt}
                    onChange={(e) => handleContentChange({ excerpt: e.target.value })}
                    placeholder="Concise 1-2 sentence synopsis for feed distribution, search snippets, and cards..."
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] focus:border-[var(--border-highlight)] rounded p-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Modular Block Stream */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-main)]">
                  <div>
                    <h2 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                      Modular Content Blocks ({content.blocks.length})
                    </h2>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Assemble reusable hero headers, rich paragraphs, code snippets, and callouts.
                    </p>
                  </div>
                </div>

                <BlockEditor
                  blocks={content.blocks}
                  onChange={(newBlocks) => handleContentChange({ blocks: newBlocks })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Contextual Inspector Tabs (4 cols) */}
        <div className="lg:col-span-4 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg overflow-hidden sticky top-20 space-y-4 shadow-xs">
          {/* Tab Selector Header */}
          <div className="grid grid-cols-3 border-b border-[var(--border-main)] bg-[var(--bg-card-subtle)] text-xs font-medium text-center">
            <button
              onClick={() => setActiveTab('content')}
              style={activeTab === 'content' ? { borderBottomColor: 'var(--brand-primary)', color: 'var(--brand-text)' } : undefined}
              className={`py-2.5 transition-colors border-b-2 ${
                activeTab === 'content' 
                  ? 'font-semibold' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Publishing
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              style={activeTab === 'seo' ? { borderBottomColor: 'var(--brand-primary)', color: 'var(--brand-text)' } : undefined}
              className={`py-2.5 transition-colors border-b-2 ${
                activeTab === 'seo' 
                  ? 'font-semibold' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              SEO & SERP
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              style={activeTab === 'comments' ? { borderBottomColor: 'var(--brand-primary)', color: 'var(--brand-text)' } : undefined}
              className={`py-2.5 transition-colors border-b-2 ${
                activeTab === 'comments' 
                  ? 'font-semibold' 
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Comments ({content.commentsCount || 0})
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-5 space-y-5 text-xs">
            {activeTab === 'content' && (
              <div className="space-y-5">
                {/* Workflow Transitions Box */}
                <div className="p-3.5 bg-[var(--bg-card-subtle)] rounded border border-[var(--border-main)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--text-primary)] font-mono text-[11px] uppercase">
                      Workflow Pipeline
                    </span>
                    <StatusBadge status={content.status} />
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)]">
                    Your active role: <span className="text-[var(--text-primary)] font-mono font-semibold capitalize">{currentUser.role.replace('_', ' ')}</span>
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {availableTransitions.length === 0 ? (
                      <div className="text-[11px] text-[var(--text-muted)] italic">
                        No state transitions available for your current role.
                      </div>
                    ) : (
                      availableTransitions.map(tr => (
                        <button
                          key={`${tr.from}->${tr.to}`}
                          onClick={() => handleStatusTransition(tr.to)}
                          style={tr.actionType === 'primary' ? { backgroundColor: 'var(--brand-primary)' } : undefined}
                          className={`w-full py-1.5 px-3 rounded text-xs font-medium text-center transition-colors ${
                            tr.actionType === 'primary' 
                              ? 'text-white hover:opacity-95' 
                              : tr.actionType === 'danger'
                              ? 'bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40'
                              : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border-main)]'
                          }`}
                        >
                          {tr.label}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono mb-1.5">
                    Lead Editorial Image
                  </label>
                  {content.featuredImageUrl ? (
                    <div className="relative rounded overflow-hidden border border-[var(--border-main)] group">
                      <img 
                        src={content.featuredImageUrl} 
                        alt="Featured hero" 
                        className="w-full h-32 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => handleContentChange({ featuredImageUrl: undefined })}
                        className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 hover:bg-black text-[10px] text-red-400 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleContentChange({ featuredImageUrl: '/src/assets/images/hero_editorial_arch_1790356991804.jpg' })}
                      className="border border-dashed border-[var(--border-main)] hover:border-[var(--border-highlight)] rounded p-4 text-center cursor-pointer bg-[var(--bg-card-subtle)]"
                    >
                      <ImageIcon className="w-5 h-5 text-[var(--text-muted)] mx-auto mb-1" />
                      <span className="text-[11px] text-[var(--text-muted)]">Click to select asset from library</span>
                    </div>
                  )}
                </div>

                {/* Metadata & Tagging */}
                <div className="space-y-3 pt-2 border-t border-[var(--border-main)]">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono mb-1">
                      Assigned Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={content.tags.join(', ')}
                      onChange={(e) => handleContentChange({ 
                        tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                      })}
                      placeholder="e.g. Distributed, Edge, CRDT"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono mb-1">
                      Publication Locale
                    </label>
                    <select
                      value={content.locale}
                      onChange={(e) => handleContentChange({ locale: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-hidden"
                    >
                      <option value="en-US">English (United States)</option>
                      <option value="de-DE">German (Germany)</option>
                      <option value="ja-JP">Japanese (Japan)</option>
                      <option value="fr-FR">French (France)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-4">
                {/* Google Search Live Preview */}
                <div className="p-3 bg-[var(--bg-card-subtle)] rounded border border-[var(--border-main)] space-y-1">
                  <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase">
                    Google Search Snippet Preview
                  </div>
                  <div className="text-xs text-emerald-400 font-mono truncate">
                    {content.seo.canonicalUrl || `https://kinetix-enterprise.io/${content.slug}`}
                  </div>
                  <div 
                    style={{ color: 'var(--brand-accent)' }}
                    className="text-sm font-medium hover:underline cursor-pointer truncate"
                  >
                    {content.seo.metaTitle || content.title}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                    {content.seo.metaDescription || content.excerpt || 'No meta description configured.'}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={content.seo.metaTitle}
                    onChange={(e) => handleContentChange({ 
                      seo: { ...content.seo, metaTitle: e.target.value } 
                    })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] rounded p-2 text-xs text-[var(--text-primary)] focus:outline-hidden"
                  />
                  <div className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 text-right">
                    {content.seo.metaTitle.length}/60 chars
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={content.seo.metaDescription}
                    onChange={(e) => handleContentChange({ 
                      seo: { ...content.seo, metaDescription: e.target.value } 
                    })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] rounded p-2 text-xs text-[var(--text-primary)] focus:outline-hidden resize-none"
                  />
                  <div className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 text-right">
                    {content.seo.metaDescription.length}/160 chars
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono mb-1">
                    Canonical URL Override
                  </label>
                  <input
                    type="url"
                    value={content.seo.canonicalUrl}
                    onChange={(e) => handleContentChange({ 
                      seo: { ...content.seo, canonicalUrl: e.target.value } 
                    })}
                    placeholder="https://kinetix-enterprise.io/..."
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-main)] rounded p-2 text-xs text-[var(--text-primary)] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-main)]">
                  <input
                    type="checkbox"
                    id="noIndex"
                    checked={content.seo.noIndex}
                    onChange={(e) => handleContentChange({ 
                      seo: { ...content.seo, noIndex: e.target.checked } 
                    })}
                    className="rounded bg-[var(--bg-input)] border-[var(--border-main)] text-[var(--brand-primary)] focus:ring-0"
                  />
                  <label htmlFor="noIndex" className="text-xs text-[var(--text-secondary)]">
                    Apply <code className="font-mono text-[var(--text-muted)]">noindex</code> robot directive
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <ContentCommentsPanel contentId={content.id} />
            )}
          </div>
        </div>
      </div>

      {/* Revision History Modal */}
      {content.id && (
        <RevisionHistoryModal
          isOpen={revisionsModalOpen}
          onClose={() => setRevisionsModalOpen(false)}
          contentId={content.id}
          onRestored={(restored) => {
            setContent(restored);
            showToast({ type: 'success', title: 'Content Restored to Selected Revision' });
          }}
        />
      )}
    </div>
  );
};
