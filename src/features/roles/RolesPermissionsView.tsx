import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { RoleDefinition, ResourceName, ActionName } from '../../types/user';
import { useCmsStore } from '../../stores/useCmsStore';
import { Shield, ShieldCheck, Check, X, Lock, Info } from 'lucide-react';

const RESOURCES: { id: ResourceName; label: string; desc: string }[] = [
  { id: 'content', label: 'Content Records', desc: 'Articles, case studies, product releases' },
  { id: 'pages', label: 'Pages & Hierarchy', desc: 'Site structure and landing pages' },
  { id: 'media', label: 'Media CDN Assets', desc: 'Images, PDFs, documents' },
  { id: 'taxonomy', label: 'Categories & Tags', desc: 'Taxonomy vocabulary and slugs' },
  { id: 'workflow', label: 'Review Gates', desc: 'Approval, change requests, re-routing' },
  { id: 'users', label: 'User Directory', desc: 'Team members, status, invitations' },
  { id: 'roles', label: 'Role Definitions', desc: 'Permission policy assignments' },
  { id: 'settings', label: 'System Configuration', desc: 'Workspace, locales, domains' },
  { id: 'api_keys', label: 'API Keys & Webhooks', desc: 'Ingestion tokens, CDN invalidation' },
  { id: 'audit_logs', label: 'Audit Trail', desc: 'Compliance activity stream' }
];

const ACTIONS: { id: ActionName; label: string }[] = [
  { id: 'read', label: 'Read' },
  { id: 'create', label: 'Create' },
  { id: 'update', label: 'Update' },
  { id: 'delete', label: 'Delete' },
  { id: 'approve', label: 'Approve' },
  { id: 'publish', label: 'Publish' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'export', label: 'Export' }
];

export const RolesPermissionsView: React.FC = () => {
  const { showToast } = useCmsStore();

  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await userService.getRoles();
      setRoles(data);
      if (data.length > 0 && !selectedRole) {
        setSelectedRole(data[0]);
      }
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to load roles' });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (resource: ResourceName, action: ActionName) => {
    if (!selectedRole) return;
    if (selectedRole.id === 'super_admin') {
      showToast({ type: 'warning', title: 'Super Admin permissions are immutable' });
      return;
    }

    const currentPerm = selectedRole.permissions.find(p => p.resource === resource);
    const hasAction = currentPerm ? currentPerm.actions.includes(action) : false;

    try {
      const updated = await userService.updateRolePermissions(
        selectedRole.id,
        resource,
        action,
        !hasAction
      );
      setSelectedRole(updated);
      setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
      showToast({
        type: 'success',
        title: 'Permission Updated',
        message: `${action.toUpperCase()} on ${resource} set to ${!hasAction}`
      });
    } catch (err) {
      showToast({ type: 'error', title: 'Update failed' });
    }
  };

  const checkHasPermission = (role: RoleDefinition, res: ResourceName, act: ActionName) => {
    if (role.id === 'super_admin') return true;
    const perm = role.permissions.find(p => p.resource === res);
    return perm ? perm.actions.includes(act) : false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Roles & Fine-Grained Permission Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Resource × Action matrix enforcing zero-trust role-based access control across all API boundaries.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Role Picker + Right Permission Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Roles List (4 cols) */}
        <div className="lg:col-span-4 bg-[#0f172a]/60 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-[#0b0f17]/40 text-xs font-semibold text-slate-300">
            System & Custom Roles ({roles.length})
          </div>

          <div className="divide-y divide-slate-800/60">
            {roles.map(r => {
              const isSelected = selectedRole?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r)}
                  className={`w-full p-4 text-left transition-colors flex items-start justify-between ${
                    isSelected ? 'bg-blue-600/15 border-l-2 border-blue-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                      <Shield className={`w-3.5 h-3.5 ${r.id === 'super_admin' ? 'text-amber-400' : 'text-blue-400'}`} />
                      <span>{r.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {r.description}
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      {r.userCount} active users
                    </div>
                  </div>
                  {r.isSystem && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                      System
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Permission Matrix (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedRole && (
            <div className="bg-[#0f172a]/60 border border-slate-800 rounded-lg p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-100">
                      Permission Matrix: {selectedRole.name}
                    </h2>
                    {selectedRole.id === 'super_admin' && (
                      <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>All Permissions Enforced</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedRole.description}
                  </p>
                </div>
              </div>

              {/* Resource × Action Matrix Table */}
              <div className="border border-slate-800 rounded-lg overflow-x-auto">
                <table className="w-full text-center text-xs">
                  <thead className="bg-slate-900/50 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Resource Area</th>
                      {ACTIONS.map(a => (
                        <th key={a.id} className="px-3 py-2.5 font-medium">{a.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {RESOURCES.map(res => (
                      <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 text-left">
                          <div className="font-semibold text-slate-200">{res.label}</div>
                          <div className="text-[10px] text-slate-500">{res.desc}</div>
                        </td>

                        {ACTIONS.map(act => {
                          const has = checkHasPermission(selectedRole, res.id, act.id);
                          const isSuperAdmin = selectedRole.id === 'super_admin';

                          return (
                            <td key={act.id} className="px-3 py-3">
                              <button
                                disabled={isSuperAdmin}
                                onClick={() => handleTogglePermission(res.id, act.id)}
                                className={`w-6 h-6 rounded flex items-center justify-center mx-auto transition-colors ${
                                  has 
                                    ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40 hover:bg-blue-600/50' 
                                    : 'bg-slate-900 text-slate-600 border border-slate-800 hover:border-slate-700'
                                } ${isSuperAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                title={`${act.label} permission on ${res.label}`}
                              >
                                {has ? <Check className="w-3.5 h-3.5" /> : <X className="w-3 h-3 opacity-30" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-900/60 rounded border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  Permissions take effect immediately for all active tokens. JWT claims and edge session cookies are refreshed on subsequent API requests.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
