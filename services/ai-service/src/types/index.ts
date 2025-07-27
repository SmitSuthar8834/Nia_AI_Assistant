export interface ConversationContext {
  userId: string;
  sessionId: string;
  currentTopic: string;
  entities: Record<string, any>;
  history: ConversationMessage[];
  lastActivity: Date;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  entities?: Record<string, any>;
}

export interface IntentResult {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  requiredActions: Action[];
  metadata?: {
    nlpResult?: any;
    enrichmentResult?: any;
    alternativeIntents?: Array<{ intent: string; confidence: number }>;
  };
}

export interface Action {
  type: string;
  parameters: Record<string, any>;
  priority: number;
}

export interface AIResponse {
  response: string;
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  actions?: Action[];
  context?: ConversationContext;
}

export interface AIRequest {
  text: string;
  userId: string;
  sessionId?: string;
  context?: ConversationContext;
  language?: string;
}

export enum AIModel {
  GEMINI_PRO = 'gemini-pro',
  GPT_4 = 'gpt-4',
  GPT_3_5_TURBO = 'gpt-3.5-turbo'
}

export interface ModelConfig {
  model: AIModel;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface ProcessedText {
  text: string;
  language: string;
  confidence: number;
  entities: Record<string, any>;
}

export interface SalesIntent {
  CREATE_LEAD: 'create_lead';
  UPDATE_LEAD: 'update_lead';
  SEARCH_LEAD: 'search_lead';
  SCHEDULE_MEETING: 'schedule_meeting';
  CREATE_TASK: 'create_task';
  GET_TASKS: 'get_tasks';
  EMAIL_SUMMARY: 'email_summary';
  GENERAL_INQUIRY: 'general_inquiry';
  GREETING: 'greeting';
  GOODBYE: 'goodbye';
}

export const SALES_INTENTS: SalesIntent = {
  CREATE_LEAD: 'create_lead',
  UPDATE_LEAD: 'update_lead',
  SEARCH_LEAD: 'search_lead',
  SCHEDULE_MEETING: 'schedule_meeting',
  CREATE_TASK: 'create_task',
  GET_TASKS: 'get_tasks',
  EMAIL_SUMMARY: 'email_summary',
  GENERAL_INQUIRY: 'general_inquiry',
  GREETING: 'greeting',
  GOODBYE: 'goodbye'
};