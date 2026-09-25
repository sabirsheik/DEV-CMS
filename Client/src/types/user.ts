export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'editor'
  | 'author'
  | 'reviewer'
  | 'publisher'
  | 'viewer';

export type UserStatus = 'active' | 'invited' | 'suspended' | 'inactive';

export type ResourceName = 
  | 'content'
  | 'pages'
  | 'media'
  | 'taxonomy'
  | 'users'
  | 'roles'
  | 'workflow'
  | 'settings'
  | 'api_keys'
  | 'audit_logs';

export type ActionName = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'publish'
  | 'schedule'
  | 'approve'
  | 'invite'
  | 'export';

export interface RoleDefinition {
  id: UserRole | string;
  name: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissions: {
    resource: ResourceName;
    actions: ActionName[];
  }[];
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  title: string;
  department: string;
  lastActiveAt: string;
  createdAt: string;
  twoFactorEnabled: boolean;
  sessions?: UserSession[];
}
