-- Migration: 003_create_crm_integration_tables.sql
-- Description: Create CRM integration tables for configurations, sync logs, and cached data
-- Date: 2025-01-26

-- Create crm_configurations table
CREATE TABLE IF NOT EXISTS crm_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crm_type VARCHAR(50) NOT NULL, -- 'salesforce', 'creatio', 'sap', 'hubspot'
    configuration_name VARCHAR(100) NOT NULL,
    connection_config JSONB NOT NULL DEFAULT '{}', -- API endpoints, client IDs, etc.
    authentication_config JSONB NOT NULL DEFAULT '{}', -- OAuth tokens, API keys, etc.
    field_mappings JSONB DEFAULT '{}', -- Field mapping between CRM and our system
    sync_settings JSONB DEFAULT '{}', -- Sync preferences and schedules
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMP,
    last_successful_sync_at TIMESTAMP,
    sync_status VARCHAR(20) DEFAULT 'never_synced', -- 'never_synced', 'syncing', 'success', 'failed', 'partial'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, configuration_name)
);

-- Create crm_sync_logs table
CREATE TABLE IF NOT EXISTS crm_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_configuration_id UUID NOT NULL REFERENCES crm_configurations(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'manual', 'real_time'
    sync_direction VARCHAR(20) NOT NULL, -- 'import', 'export', 'bidirectional'
    resource_type VARCHAR(50) NOT NULL, -- 'leads', 'contacts', 'tasks', 'meetings', 'opportunities'
    status VARCHAR(20) NOT NULL, -- 'started', 'in_progress', 'completed', 'failed', 'cancelled'
    records_processed INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    records_skipped INTEGER DEFAULT 0,
    sync_details JSONB DEFAULT '{}', -- Detailed sync information
    error_details JSONB DEFAULT '{}', -- Error information for failed records
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create crm_cache table for storing CRM data locally
CREATE TABLE IF NOT EXISTS crm_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_configuration_id UUID NOT NULL REFERENCES crm_configurations(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL, -- 'lead', 'contact', 'task', 'meeting', 'opportunity'
    external_id VARCHAR(255) NOT NULL, -- ID in the external CRM system
    internal_id UUID, -- Optional reference to our internal record
    data JSONB NOT NULL DEFAULT '{}', -- Cached CRM data
    metadata JSONB DEFAULT '{}', -- Additional metadata (sync info, etc.)
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false, -- Soft delete flag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(crm_configuration_id, resource_type, external_id)
);

-- Create leads table for normalized lead data
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crm_configuration_id UUID REFERENCES crm_configurations(id) ON DELETE SET NULL,
    external_id VARCHAR(255), -- ID in external CRM
    
    -- Lead basic information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    company VARCHAR(200),
    job_title VARCHAR(100),
    
    -- Lead details
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
    source VARCHAR(100), -- 'website', 'referral', 'cold_call', 'email', 'social_media'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    estimated_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'INR',
    expected_close_date DATE,
    
    -- Additional data
    notes TEXT,
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    
    -- Tracking
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    last_contacted_at TIMESTAMP,
    next_follow_up_at TIMESTAMP,
    
    -- Sync information
    last_synced_at TIMESTAMP,
    sync_status VARCHAR(20) DEFAULT 'local', -- 'local', 'synced', 'sync_pending', 'sync_failed'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table for normalized task data
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crm_configuration_id UUID REFERENCES crm_configurations(id) ON DELETE SET NULL,
    external_id VARCHAR(255), -- ID in external CRM
    
    -- Task basic information
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled', 'deferred'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    
    -- Task relationships
    related_to_type VARCHAR(50), -- 'lead', 'contact', 'opportunity', 'meeting'
    related_to_id UUID, -- Generic reference to related record
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    
    -- Task scheduling
    due_date TIMESTAMP,
    reminder_at TIMESTAMP,
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    
    -- Task assignment
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    
    -- Additional data
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    
    -- Completion tracking
    completed_at TIMESTAMP,
    completed_by UUID REFERENCES users(id),
    
    -- Sync information
    last_synced_at TIMESTAMP,
    sync_status VARCHAR(20) DEFAULT 'local', -- 'local', 'synced', 'sync_pending', 'sync_failed'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create meetings table for normalized meeting data
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crm_configuration_id UUID REFERENCES crm_configurations(id) ON DELETE SET NULL,
    external_id VARCHAR(255), -- ID in external CRM
    
    -- Meeting basic information
    title VARCHAR(200) NOT NULL,
    description TEXT,
    meeting_type VARCHAR(50) DEFAULT 'general', -- 'general', 'sales_call', 'demo', 'follow_up', 'negotiation'
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
    
    -- Meeting scheduling
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    location TEXT, -- Physical location or meeting URL
    meeting_url TEXT, -- Google Meet, Zoom, etc.
    
    -- Meeting relationships
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    
    -- Participants (stored as JSONB array)
    participants JSONB DEFAULT '[]', -- Array of participant objects
    organizer_id UUID REFERENCES users(id),
    
    -- Meeting outcome
    outcome VARCHAR(50), -- 'successful', 'rescheduled', 'cancelled', 'no_show'
    notes TEXT,
    action_items JSONB DEFAULT '[]', -- Array of action items
    
    -- Additional data
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    
    -- Sync information
    last_synced_at TIMESTAMP,
    sync_status VARCHAR(20) DEFAULT 'local', -- 'local', 'synced', 'sync_pending', 'sync_failed'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create crm_field_mappings table for flexible field mapping
CREATE TABLE IF NOT EXISTS crm_field_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crm_configuration_id UUID NOT NULL REFERENCES crm_configurations(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL, -- 'lead', 'task', 'meeting', 'contact'
    internal_field VARCHAR(100) NOT NULL, -- Field name in our system
    external_field VARCHAR(100) NOT NULL, -- Field name in CRM system
    field_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'date', 'json'
    transformation_rules JSONB DEFAULT '{}', -- Rules for data transformation
    is_required BOOLEAN DEFAULT false,
    is_readonly BOOLEAN DEFAULT false,
    default_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(crm_configuration_id, resource_type, internal_field)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crm_configurations_user_id ON crm_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_configurations_crm_type ON crm_configurations(crm_type);
CREATE INDEX IF NOT EXISTS idx_crm_configurations_is_active ON crm_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_crm_configurations_is_default ON crm_configurations(is_default);
CREATE INDEX IF NOT EXISTS idx_crm_configurations_sync_status ON crm_configurations(sync_status);

CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_configuration_id ON crm_sync_logs(crm_configuration_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_sync_type ON crm_sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_resource_type ON crm_sync_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_status ON crm_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_started_at ON crm_sync_logs(started_at);

CREATE INDEX IF NOT EXISTS idx_crm_cache_configuration_id ON crm_cache(crm_configuration_id);
CREATE INDEX IF NOT EXISTS idx_crm_cache_resource_type ON crm_cache(resource_type);
CREATE INDEX IF NOT EXISTS idx_crm_cache_external_id ON crm_cache(external_id);
CREATE INDEX IF NOT EXISTS idx_crm_cache_internal_id ON crm_cache(internal_id);
CREATE INDEX IF NOT EXISTS idx_crm_cache_last_synced_at ON crm_cache(last_synced_at);
CREATE INDEX IF NOT EXISTS idx_crm_cache_is_deleted ON crm_cache(is_deleted);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_crm_configuration_id ON leads(crm_configuration_id);
CREATE INDEX IF NOT EXISTS idx_leads_external_id ON leads(external_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_expected_close_date ON leads(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up_at ON leads(next_follow_up_at);
CREATE INDEX IF NOT EXISTS idx_leads_sync_status ON leads(sync_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_crm_configuration_id ON tasks(crm_configuration_id);
CREATE INDEX IF NOT EXISTS idx_tasks_external_id ON tasks(external_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_at ON tasks(reminder_at);
CREATE INDEX IF NOT EXISTS idx_tasks_sync_status ON tasks(sync_status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_crm_configuration_id ON meetings(crm_configuration_id);
CREATE INDEX IF NOT EXISTS idx_meetings_external_id ON meetings(external_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_lead_id ON meetings(lead_id);
CREATE INDEX IF NOT EXISTS idx_meetings_organizer_id ON meetings(organizer_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_end_time ON meetings(end_time);
CREATE INDEX IF NOT EXISTS idx_meetings_sync_status ON meetings(sync_status);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at);

CREATE INDEX IF NOT EXISTS idx_crm_field_mappings_configuration_id ON crm_field_mappings(crm_configuration_id);
CREATE INDEX IF NOT EXISTS idx_crm_field_mappings_resource_type ON crm_field_mappings(resource_type);
CREATE INDEX IF NOT EXISTS idx_crm_field_mappings_internal_field ON crm_field_mappings(internal_field);

-- Create triggers for updated_at columns
CREATE TRIGGER update_crm_configurations_updated_at BEFORE UPDATE ON crm_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_cache_updated_at BEFORE UPDATE ON crm_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_field_mappings_updated_at BEFORE UPDATE ON crm_field_mappings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();