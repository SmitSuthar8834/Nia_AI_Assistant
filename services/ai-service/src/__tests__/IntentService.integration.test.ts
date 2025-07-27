import { IntentService } from '../services/IntentService';
import { SALES_INTENTS } from '../types';

describe('IntentService Integration Tests', () => {
  let intentService: IntentService;

  beforeEach(() => {
    intentService = new IntentService();
  });

  describe('Enhanced NLP Pipeline Integration', () => {
    it('should process lead creation with full NLP pipeline', async () => {
      const text = 'Create a lead for John Smith from TechCorp with email john@techcorp.com';
      
      const result = await intentService.detectIntent(text);
      
      expect(result.intent).toBe(SALES_INTENTS.CREATE_LEAD);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.entities.primaryEmail).toBe('john@techcorp.com');
      expect(result.entities.primaryCompany).toBe('TechCorp');
      expect(result.requiredActions.length).toBeGreaterThan(0);
      
      // Check metadata from NLP pipeline
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.nlpResult).toBeDefined();
      expect(result.metadata?.enrichmentResult).toBeDefined();
    });

    it('should handle validation errors gracefully', async () => {
      const text = 'Create lead for x with invalid-email';
      
      const result = await intentService.detectIntent(text);
      
      expect(result.intent).toBe(SALES_INTENTS.CREATE_LEAD);
      expect(result.confidence).toBeLessThan(0.8); // Lower confidence due to validation issues
      expect(result.metadata?.enrichmentResult?.validationResults).toBeDefined();
    });

    it('should provide alternative intents when confidence is low', async () => {
      const text = 'Something about maybe creating or updating';
      
      const result = await intentService.detectIntent(text);
      
      expect(result.metadata?.alternativeIntents).toBeDefined();
      expect(result.metadata?.alternativeIntents?.length).toBeGreaterThan(0);
    });

    it('should extract and validate phone numbers correctly', async () => {
      const text = 'Create lead with phone +91 9876543210';
      
      const result = await intentService.detectIntent(text);
      
      expect(result.entities.phones).toBeDefined();
      expect(result.entities.phones.length).toBeGreaterThan(0);
      expect(result.entities.phones[0]).toContain('+91');
    });

    it('should handle date extraction and validation', async () => {
      const text = 'Schedule meeting tomorrow at 2 PM';
      
      const result = await intentService.detectIntent(text);
      
      expect(result.intent).toBe(SALES_INTENTS.SCHEDULE_MEETING);
      expect(result.entities.dates).toBeDefined();
      expect(result.entities.dates.length).toBeGreaterThan(0);
    });

    it('should provide comprehensive entity enrichment', async () => {
      const text = 'Create urgent lead for Sarah Johnson from Microsoft with email sarah@microsoft.com';
      
      const result = await intentService.detectIntent(text);
      
      expect(result.entities.priority).toBe('high');
      expect(result.entities.leadTitle).toContain('Sarah Johnson');
      expect(result.entities.leadTitle).toContain('Microsoft');
      expect(result.entities.emailDomain).toBe('microsoft.com');
      expect(result.entities.processedAt).toBeDefined();
    });

    it('should maintain high confidence for well-formed requests', async () => {
      const text = 'Create a lead for David Chen from Google with email david.chen@google.com and phone +91 9876543210';
      
      const result = await intentService.detectIntent(text);
      
      expect(result.intent).toBe(SALES_INTENTS.CREATE_LEAD);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.metadata?.enrichmentResult?.overallConfidence).toBeGreaterThan(0.7);
    });

    it('should handle multi-language detection', async () => {
      const text = 'Namaste, create lead for Raj Sharma from Infosys';
      
      const result = await intentService.detectIntent(text);
      
      expect(result.intent).toBe(SALES_INTENTS.CREATE_LEAD);
      expect(result.metadata?.nlpResult?.language).toBeDefined();
    });

    it('should provide sentiment analysis', async () => {
      const positiveText = 'Great! Create a lead for this amazing client';
      const negativeText = 'This is terrible, but create the lead anyway';
      
      const positiveResult = await intentService.detectIntent(positiveText);
      const negativeResult = await intentService.detectIntent(negativeText);
      
      expect(positiveResult.metadata?.nlpResult?.sentiment?.label).toBe('positive');
      expect(negativeResult.metadata?.nlpResult?.sentiment?.label).toBe('negative');
    });

    it('should generate appropriate actions based on validated entities', async () => {
      const text = 'Create lead for John Smith from TechCorp with email john@techcorp.com';
      
      const result = await intentService.detectIntent(text);
      
      expect(result.requiredActions.length).toBeGreaterThan(0);
      expect(result.requiredActions.some(action => action.type === 'validate_lead_data')).toBe(true);
    });
  });

  describe('Fallback Behavior', () => {
    it('should fallback to pattern matching when NLP pipeline fails', async () => {
      // This test simulates NLP pipeline failure by using a very simple text
      const text = 'create lead john techcorp';
      
      const result = await intentService.detectIntent(text);
      
      expect(result.intent).toBe(SALES_INTENTS.CREATE_LEAD);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle empty or invalid input gracefully', async () => {
      const emptyResult = await intentService.detectIntent('');
      const invalidResult = await intentService.detectIntent('   ');
      
      expect(emptyResult.intent).toBe(SALES_INTENTS.GENERAL_INQUIRY);
      expect(invalidResult.intent).toBe(SALES_INTENTS.GENERAL_INQUIRY);
    });
  });
});