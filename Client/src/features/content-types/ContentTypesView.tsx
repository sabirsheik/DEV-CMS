import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { ContentTypeModel, ContentFieldDefinition } from '../../types/content';
import { useCmsStore } from '../../stores/useCmsStore';
import { Modal } from '../../components/common/Modal';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  Check, 
  Code, 
  Hash, 
  ToggleLeft, 
  Calendar, 
  Image as ImageIcon, 
  List, 
  Link, 
  Mail,
  MoveUp,
  MoveDown
} from 'lucide-react';

const FIELD_TYPES: { type: ContentFieldDefinition['type']; label: string; icon: React.ElementType }[] = [
  { type: 'text', label: 'Single-line Text', icon: FileText },
  { type: 'rich_text', label: 'Rich Text Prose', icon: FileText },
  { type: 'number', label: 'Numeric Figure', icon: Hash },
  { type: 'boolean', label: 'Boolean Flag', icon: ToggleLeft },
  { type: 'datetime', label: 'Date & Time', icon: Calendar },
  { type: 'image', label: 'Image Asset Reference', icon: ImageIcon },
  { type: 'select', label: 'Single Select Option', icon: List },
  { type: 'multi_select', label: 'Multi Select Options', icon: List },
  { type: 'relation', label: 'Content Model Relation', icon: Link },
  { type: 'url', label: 'URL Address', icon: Link },
  { type: 'email', label: 'Email Format', icon: Mail },
  { type: 'json', label: 'JSON Document Schema', icon: Code }
];

export const ContentTypesView: React.FC = () => {
  const { showToast, navigateTo } = useCmsStore();

  const [types, setTypes] = useState<ContentTypeModel[]>([]);
  const [selectedType, setSelectedType] = useState<ContentTypeModel | null>(null);
  const [loading, setLoading] = useState(true);

  // Field Edit Modal
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<ContentFieldDefinition | null>(null);

  // New Model Modal
  const [newModelModalOpen, setNewModelModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelDesc, setNewModelDesc] = useState('');

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    setLoading(true);
    try {
      const data = await contentService.getContentTypes();
      setTypes(data);
      if (data.length > 0 && !selectedType) {
        setSelectedType(data[0]);
      }
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to load content models' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveField = () => {
    if (!selectedType || !editingField) return;

    let updatedFields = [...selectedType.fields];
    const existingIdx = updatedFields.findIndex(f => f.id === editingField.id);

    if (existingIdx >= 0) {
      updatedFields[existingIdx] = editingField;
    } else {
      updatedFields.push(editingField);
    }

    const updatedModel = { ...selectedType, fields: updatedFields };
    setSelectedType(updatedModel);
    contentService.saveContentType(updatedModel);
    setFieldModalOpen(false);
    showToast({ type: 'success', title: 'Field Schema Updated' });
  };

  const handleRemoveField = (fieldId: string) => {
    if (!selectedType) return;
    const updated = {
      ...selectedType,
      fields: selectedType.fields.filter(f => f.id !== fieldId)
    };
    setSelectedType(updated);
    contentService.saveContentType(updated);
    showToast({ type: 'info', title: 'Field Removed' });
  };

  const handleCreateNewModel = async () => {
    if (!newModelName.trim()) return;
    const slug = newModelName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newModel: ContentTypeModel = {
      id: slug,
      name: newModelName,
      slug,
      description: newModelDesc || 'Custom enterprise content schema',
      iconName: 'Layers',
      itemCount: 0,
      createdAt: new Date().toISOString(),
      fields: [
        { id: `f-${Date.now()}`, name: 'Title', key: 'title', type: 'text', required: true, description: 'Primary headline' },
        { id: `f-${Date.now() + 1}`, name: 'Slug', key: 'slug', type: 'text', required: true, description: 'Unique permalink' }
      ]
    };

    await contentService.saveContentType(newModel);
    setTypes(prev => [...prev, newModel]);
    setSelectedType(newModel);
    setNewModelModalOpen(false);
    setNewModelName('');
    setNewModelDesc('');
    showToast({ type: 'success', title: 'New Content Model Initialized' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Content Models & Schema Definitions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Define typed data models, validation constraints, and component fields consumed by client channels.
          </p>
        </div>

        <button
          onClick={() => setNewModelModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Content Model</span>
        </button>
      </div>

      {/* Main Grid: Left Model Selector + Right Schema Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Models Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-[#0f172a]/60 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-[#0b0f17]/40 text-xs font-semibold text-slate-300">
            Registered Models ({types.length})
          </div>

          <div className="divide-y divide-slate-800/60">
            {types.map(model => {
              const isSelected = selectedType?.id === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedType(model)}
                  className={`w-full p-4 text-left transition-colors flex items-start justify-between ${
                    isSelected ? 'bg-blue-600/15 border-l-2 border-blue-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{model.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {model.description}
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      {model.fields.length} fields · {model.itemCount} records
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    /{model.slug}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Schema Inspector & Fields Table (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedType && (
            <div className="bg-[#0f172a]/60 border border-slate-800 rounded-lg p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-100">
                      {selectedType.name} Schema Structure
                    </h2>
                    <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                      model:{selectedType.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedType.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingField({
                      id: `f-${Date.now()}`,
                      name: '',
                      key: '',
                      type: 'text',
                      required: false,
                      description: ''
                    });
                    setFieldModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                  <span>Add Field Definition</span>
                </button>
              </div>

              {/* Fields Table */}
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/50 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                    <tr>
                      <th className="px-4 py-2.5">Field Name & Key</th>
                      <th className="px-4 py-2.5">Field Type</th>
                      <th className="px-4 py-2.5">Required</th>
                      <th className="px-4 py-2.5">Description</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedType.fields.map(field => (
                      <tr key={field.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-100">{field.name}</div>
                          <div className="text-[10px] font-mono text-blue-400">{field.key}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-300 capitalize">
                          {field.type.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3">
                          {field.required ? (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                              Required
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-500">
                              Optional
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-[11px] max-w-xs truncate">
                          {field.description || '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingField({ ...field });
                                setFieldModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-200 rounded"
                              title="Edit field"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveField(field.id)}
                              className="p-1 text-slate-400 hover:text-red-400 rounded"
                              title="Remove field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* JSON Schema Representation Preview */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-500 font-mono uppercase">
                  Runtime JSON Schema Export
                </div>
                <pre className="text-[11px] font-mono text-emerald-400 max-h-36 overflow-y-auto">
                  {JSON.stringify({
                    $schema: "http://json-schema.org/draft-07/schema#",
                    title: selectedType.name,
                    type: "object",
                    properties: selectedType.fields.reduce((acc, f) => ({
                      ...acc,
                      [f.key]: { type: f.type, required: f.required }
                    }), {})
                  }, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Field Configuration Modal */}
      {fieldModalOpen && editingField && (
        <Modal
          isOpen={fieldModalOpen}
          onClose={() => setFieldModalOpen(false)}
          title="Configure Field Property"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Display Label
              </label>
              <input
                type="text"
                value={editingField.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
                  setEditingField({ ...editingField, name, key: editingField.key || key });
                }}
                placeholder="e.g. Hero Headline"
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Field API Key
              </label>
              <input
                type="text"
                value={editingField.key}
                onChange={(e) => setEditingField({ ...editingField, key: e.target.value })}
                placeholder="heroHeadline"
                className="w-full bg-slate-900 border border-slate-800 font-mono rounded p-2 text-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Field Type
              </label>
              <select
                value={editingField.type}
                onChange={(e) => setEditingField({ ...editingField, type: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
              >
                {FIELD_TYPES.map(ft => (
                  <option key={ft.type} value={ft.type}>{ft.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Helper / Tooltip Description
              </label>
              <input
                type="text"
                value={editingField.description || ''}
                onChange={(e) => setEditingField({ ...editingField, description: e.target.value })}
                placeholder="Instruction for editors..."
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="checkbox"
                id="reqCheck"
                checked={editingField.required}
                onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <label htmlFor="reqCheck" className="text-slate-300">
                Mark as Mandatory / Required in editor
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setFieldModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveField}
                disabled={!editingField.name || !editingField.key}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded font-medium"
              >
                Save Field
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Model Creation Modal */}
      {newModelModalOpen && (
        <Modal
          isOpen={newModelModalOpen}
          onClose={() => setNewModelModalOpen(false)}
          title="Create New Content Model"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Model Name
              </label>
              <input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="e.g. Press Release, Event, Podcast"
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Model Purpose & Description
              </label>
              <textarea
                rows={3}
                value={newModelDesc}
                onChange={(e) => setNewModelDesc(e.target.value)}
                placeholder="Briefly describe what this content model handles..."
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setNewModelModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewModel}
                disabled={!newModelName.trim()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded font-medium"
              >
                Create Model
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
