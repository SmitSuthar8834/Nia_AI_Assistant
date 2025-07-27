# Nia AI Service

The AI Engine Service for the Nia AI Sales Assistant platform. This service handles natural language processing, intent detection, conversation context management, and integration with multiple AI models.

## Features

- **Multi-Model Support**: Integrates with Gemini Pro and GPT-4 with automatic fallback
- **Intent Detection**: Custom NLP pipeline for sales-specific intents
- **Context Management**: Conversation memory and context preservation using Redis
- **Entity Extraction**: Extracts structured data from natural language
- **Multi-language Support**: Handles English, Hindi, and Hinglish interactions
- **Performance Optimization**: Model switching and response caching

## Architecture

### Core Components

- **AI Service**: Main orchestrator for AI processing
- **Intent Service**: Detects user intents and extracts entities
- **Context Service**: Manages conversation context and memory
- **Gemini Provider**: Google Gemini Pro integration
- **OpenAI Provider**: GPT-4 and GPT-3.5-turbo integration

### Supported Intents

- `create_lead`: Create new leads in CRM
- `update_lead`: Update existing lead information
- `search_lead`: Search for leads in CRM
- `schedule_meeting`: Schedule meetings and calendar events
- `create_task`: Create tasks and reminders
- `get_tasks`: Retrieve pending tasks
- `email_summary`: Summarize and read emails
- `greeting`: Handle greetings and introductions
- `goodbye`: Handle farewells
- `general_inquiry`: Handle general questions

## API Endpoints

### Process AI Request
```
POST /api/ai/process
```

Request body:
```json
{
  "text": "Create a lead for John from TechCorp",
  "userId": "user-123",
  "sessionId": "session-456",
  "language": "en-IN"
}
```

Response:
```json
{
  "response": "I'll help you create a lead for John from TechCorp. What's his email address?",
  "intent": "create_lead",
  "entities": {
    "name": "John",
    "company": "TechCorp"
  },
  "confidence": 0.95,
  "actions": [
    {
      "type": "validate_lead_data",
      "parameters": { "name": "John", "company": "TechCorp" },
      "priority": 1
    }
  ]
}
```

### Get Conversation Context
```
GET /api/ai/context/:userId/:sessionId?
```

### Clear Conversation Context
```
DELETE /api/ai/context/:userId/:sessionId?
```

### Switch AI Model
```
POST /api/ai/model/switch
```

Request body:
```json
{
  "model": "gemini-pro"
}
```

### Get Model Status
```
GET /api/ai/model/status
```

### Process Multi-language Text
```
POST /api/ai/language/process
```

### Health Check
```
GET /api/ai/health
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
# AI Model Configuration
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
DEFAULT_AI_MODEL=gemini-pro
FALLBACK_AI_MODEL=gpt-3.5-turbo

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nia_ai
DB_USER=postgres
DB_PASSWORD=password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Installation

```bash
# Install dependencies
npm install

# Build the service
npm run build

# Run in development mode
npm run dev

# Run in production mode
npm start

# Run tests
npm test
```

## Docker

```bash
# Build Docker image
docker build -t nia-ai-service .

# Run container
docker run -p 3004:3004 --env-file .env nia-ai-service
```

## Usage Examples

### Creating a Lead
```javascript
const response = await fetch('/api/ai/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Create a lead for Sarah Johnson from TechNova, email sarah@technova.com",
    userId: "user-123"
  })
});
```

### Scheduling a Meeting
```javascript
const response = await fetch('/api/ai/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Schedule a meeting with Mike tomorrow at 3 PM",
    userId: "user-123"
  })
});
```

### Multi-language Support
```javascript
const response = await fetch('/api/ai/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Namaskar, mujhe ek lead create karna hai for Raj from InfoTech",
    userId: "user-123",
    language: "hi-en"
  })
});
```

## Testing

The service includes comprehensive tests for:

- Intent detection accuracy
- Entity extraction
- Context management
- Multi-language processing
- API endpoints

Run tests with:
```bash
npm test
```

## Monitoring

The service provides health checks and metrics:

- Model availability status
- Response times
- Error rates
- Context cache statistics

## Security

- JWT token authentication
- Rate limiting
- Input validation
- Secure API key management
- CORS configuration

## Performance

- Response caching with Redis
- Model fallback mechanisms
- Connection pooling
- Graceful error handling
- Memory-efficient context management