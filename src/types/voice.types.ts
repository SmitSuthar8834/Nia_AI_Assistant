// Voice and AI Type Definitions
// Comprehensive types for voice processing, conversations, and AI interactions

export interface VoiceProfile {
  id: string;
  user_id: string;
  profile_name: string;
  language_code: string;
  accent?: string;
  voice_samples: VoiceSample[];
  calibration_data: Record<string, any>;
  recognition_accuracy: number;
  is_active: boolean;
  is_default: boolean;
  training_status: VoiceTrainingStatus;
  training_progress: number;
  last_trained_at?: Date;
  created_at: Date;
  updated_at: Date;
  user?: import('./user.types').User;
}

export interface VoiceSample {
  id: string;
  audio_url: string;
  duration_seconds: number;
  text_content: string;
  quality_score: number;
  created_at: Date;
}

export interface Conversation {
  id: string;
  user_id: string;
  session_id?: string;
  voice_profile_id?: string;
  conversation_title?: string;
  language_code: string;
  status: ConversationStatus;
  context: ConversationContext;
  summary?: string;
  total_messages: number;
  total_duration_seconds: number;
  confidence_score?: number;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  user?: import('./user.types').User;
  voice_profile?: VoiceProfile;
  messages?: ConversationMessage[];
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  message_type: MessageType;
  content: string;
  audio_url?: string;
  audio_duration_seconds?: number;
  transcription_confidence?: number;
  language_detected?: string;
  intent_detected?: string;
  entities_extracted: Record<string, any>;
  ai_confidence?: number;
  processing_time_ms?: number;
  created_at: Date;
  message_order: number;
  conversation?: Conversation;
}

export interface ConversationContext {
  current_topic?: string;
  previous_intents: string[];
  entities: Record<string, any>;
  user_preferences: Record<string, any>;
  crm_context?: {
    active_lead_id?: string;
    active_task_id?: string;
    active_meeting_id?: string;
  };
  conversation_flow: string[];
  last_action?: string;
  pending_confirmations: string[];
  session_variables: Record<string, any>;
}

export interface IntentLog {
  id: string;
  user_id: string;
  conversation_id?: string;
  message_id?: string;
  session_id?: string;
  intent_name: string;
  intent_category?: string;
  confidence_score: number;
  input_text: string;
  processed_text?: string;
  entities: Record<string, any>;
  context: Record<string, any>;
  action_taken?: string;
  action_success?: boolean;
  action_result: Record<string, any>;
  error_message?: string;
  processing_time_ms?: number;
  model_version?: string;
  created_at: Date;
  user?: import('./user.types').User;
  conversation?: Conversation;
  message?: ConversationMessage;
}

export interface VoiceTrainingSession {
  id: string;
  voice_profile_id: string;
  session_type: TrainingSessionType;
  status: TrainingSessionStatus;
  total_samples_required: number;
  samples_completed: number;
  current_accuracy?: number;
  target_accuracy: number;
  training_data: Record<string, any>;
  error_message?: string;
  started_at: Date;
  completed_at?: Date;
  created_at: Date;
  voice_profile?: VoiceProfile;
}

export interface AIModelConfig {
  id: string;
  model_name: string;
  model_type: ModelType;
  version: string;
  provider: ModelProvider;
  configuration: Record<string, any>;
  is_active: boolean;
  is_default: boolean;
  performance_metrics: Record<string, any>;
  cost_per_request?: number;
  rate_limit_per_minute?: number;
  created_at: Date;
  updated_at: Date;
}

// Enums and Union Types
export type VoiceTrainingStatus = 'untrained' | 'training' | 'trained' | 'failed';
export type ConversationStatus = 'active' | 'completed' | 'failed' | 'timeout';
export type MessageType = 'user_voice' | 'user_text' | 'ai_response' | 'system';
export type TrainingSessionType = 'initial' | 'improvement' | 'recalibration';
export type TrainingSessionStatus = 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type ModelType = 'llm' | 'stt' | 'tts' | 'intent_detection';
export type ModelProvider = 'google' | 'openai' | 'custom';

// Request/Response DTOs
export interface CreateVoiceProfileRequest {
  profile_name: string;
  language_code: string;
  accent?: string;
}

export interface UpdateVoiceProfileRequest {
  profile_name?: string;
  language_code?: string;
  accent?: string;
  is_active?: boolean;
  is_default?: boolean;
}

export interface StartVoiceTrainingRequest {
  voice_profile_id: string;
  session_type: TrainingSessionType;
  target_accuracy?: number;
}

export interface UploadVoiceSampleRequest {
  voice_profile_id: string;
  audio_file: File | Buffer;
  text_content: string;
}

export interface StartConversationRequest {
  voice_profile_id?: string;
  language_code?: string;
  initial_context?: Partial<ConversationContext>;
}

export interface SendMessageRequest {
  conversation_id: string;
  message_type: MessageType;
  content?: string;
  audio_file?: File | Buffer;
}

export interface ProcessVoiceInputRequest {
  conversation_id: string;
  audio_file: File | Buffer;
  language_code?: string;
}

export interface ProcessTextInputRequest {
  conversation_id: string;
  text: string;
  language_code?: string;
}

export interface UpdateConversationContextRequest {
  conversation_id: string;
  context_updates: Partial<ConversationContext>;
}

export interface CreateAIModelConfigRequest {
  model_name: string;
  model_type: ModelType;
  version: string;
  provider: ModelProvider;
  configuration: Record<string, any>;
  is_default?: boolean;
  cost_per_request?: number;
  rate_limit_per_minute?: number;
}

export interface UpdateAIModelConfigRequest {
  configuration?: Record<string, any>;
  is_active?: boolean;
  is_default?: boolean;
  performance_metrics?: Record<string, any>;
  cost_per_request?: number;
  rate_limit_per_minute?: number;
}

// Query parameters
export interface VoiceProfileQueryParams {
  page?: number;
  limit?: number;
  user_id?: string;
  language_code?: string;
  is_active?: boolean;
  training_status?: VoiceTrainingStatus;
  sort_by?: 'created_at' | 'updated_at' | 'recognition_accuracy' | 'profile_name';
  sort_order?: 'asc' | 'desc';
}

export interface ConversationQueryParams {
  page?: number;
  limit?: number;
  user_id?: string;
  status?: ConversationStatus;
  language_code?: string;
  start_date?: Date;
  end_date?: Date;
  sort_by?: 'created_at' | 'updated_at' | 'total_messages' | 'total_duration_seconds';
  sort_order?: 'asc' | 'desc';
}

export interface IntentLogQueryParams {
  page?: number;
  limit?: number;
  user_id?: string;
  conversation_id?: string;
  intent_name?: string;
  intent_category?: string;
  action_success?: boolean;
  min_confidence?: number;
  start_date?: Date;
  end_date?: Date;
  sort_by?: 'created_at' | 'confidence_score' | 'processing_time_ms';
  sort_order?: 'asc' | 'desc';
}

// Response types
export interface VoiceProcessingResponse {
  transcription: string;
  confidence_score: number;
  language_detected: string;
  processing_time_ms: number;
  intent_detected?: string;
  entities_extracted?: Record<string, any>;
}

export interface AIResponse {
  response_text: string;
  confidence_score: number;
  intent_fulfilled: boolean;
  action_taken?: string;
  action_result?: Record<string, any>;
  context_updates?: Partial<ConversationContext>;
  processing_time_ms: number;
  model_used: string;
}

export interface ConversationSummary {
  conversation_id: string;
  summary: string;
  key_topics: string[];
  actions_taken: string[];
  unresolved_items: string[];
  sentiment_analysis?: {
    overall_sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
  };
}

// Analytics types
export interface VoiceAnalytics {
  total_conversations: number;
  average_conversation_duration: number;
  average_confidence_score: number;
  most_common_intents: Array<{
    intent: string;
    count: number;
    success_rate: number;
  }>;
  language_distribution: Array<{
    language_code: string;
    count: number;
    percentage: number;
  }>;
  accuracy_trends: Array<{
    date: Date;
    average_accuracy: number;
  }>;
}

export interface IntentAnalytics {
  intent_name: string;
  total_occurrences: number;
  success_rate: number;
  average_confidence: number;
  average_processing_time: number;
  common_entities: Array<{
    entity_type: string;
    count: number;
  }>;
  failure_reasons: Array<{
    reason: string;
    count: number;
  }>;
}

// Error types
export interface VoiceProcessingError extends Error {
  code: 'AUDIO_FORMAT_UNSUPPORTED' | 'TRANSCRIPTION_FAILED' | 'LANGUAGE_NOT_SUPPORTED' | 'AUDIO_TOO_SHORT' | 'AUDIO_TOO_LONG';
  details?: Record<string, any>;
}

export interface ConversationError extends Error {
  code: 'CONVERSATION_NOT_FOUND' | 'CONVERSATION_EXPIRED' | 'INVALID_MESSAGE_TYPE' | 'CONTEXT_INVALID';
  conversation_id?: string;
}

export interface TrainingError extends Error {
  code: 'INSUFFICIENT_SAMPLES' | 'TRAINING_FAILED' | 'PROFILE_NOT_FOUND' | 'TRAINING_IN_PROGRESS';
  voice_profile_id?: string;
}

// Constants
export const SUPPORTED_LANGUAGES = {
  'en-IN': 'English (India)',
  'hi-IN': 'Hindi (India)',
  'en-US': 'English (US)',
  'en-GB': 'English (UK)'
} as const;

export const SUPPORTED_ACCENTS = {
  indian: 'Indian',
  american: 'American',
  british: 'British',
  australian: 'Australian'
} as const;

export const INTENT_CATEGORIES = {
  CRM: 'crm',
  CALENDAR: 'calendar',
  TASK_MANAGEMENT: 'task_management',
  EMAIL: 'email',
  SYSTEM: 'system',
  GENERAL: 'general'
} as const;

export const COMMON_INTENTS = {
  // CRM intents
  CREATE_LEAD: 'create_lead',
  UPDATE_LEAD: 'update_lead',
  GET_LEAD: 'get_lead',
  SEARCH_LEADS: 'search_leads',
  
  // Calendar intents
  SCHEDULE_MEETING: 'schedule_meeting',
  RESCHEDULE_MEETING: 'reschedule_meeting',
  CANCEL_MEETING: 'cancel_meeting',
  GET_CALENDAR: 'get_calendar',
  
  // Task intents
  CREATE_TASK: 'create_task',
  UPDATE_TASK: 'update_task',
  GET_TASKS: 'get_tasks',
  COMPLETE_TASK: 'complete_task',
  
  // Email intents
  READ_EMAIL: 'read_email',
  SEND_EMAIL: 'send_email',
  SUMMARIZE_EMAIL: 'summarize_email',
  
  // System intents
  GET_HELP: 'get_help',
  CHANGE_SETTINGS: 'change_settings',
  LOGOUT: 'logout',
  
  // General intents
  GREETING: 'greeting',
  GOODBYE: 'goodbye',
  CONFIRMATION: 'confirmation',
  CANCELLATION: 'cancellation',
  UNKNOWN: 'unknown'
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;
export type SupportedAccent = keyof typeof SUPPORTED_ACCENTS;
export type IntentCategory = typeof INTENT_CATEGORIES[keyof typeof INTENT_CATEGORIES];
export type CommonIntent = typeof COMMON_INTENTS[keyof typeof COMMON_INTENTS];