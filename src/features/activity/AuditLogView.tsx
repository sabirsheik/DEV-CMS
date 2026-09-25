import React, { useState, useEffect } from 'react';
import { activityService } from '../../services/activityService';
import { AuditLogEntry } from '../../types/activity';
import { useCmsStore } from '../../stores/useCmsStore';
import { Modal } from '../../components/common/Modal';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  Terminal, 
  Calendar, 
  User, 
  ExternalLink 
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { showToast } = useCmsStore();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    loadLogs();
  }, [search, actionFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await activityService.getAuditLogs({
        search,
        action: actionFilter
      });
      setLogs(data);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to load audit trail' });
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogCsv = () => {
    const csvHeader = 'Timestamp,Actor,Email,Role,Action,Resource,IP_Address\n';
    const csvRows = logs.map(l => 
      `"${l.timestamp}","${l.actor.name}","${l.actor.email}","${l.actor.role}","${l.action}","${l.resourceTitle}","${l.ipAddress}"`
    ).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kinetix-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast({ type: 'success', title: 'Audit Trail Exported to CSV' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Immutable Audit Trail & Compliance Log</span>
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {logs.length} logged events
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident system activity recording actor identity, authorization scope, and resource state mutation.
          </p>
        </div>

        <button
          onClick={exportAuditLogCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#0f172a]/60 p-3 rounded-lg border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor name, resource, or action..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 focus:border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded focus:outline-hidden font-mono"
        >
          <option value="all">All Audit Actions</option>
          <option value="content.created">content.created</option>
          <option value="content.updated">content.updated</option>
          <option value="content.published">content.published</option>
          <option value="content.reviewed">content.reviewed</option>
          <option value="content.scheduled">content.scheduled</option>
          <option value="media.uploaded">media.uploaded</option>
          <option value="user.invited">user.invited</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[#0f172a]/60 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/50 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
            <tr>
              <th className="px-4 py-3">Timestamp (UTC)</th>
              <th className="px-4 py-3">Actor & Identity</th>
              <th className="px-4 py-3">Action Signature</th>
              <th className="px-4 py-3">Target Resource</th>
              <th className="px-4 py-3 font-mono">Origin IP</th>
              <th className="px-4 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {logs.map(log => (
              <tr 
                key={log.id}
                onClick={() => setSelectedEntry(log)}
                className="hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-slate-400 tabular-nums">
                  {new Date(log.timestamp).toLocaleString()}
                </td>

                <td className="px-4 py-3 font-sans">
                  <div className="font-semibold text-slate-200">{log.actor.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{log.actor.role}</div>
                </td>

                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    log.action.includes('published') ? 'bg-emerald-500/20 text-emerald-300' :
                    log.action.includes('reviewed') ? 'bg-amber-500/20 text-amber-300' :
                    log.action.includes('deleted') ? 'bg-red-500/20 text-red-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {log.action}
                  </span>
                </td>

                <td className="px-4 py-3 font-sans text-slate-300 max-w-xs truncate">
                  {log.resourceTitle}
                </td>

                <td className="px-4 py-3 text-slate-500">
                  {log.ipAddress}
                </td>

                <td className="px-4 py-3 text-right font-sans">
                  <button
                    onClick={() => setSelectedEntry(log)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View Record
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Audit Log Modal */}
      {selectedEntry && (
        <Modal
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          title="Audit Log Event Inspection"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Event Identifier:</span>
                <span className="text-slate-200">{selectedEntry.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ISO Timestamp:</span>
                <span className="text-slate-200">{selectedEntry.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Actor:</span>
                <span className="text-slate-200">{selectedEntry.actor.name} ({selectedEntry.actor.email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Origin IP:</span>
                <span className="text-slate-200">{selectedEntry.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Action:</span>
                <span className="text-blue-400 font-semibold">{selectedEntry.action}</span>
              </div>
            </div>

            {selectedEntry.details && (
              <div className="p-3 bg-slate-900 rounded border border-slate-800 font-sans text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Payload Annotation</span>
                <p className="text-slate-300 leading-relaxed">{selectedEntry.details.note || JSON.stringify(selectedEntry.details)}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800 font-sans">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
