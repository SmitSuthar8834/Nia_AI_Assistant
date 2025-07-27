-- Connect to CRM database
\c nia_crm;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CRM configurations table
CREATE TABLE crm_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    crm_type VARCHAR(50) NOT NULL,
    config_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRM sync logs table
CREATE TABLE crm_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    crm_type VARCHAR(50) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    record_type VARCHAR(50),
    record_id VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    sync_duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cached CRM data table
CREATE TABLE crm_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    crm_type VARCHAR(50) NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead mappings table (for cross-CRM lead tracking)
CREATE TABLE lead_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    internal_id UUID NOT NULL,
    crm_type VARCHAR(50) NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    lead_data JSONB,
    last_synced TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task mappings table
CREATE TABLE task_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    internal_id UUID NOT NULL,
    crm_type VARCHAR(50) NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    task_data JSONB,
    last_synced TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meeting mappings table
CREATE TABLE meeting_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    internal_id UUID NOT NULL,
    crm_type VARCHAR(50) NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    meeting_data JSONB,
    last_synced TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_crm_configurations_user_id ON crm_configurations(user_id);
CREATE INDEX idx_crm_configurations_crm_type ON crm_configurations(crm_type);
CREATE INDEX idx_crm_sync_logs_user_id ON crm_sync_logs(user_id);
CREATE INDEX idx_crm_sync_logs_created_at ON crm_sync_logs(created_at);
CREATE INDEX idx_crm_cache_user_id ON crm_cache(user_id);
CREATE INDEX idx_crm_cache_expires_at ON crm_cache(expires_at);
CREATE INDEX idx_lead_mappings_user_id ON lead_mappings(user_id);
CREATE INDEX idx_lead_mappings_internal_id ON lead_mappings(internal_id);
CREATE INDEX idx_task_mappings_user_id ON task_mappings(user_id);
CREATE INDEX idx_meeting_mappings_user_id ON meeting_mappings(user_id);