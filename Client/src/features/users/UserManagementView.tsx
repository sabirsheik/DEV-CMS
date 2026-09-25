import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { UserItem, UserRole, UserStatus } from '../../types/user';
import { useCmsStore } from '../../stores/useCmsStore';
import { Modal } from '../../components/common/Modal';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  Key, 
  Smartphone, 
  Laptop,
  Mail,
  UserCheck
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { showToast } = useCmsStore();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Invite User Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('author');
  const [inviteDept, setInviteDept] = useState('Digital Publishing');
  const [inviteTitle, setInviteTitle] = useState('Staff Author');

  // Selected User Detail Modal
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to load user directory' });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    try {
      const created = await userService.inviteUser(
        inviteEmail,
        inviteName,
        inviteRole,
        inviteDept,
        inviteTitle
      );
      setUsers(prev => [...prev, created]);
      setInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      showToast({
        type: 'success',
        title: 'Invitation Dispatched',
        message: `Temporary credentials generated and sent to ${inviteEmail}.`
      });
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to invite user' });
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    try {
      const updated = user.status === 'active' 
        ? await userService.suspendUser(user.id)
        : await userService.activateUser(user.id);

      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      if (selectedUser?.id === user.id) setSelectedUser(updated);

      showToast({
        type: 'info',
        title: `Account Status: ${updated.status.toUpperCase()}`,
        message: `Updated account status for ${user.name}.`
      });
    } catch (err) {
      showToast({ type: 'error', title: 'Status change failed' });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase()) ||
                          u.department.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Team Directory & Identity Access</span>
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {users.length} accounts
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage enterprise contributors, multi-factor security enforcement, and role assignments.
          </p>
        </div>

        <button
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite Team Member</span>
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
            placeholder="Search by name, email, department..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 focus:border-slate-700 rounded text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded focus:outline-hidden"
        >
          <option value="all">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Administrator</option>
          <option value="editor">Editor</option>
          <option value="author">Author</option>
          <option value="reviewer">Reviewer</option>
          <option value="publisher">Publisher</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[#0f172a]/60 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-900/50 text-[11px] text-slate-400 uppercase font-mono">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">2FA</th>
              <th className="px-4 py-3 font-mono">Last Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredUsers.map(u => (
              <tr 
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className="hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="font-semibold text-slate-300 text-[11px]">{u.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 font-mono text-[11px] text-slate-300 capitalize">
                  {u.role.replace('_', ' ')}
                </td>

                <td className="px-4 py-3 text-slate-300">
                  <div>{u.department}</div>
                  <div className="text-[10px] text-slate-500">{u.title}</div>
                </td>

                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                    u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    u.status === 'invited' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      u.status === 'active' ? 'bg-emerald-400' :
                      u.status === 'invited' ? 'bg-blue-400' : 'bg-red-400'
                    }`} />
                    <span className="capitalize">{u.status}</span>
                  </span>
                </td>

                <td className="px-4 py-3 font-mono text-[11px]">
                  {u.twoFactorEnabled ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Enforced</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                      <span>Optional</span>
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 font-mono text-[11px] text-slate-400 tabular-nums">
                  {u.lastActiveAt.includes('Z') 
                    ? new Date(u.lastActiveAt).toLocaleDateString()
                    : u.lastActiveAt}
                </td>

                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className={`px-2 py-1 rounded text-[11px] transition-colors ${
                      u.status === 'active' 
                        ? 'text-red-400 hover:bg-red-950/40' 
                        : 'text-emerald-400 hover:bg-emerald-950/40'
                    }`}
                  >
                    {u.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Profile Detail Inspection Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title="Contributor Profile & Security Telemetry"
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                {selectedUser.avatarUrl ? (
                  <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="font-bold text-slate-200 text-lg">{selectedUser.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">{selectedUser.name}</h3>
                <p className="text-slate-400 font-mono text-[11px]">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="capitalize font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded text-[10px]">
                    {selectedUser.role.replace('_', ' ')}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{selectedUser.title}</span>
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono block">
                Active Client Sessions & IP Trace
              </span>
              <div className="space-y-1.5">
                {(selectedUser.sessions || [
                  { id: 's-1', device: 'Corporate Workstation', browser: 'Chromium 129', ipAddress: '192.0.2.45', lastActive: 'Now', isCurrent: true }
                ]).map(s => (
                  <div key={s.id} className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-200">{s.device} ({s.browser})</div>
                        <div className="text-[10px] font-mono text-slate-500">IP: {s.ipAddress}</div>
                      </div>
                    </div>
                    {s.isCurrent && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded">
                        Current Session
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => handleToggleStatus(selectedUser)}
                className={`px-3 py-1.5 rounded font-medium text-xs transition-colors ${
                  selectedUser.status === 'active'
                    ? 'bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30'
                    : 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {selectedUser.status === 'active' ? 'Suspend Account' : 'Activate Account'}
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <Modal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          title="Invite Enterprise Contributor"
          maxWidth="md"
        >
          <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="alex.m@kinetix-enterprise.io"
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                  Assign System Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden capitalize"
                >
                  <option value="author">Author</option>
                  <option value="editor">Editor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="publisher">Publisher</option>
                  <option value="admin">Administrator</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={inviteTitle}
                onChange={(e) => setInviteTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
              >
                Send Invite
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
