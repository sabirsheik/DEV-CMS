import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import { CmsPageItem, NavigationMenu, NavMenuItem } from '../../types/navigation';
import { useCmsStore } from '../../stores/useCmsStore';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { 
  FolderTree, 
  Menu as MenuIcon, 
  Plus, 
  FileText, 
  ExternalLink, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  CornerDownRight, 
  Edit3,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export const PagesNavigationView: React.FC = () => {
  const { showToast } = useCmsStore();

  const [activeTab, setActiveTab] = useState<'pages' | 'menus'>('pages');
  const [pages, setPages] = useState<CmsPageItem[]>([]);
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<NavigationMenu | null>(null);
  const [loading, setLoading] = useState(true);

  // New Page Modal
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageTemplate, setNewPageTemplate] = useState<CmsPageItem['template']>('default');

  // New Menu Item
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, m] = await Promise.all([
        settingsService.getPages(),
        settingsService.getMenus()
      ]);
      setPages(p);
      setMenus(m);
      if (m.length > 0 && !selectedMenu) setSelectedMenu(m[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    try {
      const created = await settingsService.createPage({
        title: newPageTitle,
        slug: newPageSlug || newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        template: newPageTemplate,
        status: 'published',
        author: 'Sarah Chen',
        depth: 0
      });
      setPages(prev => [...prev, created]);
      setPageModalOpen(false);
      setNewPageTitle('');
      setNewPageSlug('');
      showToast({ type: 'success', title: 'Page Entity Created' });
    } catch (err) {
      showToast({ type: 'error', title: 'Page creation failed' });
    }
  };

  const handleAddMenuItem = () => {
    if (!selectedMenu || !newLabel.trim() || !newUrl.trim()) return;

    const newItem: NavMenuItem = {
      id: `item-${Date.now()}`,
      label: newLabel,
      url: newUrl,
      order: selectedMenu.items.length + 1
    };

    const updatedItems = [...selectedMenu.items, newItem];
    settingsService.updateMenu(selectedMenu.id, updatedItems).then(updated => {
      setSelectedMenu(updated);
      setMenus(prev => prev.map(m => m.id === updated.id ? updated : m));
      setNewLabel('');
      setNewUrl('');
      showToast({ type: 'success', title: 'Navigation Link Added' });
    });
  };

  const handleRemoveMenuItem = (itemId: string) => {
    if (!selectedMenu) return;
    const updated = selectedMenu.items.filter(i => i.id !== itemId);
    settingsService.updateMenu(selectedMenu.id, updated).then(m => {
      setSelectedMenu(m);
      setMenus(prev => prev.map(menu => menu.id === m.id ? m : menu));
      showToast({ type: 'info', title: 'Menu item removed' });
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Pages & Navigation Architecture
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Construct nested page hierarchies, template assignments, and header/footer menu structures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('pages')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'pages' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pages Hierarchy
            </button>
            <button
              onClick={() => setActiveTab('menus')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'menus' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Navigation Menus
            </button>
          </div>

          {activeTab === 'pages' && (
            <button
              onClick={() => setPageModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Page</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'pages' ? (
        /* Pages Tree Table */
        <div className="bg-[#0f172a]/60 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/50 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
              <tr>
                <th className="px-4 py-3">Page Title & Path</th>
                <th className="px-4 py-3">Template Layout</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pages.map(page => (
                <tr key={page.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${page.depth * 20}px` }}>
                      {page.depth > 0 && <CornerDownRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-100">{page.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">/{page.slug}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400 capitalize">
                    {page.template.replace('_', ' ')}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={page.status} />
                  </td>

                  <td className="px-4 py-3 text-slate-300">
                    {page.author}
                  </td>

                  <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-400">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Navigation Menu Builder */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Menus List (4 cols) */}
          <div className="lg:col-span-4 bg-[#0f172a]/60 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-slate-800 bg-[#0b0f17]/40 text-xs font-semibold text-slate-300">
              Configured Menus ({menus.length})
            </div>
            <div className="divide-y divide-slate-800/60">
              {menus.map(m => {
                const isSelected = selectedMenu?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMenu(m)}
                    className={`w-full p-4 text-left transition-colors flex items-start justify-between ${
                      isSelected ? 'bg-blue-600/15 border-l-2 border-blue-500' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                        <MenuIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>{m.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Location: {m.location} · {m.items.length} top-level links
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Menu Items Editor (8 cols) */}
          <div className="lg:col-span-8 bg-[#0f172a]/60 border border-slate-800 rounded-lg p-5 space-y-5">
            {selectedMenu && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">{selectedMenu.name}</h2>
                    <p className="text-xs text-slate-400 font-mono text-[11px] mt-0.5">
                      Binding Target: {selectedMenu.location}
                    </p>
                  </div>
                </div>

                {/* Add Item Row */}
                <div className="p-3 bg-slate-900 rounded border border-slate-800 flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Link Label (e.g. Products)"
                    className="w-full sm:w-1/3 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="URL Path (/solutions/cloud)"
                    className="w-full sm:flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden"
                  />
                  <button
                    onClick={handleAddMenuItem}
                    disabled={!newLabel.trim() || !newUrl.trim()}
                    className="w-full sm:w-auto px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs font-medium transition-colors shrink-0"
                  >
                    Add Item
                  </button>
                </div>

                {/* Items List */}
                <div className="border border-slate-800 rounded-lg divide-y divide-slate-800/80 bg-slate-950/40">
                  {selectedMenu.items.map(item => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-200">{item.label}</span>
                        <span className="font-mono text-[11px] text-blue-400">{item.url}</span>
                        {item.children && item.children.length > 0 && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                            {item.children.length} sub-links
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveMenuItem(item.id)}
                        className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
                        title="Remove link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* New Page Modal */}
      {pageModalOpen && (
        <Modal
          isOpen={pageModalOpen}
          onClose={() => setPageModalOpen(false)}
          title="Create New Site Page"
          maxWidth="md"
        >
          <form onSubmit={handleCreatePage} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Page Title
              </label>
              <input
                type="text"
                required
                value={newPageTitle}
                onChange={(e) => {
                  setNewPageTitle(e.target.value);
                  setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                placeholder="e.g. Solutions Overview"
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Permalink Slug
              </label>
              <input
                type="text"
                required
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 font-mono rounded p-2 text-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Template Layout
              </label>
              <select
                value={newPageTemplate}
                onChange={(e) => setNewPageTemplate(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
              >
                <option value="default">Default Container Layout</option>
                <option value="landing">Marketing Landing Edge Canvas</option>
                <option value="docs">Technical Documentation Sidebar</option>
                <option value="full_width">Full Width Edge Grid</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPageModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
              >
                Create Page
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
