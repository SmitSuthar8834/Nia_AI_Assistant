-- Connect to voice database
\c nia_voice;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Voice profiles table
CREATE TABLE voice_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    language_preferences TEXT[] DEFAULT ARRAY['en-IN'],
    voice_settings JSONB DEFAULT '{"speed": 1.0, "pitch": 0.0, "volume": 0.0}',
    training_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]',
    context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice interaction logs table
CREATE TABLE voice_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_id VARCHAR(255),
    input_text TEXT,
    input_confidence DECIMAL(3,2),
    output_text TEXT,
    intent VARCHAR(100),
    entities JSONB,
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audio samples table (for voice training)
CREATE TABLE audio_samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    sample_data BYTEA,
    transcription TEXT,
    confidence DECIMAL(3,2),
    language_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_voice_profiles_user_id ON voice_profiles(user_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_voice_interactions_user_id ON voice_interactions(user_id);
CREATE INDEX idx_voice_interactions_created_at ON voice_interactions(created_at);
CREATE INDEX idx_audio_samples_user_id ON audio_samples(user_id);