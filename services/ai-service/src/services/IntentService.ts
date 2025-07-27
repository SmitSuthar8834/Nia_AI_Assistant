import { IntentResult, SALES_INTENTS, Action } from '../types';
import { NLPPipeline, NLPProcessingResult } from './NLPPipeline';
import { EntityValidationService, DataEnrichmentResult } from './EntityValidationService';
import logger from '../utils/logger';

export class IntentService {
  private intentPatterns: Map<string, RegExp[]> = new Map();
  private nlpPipeline: NLPPipeline;
  private entityValidator: EntityValidationService;

  constructor() {
    this.initializePatterns();
    this.nlpPipeline = new NLPPipeline();
    this.entityValidator = new EntityValidationService();
  }

  private initializePatterns() {
    // Lead creation patterns
    this.intentPatterns.set(SALES_INTENTS.CREATE_LEAD, [
      /create\s+(a\s+)?lead/i,
      /add\s+(a\s+)?new\s+lead/i,
      /new\s+lead\s+for/i,
      /register\s+(a\s+)?prospect/i,
      /add\s+prospect/i
    ]);

    // Lead update patterns
    this.intentPatterns.set(SALES_INTENTS.UPDATE_LEAD, [
      /update\s+lead/i,
      /modify\s+lead/i,
      /change\s+lead/i,
      /edit\s+lead/i
    ]);

    // Lead search patterns
    this.intentPatterns.set(SALES_INTENTS.SEARCH_LEAD, [
      /find\s+lead/i,
      /search\s+(for\s+)?lead/i,
      /look\s+for\s+lead/i,
      /show\s+me\s+lead/i,
      /get\s+lead/i,
      /what.*status.*lead/i
    ]);

    // Meeting scheduling patterns
    this.intentPatterns.set(SALES_INTENTS.SCHEDULE_MEETING, [
      /schedule\s+(a\s+)?meeting/i,
      /book\s+(a\s+)?meeting/i,
      /arrange\s+(a\s+)?meeting/i,
      /set\s+up\s+(a\s+)?meeting/i,
      /meeting\s+with/i
    ]);

    // Task creation patterns
    this.intentPatterns.set(SALES_INTENTS.CREATE_TASK, [
      /create\s+(?:a\s+|urgent\s+|high\s+priority\s+)?task/i,
      /add\s+(a\s+)?task/i,
      /remind\s+me\s+to/i,
      /follow\s+up/i,
      /set\s+(a\s+)?reminder/i
    ]);

    // Task retrieval patterns
    this.intentPatterns.set(SALES_INTENTS.GET_TASKS, [
      /show\s+my\s+tasks/i,
      /what.*tasks/i,
      /list\s+tasks/i,
      /pending\s+tasks/i,
      /my\s+to.?do/i
    ]);

    // Email summary patterns
    this.intentPatterns.set(SALES_INTENTS.EMAIL_SUMMARY, [
      /read\s+emails/i,
      /email\s+summary/i,
      /summarize\s+emails/i,
      /check\s+emails/i,
      /what.*new\s+emails/i
    ]);

    // Greeting patterns
    this.intentPatterns.set(SALES_INTENTS.GREETING, [
      /^(hi|hello|hey|good\s+(morning|afternoon|evening))/i,
      /^(namaste|namaskar)/i
    ]);

    // Goodbye patterns
    this.intentPatterns.set(SALES_INTENTS.GOODBYE, [
      /^(bye|goodbye|see\s+you|talk\s+to\s+you\s+later)/i,
      /^(dhanyawad|thank\s+you)/i
    ]);
  }

  async detectIntent(text: string): Promise<IntentResult> {
    try {
      // Use advanced NLP pipeline for processing
      const nlpResult = await this.nlpPipeline.processText(text);
      
      // Get intent from ML classifier with higher confidence
      const mlIntent = nlpResult.intent;
      let finalIntent = mlIntent.intent;
      let finalConfidence = mlIntent.confidence;
      
      // Fallback to pattern matching if ML confidence is low
      if (mlIntent.confidence < 0.7) {
        const patternResult = this.detectIntentWithPatterns(text);
        if (patternResult.confidence > mlIntent.confidence) {
          finalIntent = patternResult.intent;
          finalConfidence = patternResult.confidence;
        }
      }
      
      // Validate and enrich entities
      const enrichmentResult = await this.entityValidator.validateAndEnrichEntities(
        nlpResult.entities.entities,
        finalIntent
      );
      
      // Generate actions based on validated entities
      const actions = this.generateActions(finalIntent, enrichmentResult.enrichedData);
      
      logger.info('Advanced intent detection completed', {
        intent: finalIntent,
        confidence: finalConfidence,
        mlConfidence: mlIntent.confidence,
        entityConfidence: nlpResult.entities.confidence,
        validationConfidence: enrichmentResult.overallConfidence,
        language: nlpResult.language,
        sentiment: nlpResult.sentiment.label
      });
      
      return {
        intent: finalIntent,
        entities: enrichmentResult.enrichedData,
        confidence: Math.min(finalConfidence, enrichmentResult.overallConfidence),
        requiredActions: actions,
        // Additional metadata for debugging and improvement
        metadata: {
          nlpResult,
          enrichmentResult,
          alternativeIntents: mlIntent.alternativeIntents
        }
      };
    } catch (error) {
      logger.error('Error in advanced intent detection, falling back to pattern matching:', error);
      return this.detectIntentWithPatterns(text);
    }
  }

  private detectIntentWithPatterns(text: string): IntentResult {
    const normalizedText = text.toLowerCase().trim();
    
    // Check each intent pattern
    for (const [intent, patterns] of this.intentPatterns) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedText)) {
          const entities = this.extractEntities(text, intent);
          const actions = this.generateActions(intent, entities);
          
          logger.info('Pattern-based intent detected', { intent, confidence: 0.8, entities });
          
          return {
            intent,
            entities,
            confidence: 0.8,
            requiredActions: actions
          };
        }
      }
    }

    // Default to general inquiry
    return {
      intent: SALES_INTENTS.GENERAL_INQUIRY,
      entities: {},
      confidence: 0.5,
      requiredActions: []
    };
  }

  private extractEntities(text: string, intent: string): Record<string, any> {
    const entities: Record<string, any> = {};

    switch (intent) {
      case SALES_INTENTS.CREATE_LEAD:
        entities.name = this.extractName(text);
        entities.company = this.extractCompany(text);
        entities.email = this.extractEmail(text);
        entities.phone = this.extractPhone(text);
        entities.priority = this.extractPriority(text);
        break;

      case SALES_INTENTS.SCHEDULE_MEETING:
        entities.participant = this.extractName(text);
        entities.date = this.extractDate(text);
        entities.time = this.extractTime(text);
        entities.duration = this.extractDuration(text);
        break;

      case SALES_INTENTS.CREATE_TASK:
        entities.description = this.extractTaskDescription(text);
        entities.dueDate = this.extractDate(text);
        entities.priority = this.extractPriority(text);
        break;

      case SALES_INTENTS.SEARCH_LEAD:
        entities.searchTerm = this.extractSearchTerm(text);
        entities.company = this.extractCompany(text);
        break;
    }

    return entities;
  }

  private extractName(text: string): string | null {
    const namePatterns = [
      /(?:lead\s+for|meeting\s+with|call\s+)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s+from|\s+at|\s+tomorrow|\s+next|\s|$)/i,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)\s+from/i
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  }

  private extractCompany(text: string): string | null {
    const companyPatterns = [
      /from\s+([A-Z][a-zA-Z\s&.]+?)(?:\s|$)/i,
      /at\s+([A-Z][a-zA-Z\s&.]+?)(?:\s|$)/i,
      /company\s+([A-Z][a-zA-Z\s&.]+?)(?:\s|$)/i
    ];

    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  }

  private extractEmail(text: string): string | null {
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const match = text.match(emailPattern);
    return match ? match[1] : null;
  }

  private extractPhone(text: string): string | null {
    const phonePatterns = [
      /(\+91[\s-]?[6-9]\d{9})/,
      /(?:phone|number|contact).*?([6-9]\d{9})/i,
      /(?:is|:)\s*([6-9]\d{9})/i,
      /([6-9]\d{9})/,
      /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/
    ];

    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private extractDate(text: string): string | null {
    const datePatterns = [
      /(tomorrow|today|yesterday)/i,
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(next\s+week|this\s+week|next\s+month)/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private extractTime(text: string): string | null {
    const timePatterns = [
      /(\d{1,2}:\d{2}\s*(?:am|pm))/i,
      /(\d{1,2}\s*(?:am|pm))/i,
      /(morning|afternoon|evening)/i
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private extractDuration(text: string): string | null {
    const durationPatterns = [
      /(\d+\s*(?:hour|hr|minute|min)s?)/i,
      /(half\s+hour|30\s*min)/i
    ];

    for (const pattern of durationPatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private extractTaskDescription(text: string): string | null {
    const taskPatterns = [
      /remind\s+me\s+to\s+(.+)/i,
      /create\s+task\s+(.+)/i,
      /follow\s+up\s+(.+)/i
    ];

    for (const pattern of taskPatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private extractPriority(text: string): string | null {
    if (/urgent|high\s+priority|asap/i.test(text)) return 'high';
    if (/low\s+priority|when\s+possible/i.test(text)) return 'low';
    return 'medium';
  }

  private extractSearchTerm(text: string): string | null {
    const searchPatterns = [
      /find\s+lead\s+(?:for\s+)?(.+)/i,
      /search\s+(?:for\s+)?(.+)/i,
      /show\s+me\s+(.+)/i
    ];

    for (const pattern of searchPatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  }

  private generateActions(intent: string, entities: Record<string, any>): Action[] {
    const actions: Action[] = [];

    switch (intent) {
      case SALES_INTENTS.CREATE_LEAD:
        actions.push({
          type: 'validate_lead_data',
          parameters: entities,
          priority: 1
        });
        if (entities.name && entities.company) {
          actions.push({
            type: 'create_crm_lead',
            parameters: entities,
            priority: 2
          });
        }
        break;

      case SALES_INTENTS.SCHEDULE_MEETING:
        actions.push({
          type: 'check_calendar_availability',
          parameters: { date: entities.date, time: entities.time },
          priority: 1
        });
        actions.push({
          type: 'create_calendar_event',
          parameters: entities,
          priority: 2
        });
        break;

      case SALES_INTENTS.CREATE_TASK:
        actions.push({
          type: 'create_crm_task',
          parameters: entities,
          priority: 1
        });
        break;

      case SALES_INTENTS.SEARCH_LEAD:
        actions.push({
          type: 'search_crm_records',
          parameters: { type: 'lead', query: entities.searchTerm || entities.company },
          priority: 1
        });
        break;
    }

    return actions;
  }
}