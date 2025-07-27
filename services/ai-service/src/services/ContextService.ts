import { ConversationContext, ConversationMessage } from '../types';
import { redisClient } from '../database/connection';
import config from '../config';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class ContextService {
  private readonly CONTEXT_PREFIX = 'context:';
  private readonly SESSION_PREFIX = 'session:';

  async getContext(userId: string, sessionId?: string): Promise<ConversationContext | null> {
    try {
      const contextKey = this.getContextKey(userId, sessionId);
      const contextData = await redisClient.get(contextKey);
      
      if (!contextData) {
        return null;
      }

      const context = JSON.parse(contextData) as ConversationContext;
      
      // Convert date strings back to Date objects
      context.lastActivity = new Date(context.lastActivity);
      context.history = context.history.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));

      logger.info('Context retrieved', { userId, sessionId, historyLength: context.history.length });
      return context;
    } catch (error) {
      logger.error('Error retrieving context:', error);
      return null;
    }
  }

  async saveContext(context: ConversationContext): Promise<void> {
    try {
      const contextKey = this.getContextKey(context.userId, context.sessionId);
      
      // Trim history if it exceeds max length
      if (context.history.length > config.context.maxHistoryLength) {
        context.history = context.history.slice(-config.context.maxHistoryLength);
      }

      // Update last activity
      context.lastActivity = new Date();

      await redisClient.setEx(
        contextKey,
        config.context.contextTtl,
        JSON.stringify(context)
      );

      logger.info('Context saved', { 
        userId: context.userId, 
        sessionId: context.sessionId,
        historyLength: context.history.length 
      });
    } catch (error) {
      logger.error('Error saving context:', error);
      throw error;
    }
  }

  async createNewContext(userId: string, sessionId?: string): Promise<ConversationContext> {
    const newSessionId = sessionId || uuidv4();
    
    const context: ConversationContext = {
      userId,
      sessionId: newSessionId,
      currentTopic: '',
      entities: {},
      history: [],
      lastActivity: new Date()
    };

    await this.saveContext(context);
    
    logger.info('New context created', { userId, sessionId: newSessionId });
    return context;
  }

  async addMessage(
    userId: string,
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    intent?: string,
    entities?: Record<string, any>
  ): Promise<ConversationContext> {
    let context = await this.getContext(userId, sessionId);
    
    if (!context) {
      context = await this.createNewContext(userId, sessionId);
    }

    const message: ConversationMessage = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date(),
      intent,
      entities
    };

    context.history.push(message);
    
    // Update entities with new information
    if (entities) {
      context.entities = { ...context.entities, ...entities };
    }

    // Update current topic based on intent
    if (intent && role === 'user') {
      context.currentTopic = intent;
    }

    await this.saveContext(context);
    return context;
  }

  async updateEntities(
    userId: string,
    sessionId: string,
    entities: Record<string, any>
  ): Promise<ConversationContext | null> {
    const context = await this.getContext(userId, sessionId);
    
    if (!context) {
      return null;
    }

    context.entities = { ...context.entities, ...entities };
    await this.saveContext(context);
    
    return context;
  }

  async clearContext(userId: string, sessionId?: string): Promise<void> {
    try {
      const contextKey = this.getContextKey(userId, sessionId);
      await redisClient.del(contextKey);
      
      logger.info('Context cleared', { userId, sessionId });
    } catch (error) {
      logger.error('Error clearing context:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string): Promise<string[]> {
    try {
      const pattern = `${this.CONTEXT_PREFIX}${userId}:*`;
      const keys = await redisClient.keys(pattern);
      
      return keys.map((key: string) => {
        const parts = key.split(':');
        return parts[parts.length - 1];
      });
    } catch (error) {
      logger.error('Error getting user sessions:', error);
      return [];
    }
  }

  async getContextSummary(userId: string, sessionId: string): Promise<string> {
    const context = await this.getContext(userId, sessionId);
    
    if (!context || context.history.length === 0) {
      return 'No previous conversation history.';
    }

    const recentMessages = context.history.slice(-5);
    const topics = [...new Set(recentMessages.map(msg => msg.intent).filter(Boolean))];
    
    let summary = `Recent conversation topics: ${topics.join(', ') || 'general discussion'}.\n`;
    
    if (Object.keys(context.entities).length > 0) {
      summary += `Current context: ${JSON.stringify(context.entities, null, 2)}`;
    }

    return summary;
  }

  private getContextKey(userId: string, sessionId?: string): string {
    if (sessionId) {
      return `${this.CONTEXT_PREFIX}${userId}:${sessionId}`;
    }
    return `${this.CONTEXT_PREFIX}${userId}:default`;
  }

  async cleanupExpiredContexts(): Promise<void> {
    try {
      const pattern = `${this.CONTEXT_PREFIX}*`;
      const keys = await redisClient.keys(pattern);
      
      let cleanedCount = 0;
      
      for (const key of keys) {
        const ttl = await redisClient.ttl(key);
        if (ttl === -1) { // Key exists but has no expiration
          await redisClient.expire(key, config.context.contextTtl);
        } else if (ttl === -2) { // Key doesn't exist
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} expired contexts`);
      }
    } catch (error) {
      logger.error('Error cleaning up expired contexts:', error);
    }
  }
}