import React, { useState } from 'react';
import { ContentBlock, BlockType } from '../../../types/content';
import { 
  Type, 
  Image as ImageIcon, 
  Quote, 
  Code, 
  AlertCircle, 
  HelpCircle, 
  MousePointerClick, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Plus, 
  Maximize2,
  ChevronDown
} from 'lucide-react';

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const AVAILABLE_BLOCKS: { type: BlockType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'text', label: 'Rich Text Paragraph', icon: Type, description: 'Formatted body copy and technical explanations' },
  { type: 'hero', label: 'Hero Header Block', icon: Maximize2, description: 'Lead banner with headline, kicker and subtitle' },
  { type: 'quote', label: 'Editorial Pull Quote', icon: Quote, description: 'Attributed quote with author title and citation' },
  { type: 'code', label: 'Syntax Code Block', icon: Code, description: 'Formatted syntax with language switcher' },
  { type: 'callout', label: 'Audited Callout Box', icon: AlertCircle, description: 'Important disclaimer, notice or compliance caveat' },
  { type: 'faq', label: 'Structured FAQ Accordion', icon: HelpCircle, description: 'Collapsible questions for knowledge base & SEO' },
  { type: 'cta', label: 'Conversion Action Callout', icon: MousePointerClick, description: 'Action button with headline for conversion' }
];

export const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange }) => {
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const addBlock = (type: BlockType) => {
    let initialData: Record<string, any> = {};
    if (type === 'text') initialData = { content: 'Add editorial prose here...' };
    if (type === 'hero') initialData = { headline: 'Section Headline', kicker: 'Engineering Kicker', lead: 'Introductory context...' };
    if (type === 'quote') initialData = { quote: 'Crucial architectural takeaway.', attribution: 'Architect Name', role: 'Staff Principal' };
    if (type === 'code') initialData = { language: 'typescript', code: '// Implementation details\nconst config = { strict: true };' };
    if (type === 'callout') initialData = { title: 'Compliance Notice', message: 'Verified against current security audit standards.', variant: 'info' };
    if (type === 'faq') initialData = { question: 'What is the deployment SLA?', answer: 'Edge distribution propagates under 250 milliseconds globally.' };
    if (type === 'cta') initialData = { headline: 'Ready to benchmark your clusters?', buttonText: 'Schedule Technical Briefing', link: '/contact' };

    const newBlock: ContentBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      order: blocks.length + 1,
      data: initialData
    };

    onChange([...blocks, newBlock]);
    setAddMenuOpen(false);
  };

  const updateBlockData = (id: string, key: string, value: any) => {
    const updated = blocks.map(b => {
      if (b.id === id) {
        return { ...b, data: { ...b.data, [key]: value } };
      }
      return b;
    });
    onChange(updated);
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const reordered = [...blocks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIdx, 0, moved);
    onChange(reordered.map((b, i) => ({ ...b, order: i + 1 })));
  };

  return (
    <div className="space-y-4">
      {/* Block Stream */}
      <div className="space-y-3">
        {blocks.map((block, idx) => (
          <div 
            key={block.id}
            className="group relative bg-[#0b0f17]/90 border border-slate-800 hover:border-slate-700 rounded-lg p-4 transition-all"
          >
            {/* Block Action Bar */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-slate-300 font-semibold text-[10px]">
                  {idx + 1}
                </span>
                <span className="uppercase text-slate-300 font-medium">
                  {block.type} BLOCK
                </span>
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveBlock(idx, 'up')}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded"
                  title="Move Up"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === blocks.length - 1}
                  onClick={() => moveBlock(idx, 'down')}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded"
                  title="Move Down"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="p-1 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded transition-colors ml-1"
                  title="Delete Block"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Block Specific Form Inputs */}
            {block.type === 'text' && (
              <div>
                <textarea
                  rows={4}
                  value={block.data.content || ''}
                  onChange={(e) => updateBlockData(block.id, 'content', e.target.value)}
                  placeholder="Compose article paragraphs..."
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-blue-500/50 rounded p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden leading-relaxed resize-y"
                />
              </div>
            )}

            {block.type === 'hero' && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={block.data.kicker || ''}
                    onChange={(e) => updateBlockData(block.id, 'kicker', e.target.value)}
                    placeholder="Kicker (e.g. Systems Architecture)"
                    className="col-span-1 bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={block.data.headline || ''}
                    onChange={(e) => updateBlockData(block.id, 'headline', e.target.value)}
                    placeholder="Primary Section Headline"
                    className="col-span-2 bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-semibold focus:outline-hidden"
                  />
                </div>
                <textarea
                  rows={2}
                  value={block.data.lead || ''}
                  onChange={(e) => updateBlockData(block.id, 'lead', e.target.value)}
                  placeholder="Lead subheader narrative..."
                  className="w-full bg-slate-900/60 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-hidden resize-none"
                />
              </div>
            )}

            {block.type === 'quote' && (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={block.data.quote || ''}
                  onChange={(e) => updateBlockData(block.id, 'quote', e.target.value)}
                  placeholder="Enter quote copy..."
                  className="w-full bg-slate-900/60 border border-slate-800 italic rounded p-2 text-xs text-slate-200 focus:outline-hidden resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={block.data.attribution || ''}
                    onChange={(e) => updateBlockData(block.id, 'attribution', e.target.value)}
                    placeholder="Attribution name"
                    className="bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={block.data.role || ''}
                    onChange={(e) => updateBlockData(block.id, 'role', e.target.value)}
                    placeholder="Job title or organization"
                    className="bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {block.type === 'code' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <select
                    value={block.data.language || 'typescript'}
                    onChange={(e) => updateBlockData(block.id, 'language', e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 rounded px-2 py-1 focus:outline-hidden"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="json">JSON</option>
                    <option value="graphql">GraphQL</option>
                    <option value="sql">SQL</option>
                    <option value="bash">Bash</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>
                <textarea
                  rows={4}
                  value={block.data.code || ''}
                  onChange={(e) => updateBlockData(block.id, 'code', e.target.value)}
                  placeholder="// Paste or write source code here..."
                  className="w-full bg-slate-950 font-mono text-xs text-emerald-400 p-3 rounded border border-slate-800 focus:outline-hidden resize-y leading-relaxed"
                />
              </div>
            )}

            {block.type === 'callout' && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={block.data.variant || 'info'}
                    onChange={(e) => updateBlockData(block.id, 'variant', e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-2 py-1.5 focus:outline-hidden"
                  >
                    <option value="info">Info Callout</option>
                    <option value="warning">Warning / Caution</option>
                    <option value="audit">Compliance / Audit</option>
                  </select>
                  <input
                    type="text"
                    value={block.data.title || ''}
                    onChange={(e) => updateBlockData(block.id, 'title', e.target.value)}
                    placeholder="Callout Title"
                    className="col-span-2 bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-semibold focus:outline-hidden"
                  />
                </div>
                <textarea
                  rows={2}
                  value={block.data.message || ''}
                  onChange={(e) => updateBlockData(block.id, 'message', e.target.value)}
                  placeholder="Callout narrative..."
                  className="w-full bg-slate-900/60 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-hidden resize-none"
                />
              </div>
            )}

            {block.type === 'faq' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.data.question || ''}
                  onChange={(e) => updateBlockData(block.id, 'question', e.target.value)}
                  placeholder="Question text"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-hidden"
                />
                <textarea
                  rows={2}
                  value={block.data.answer || ''}
                  onChange={(e) => updateBlockData(block.id, 'answer', e.target.value)}
                  placeholder="Answer explanation..."
                  className="w-full bg-slate-900/60 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-hidden resize-none"
                />
              </div>
            )}

            {block.type === 'cta' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.data.headline || ''}
                  onChange={(e) => updateBlockData(block.id, 'headline', e.target.value)}
                  placeholder="CTA Banner Headline"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-hidden"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={block.data.buttonText || ''}
                    onChange={(e) => updateBlockData(block.id, 'buttonText', e.target.value)}
                    placeholder="Button Label"
                    className="bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={block.data.link || ''}
                    onChange={(e) => updateBlockData(block.id, 'link', e.target.value)}
                    placeholder="Target URL Path"
                    className="bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Block Button & Drawer */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setAddMenuOpen(!addMenuOpen)}
          className="w-full py-2.5 border border-dashed border-slate-800 hover:border-blue-500/50 rounded-lg text-xs font-medium text-slate-400 hover:text-blue-400 bg-[#0f172a]/30 hover:bg-slate-900/50 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Insert Modular Content Block</span>
        </button>

        {addMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-[#0f172a] border border-slate-800 rounded-lg shadow-2xl z-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 animate-in fade-in-0 zoom-in-95 duration-100">
            {AVAILABLE_BLOCKS.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => addBlock(item.type)}
                  className="flex items-start gap-2.5 p-2.5 rounded text-left hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
                >
                  <div className="p-1.5 rounded bg-slate-800 text-blue-400 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
