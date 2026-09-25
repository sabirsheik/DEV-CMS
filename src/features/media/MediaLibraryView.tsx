import React, { useState, useEffect, useRef } from 'react';
import { mediaService, MediaFilterOptions } from '../../services/mediaService';
import { MediaItem, MediaType, MediaUploadProgress } from '../../types/media';
import { useCmsStore } from '../../stores/useCmsStore';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  Upload, 
  Grid, 
  List, 
  Search, 
  Filter, 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  Trash2, 
  Copy, 
  Download, 
  ExternalLink,
  Check,
  X,
  HardDrive,
  FileCheck
} from 'lucide-react';

export const MediaLibraryView: React.FC = () => {
  const { currentUser, showToast } = useCmsStore();

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter & Search
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');
  
  // Inspector drawer / modal
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Upload State
  const [uploads, setUploads] = useState<MediaUploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, [search, typeFilter]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const items = await mediaService.getMedia({
        search,
        type: typeFilter
      });
      setMediaList(items);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to load media assets' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      mediaService.simulateUpload(
        file,
        (progress) => {
          setUploads(prev => {
            const idx = prev.findIndex(u => u.id === progress.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = progress;
              return copy;
            }
            return [progress, ...prev];
          });
        },
        { id: currentUser.id, name: currentUser.name }
      ).then(newAsset => {
        setMediaList(prev => [newAsset, ...prev]);
        showToast({
          type: 'success',
          title: 'Asset Ingested',
          message: `Uploaded ${newAsset.filename} to media storage.`
        });
      });
    });
  };

  const handleUpdateMetadata = async () => {
    if (!selectedItem) return;
    try {
      const updated = await mediaService.updateMedia(selectedItem.id, {
        title: selectedItem.title,
        altText: selectedItem.altText,
        caption: selectedItem.caption
      });
      setMediaList(prev => prev.map(m => m.id === updated.id ? updated : m));
      setSelectedItem(updated);
      showToast({ type: 'success', title: 'Asset Metadata Saved' });
    } catch (err) {
      showToast({ type: 'error', title: 'Update failed' });
    }
  };

  const handleDeleteAsset = async () => {
    if (!selectedItem) return;
    try {
      await mediaService.deleteMedia(selectedItem.id);
      setMediaList(prev => prev.filter(m => m.id !== selectedItem.id));
      showToast({ type: 'success', title: 'Asset Deleted from CDN' });
      setSelectedItem(null);
    } catch (err) {
      showToast({ type: 'error', title: 'Deletion failed' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast({ type: 'info', title: 'Asset URL Copied to Clipboard' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Media Asset Library</span>
            <span className="text-xs font-mono font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-800">
              {mediaList.length} assets
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global CDN asset repository with automatic WebP derivation, EXIF extraction, and edge caching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Assets</span>
          </button>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0f172a]/60 p-3 rounded-lg border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, filename, or tags..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 focus:border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded focus:outline-hidden"
          >
            <option value="all">All Asset Types</option>
            <option value="image">Images</option>
            <option value="document">Documents (PDF)</option>
            <option value="video">Videos</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-800 rounded bg-slate-900 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors ${viewMode === 'grid' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition-colors ${viewMode === 'list' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Uploads Drawer */}
      {uploads.some(u => u.status === 'uploading' || u.status === 'processing') && (
        <div className="p-4 bg-slate-900/90 border border-blue-500/30 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-200 font-semibold">
            <span>Uploading Assets ({uploads.filter(u => u.status !== 'completed').length})</span>
          </div>
          {uploads.filter(u => u.status !== 'completed').map(u => (
            <div key={u.id} className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span className="truncate max-w-xs">{u.name}</span>
                <span className="font-mono">{u.status === 'processing' ? 'Processing WebP...' : `${u.progress}%`}</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-150" style={{ width: `${u.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Grid or List */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-4/3 bg-slate-800/40 rounded-lg border border-slate-800"></div>
          ))}
        </div>
      ) : mediaList.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No Media Assets Found"
          description="Drag and drop images, PDFs, or design assets to upload to your enterprise CDN."
          actionLabel="Upload First Asset"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group bg-[#0f172a]/60 border border-slate-800 hover:border-blue-500/50 rounded-lg overflow-hidden cursor-pointer transition-all flex flex-col"
            >
              <div className="aspect-4/3 bg-slate-950 flex items-center justify-center overflow-hidden relative">
                {item.type === 'image' && item.url ? (
                  <img
                    src={item.url}
                    alt={item.altText}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <FileText className="w-8 h-8 mb-1" />
                    <span className="text-[10px] uppercase font-mono">{item.type}</span>
                  </div>
                )}
                <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-black/70 px-1.5 py-0.5 rounded text-slate-300">
                  {(item.sizeBytes / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div className="text-xs font-medium text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                  {item.title}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate mt-1 flex items-center justify-between">
                  <span>{item.folder}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0f172a]/60 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/50 text-[11px] text-slate-400 uppercase font-mono">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Folder</th>
                <th className="px-4 py-3">Uploaded By</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mediaList.map(item => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium text-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.type === 'image' && item.url ? (
                        <img src={item.url} alt={item.altText} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <span className="truncate max-w-xs">{item.title}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400 uppercase">{item.type}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-400">{(item.sizeBytes / 1024 / 1024).toFixed(2)} MB</td>
                  <td className="px-4 py-2.5 text-slate-300">{item.folder}</td>
                  <td className="px-4 py-2.5 text-slate-400">{item.uploader.name}</td>
                  <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => copyToClipboard(item.url)}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded"
                      title="Copy URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Asset Inspector Modal / Detail Drawer */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title="Media Asset Metadata & Edge Config"
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Asset Preview */}
            <div className="bg-slate-950 rounded-lg border border-slate-800 p-2 flex items-center justify-center max-h-72 overflow-hidden">
              {selectedItem.type === 'image' && selectedItem.url ? (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.altText}
                  className="max-h-64 object-contain rounded"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                  <FileText className="w-12 h-12 mb-2" />
                  <span className="font-mono text-xs">{selectedItem.filename}</span>
                </div>
              )}
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                    Asset Title
                  </label>
                  <input
                    type="text"
                    value={selectedItem.title}
                    onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                    Alt Text (Accessibility)
                  </label>
                  <input
                    type="text"
                    value={selectedItem.altText}
                    onChange={(e) => setSelectedItem({ ...selectedItem, altText: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                    Caption / Citation
                  </label>
                  <textarea
                    rows={2}
                    value={selectedItem.caption || ''}
                    onChange={(e) => setSelectedItem({ ...selectedItem, caption: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Readonly Specs */}
              <div className="bg-slate-900/60 p-4 rounded border border-slate-800 space-y-2.5 font-mono text-[11px]">
                <div className="text-slate-400 uppercase font-semibold text-[10px] pb-1 border-b border-slate-800">
                  CDN Technical Specs
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">File Name:</span>
                  <span className="text-slate-200 truncate max-w-[160px]">{selectedItem.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MIME Type:</span>
                  <span className="text-slate-200">{selectedItem.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">File Size:</span>
                  <span className="text-slate-200">{(selectedItem.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                {selectedItem.dimensions && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dimensions:</span>
                    <span className="text-slate-200">{selectedItem.dimensions.width} × {selectedItem.dimensions.height} px</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Uploader:</span>
                  <span className="text-slate-200">{selectedItem.uploader.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Edge Ingestion:</span>
                  <span className="text-slate-200">{new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 rounded text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Asset</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(selectedItem.url)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy CDN URL</span>
                </button>
                <button
                  onClick={handleUpdateMetadata}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAsset}
        title="Delete CDN Asset"
        message="Are you sure you want to permanently delete this file? Any published content referencing this asset URL will result in broken media."
        confirmLabel="Delete Permanently"
        isDestructive
      />
    </div>
  );
};
