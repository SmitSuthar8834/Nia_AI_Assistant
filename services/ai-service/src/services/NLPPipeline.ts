import natural from 'natural';
import * as chrono from 'chrono-node';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import validator from 'validator';
import logger from '../utils/logger';

export interface EntityExtractionResult {
  entities: Record<string, any>;
  confidence: number;
  validationErrors: string[];
  enrichedData: Record<string, any>;
}

export interface IntentClassificationResult {
  intent: string;
  confidence: number;
  alternativeIntents: Array<{ intent: string; confidence: number }>;
  features: Record<string, number>;
}

export interface NLPProcessingResult {
  text: string;
  language: string;
  languageConfidence: number;
  tokens: string[];
  pos: Array<{ word: string; tag: string }>;
  sentiment: {
    score: number;
    comparative: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  entities: EntityExtractionResult;
  intent: IntentClassificationResult;
}

export class NLPPipeline {
  private tokenizer: natural.WordTokenizer;
  private tfidf: natural.TfIdf;
  private intentClassifier: natural.BayesClassifier;
  private isTrained: boolean = false;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.intentClassifier = new natural.BayesClassifier();
    this.initializeClassifier();
  }

  private initializeClassifier() {
    // Training data for intent classification
    const trainingData = [
      // Lead creation intents
      { text: 'create lead for john from techcorp', intent: 'create_lead' },
      { text: 'create a lead for john smith from techcorp with email', intent: 'create_lead' },
      { text: 'add new lead sarah microsoft', intent: 'create_lead' },
      { text: 'register prospect david amazon', intent: 'create_lead' },
      { text: 'new lead for mary at google', intent: 'create_lead' },
      { text: 'add lead mike from apple', intent: 'create_lead' },
      { text: 'create urgent lead for mary johnson from microsoft', intent: 'create_lead' },
      
      // Lead update intents
      { text: 'update lead status for john', intent: 'update_lead' },
      { text: 'modify lead information sarah', intent: 'update_lead' },
      { text: 'change lead priority high', intent: 'update_lead' },
      { text: 'edit lead details for david', intent: 'update_lead' },
      
      // Lead search intents
      { text: 'find lead for techcorp', intent: 'search_lead' },
      { text: 'search lead john smith', intent: 'search_lead' },
      { text: 'show me leads from microsoft', intent: 'search_lead' },
      { text: 'what is status of amazon lead', intent: 'search_lead' },
      { text: 'get lead information for sarah', intent: 'search_lead' },
      
      // Meeting scheduling intents
      { text: 'schedule meeting with john tomorrow', intent: 'schedule_meeting' },
      { text: 'schedule a meeting with sarah johnson tomorrow at 2 pm', intent: 'schedule_meeting' },
      { text: 'book meeting sarah next week', intent: 'schedule_meeting' },
      { text: 'arrange meeting with team friday', intent: 'schedule_meeting' },
      { text: 'set up meeting david 2pm', intent: 'schedule_meeting' },
      { text: 'meeting with client monday morning', intent: 'schedule_meeting' },
      { text: 'schedule a meeting with david chen tomorrow at 2:30 pm for 1 hour', intent: 'schedule_meeting' },
      
      // Task creation intents
      { text: 'create task follow up with john', intent: 'create_task' },
      { text: 'remind me to call sarah', intent: 'create_task' },
      { text: 'remind me to follow up with the client next week with high priority', intent: 'create_task' },
      { text: 'add task send proposal to client', intent: 'create_task' },
      { text: 'set reminder for meeting preparation', intent: 'create_task' },
      { text: 'task to review contract tomorrow', intent: 'create_task' },
      
      // Task retrieval intents
      { text: 'show my tasks', intent: 'get_tasks' },
      { text: 'what are my pending tasks', intent: 'get_tasks' },
      { text: 'list all tasks for today', intent: 'get_tasks' },
      { text: 'my todo list', intent: 'get_tasks' },
      { text: 'upcoming tasks this week', intent: 'get_tasks' },
      
      // Email summary intents
      { text: 'read my emails', intent: 'email_summary' },
      { text: 'summarize new emails', intent: 'email_summary' },
      { text: 'check email updates', intent: 'email_summary' },
      { text: 'what are new messages', intent: 'email_summary' },
      { text: 'email summary for today', intent: 'email_summary' },
      
      // Greeting intents
      { text: 'hello nia', intent: 'greeting' },
      { text: 'hi there', intent: 'greeting' },
      { text: 'good morning', intent: 'greeting' },
      { text: 'namaste', intent: 'greeting' },
      { text: 'hey assistant', intent: 'greeting' },
      
      // Goodbye intents
      { text: 'goodbye', intent: 'goodbye' },
      { text: 'see you later', intent: 'goodbye' },
      { text: 'bye nia', intent: 'goodbye' },
      { text: 'thank you', intent: 'goodbye' },
      { text: 'dhanyawad', intent: 'goodbye' },
      
      // General inquiry intents
      { text: 'what can you do', intent: 'general_inquiry' },
      { text: 'help me with sales', intent: 'general_inquiry' },
      { text: 'how to use this system', intent: 'general_inquiry' },
      { text: 'what are your features', intent: 'general_inquiry' }
    ];

    // Train the classifier
    trainingData.forEach(({ text, intent }) => {
      this.intentClassifier.addDocument(text, intent);
    });

    this.intentClassifier.train();
    this.isTrained = true;
    
    logger.info('NLP Pipeline initialized and trained with intent classification');
  }

  async processText(text: string): Promise<NLPProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Simple language detection
      const detectedLanguage = this.detectLanguageSimple(text);
      const languageConfidence = this.getLanguageConfidence(text, detectedLanguage);
      
      // Tokenization
      const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
      
      // Simple POS tagging (placeholder for now)
      const pos = tokens.map(token => ({
        word: token,
        tag: 'unknown' // Simplified for now
      }));
      
      // Sentiment analysis
      const sentiment = this.analyzeSentiment(text);
      
      // Entity extraction
      const entities = await this.extractEntities(text);
      
      // Intent classification
      const intent = this.classifyIntent(text);
      
      const processingTime = Date.now() - startTime;
      
      logger.info('NLP processing completed', {
        textLength: text.length,
        language: detectedLanguage,
        intent: intent.intent,
        confidence: intent.confidence,
        processingTime
      });

      return {
        text,
        language: this.normalizeLanguage(detectedLanguage),
        languageConfidence,
        tokens,
        pos,
        sentiment,
        entities,
        intent
      };
    } catch (error) {
      logger.error('Error in NLP processing:', error);
      throw error;
    }
  }

  private detectLanguageSimple(text: string): string {
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

  private getLanguageConfidence(text: string, detectedLanguage: string): number {
    // Simple confidence scoring based on text characteristics
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hasHindi = hindiPattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    if (hasHindi && hasEnglish) {
      return 0.8; // Mixed language (Hinglish)
    } else if (detectedLanguage === 'en-IN' || detectedLanguage === 'hi') {
      return 0.9; // High confidence for detected language
    } else {
      return 0.6; // Lower confidence for other languages
    }
  }

  private normalizeLanguage(detectedLanguage: string): string {
    return detectedLanguage || 'en-IN';
  }

  private analyzeSentiment(text: string): { score: number; comparative: number; label: 'positive' | 'negative' | 'neutral' } {
    const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
    const score = analyzer.getSentiment(tokens);
    
    let label: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (score > 0.1) label = 'positive';
    else if (score < -0.1) label = 'negative';
    
    return {
      score,
      comparative: score / tokens.length,
      label
    };
  }

  private async extractEntities(text: string): Promise<EntityExtractionResult> {
    const entities: Record<string, any> = {};
    const validationErrors: string[] = [];
    const enrichedData: Record<string, any> = {};
    
    // Extract person names using improved patterns
    const namePatterns = [
      /(?:lead\s+for|meeting\s+with|call\s+)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s+from)/i,
      /(?:lead\s+for|meeting\s+with|call\s+)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s+at)/i,
      /(?:lead\s+for|meeting\s+with|call\s+)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s+tomorrow)/i,
      /(?:lead\s+for|meeting\s+with|call\s+)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s+next)/i,
      /(?:lead\s+for|meeting\s+with|call\s+)\s+([A-Z][a-z]+)(?:\s+from)/i,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)\s+from/i
    ];
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        entities.names = [match[1].trim()];
        entities.primaryName = match[1].trim();
        break;
      }
    }
    
    // Extract organizations/companies
    const companyPatterns = [
      /from\s+([A-Z][a-zA-Z\s&.]+?)(?:\s|$)/i,
      /at\s+([A-Z][a-zA-Z\s&.]+?)(?:\s|$)/i,
      /company\s+([A-Z][a-zA-Z\s&.]+?)(?:\s|$)/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) {
        entities.companies = [match[1].trim()];
        entities.primaryCompany = match[1].trim();
        break;
      }
    }
    
    // Extract emails
    const emailMatches = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
    if (emailMatches) {
      entities.emails = emailMatches;
      entities.primaryEmail = emailMatches[0];
      
      // Validate emails
      emailMatches.forEach(email => {
        if (!validator.isEmail(email)) {
          validationErrors.push(`Invalid email format: ${email}`);
        }
      });
    }
    
    // Extract phone numbers
    const phoneMatches = this.extractPhoneNumbers(text);
    if (phoneMatches.length > 0) {
      entities.phones = phoneMatches;
      entities.primaryPhone = phoneMatches[0];
    }
    
    // Extract dates and times using chrono-node
    const dateMatches = chrono.parse(text);
    if (dateMatches.length > 0) {
      entities.dates = dateMatches.map(match => ({
        text: match.text,
        start: match.start.date(),
        end: match.end?.date(),
        index: match.index
      }));
      entities.primaryDate = dateMatches[0].start.date();
    }
    
    // Extract monetary amounts
    const moneyMatches = text.match(/(?:\$|₹|USD|INR)\s*[\d,]+(?:\.\d{2})?/g);
    if (moneyMatches) {
      entities.amounts = moneyMatches;
    }
    
    // Extract priorities
    const priorityMatch = text.match(/\b(urgent|high|medium|low|critical)\s*priority\b/i);
    if (priorityMatch) {
      entities.priority = priorityMatch[1].toLowerCase();
    } else if (/\b(urgent|asap|critical|important)\b/i.test(text)) {
      entities.priority = 'high';
    }
    
    // Extract status keywords
    const statusMatch = text.match(/\b(new|qualified|proposal|negotiation|closed|won|lost)\b/i);
    if (statusMatch) {
      entities.status = statusMatch[1].toLowerCase();
    }
    
    // Data enrichment
    if (entities.primaryName && entities.primaryCompany) {
      enrichedData.fullContext = `${entities.primaryName} from ${entities.primaryCompany}`;
    }
    
    if (entities.primaryEmail) {
      const domain = entities.primaryEmail.split('@')[1];
      enrichedData.emailDomain = domain;
      enrichedData.isBusinessEmail = !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain);
    }
    
    // Calculate confidence based on extracted entities
    const entityCount = Object.keys(entities).length;
    const confidence = Math.min(0.9, entityCount * 0.15 + 0.3);
    
    return {
      entities,
      confidence,
      validationErrors,
      enrichedData
    };
  }

  private extractPhoneNumbers(text: string): string[] {
    const phoneNumbers: string[] = [];
    
    // Indian phone number patterns
    const patterns = [
      /(\+91[\s-]?[6-9]\d{9})/g,
      /(\b[6-9]\d{9}\b)/g,
      /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g
    ];
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          try {
            const phoneNumber = parsePhoneNumber(match, 'IN');
            if (phoneNumber && isValidPhoneNumber(match, 'IN')) {
              phoneNumbers.push(phoneNumber.formatInternational());
            }
          } catch (error) {
            // If parsing fails, keep original if it looks like a phone number
            if (/^\+?[\d\s-()]{10,}$/.test(match)) {
              phoneNumbers.push(match);
            }
          }
        });
      }
    });
    
    return [...new Set(phoneNumbers)]; // Remove duplicates
  }

  private classifyIntent(text: string): IntentClassificationResult {
    if (!this.isTrained) {
      throw new Error('Intent classifier not trained');
    }
    
    // Get classification with confidence
    const classifications = this.intentClassifier.getClassifications(text);
    const primaryIntent = classifications[0];
    
    // Extract features for transparency
    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
    const features: Record<string, number> = {};
    
    tokens.forEach(token => {
      const stemmed = natural.PorterStemmer.stem(token);
      features[stemmed] = (features[stemmed] || 0) + 1;
    });
    
    // Get alternative intents (top 3)
    const alternativeIntents = classifications.slice(1, 4).map(classification => ({
      intent: classification.label,
      confidence: classification.value
    }));
    
    return {
      intent: primaryIntent.label,
      confidence: primaryIntent.value,
      alternativeIntents,
      features
    };
  }

  // Method to retrain classifier with new data
  async retrainClassifier(trainingData: Array<{ text: string; intent: string }>): Promise<void> {
    this.intentClassifier = new natural.BayesClassifier();
    
    trainingData.forEach(({ text, intent }) => {
      this.intentClassifier.addDocument(text, intent);
    });
    
    this.intentClassifier.train();
    this.isTrained = true;
    
    logger.info('Intent classifier retrained with new data', {
      trainingDataSize: trainingData.length
    });
  }

  // Method to validate and enrich extracted entities
  validateAndEnrichEntities(entities: Record<string, any>): {
    validatedEntities: Record<string, any>;
    validationErrors: string[];
    enrichedData: Record<string, any>;
  } {
    const validatedEntities: Record<string, any> = { ...entities };
    const validationErrors: string[] = [];
    const enrichedData: Record<string, any> = {};
    
    // Validate email
    if (entities.primaryEmail) {
      if (!validator.isEmail(entities.primaryEmail)) {
        validationErrors.push('Invalid email format');
      } else {
        enrichedData.emailDomain = entities.primaryEmail.split('@')[1];
      }
    }
    
    // Validate phone
    if (entities.primaryPhone) {
      try {
        const phoneNumber = parsePhoneNumber(entities.primaryPhone, 'IN');
        if (phoneNumber && phoneNumber.isValid()) {
          validatedEntities.primaryPhone = phoneNumber.formatInternational();
          enrichedData.phoneCountry = phoneNumber.country;
          enrichedData.phoneType = phoneNumber.getType();
        } else {
          validationErrors.push('Invalid phone number format');
        }
      } catch (error) {
        validationErrors.push('Unable to parse phone number');
      }
    }
    
    // Validate and enrich dates
    if (entities.primaryDate) {
      const date = new Date(entities.primaryDate);
      if (isNaN(date.getTime())) {
        validationErrors.push('Invalid date format');
      } else {
        enrichedData.dateFormatted = date.toISOString();
        enrichedData.isDateInFuture = date > new Date();
      }
    }
    
    // Enrich company information
    if (entities.primaryCompany) {
      enrichedData.companyNormalized = entities.primaryCompany.toLowerCase().trim();
      enrichedData.isKnownCompany = this.isKnownCompany(entities.primaryCompany);
    }
    
    return {
      validatedEntities,
      validationErrors,
      enrichedData
    };
  }
  
  private isKnownCompany(company: string): boolean {
    const knownCompanies = [
      'microsoft', 'google', 'amazon', 'apple', 'facebook', 'meta',
      'salesforce', 'oracle', 'ibm', 'adobe', 'netflix', 'uber',
      'tcs', 'infosys', 'wipro', 'hcl', 'tech mahindra', 'cognizant'
    ];
    
    return knownCompanies.some(known => 
      company.toLowerCase().includes(known) || known.includes(company.toLowerCase())
    );
  }
}