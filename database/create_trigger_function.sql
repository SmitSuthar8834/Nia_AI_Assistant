-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for voice and AI tables
CREATE TRIGGER update_voice_profiles_updated_at BEFORE UPDATE ON voice_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_model_configs_updated_at BEFORE UPDATE ON ai_model_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();