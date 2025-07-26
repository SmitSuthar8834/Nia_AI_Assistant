// CRM Integration Type Definitions
// Comprehensive types for CRM configurations, sync operations, and data models

export interface CRMConfiguration {
  id: string;
  user_id: string;
  crm_type: CRMType;
  configuration_name: string;
  connection_config: Record<string, any>;
  authentication_config: Record<string, any>;
  field_mappings: Record<string, any>;
  sync_settings: CRMSyncSettings;
  is_active: boolean;
  is_default: boolean;
  last_sync_at?: Date;
  last_successful_sync_at?: Date;
  sync_status: SyncStatus;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
  user?: import('./user.types').User;
}

export interface CRMSyncLog {
  id: string;
  crm_configuration_id: string;
  sync_type: SyncType;
  sync_direction: SyncDirection;
  resource_type: ResourceType;
  status: SyncLogStatus;
  records_processed: number;
  records_successful: number;
  records_failed: number;
  records_skipped: number;
  sync_details: Record<string, any>;
  error_details: Record<string, any>;
  started_at: Date;
  completed_at?: Date;
  duration_seconds?: number;
  created_at: Date;
  crm_configuration?: CRMConfiguration;
}

export interface CRMCache {
  id: string;
  crm_configuration_id: string;
  resource_type: ResourceType;
  external_id: string;
  internal_id?: string;
  data: Record<string, any>;
  metadata: Record<string, any>;
  last_synced_at: Date;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  crm_configuration?: CRMConfiguration;
}

export interface LeadData {
  id: string;
  user_id: string;
  crm_configuration_id?: string;
  external_id?: string;
  
  // Basic information
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  
  // Lead details
  status: LeadStatus;
  source?: string;
  priority: Priority;
  estimated_value?: number;
  currency: string;
  expected_close_date?: Date;
  
  // Additional data
  notes?: string;
  tags: string[];
  custom_fields: Record<string, any>;
  
  // Tracking
  assigned_to?: string;
  created_by?: string;
  last_contacted_at?: Date;
  next_follow_up_at?: Date;
  
  // Sync information
  last_synced_at?: Date;
  sync_status: SyncStatus;
  
  created_at: Date;
  updated_at: Date;
  
  // Relations
  user?: import('./user.types').User;
  assigned_user?: import('./user.types').User;
  creator?: import('./user.types').User;
  crm_configuration?: CRMConfiguration;
  tasks?: TaskData[];
  meetings?: MeetingData[];
}

export interface TaskData {
  id: string;
  user_id: string;
  crm_configuration_id?: string;
  external_id?: string;
  
  // Basic information
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  
  // Relationships
  related_to_type?: string;
  related_to_id?: string;
  lead_id?: string;
  
  // Scheduling
  due_date?: Date;
  reminder_at?: Date;
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  
  // Assignment
  assigned_to?: string;
  created_by?: string;
  
  // Additional data
  tags: string[];
  custom_fields: Record<string, any>;
  
  // Completion
  completed_at?: Date;
  completed_by?: string;
  
  // Sync information
  last_synced_at?: Date;
  sync_status: SyncStatus;
  
  created_at: Date;
  updated_at: Date;
  
  // Relations
  user?: import('./user.types').User;
  assigned_user?: import('./user.types').User;
  creator?: import('./user.types').User;
  completed_by_user?: import('./user.types').User;
  lead?: LeadData;
  crm_configuration?: CRMConfiguration;
}

export interface MeetingData {
  id: string;
  user_id: string;
  crm_configuration_id?: string;
  external_id?: string;
  
  // Basic information
  title: string;
  description?: string;
  meeting_type: MeetingType;
  status: MeetingStatus;
  
  // Scheduling
  start_time: Date;
  end_time: Date;
  timezone: string;
  location?: string;
  meeting_url?: string;
  
  // Relationships
  lead_id?: string;
  
  // Participants
  participants: MeetingParticipant[];
  organizer_id?: string;
  
  // Outcome
  outcome?: MeetingOutcome;
  notes?: string;
  action_items: ActionItem[];
  
  // Additional data
  tags: string[];
  custom_fields: Record<string, any>;
  
  // Sync information
  last_synced_at?: Date;
  sync_status: SyncStatus;
  
  created_at: Date;
  updated_at: Date;
  
  // Relations
  user?: import('./user.types').User;
  organizer?: import('./user.types').User;
  lead?: LeadData;
  crm_configuration?: CRMConfiguration;
}

export interface CRMFieldMapping {
  id: string;
  crm_configuration_id: string;
  resource_type: ResourceType;
  internal_field: string;
  external_field: string;
  field_type: FieldType;
  transformation_rules: Record<string, any>;
  is_required: boolean;
  is_readonly: boolean;
  default_value?: string;
  created_at: Date;
  updated_at: Date;
  crm_configuration?: CRMConfiguration;
}

// Supporting interfaces
export interface CRMSyncSettings {
  auto_sync_enabled: boolean;
  sync_interval_minutes: number;
  sync_direction: SyncDirection;
  conflict_resolution: ConflictResolution;
  resources_to_sync: ResourceType[];
  field_sync_rules: Record<string, any>;
  webhook_enabled: boolean;
  webhook_url?: string;
}

export interface MeetingParticipant {
  email: string;
  name?: string;
  role?: string;
  response_status?: 'accepted' | 'declined' | 'tentative' | 'needs_action';
  is_organizer?: boolean;
  is_required?: boolean;
}

export interface ActionItem {
  id: string;
  description: string;
  assigned_to?: string;
  due_date?: Date;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: Date;
}

// Enums and Union Types
export type CRMType = 'salesforce' | 'creatio' | 'sap' | 'hubspot' | 'pipedrive' | 'zoho';
export type SyncStatus = 'never_synced' | 'syncing' | 'success' | 'failed' | 'partial' | 'local' | 'synced' | 'sync_pending' | 'sync_failed';
export type SyncType = 'full' | 'incremental' | 'manual' | 'real_time';
export type SyncDirection = 'import' | 'export' | 'bidirectional';
export type SyncLogStatus = 'started' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type ResourceType = 'leads' | 'contacts' | 'tasks' | 'meetings' | 'opportunities' | 'accounts';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'deferred';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type MeetingType = 'general' | 'sales_call' | 'demo' | 'follow_up' | 'negotiation';
export type MeetingOutcome = 'successful' | 'rescheduled' | 'cancelled' | 'no_show';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'json' | 'array';
export type ConflictResolution = 'local_wins' | 'remote_wins' | 'latest_wins' | 'manual_review';

// Request/Response DTOs
export interface CreateCRMConfigurationRequest {
  crm_type: CRMType;
  configuration_name: string;
  connection_config: Record<string, any>;
  authentication_config: Record<string, any>;
  field_mappings?: Record<string, any>;
  sync_settings?: Partial<CRMSyncSettings>;
  is_default?: boolean;
}

export interface UpdateCRMConfigurationRequest {
  configuration_name?: string;
  connection_config?: Record<string, any>;
  authentication_config?: Record<string, any>;
  field_mappings?: Record<string, any>;
  sync_settings?: Partial<CRMSyncSettings>;
  is_active?: boolean;
  is_default?: boolean;
}

export interface TestCRMConnectionRequest {
  crm_configuration_id: string;
}

export interface TestCRMConnectionResponse {
  success: boolean;
  connection_status: 'connected' | 'authentication_failed' | 'network_error' | 'invalid_config';
  error_message?: string;
  crm_info?: {
    version?: string;
    user_info?: Record<string, any>;
    available_resources?: string[];
  };
}

export interface StartSyncRequest {
  crm_configuration_id: string;
  sync_type: SyncType;
  resource_types?: ResourceType[];
  sync_direction?: SyncDirection;
}

export interface SyncStatusResponse {
  sync_log_id: string;
  status: SyncLogStatus;
  progress_percentage: number;
  current_resource?: ResourceType;
  records_processed: number;
  estimated_completion?: Date;
  error_message?: string;
}

export interface CreateLeadRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  status?: LeadStatus;
  source?: string;
  priority?: Priority;
  estimated_value?: number;
  currency?: string;
  expected_close_date?: Date;
  notes?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  assigned_to?: string;
  crm_configuration_id?: string;
}

export interface UpdateLeadRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  status?: LeadStatus;
  source?: string;
  priority?: Priority;
  estimated_value?: number;
  currency?: string;
  expected_close_date?: Date;
  notes?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  assigned_to?: string;
  next_follow_up_at?: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  related_to_type?: string;
  related_to_id?: string;
  lead_id?: string;
  due_date?: Date;
  reminder_at?: Date;
  estimated_duration_minutes?: number;
  assigned_to?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
  crm_configuration_id?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  due_date?: Date;
  reminder_at?: Date;
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  assigned_to?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  meeting_type?: MeetingType;
  start_time: Date;
  end_time: Date;
  timezone?: string;
  location?: string;
  meeting_url?: string;
  lead_id?: string;
  participants: MeetingParticipant[];
  tags?: string[];
  custom_fields?: Record<string, any>;
  crm_configuration_id?: string;
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  meeting_type?: MeetingType;
  status?: MeetingStatus;
  start_time?: Date;
  end_time?: Date;
  timezone?: string;
  location?: string;
  meeting_url?: string;
  participants?: MeetingParticipant[];
  outcome?: MeetingOutcome;
  notes?: string;
  action_items?: ActionItem[];
  tags?: string[];
  custom_fields?: Record<string, any>;
}

// Query parameters
export interface CRMConfigurationQueryParams {
  page?: number;
  limit?: number;
  crm_type?: CRMType;
  is_active?: boolean;
  sync_status?: SyncStatus;
  sort_by?: 'created_at' | 'updated_at' | 'configuration_name' | 'last_sync_at';
  sort_order?: 'asc' | 'desc';
}

export interface LeadQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  priority?: Priority;
  assigned_to?: string;
  created_by?: string;
  company?: string;
  source?: string;
  crm_configuration_id?: string;
  expected_close_date_from?: Date;
  expected_close_date_to?: Date;
  next_follow_up_from?: Date;
  next_follow_up_to?: Date;
  tags?: string[];
  sort_by?: 'created_at' | 'updated_at' | 'expected_close_date' | 'next_follow_up_at' | 'estimated_value';
  sort_order?: 'asc' | 'desc';
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
  priority?: Priority;
  assigned_to?: string;
  created_by?: string;
  lead_id?: string;
  due_date_from?: Date;
  due_date_to?: Date;
  tags?: string[];
  sort_by?: 'created_at' | 'updated_at' | 'due_date' | 'priority';
  sort_order?: 'asc' | 'desc';
}

export interface MeetingQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: MeetingStatus;
  meeting_type?: MeetingType;
  organizer_id?: string;
  lead_id?: string;
  start_time_from?: Date;
  start_time_to?: Date;
  tags?: string[];
  sort_by?: 'created_at' | 'updated_at' | 'start_time';
  sort_order?: 'asc' | 'desc';
}

export interface SyncLogQueryParams {
  page?: number;
  limit?: number;
  crm_configuration_id?: string;
  sync_type?: SyncType;
  resource_type?: ResourceType;
  status?: SyncLogStatus;
  start_date?: Date;
  end_date?: Date;
  sort_by?: 'started_at' | 'completed_at' | 'duration_seconds';
  sort_order?: 'asc' | 'desc';
}

// Analytics types
export interface CRMAnalytics {
  total_leads: number;
  leads_by_status: Array<{
    status: LeadStatus;
    count: number;
    percentage: number;
  }>;
  conversion_rate: number;
  average_deal_size: number;
  total_pipeline_value: number;
  tasks_completion_rate: number;
  meetings_scheduled: number;
  sync_health: {
    total_configurations: number;
    active_configurations: number;
    failed_syncs_last_24h: number;
    last_successful_sync?: Date;
  };
}

export interface LeadAnalytics {
  total_leads: number;
  new_leads_this_month: number;
  conversion_rate: number;
  average_time_to_close: number; // in days
  top_lead_sources: Array<{
    source: string;
    count: number;
    conversion_rate: number;
  }>;
  leads_by_priority: Array<{
    priority: Priority;
    count: number;
  }>;
  pipeline_forecast: Array<{
    month: string;
    expected_value: number;
    probability_weighted_value: number;
  }>;
}

// Error types
export interface CRMError extends Error {
  code: 'CONNECTION_FAILED' | 'AUTHENTICATION_FAILED' | 'SYNC_FAILED' | 'RATE_LIMIT_EXCEEDED' | 'INVALID_CONFIGURATION';
  crm_type?: CRMType;
  configuration_id?: string;
  details?: Record<string, any>;
}

export interface SyncError extends Error {
  code: 'SYNC_IN_PROGRESS' | 'CONFIGURATION_NOT_FOUND' | 'RESOURCE_NOT_SUPPORTED' | 'FIELD_MAPPING_ERROR';
  sync_log_id?: string;
  resource_type?: ResourceType;
  failed_records?: Array<{
    external_id: string;
    error: string;
  }>;
}

// Constants
export const CRM_TYPES = {
  SALESFORCE: 'salesforce',
  CREATIO: 'creatio',
  SAP: 'sap',
  HUBSPOT: 'hubspot',
  PIPEDRIVE: 'pipedrive',
  ZOHO: 'zoho'
} as const;

export const LEAD_STATUSES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost'
} as const;

export const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DEFERRED: 'deferred'
} as const;

export const MEETING_STATUSES = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
} as const;

export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;