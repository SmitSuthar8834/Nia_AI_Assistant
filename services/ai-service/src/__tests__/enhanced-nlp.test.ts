import { IntentService } from '../services/IntentService';
import { SALES_INTENTS } from '../types';

describe('Enhanced NLP Pipeline - Core Functionality', () => {
  let intentService: IntentService;

  beforeEach(() => {
    intentService = new IntentService();
  });

  it('should successfully process lead creation with enhanced NLP', async () => {
    const text = 'Create a lead for John Smith from TechCorp with email john@techcorp.com';
    
    const result = await intentService.detectIntent(text);
    
    // Basic intent detection
    expect(result.intent).toBe(SALES_INTENTS.CREATE_LEAD);
    expect(result.confidence).toBeGreaterThan(0.5);
    
    // Entity extraction
    expect(result.entities.primaryEmail).toBe('john@techcorp.com');
    expect(result.entities.primaryCompany).toBeDefined();
    
    // Actions generation
    expect(result.requiredActions.length).toBeGreaterThan(0);
    
    // Metadata from enhanced pipeline
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.nlpResult).toBeDefined();
    expect(result.metadata?.enrichmentResult).toBeDefined();
    
    console.log('Enhanced NLP Result:', JSON.stringify(result, null, 2));
  });

  it('should handle phone number extraction and validation', async () => {
    const text = 'Create lead with phone +91 9876543210';
    
    const result = await intentService.detectIntent(text);
    
    expect(result.intent).toBe(SALES_INTENTS.CREATE_LEAD);
    expect(result.entities.phones).toBeDefined();
    expect(result.entities.phones.length).toBeGreaterThan(0);
    
    // Check validation results
    const validationResults = result.metadata?.enrichmentResult?.validationResults;
    expect(validationResults).toBeDefined();
    
    console.log('Phone validation result:', validationResults);
  });

  it('should provide comprehensive error reporting for invalid data', async () => {
    const text = 'Create lead for x with invalid-email and phone 123';
    
    const result = await intentService.detectIntent(text);
    
    expect(result.intent).toBe(SALES_INTENTS.CREATE_LEAD);
    
    // Should have lower confidence due to validation issues
    expect(result.confidence).toBeLessThan(0.9);
    
    // Check validation errors
    const enrichmentResult = result.metadata?.enrichmentResult;
    expect(enrichmentResult).toBeDefined();
    
    const allErrors = Object.values(enrichmentResult?.validationResults || {})
      .reduce((acc: string[], result: any) => [...acc, ...result.errors], []);
    
    console.log('Validation errors:', allErrors);
    console.log('Overall confidence:', enrichmentResult?.overallConfidence);
  });

  it('should demonstrate the complete NLP pipeline workflow', async () => {
    const testCases = [
      'Create a lead for Sarah Johnson from Microsoft with email sarah@microsoft.com',
      'Schedule a meeting with David Chen tomorrow at 2 PM',
      'Remind me to follow up with the client next week',
      'Find lead for TechNova company',
      'Hello Nia, how are you today?'
    ];

    for (const text of testCases) {
      const result = await intentService.detectIntent(text);
      
      console.log(`\n--- Processing: "${text}" ---`);
      console.log(`Intent: ${result.intent} (confidence: ${result.confidence})`);
      console.log(`Language: ${result.metadata?.nlpResult?.language}`);
      console.log(`Sentiment: ${result.metadata?.nlpResult?.sentiment?.label}`);
      console.log(`Entities: ${Object.keys(result.entities).length}`);
      console.log(`Actions: ${result.requiredActions.length}`);
      console.log(`Validation confidence: ${result.metadata?.enrichmentResult?.overallConfidence}`);
      
      expect(result.intent).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.metadata).toBeDefined();
    }
  });
});