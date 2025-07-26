// User Management Type Definitions
// Comprehensive types for user, role, and session management

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system_role: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  permissions?: Permission[];
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  role_id?: string;
  is_active: boolean;
  is_email_verified: boolean;
  email_verification_token?: string;
  email_verification_expires_at?: Date;
  password_reset_token?: string;
  password_reset_expires_at?: Date;
  last_login_at?: Date;
  login_attempts: number;
  locked_until?: Date;
  preferences: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  role?: Role;
  permissions?: UserPermission[];
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token: string;
  device_info: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  expires_at: Date;
  refresh_expires_at: Date;
  created_at: Date;
  updated_at: Date;
  user?: User;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  granted: boolean;
  granted_by?: string;
  granted_at: Date;
  expires_at?: Date;
  permission?: Permission;
  granted_by_user?: User;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  session_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  created_at: Date;
  user?: User;
  session?: UserSession;
}

// Request/Response DTOs
export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_id?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  role_id?: string;
  is_active?: boolean;
  preferences?: Record<string, any>;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  user: Omit<User, 'password_hash'>;
  session_token: string;
  refresh_token: string;
  expires_at: Date;
  permissions: string[];
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permission_ids: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  permission_ids?: string[];
}

export interface AssignUserPermissionRequest {
  user_id: string;
  permission_id: string;
  granted: boolean;
  expires_at?: Date;
}

// Query parameters for filtering and pagination
export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role_id?: string;
  is_active?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'last_login_at' | 'email' | 'first_name' | 'last_name';
  sort_order?: 'asc' | 'desc';
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  user_id?: string;
  action?: string;
  resource?: string;
  success?: boolean;
  start_date?: Date;
  end_date?: Date;
  sort_by?: 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface SessionQueryParams {
  page?: number;
  limit?: number;
  user_id?: string;
  is_active?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'expires_at';
  sort_order?: 'asc' | 'desc';
}

// Pagination response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Permission checking types
export interface PermissionCheck {
  resource: string;
  action: string;
}

export interface UserWithPermissions extends Omit<User, 'password_hash'> {
  effective_permissions: string[];
}

// Error types
export interface AuthError extends Error {
  code: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'EMAIL_NOT_VERIFIED' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID';
}

export interface ValidationError extends Error {
  field: string;
  code: 'REQUIRED' | 'INVALID_FORMAT' | 'TOO_SHORT' | 'TOO_LONG' | 'ALREADY_EXISTS';
}

// Constants
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer'
} as const;

export const PERMISSIONS = {
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ROLES: 'user:manage_roles',
  USER_MANAGE_PERMISSIONS: 'user:manage_permissions',
  
  // Role management
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_MANAGE_PERMISSIONS: 'role:manage_permissions',
  
  // System management
  SYSTEM_CONFIGURE: 'system:configure',
  SYSTEM_MONITOR: 'system:monitor',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_RESTORE: 'system:restore',
  
  // Voice interface
  VOICE_USE: 'voice:use',
  VOICE_CONFIGURE: 'voice:configure',
  VOICE_TRAIN: 'voice:train',
  
  // CRM
  CRM_ACCESS: 'crm:access',
  CRM_CONFIGURE: 'crm:configure',
  CRM_SYNC: 'crm:sync',
  CRM_CREATE_LEADS: 'crm:create_leads',
  CRM_UPDATE_LEADS: 'crm:update_leads',
  CRM_CREATE_TASKS: 'crm:create_tasks',
  CRM_SCHEDULE_MEETINGS: 'crm:schedule_meetings',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // Audit
  AUDIT_READ: 'audit:read',
  AUDIT_EXPORT: 'audit:export'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];