import { AIService } from '../services/AIService';
import { IntentService } from '../services/IntentService';
import { SALES_INTENTS } from '../types';

// Mock the providers and dependencies
jest.mock('../providers/GeminiProvider');
jest.mock('../providers/OpenAIProvider');
jest.mock('../database/connection');

describe('AIService', () => {
  let aiService: AIService;
  let intentService: IntentService;

  beforeEach(() => {
    intentService = new IntentService();
  });

  describe('Intent Detection', () => {
    test('should detect create lead intent', async () => {
      const result = await intentService.detectIntent('create a lead for John from TechCorp');
      
      expect(result.intent).toBe(SALES_INTENTS.CREATE_LEAD);
      expect(result.entities.primaryName).toBe('John');
      expect(result.entities.primaryCompany).toBe('TechCorp');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should detect schedule meeting intent', async () => {
      const result = await intentService.detectIntent('schedule a meeting with Sarah tomorrow at 2 PM');
      
      expect(result.intent).toBe(SALES_INTENTS.SCHEDULE_MEETING);
      expect(result.entities.primaryName).toBe('Sarah');
      expect(result.entities.dates).toBeDefined();
    });

    test('should detect create task intent', async () => {
      const result = await intentService.detectIntent('remind me to follow up with the client next week');
      
      expect(result.intent).toBe(SALES_INTENTS.CREATE_TASK);
      expect(result.entities.dates).toBeDefined();
    });

    test('should detect search lead intent', async () => {
      const result = await intentService.detectIntent('find lead for TechNova');
      
      expect(result.intent).toBe(SALES_INTENTS.SEARCH_LEAD);
    });

    test('should detect greeting intent', async () => {
      const result = await intentService.detectIntent('Hello Nia');
      
      expect(result.intent).toBe(SALES_INTENTS.GREETING);
    });

    test('should default to general inquiry for unknown input', async () => {
      const result = await intentService.detectIntent('random text that doesnt match any pattern');
      
      expect(result.intent).toBe(SALES_INTENTS.GENERAL_INQUIRY);
      expect(result.confidence).toBe(0.5);
    });
  });

  describe('Entity Extraction', () => {
    test('should extract email addresses', async () => {
      const result = await intentService.detectIntent('create lead for john.doe@techcorp.com');
      
      expect(result.entities.primaryEmail).toBe('john.doe@techcorp.com');
    });

    test('should extract phone numbers', async () => {
      const result = await intentService.detectIntent('create lead with phone +91 9876543210');
      
      expect(result.entities.phones).toContain('+91 9876543210');
    });

    test('should extract Indian phone numbers', async () => {
      const result = await intentService.detectIntent('create lead with contact number 9876543210');
      
      expect(result.entities.phones).toBeDefined();
    });

    test('should extract priority levels', async () => {
      const result = await intentService.detectIntent('create urgent task to call client');
      
      expect(result.entities.priority).toBe('high');
    });
  });

  describe('Action Generation', () => {
    test('should generate actions for lead creation', async () => {
      const result = await intentService.detectIntent('create lead for John from TechCorp');
      
      expect(result.requiredActions.length).toBeGreaterThan(0);
    });

    test('should generate actions for meeting scheduling', async () => {
      const result = await intentService.detectIntent('schedule meeting with Sarah tomorrow');
      
      expect(result.requiredActions.length).toBeGreaterThan(0);
    });

    test('should generate actions for task creation', async () => {
      const result = await intentService.detectIntent('remind me to call client');
      
      expect(result.requiredActions.length).toBeGreaterThan(0);
    });
  });
});