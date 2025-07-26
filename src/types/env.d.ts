declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: string;
    PORT?: string;
    FRONTEND_URL?: string;

    // Database
    DB_HOST?: string;
    DB_PORT?: string;
    DB_NAME?: string;
    DB_USER?: string;
    DB_PASSWORD?: string;
    DB_POOL_MAX?: string;
    DB_POOL_MIN?: string;
    DB_IDLE_TIMEOUT?: string;
    DB_CONNECTION_TIMEOUT?: string;

    // Redis
    REDIS_HOST?: string;
    REDIS_PORT?: string;
    REDIS_PASSWORD?: string;
    REDIS_DB?: string;

    // JWT
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;
    JWT_REFRESH_SECRET?: string;
    JWT_REFRESH_EXPIRES_IN?: string;

    // Logging
    LOG_LEVEL?: string;

    // External APIs
    GOOGLE_SPEECH_API_KEY?: string;
    GOOGLE_CALENDAR_CLIENT_ID?: string;
    GOOGLE_CALENDAR_CLIENT_SECRET?: string;
    OPENAI_API_KEY?: string;
    GEMINI_API_KEY?: string;

    // CRM
    SALESFORCE_CLIENT_ID?: string;
    SALESFORCE_CLIENT_SECRET?: string;
    CREATIO_BASE_URL?: string;
    CREATIO_USERNAME?: string;
    CREATIO_PASSWORD?: string;
  }
}
