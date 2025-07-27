import { NLPPipeline } from '../services/NLPPipeline';
import { EntityValidationService } from '../services/EntityValidationService';

describe('NLPPipeline', () => {
  let nlpPipeline: NLPPipeline;
  let entityValidator: EntityValidationService;

  beforeEach(() => {
    nlpPipeline = new NLPPipeline();
    entityValidator = new EntityValidationService();
  });

  describe('processText', () => {
    it('should process lead creation text correctly', async () => {
      const text = 'Create a lead for John Smith from TechCorp with email john@techcorp.com and phone +91 9876543210';
      
      const result = await nlpPipeline.processText(text);
      
      expect(result.intent.intent).toBe('create_lead');
      expect(result.intent.confidence).toBeGreaterThan(0.8);
      expect(result.entities.entities.primaryName).toBe('John Smith');
      expect(result.entities.entities.primaryCompany).toBe('TechCorp');
      expect(result.entities.entities.primaryEmail).toBe('john@techcorp.com');
      expect(result.entities.entities.primaryPhone).toContain('+91');
      expect(result.language).toBe('en-IN');
    });

    it('should process meeting scheduling text correctly', async () => {
      const text = 'Schedule a meeting with Sarah Johnson tomorrow at 2 PM for 1 hour';
      
      const result = await nlpPipeline.processText(text);
      
      expect(result.intent.intent).toBe('schedule_meeting');
      expect(result.intent.confidence).toBeGreaterThan(0.8);
      expect(result.entities.entities.primaryName).toBe('Sarah Johnson');
      expect(result.entities.entities.dates).toBeDefined();
      expect(result.entities.entities.dates[0].text).toBe('tomorrow');
    });

    it('should process task creation text correctly', async () => {
      const text = 'Remind me to follow up with the client next week with high priority';
      
      const result = await nlpPipeline.processText(text);
      
      expect(result.intent.intent).toBe('create_task');
      expect(result.intent.confidence).toBeGreaterThan(0.8);
      expect(result.entities.entities.priority).toBe('high');
      expect(result.entities.entities.dates).toBeDefined();
    });

    it('should handle Hinglish text', async () => {
      const text = 'Namaste, create lead for Raj Sharma from Infosys';
      
      const result = await nlpPipeline.processText(text);
      
      expect(result.intent.intent).toBe('create_lead');
      expect(result.entities.entities.primaryName).toBe('Raj Sharma');
      expect(result.entities.entities.primaryCompany).toBe('Infosys');
    });

    it('should extract multiple entities correctly', async () => {
      const text = 'Create urgent lead for Mary Johnson from Microsoft, email mary.johnson@microsoft.com, phone 9876543210, meeting tomorrow 3 PM';
      
      const result = await nlpPipeline.processText(text);
      
      expect(result.entities.entities.primaryName).toBe('Mary Johnson');
      expect(result.entities.entities.primaryCompany).toBe('Microsoft');
      expect(result.entities.entities.primaryEmail).toBe('mary.johnson@microsoft.com');
      expect(result.entities.entities.priority).toBe('high');
      expect(result.entities.entities.dates).toBeDefined();
    });

    it('should provide alternative intents when confidence is low', async () => {
      const text = 'Something about leads and meetings';
      
      const result = await nlpPipeline.processText(text);
      
      expect(result.intent.alternativeIntents).toBeDefined();
      expect(result.intent.alternativeIntents.length).toBeGreaterThan(0);
    });

    it('should analyze sentiment correctly', async () => {
      const positiveText = 'Great! Create a lead for this amazing client';
      const negativeText = 'This is terrible, cancel the meeting';
      
      const positiveResult = await nlpPipeline.processText(positiveText);
      const negativeResult = await nlpPipeline.processText(negativeText);
      
      expect(positiveResult.sentiment.label).toBe('positive');
      expect(negativeResult.sentiment.label).toBe('negative');
    });
  });

  describe('Entity Extraction', () => {
    it('should extract phone numbers in various formats', async () => {
      const texts = [
        'Call +91 9876543210',
        'Phone: 9876543210',
        'Contact at 987-654-3210'
      ];
      
      for (const text of texts) {
        const result = await nlpPipeline.processText(text);
        expect(result.entities.entities.phones).toBeDefined();
        expect(result.entities.entities.phones.length).toBeGreaterThan(0);
      }
    });

    it('should extract email addresses correctly', async () => {
      const text = 'Send to john.doe@company.com and backup@example.org';
      
      const result = await nlpPipeline.processText(text);
      
      expect(result.entities.entities.emails).toBeDefined();
      expect(result.entities.entities.emails).toContain('john.doe@company.com');
      expect(result.entities.entities.emails).toContain('backup@example.org');
    });

    it('should extract dates in natural language', async () => {
      const texts = [
        'Meeting tomorrow',
        'Due next Monday',
        'Schedule for January 15, 2024',
        'Follow up in 2 weeks'
      ];
      
      for (const text of texts) {
        const result = await nlpPipeline.processText(text);
        expect(result.entities.entities.dates).toBeDefined();
        expect(result.entities.entities.dates.length).toBeGreaterThan(0);
      }
    });

    it('should extract monetary amounts', async () => {
      const text = 'Deal worth $50,000 or ₹4,000,000';
      
      const result = await nlpPipeline.processText(text);
      
      expect(result.entities.entities.amounts).toBeDefined();
      expect(result.entities.entities.amounts.length).toBe(2);
    });
  });
});

describe('EntityValidationService', () => {
  let entityValidator: EntityValidationService;

  beforeEach(() => {
    entityValidator = new EntityValidationService();
  });

  describe('validateAndEnrichEntities', () => {
    it('should validate lead creation entities', async () => {
      const entities = {
        primaryName: 'john smith',
        primaryCompany: 'techcorp',
        primaryEmail: 'john@techcorp.com',
        primaryPhone: '9876543210'
      };
      
      const result = await entityValidator.validateAndEnrichEntities(entities, 'create_lead');
      
      expect(result.validationResults.primaryName.isValid).toBe(true);
      expect(result.enrichedData.primaryName).toBe('John Smith'); // Proper case
      expect(result.validationResults.primaryEmail.isValid).toBe(true);
      expect(result.validationResults.primaryPhone.isValid).toBe(true);
      expect(result.enrichedData.primaryPhone).toContain('+91'); // Normalized
      expect(result.overallConfidence).toBeGreaterThan(0.8);
    });

    it('should detect validation errors', async () => {
      const entities = {
        primaryName: 'x', // Too short
        primaryEmail: 'invalid-email', // Invalid format
        primaryPhone: '123' // Too short
      };
      
      const result = await entityValidator.validateAndEnrichEntities(entities, 'create_lead');
      
      expect(result.validationResults.primaryName.isValid).toBe(false);
      expect(result.validationResults.primaryEmail.isValid).toBe(false);
      expect(result.validationResults.primaryPhone.isValid).toBe(false);
      expect(result.overallConfidence).toBeLessThan(0.5);
    });

    it('should provide suggestions for invalid data', async () => {
      const entities = {
        primaryEmail: 'john@',
        primaryPhone: '98765'
      };
      
      const result = await entityValidator.validateAndEnrichEntities(entities, 'create_lead');
      
      expect(result.validationResults.primaryEmail.suggestions.length).toBeGreaterThan(0);
      expect(result.validationResults.primaryPhone.suggestions.length).toBeGreaterThan(0);
    });

    it('should enrich data with contextual information', async () => {
      const entities = {
        primaryName: 'John Smith',
        primaryCompany: 'Microsoft',
        primaryEmail: 'john@microsoft.com'
      };
      
      const result = await entityValidator.validateAndEnrichEntities(entities, 'create_lead');
      
      expect(result.enrichedData.leadTitle).toBe('John Smith - Microsoft');
      expect(result.enrichedData.emailDomain).toBe('microsoft.com');
      expect(result.enrichedData.processedAt).toBeDefined();
    });

    it('should handle date validation and enrichment', async () => {
      const entities = {
        primaryDate: new Date('2024-12-25')
      };
      
      const result = await entityValidator.validateAndEnrichEntities(entities, 'schedule_meeting');
      
      expect(result.validationResults.primaryDate.isValid).toBe(true);
      expect(result.enrichedData.primaryDate).toBeInstanceOf(Date);
    });

    it('should validate priority levels', async () => {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      
      for (const priority of validPriorities) {
        const entities = { priority };
        const result = await entityValidator.validateAndEnrichEntities(entities, 'create_task');
        
        expect(result.validationResults.priority.isValid).toBe(true);
        expect(result.enrichedData.priority).toBe(priority);
      }
      
      // Test invalid priority
      const invalidEntities = { priority: 'invalid' };
      const invalidResult = await entityValidator.validateAndEnrichEntities(invalidEntities, 'create_task');
      
      expect(invalidResult.validationResults.priority.isValid).toBe(false);
    });

    it('should check completeness for different intents', async () => {
      // Complete lead creation
      const completeLeadEntities = {
        primaryName: 'John Smith',
        primaryCompany: 'TechCorp',
        primaryEmail: 'john@techcorp.com',
        primaryPhone: '+91 9876543210'
      };
      
      const completeResult = await entityValidator.validateAndEnrichEntities(
        completeLeadEntities, 
        'create_lead'
      );
      
      expect(completeResult.completenessScore).toBeGreaterThan(0.8);
      
      // Incomplete lead creation
      const incompleteLeadEntities = {
        primaryName: 'John Smith'
        // Missing required company
      };
      
      const incompleteResult = await entityValidator.validateAndEnrichEntities(
        incompleteLeadEntities, 
        'create_lead'
      );
      
      expect(incompleteResult.completenessScore).toBeLessThan(0.8);
    });
  });
});

describe('Integration Tests', () => {
  let nlpPipeline: NLPPipeline;
  let entityValidator: EntityValidationService;

  beforeEach(() => {
    nlpPipeline = new NLPPipeline();
    entityValidator = new EntityValidationService();
  });

  it('should handle complete lead creation workflow', async () => {
    const text = 'Create a lead for Sarah Johnson from Microsoft, email sarah.johnson@microsoft.com, phone +91 9876543210, high priority';
    
    const nlpResult = await nlpPipeline.processText(text);
    const enrichmentResult = await entityValidator.validateAndEnrichEntities(
      nlpResult.entities.entities,
      nlpResult.intent.intent
    );
    
    expect(nlpResult.intent.intent).toBe('create_lead');
    expect(enrichmentResult.overallConfidence).toBeGreaterThan(0.8);
    expect(enrichmentResult.completenessScore).toBeGreaterThan(0.8);
    expect(enrichmentResult.enrichedData.leadTitle).toBe('Sarah Johnson - Microsoft');
    expect(enrichmentResult.enrichedData.priority).toBe('high');
  });

  it('should handle meeting scheduling workflow', async () => {
    const text = 'Schedule a meeting with David Chen tomorrow at 2:30 PM for 1 hour';
    
    const nlpResult = await nlpPipeline.processText(text);
    const enrichmentResult = await entityValidator.validateAndEnrichEntities(
      nlpResult.entities.entities,
      nlpResult.intent.intent
    );
    
    expect(nlpResult.intent.intent).toBe('schedule_meeting');
    expect(enrichmentResult.enrichedData.primaryName).toBe('David Chen');
    expect(enrichmentResult.enrichedData.dates).toBeDefined();
  });

  it('should handle task creation workflow', async () => {
    const text = 'Remind me to follow up with the client next Monday, high priority';
    
    const nlpResult = await nlpPipeline.processText(text);
    const enrichmentResult = await entityValidator.validateAndEnrichEntities(
      nlpResult.entities.entities,
      nlpResult.intent.intent
    );
    
    expect(nlpResult.intent.intent).toBe('create_task');
    expect(enrichmentResult.enrichedData.priority).toBe('high');
    expect(enrichmentResult.enrichedData.dates).toBeDefined();
  });

  it('should provide comprehensive error reporting', async () => {
    const text = 'Create lead for x with email invalid-email and phone 123';
    
    const nlpResult = await nlpPipeline.processText(text);
    const enrichmentResult = await entityValidator.validateAndEnrichEntities(
      nlpResult.entities.entities,
      nlpResult.intent.intent
    );
    
    const allErrors = Object.values(enrichmentResult.validationResults)
      .reduce((acc: string[], result) => [...acc, ...result.errors], []);
    
    expect(allErrors.length).toBeGreaterThan(0);
    expect(enrichmentResult.overallConfidence).toBeLessThan(0.5);
  });
});