import { GeminiProvider } from '../providers/GeminiProvider';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { IntentService } from './IntentService';
import { ContextService } from './ContextService';
import { AIRequest, AIResponse, AIModel, ModelConfig, ConversationContext } from '../types';
import config from '../config';
import logger from '../utils/logger';

export class AIService {
  private geminiProvider?: GeminiProvider;
  private openaiProvider?: OpenAIProvider;
  private intentService: IntentService;
  private contextService: ContextService;
  private currentModel: AIModel;

  constructor() {
    this.intentService = new IntentService();
    this.contextService = new ContextService();
    this.currentModel = config.ai.defaultModel as AIModel;
    
    // Initialize providers
    try {
      this.geminiProvider = new GeminiProvider();
    } catch (error) {
      logger.warn('Gemini provider initialization failed:', error);
    }
    
    try {
      this.openaiProvider = new OpenAIProvider();
    } catch (error) {
      logger.warn('OpenAI provider initialization failed:', error);
    }
  }

  async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      logger.info('Processing AI request', {
        userId: request.userId,
        textLength: request.text.length,
        language: request.language
      });

      // Get or create conversation context
      let context = request.context;
      if (!context) {
        const existingContext = await this.contextService.getContext(request.userId, request.sessionId);
        if (existingContext) {
          context = existingContext;
        } else {
          context = await this.contextService.createNewContext(request.userId, request.sessionId);
        }
      }

      // Detect intent and extract entities
      const intentResult = await this.intentService.detectIntent(request.text);
      
      // Add user message to context
      context = await this.contextService.addMessage(
        request.userId,
        context.sessionId,
        'user',
        request.text,
        intentResult.intent,
        intentResult.entities
      );

      // Generate AI response
      const response = await this.generateResponse(request.text, context, intentResult);
      
      // Add assistant response to context
      await this.contextService.addMessage(
        request.userId,
        context.sessionId,
        'assistant',
        response
      );

      const processingTime = Date.now() - startTime;
      
      logger.info('AI request processed successfully', {
        userId: request.userId,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        processingTime
      });

      return {
        response,
        intent: intentResult.intent,
        entities: intentResult.entities,
        confidence: intentResult.confidence,
        actions: intentResult.requiredActions,
        context
      };

    } catch (error) {
      logger.error('Error processing AI request:', error);
      
      // Fallback response
      return {
        response: "I apologize, but I'm having trouble processing your request right now. Could you please try again?",
        intent: 'error',
        entities: {},
        confidence: 0,
        actions: []
      };
    }
  }

  private async generateResponse(
    text: string,
    context: ConversationContext,
    intentResult: any
  ): Promise<string> {
    const modelConfig: ModelConfig = {
      model: this.currentModel,
      temperature: 0.7,
      maxTokens: 1024,
      topP: 0.95
    };

    // Try primary model first
    try {
      return await this.generateWithModel(text, context, modelConfig);
    } catch (error) {
      logger.warn(`Primary model (${this.currentModel}) failed, trying fallback:`, error);
      
      // Try fallback model
      const fallbackModel = config.ai.fallbackModel as AIModel;
      if (fallbackModel !== this.currentModel) {
        try {
          modelConfig.model = fallbackModel;
          return await this.generateWithModel(text, context, modelConfig);
        } catch (fallbackError) {
          logger.error('Fallback model also failed:', fallbackError);
        }
      }
      
      // Return intent-based fallback response
      return this.getFallbackResponse(intentResult.intent, intentResult.entities);
    }
  }

  private async generateWithModel(
    text: string,
    context: ConversationContext,
    modelConfig: ModelConfig
  ): Promise<string> {
    if (modelConfig.model === AIModel.GEMINI_PRO && this.geminiProvider) {
      return await this.geminiProvider.generateResponse(text, context, modelConfig);
    } else if (this.openaiProvider) {
      return await this.openaiProvider.generateResponse(text, context, modelConfig);
    } else {
      throw new Error('No available AI providers');
    }
  }

  private getFallbackResponse(intent: string, entities: Record<string, any>): string {
    switch (intent) {
      case 'create_lead':
        if (entities.name && entities.company) {
          return `I understand you want to create a lead for ${entities.name} from ${entities.company}. Let me help you with that. What's their email address?`;
        }
        return "I can help you create a new lead. Please provide the contact's name and company.";
        
      case 'schedule_meeting':
        if (entities.participant) {
          return `I'll help you schedule a meeting with ${entities.participant}. What date and time work for you?`;
        }
        return "I can help you schedule a meeting. Who would you like to meet with?";
        
      case 'create_task':
        return "I can help you create a task. What would you like to be reminded about?";
        
      case 'search_lead':
        return "I can help you find leads in your CRM. What information are you looking for?";
        
      case 'greeting':
        return "Hello! I'm Nia, your AI sales assistant. How can I help you with your sales tasks today?";
        
      case 'goodbye':
        return "Goodbye! Feel free to reach out whenever you need help with your sales activities.";
        
      default:
        return "I'm here to help with your sales tasks like creating leads, scheduling meetings, and managing your CRM. What would you like to do?";
    }
  }

  async switchModel(model: AIModel): Promise<boolean> {
    try {
      // Test the model before switching
      const testProvider = model === AIModel.GEMINI_PRO ? this.geminiProvider : this.openaiProvider;
      
      if (!testProvider) {
        throw new Error(`Provider for ${model} not available`);
      }

      const isHealthy = await testProvider.isHealthy();
      if (!isHealthy) {
        throw new Error(`Model ${model} health check failed`);
      }

      this.currentModel = model;
      logger.info(`Switched to AI model: ${model}`);
      return true;
    } catch (error) {
      logger.error(`Failed to switch to model ${model}:`, error);
      return false;
    }
  }

  async getModelStatus(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};

    if (this.geminiProvider) {
      try {
        status[AIModel.GEMINI_PRO] = await this.geminiProvider.isHealthy();
      } catch {
        status[AIModel.GEMINI_PRO] = false;
      }
    }

    if (this.openaiProvider) {
      try {
        status[AIModel.GPT_4] = await this.openaiProvider.isHealthy();
        status[AIModel.GPT_3_5_TURBO] = await this.openaiProvider.isHealthy();
      } catch {
        status[AIModel.GPT_4] = false;
        status[AIModel.GPT_3_5_TURBO] = false;
      }
    }

    return status;
  }

  getCurrentModel(): AIModel {
    return this.currentModel;
  }

  async processMultiLanguage(text: string, languages: string[]): Promise<any> {
    // Detect language and process accordingly
    const detectedLanguage = this.detectLanguage(text);
    const intentResult = await this.intentService.detectIntent(text);
    
    return {
      text,
      language: detectedLanguage,
      confidence: 0.9,
      entities: intentResult.entities
    };
  }

  private detectLanguage(text: string): string {
    // Simple language detection based on character patterns
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hasHindi = hindiPattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    if (hasHindi && hasEnglish) {
      return 'hi-en'; // Hinglish
    } else if (hasHindi) {
      return 'hi';
    } else {
      return 'en-IN';
    }
  }

  async getContextSummary(userId: string, sessionId: string): Promise<string> {
    return await this.contextService.getContextSummary(userId, sessionId);
  }

  async clearUserContext(userId: string, sessionId?: string): Promise<void> {
    await this.contextService.clearContext(userId, sessionId);
  }
}