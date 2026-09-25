import { UserItem, RoleDefinition, UserRole, ResourceName, ActionName } from '../types/user';
import { INITIAL_USERS, INITIAL_ROLES } from './mockData';

const STORAGE_KEY_USERS = 'kinetix_cms_users';
const STORAGE_KEY_ROLES = 'kinetix_cms_roles';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

let userStore: UserItem[] = loadFromStorage(STORAGE_KEY_USERS, INITIAL_USERS);
let roleStore: RoleDefinition[] = loadFromStorage(STORAGE_KEY_ROLES, INITIAL_ROLES);
const delay = (ms = 80) => new Promise(resolve => setTimeout(resolve, ms));

export const userService = {
  async getUsers(): Promise<UserItem[]> {
    await delay(60);
    return [...userStore];
  },

  async getUserById(id: string): Promise<UserItem | null> {
    await delay(50);
    const u = userStore.find(user => user.id === id);
    return u ? JSON.parse(JSON.stringify(u)) : null;
  },

  async inviteUser(email: string, name: string, role: UserRole, department: string, title: string): Promise<UserItem> {
    await delay(120);
    const newUser: UserItem = {
      id: `usr-${Date.now().toString().slice(-5)}`,
      name,
      email,
      role,
      status: 'invited',
      title,
      department,
      lastActiveAt: 'Never',
      createdAt: new Date().toISOString(),
      twoFactorEnabled: false
    };
    userStore.push(newUser);
    saveToStorage(STORAGE_KEY_USERS, userStore);
    return newUser;
  },

  async updateUser(id: string, updates: Partial<UserItem>): Promise<UserItem> {
    await delay(90);
    const idx = userStore.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    const updated = { ...userStore[idx], ...updates };
    userStore[idx] = updated;
    saveToStorage(STORAGE_KEY_USERS, userStore);
    return updated;
  },

  async suspendUser(id: string): Promise<UserItem> {
    return this.updateUser(id, { status: 'suspended' });
  },

  async activateUser(id: string): Promise<UserItem> {
    return this.updateUser(id, { status: 'active' });
  },

  // Roles & Permissions
  async getRoles(): Promise<RoleDefinition[]> {
    await delay(60);
    return [...roleStore];
  },

  async updateRolePermissions(
    roleId: string,
    resource: ResourceName,
    action: ActionName,
    enabled: boolean
  ): Promise<RoleDefinition> {
    await delay(80);
    const role = roleStore.find(r => r.id === roleId);
    if (!role) throw new Error('Role not found');

    let permObj = role.permissions.find(p => p.resource === resource);
    if (!permObj) {
      permObj = { resource, actions: [] };
      role.permissions.push(permObj);
    }

    if (enabled) {
      if (!permObj.actions.includes(action)) {
        permObj.actions.push(action);
      }
    } else {
      permObj.actions = permObj.actions.filter(a => a !== action);
    }

    saveToStorage(STORAGE_KEY_ROLES, roleStore);
    return JSON.parse(JSON.stringify(role));
  },

  // Check if role has permission
  hasPermission(roleId: string, resource: ResourceName, action: ActionName): boolean {
    const role = roleStore.find(r => r.id === roleId);
    if (!role) return false;
    if (role.id === 'super_admin') return true;
    const perm = role.permissions.find(p => p.resource === resource);
    return perm ? perm.actions.includes(action) : false;
  }
};
