-- Create databases for each microservice
CREATE DATABASE nia_auth;
CREATE DATABASE nia_voice;
CREATE DATABASE nia_ai;
CREATE DATABASE nia_crm;
CREATE DATABASE nia_notifications;

-- Create users for each service (optional, for better security)
CREATE USER auth_service WITH PASSWORD 'auth_password';
CREATE USER voice_service WITH PASSWORD 'voice_password';
CREATE USER ai_service WITH PASSWORD 'ai_password';
CREATE USER crm_service WITH PASSWORD 'crm_password';
CREATE USER notification_service WITH PASSWORD 'notification_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE nia_auth TO auth_service;
GRANT ALL PRIVILEGES ON DATABASE nia_voice TO voice_service;
GRANT ALL PRIVILEGES ON DATABASE nia_ai TO ai_service;
GRANT ALL PRIVILEGES ON DATABASE nia_crm TO crm_service;
GRANT ALL PRIVILEGES ON DATABASE nia_notifications TO notification_service;