-- Migration: 002_create_voice_ai_tables.sql
-- Description: Create voice and AI data tables for voice profiles, conversations, and intent logs
-- Date: 2025-01-26

-- Create voice_profiles table
CREATE TABLE IF NOT EXISTS voice_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_name VARCHAR(100) NOT NULL,
    language_code VARCHAR(10) NOT NULL DEFAULT 'en-IN', -- e.g., 'en-IN', 'hi-IN', 'en-US'
    accent VARCHAR(50), -- e.g., 'indian', 'american', 'british'
    voice_samples JSONB DEFAULT '[]', -- Array of voice sample metadata
    calibration_data JSONB DEFAULT '{}', -- Voice calibration parameters
    recognition_accuracy DECIMAL(5,2) DEFAULT 0.0, -- Percentage accuracy
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    training_status VARCHAR(20) DEFAULT 'untrained', -- 'untrained', 'training', 'trained', 'failed'
    training_progress INTEGER DEFAULT 0, -- 0-100 percentage
    last_trained_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, profile_name)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    voice_profile_id UUID REFERENCES voice_profiles(id) ON DELETE SET NULL,
    conversation_title VARCHAR(200),
    language_code VARCHAR(10) NOT NULL DEFAULT 'en-IN',
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'failed', 'timeout'
    context JSONB DEFAULT '{}', -- Conversation context and memory
    summary TEXT, -- AI-generated conversation summary
    total_messages INTEGER DEFAULT 0,
    total_duration_seconds INTEGER DEFAULT 0, -- Total conversation duration
    confidence_score DECIMAL(5,2), -- Overall conversation confidence
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create conversation_messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL, -- 'user_voice', 'user_text', 'ai_response', 'system'
    content TEXT NOT NULL,
    audio_url TEXT, -- URL to stored audio file (for voice messages)
    audio_duration_seconds INTEGER, -- Duration of audio message
    transcription_confidence DECIMAL(5,2), -- STT confidence score
    language_detected VARCHAR(10), -- Detected language for the message
    intent_detected VARCHAR(100), -- Detected intent (e.g., 'create_lead', 'schedule_meeting')
    entities_extracted JSONB DEFAULT '{}', -- Extracted entities (names, dates, etc.)
    ai_confidence DECIMAL(5,2), -- AI response confidence
    processing_time_ms INTEGER, -- Time taken to process the message
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_order INTEGER NOT NULL -- Order of message in conversation
);

-- Create intent_logs table
CREATE TABLE IF NOT EXISTS intent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES conversation_messages(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    intent_name VARCHAR(100) NOT NULL, -- e.g., 'create_lead', 'schedule_meeting', 'get_tasks'
    intent_category VARCHAR(50), -- e.g., 'crm', 'calendar', 'task_management'
    confidence_score DECIMAL(5,2) NOT NULL,
    input_text TEXT NOT NULL, -- Original user input
    processed_text TEXT, -- Cleaned/processed text
    entities JSONB DEFAULT '{}', -- Extracted entities
    context JSONB DEFAULT '{}', -- Context used for intent detection
    action_taken VARCHAR(100), -- Action performed based on intent
    action_success BOOLEAN,
    action_result JSONB DEFAULT '{}', -- Result of the action
    error_message TEXT, -- Error message if action failed
    processing_time_ms INTEGER,
    model_version VARCHAR(50), -- AI model version used
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create voice_training_sessions table
CREATE TABLE IF NOT EXISTS voice_training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voice_profile_id UUID NOT NULL REFERENCES voice_profiles(id) ON DELETE CASCADE,
    session_type VARCHAR(20) NOT NULL, -- 'initial', 'improvement', 'recalibration'
    status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed', 'cancelled'
    total_samples_required INTEGER DEFAULT 50,
    samples_completed INTEGER DEFAULT 0,
    current_accuracy DECIMAL(5,2),
    target_accuracy DECIMAL(5,2) DEFAULT 95.0,
    training_data JSONB DEFAULT '{}', -- Training parameters and data
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_model_configs table
CREATE TABLE IF NOT EXISTS ai_model_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(100) NOT NULL, -- e.g., 'gemini-pro', 'gpt-4', 'whisper'
    model_type VARCHAR(50) NOT NULL, -- 'llm', 'stt', 'tts', 'intent_detection'
    version VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'google', 'openai', 'custom'
    configuration JSONB NOT NULL DEFAULT '{}', -- Model-specific configuration
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    performance_metrics JSONB DEFAULT '{}', -- Performance tracking
    cost_per_request DECIMAL(10,6), -- Cost tracking
    rate_limit_per_minute INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_name, version)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voice_profiles_user_id ON voice_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_profiles_is_active ON voice_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_voice_profiles_is_default ON voice_profiles(is_default);
CREATE INDEX IF NOT EXISTS idx_voice_profiles_language_code ON voice_profiles(language_code);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_voice_profile_id ON conversations(voice_profile_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_language_code ON conversations(language_code);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_message_type ON conversation_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_intent_detected ON conversation_messages(intent_detected);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_order ON conversation_messages(conversation_id, message_order);

CREATE INDEX IF NOT EXISTS idx_intent_logs_user_id ON intent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_intent_logs_conversation_id ON intent_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_intent_logs_message_id ON intent_logs(message_id);
CREATE INDEX IF NOT EXISTS idx_intent_logs_intent_name ON intent_logs(intent_name);
CREATE INDEX IF NOT EXISTS idx_intent_logs_intent_category ON intent_logs(intent_category);
CREATE INDEX IF NOT EXISTS idx_intent_logs_confidence_score ON intent_logs(confidence_score);
CREATE INDEX IF NOT EXISTS idx_intent_logs_created_at ON intent_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_intent_logs_action_success ON intent_logs(action_success);

CREATE INDEX IF NOT EXISTS idx_voice_training_sessions_profile_id ON voice_training_sessions(voice_profile_id);
CREATE INDEX IF NOT EXISTS idx_voice_training_sessions_status ON voice_training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_training_sessions_created_at ON voice_training_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_model_configs_model_type ON ai_model_configs(model_type);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_is_active ON ai_model_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_is_default ON ai_model_configs(is_default);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_provider ON ai_model_configs(provider);

-- Create triggers for updated_at columns
CREATE TRIGGER update_voice_profiles_updated_at BEFORE UPDATE ON voice_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_model_configs_updated_at BEFORE UPDATE ON ai_model_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default AI model configurations
INSERT INTO ai_model_configs (model_name, model_type, version, provider, configuration, is_active, is_default) VALUES 
-- Speech-to-Text models
('google-speech-to-text', 'stt', 'v1', 'google', '{"language_code": "en-IN", "enable_automatic_punctuation": true, "enable_word_time_offsets": true}', true, true),
('whisper', 'stt', 'v1', 'openai', '{"language": "en", "response_format": "json", "temperature": 0}', false, false),

-- Text-to-Speech models
('google-text-to-speech', 'tts', 'v1', 'google', '{"language_code": "en-IN", "voice_name": "en-IN-Wavenet-A", "speaking_rate": 1.0}', true, true),

-- Large Language Models
('gemini-pro', 'llm', 'v1', 'google', '{"temperature": 0.7, "max_output_tokens": 1024, "top_p": 0.8, "top_k": 40}', true, true),
('gpt-4', 'llm', 'v1', 'openai', '{"temperature": 0.7, "max_tokens": 1024, "top_p": 1, "frequency_penalty": 0, "presence_penalty": 0}', false, false),

-- Intent Detection models
('custom-intent-classifier', 'intent_detection', 'v1', 'custom', '{"confidence_threshold": 0.8, "max_entities": 10}', true, true)

ON CONFLICT (model_name, version) DO NOTHING;