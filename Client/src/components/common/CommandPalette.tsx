import React, { useState, useEffect, useRef } from 'react';
import { useCmsStore } from '../../stores/useCmsStore';
import { contentService } from '../../services/contentService';
import { mediaService } from '../../services/mediaService';
import { userService } from '../../services/userService';
import { ContentItem } from '../../types/content';
import { MediaItem } from '../../types/media';
import { UserItem } from '../../types/user';
import { 
  Search, 
  FileText, 
  Image as ImageIcon, 
  User as UserIcon, 
  PlusCircle, 
  Layers, 
  Clock, 
  Settings as SettingsIcon,
  ShieldAlert,
  ArrowRight,
  X
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, navigateTo } = useCmsStore();
  const [query, setQuery] = useState('');
  const [contentResults, setContentResults] = useState<ContentItem[]>([]);
  const [mediaResults, setMediaResults] = useState<MediaItem[]>([]);
  const [userResults, setUserResults] = useState<UserItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      searchEverything(query);
    }
  }, [commandPaletteOpen, query]);

  const searchEverything = async (q: string) => {
    if (!q.trim()) {
      const c = await contentService.getAllContent({ pageSize: 4 });
      const m = await mediaService.getMedia();
      const u = await userService.getUsers();
      setContentResults(c.data.slice(0, 3));
      setMediaResults(m.slice(0, 2));
      setUserResults(u.slice(0, 2));
      return;
    }

    const c = await contentService.getAllContent({ search: q, pageSize: 4 });
    const m = await mediaService.getMedia({ search: q });
    const u = (await userService.getUsers()).filter(user => 
      user.name.toLowerCase().includes(q.toLowerCase()) || 
      user.email.toLowerCase().includes(q.toLowerCase())
    );

    setContentResults(c.data);
    setMediaResults(m.slice(0, 3));
    setUserResults(u.slice(0, 3));
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-[var(--bg-elevated)] border border-[var(--border-main)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in-0 zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input bar */}
        <div className="flex items-center px-4 py-3 border-b border-[var(--border-main)] gap-3 bg-[var(--bg-card)]">
          <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, jump to content, media asset, or user..."
            className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] text-[var(--text-muted)] font-mono border border-[var(--border-main)] rounded px-1.5 py-0.5">
            ESC
          </span>
        </div>

        {/* Quick jump actions if query is empty */}
        {!query && (
          <div className="p-3 border-b border-[var(--border-main)] bg-[var(--bg-card-subtle)]">
            <span className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase px-2 mb-1.5 block font-mono">
              Quick Actions
            </span>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <button
                onClick={() => {
                  setCommandPaletteOpen(false);
                  navigateTo('editor', { contentId: null });
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] text-left transition-colors"
              >
                <PlusCircle 
                  className="w-3.5 h-3.5"
                  style={{ color: 'var(--brand-accent)' }}
                />
                <span>Create New Article</span>
              </button>
              <button
                onClick={() => {
                  setCommandPaletteOpen(false);
                  navigateTo('media');
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] text-left transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload Media Assets</span>
              </button>
              <button
                onClick={() => {
                  setCommandPaletteOpen(false);
                  navigateTo('workflow');
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] text-left transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Review Queue</span>
              </button>
              <button
                onClick={() => {
                  setCommandPaletteOpen(false);
                  navigateTo('settings');
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] text-left transition-colors"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>System Configuration</span>
              </button>
            </div>
          </div>
        )}

        {/* Results scroll area */}
        <div className="p-3 overflow-y-auto space-y-4">
          {/* Content results */}
          {contentResults.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase px-2 mb-1 block font-mono">
                Content Records
              </span>
              <div className="space-y-1">
                {contentResults.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      navigateTo('editor', { contentId: item.id });
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded text-left hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText 
                        className="w-4 h-4 shrink-0"
                        style={{ color: 'var(--brand-accent)' }}
                      />
                      <div className="truncate">
                        <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{item.type}</span>
                          <span>·</span>
                          <span>{item.status}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Media results */}
          {mediaResults.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase px-2 mb-1 block font-mono">
                Media Assets
              </span>
              <div className="space-y-1">
                {mediaResults.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      navigateTo('media');
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded text-left hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                          {m.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono">
                          {m.filename} · {(m.sizeBytes / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User results */}
          {userResults.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase px-2 mb-1 block font-mono">
                Team Directory
              </span>
              <div className="space-y-1">
                {userResults.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      navigateTo('users');
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded text-left hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserIcon className="w-4 h-4 text-purple-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono truncate">
                          {u.email} · {u.role}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {contentResults.length === 0 && mediaResults.length === 0 && userResults.length === 0 && query && (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No matching records found for "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[var(--border-main)] bg-[var(--bg-card-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          <span>DEV CMS Search Engine</span>
        </div>
      </div>
    </div>
  );
};
