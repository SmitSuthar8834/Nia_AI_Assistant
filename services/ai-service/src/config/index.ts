import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3004,
  
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'nia_ai',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  
  // AI Models
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY
    },
    defaultModel: process.env.DEFAULT_AI_MODEL || 'gemini-pro',
    fallbackModel: process.env.FALLBACK_AI_MODEL || 'gpt-3.5-turbo',
    maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
    timeout: parseInt(process.env.AI_TIMEOUT || '30000')
  },
  
  // Context Management
  context: {
    maxHistoryLength: parseInt(process.env.MAX_HISTORY_LENGTH || '20'),
    contextTtl: parseInt(process.env.CONTEXT_TTL || '3600'), // 1 hour
    maxContextSize: parseInt(process.env.MAX_CONTEXT_SIZE || '4000') // tokens
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX || '100') // requests per window
  }
};

export default config;