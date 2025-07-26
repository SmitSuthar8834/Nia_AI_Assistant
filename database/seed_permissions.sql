-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES 
-- User management permissions
('user:create', 'Create new users', 'users', 'create'),
('user:read', 'View user information', 'users', 'read'),
('user:update', 'Update user information', 'users', 'update'),
('user:delete', 'Delete users', 'users', 'delete'),
('user:manage_roles', 'Assign roles to users', 'users', 'manage_roles'),
('user:manage_permissions', 'Assign direct permissions to users', 'users', 'manage_permissions'),

-- Role management permissions
('role:create', 'Create new roles', 'roles', 'create'),
('role:read', 'View role information', 'roles', 'read'),
('role:update', 'Update role information', 'roles', 'update'),
('role:delete', 'Delete roles', 'roles', 'delete'),
('role:manage_permissions', 'Assign permissions to roles', 'roles', 'manage_permissions'),

-- System management permissions
('system:configure', 'Configure system settings', 'system', 'configure'),
('system:monitor', 'Monitor system health and performance', 'system', 'monitor'),
('system:backup', 'Create and manage backups', 'system', 'backup'),
('system:restore', 'Restore from backups', 'system', 'restore'),

-- Voice interface permissions
('voice:use', 'Use voice interface', 'voice', 'use'),
('voice:configure', 'Configure voice settings', 'voice', 'configure'),
('voice:train', 'Train voice profiles', 'voice', 'train'),

-- CRM permissions
('crm:access', 'Access CRM integrations', 'crm', 'access'),
('crm:configure', 'Configure CRM connections', 'crm', 'configure'),
('crm:sync', 'Synchronize CRM data', 'crm', 'sync'),
('crm:create_leads', 'Create leads in CRM', 'crm', 'create_leads'),
('crm:update_leads', 'Update leads in CRM', 'crm', 'update_leads'),
('crm:create_tasks', 'Create tasks in CRM', 'crm', 'create_tasks'),
('crm:schedule_meetings', 'Schedule meetings in CRM', 'crm', 'schedule_meetings'),

-- Analytics permissions
('analytics:view', 'View analytics and reports', 'analytics', 'view'),
('analytics:export', 'Export analytics data', 'analytics', 'export'),

-- Audit permissions
('audit:read', 'View audit logs', 'audit', 'read'),
('audit:export', 'Export audit logs', 'audit', 'export')

ON CONFLICT (name) DO NOTHING;