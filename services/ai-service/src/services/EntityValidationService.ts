import validator from 'validator';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import * as chrono from 'chrono-node';
import logger from '../utils/logger';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  normalizedValue?: any;
  confidence: number;
}

export interface EntityValidationResults {
  [key: string]: ValidationResult;
}

export interface DataEnrichmentResult {
  originalData: Record<string, any>;
  enrichedData: Record<string, any>;
  validationResults: EntityValidationResults;
  overallConfidence: number;
  completenessScore: number;
}

export class EntityValidationService {
  private readonly requiredFieldsByIntent: Record<string, string[]> = {
    'create_lead': ['name', 'company'],
    'update_lead': ['leadId'],
    'schedule_meeting': ['participant', 'date'],
    'create_task': ['description'],
    'search_lead': ['searchTerm']
  };

  private readonly optionalFieldsByIntent: Record<string, string[]> = {
    'create_lead': ['email', 'phone', 'title', 'priority', 'source'],
    'schedule_meeting': ['time', 'duration', 'location'],
    'create_task': ['dueDate', 'priority', 'assignee'],
    'search_lead': ['company', 'status']
  };

  async validateAndEnrichEntities(
    entities: Record<string, any>,
    intent: string
  ): Promise<DataEnrichmentResult> {
    const startTime = Date.now();
    
    try {
      const validationResults: EntityValidationResults = {};
      const enrichedData: Record<string, any> = { ...entities };
      
      // Validate each entity
      for (const [key, value] of Object.entries(entities)) {
        if (value !== null && value !== undefined && value !== '') {
          validationResults[key] = await this.validateEntity(key, value);
          
          // Apply normalization if validation passed
          if (validationResults[key].isValid && validationResults[key].normalizedValue !== undefined) {
            enrichedData[key] = validationResults[key].normalizedValue;
          }
        }
      }
      
      // Check completeness for the given intent
      const completenessResult = this.checkCompleteness(entities, intent);
      
      // Calculate overall confidence
      const overallConfidence = this.calculateOverallConfidence(validationResults, completenessResult.completenessScore);
      
      // Add contextual enrichments
      const contextualEnrichments = await this.addContextualEnrichments(enrichedData, intent);
      Object.assign(enrichedData, contextualEnrichments);
      
      const processingTime = Date.now() - startTime;
      
      logger.info('Entity validation and enrichment completed', {
        intent,
        entityCount: Object.keys(entities).length,
        validationErrors: Object.values(validationResults).reduce((acc, result) => acc + result.errors.length, 0),
        overallConfidence,
        completenessScore: completenessResult.completenessScore,
        processingTime
      });

      return {
        originalData: entities,
        enrichedData,
        validationResults,
        overallConfidence,
        completenessScore: completenessResult.completenessScore
      };
    } catch (error) {
      logger.error('Error in entity validation and enrichment:', error);
      throw error;
    }
  }

  private async validateEntity(key: string, value: any): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      confidence: 1.0
    };

    try {
      switch (key) {
        case 'email':
        case 'primaryEmail':
          return this.validateEmail(value);
          
        case 'phone':
        case 'primaryPhone':
          return this.validatePhone(value);
          
        case 'name':
        case 'primaryName':
          return this.validateName(value);
          
        case 'company':
        case 'primaryCompany':
          return this.validateCompany(value);
          
        case 'date':
        case 'primaryDate':
        case 'dueDate':
          return this.validateDate(value);
          
        case 'time':
          return this.validateTime(value);
          
        case 'priority':
          return this.validatePriority(value);
          
        case 'status':
          return this.validateStatus(value);
          
        case 'url':
        case 'website':
          return this.validateURL(value);
          
        default:
          return this.validateGeneric(key, value);
      }
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Validation error for ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.confidence = 0;
      return result;
    }
  }

  private validateEmail(email: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      confidence: 1.0
    };

    if (typeof email !== 'string') {
      result.isValid = false;
      result.errors.push('Email must be a string');
      result.confidence = 0;
      return result;
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    if (!validator.isEmail(trimmedEmail)) {
      result.isValid = false;
      result.errors.push('Invalid email format');
      result.confidence = 0;
      
      // Suggest corrections for common mistakes
      if (trimmedEmail.includes(' ')) {
        result.suggestions.push('Remove spaces from email address');
      }
      if (!trimmedEmail.includes('@')) {
        result.suggestions.push('Email must contain @ symbol');
      }
      if (!trimmedEmail.includes('.')) {
        result.suggestions.push('Email must contain domain extension');
      }
    } else {
      result.normalizedValue = trimmedEmail;
      
      // Check for common personal email domains
      const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      const domain = trimmedEmail.split('@')[1];
      
      if (personalDomains.includes(domain)) {
        result.warnings.push('Personal email domain detected - consider using business email');
        result.confidence = 0.8;
      }
      
      // Check for suspicious patterns
      if (trimmedEmail.includes('test') || trimmedEmail.includes('example')) {
        result.warnings.push('Email appears to be a test/example address');
        result.confidence = 0.6;
      }
    }

    return result;
  }

  private validatePhone(phone: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      confidence: 1.0
    };

    if (typeof phone !== 'string') {
      result.isValid = false;
      result.errors.push('Phone number must be a string');
      result.confidence = 0;
      return result;
    }

    try {
      const phoneNumber = parsePhoneNumber(phone, 'IN');
      
      if (!phoneNumber || !phoneNumber.isValid()) {
        result.isValid = false;
        result.errors.push('Invalid phone number format');
        result.confidence = 0;
        
        // Suggest corrections
        if (!/^\+/.test(phone) && phone.length === 10) {
          result.suggestions.push('Try adding country code (+91 for India)');
        }
        if (phone.length < 10) {
          result.suggestions.push('Phone number appears too short');
        }
      } else {
        result.normalizedValue = phoneNumber.formatInternational();
        
        // Check if it's a mobile number
        const type = phoneNumber.getType();
        if (type && type !== 'MOBILE') {
          result.warnings.push(`Phone type detected as ${type}, mobile preferred for sales contacts`);
          result.confidence = 0.9;
        }
      }
    } catch (error) {
      result.isValid = false;
      result.errors.push('Unable to parse phone number');
      result.confidence = 0;
      
      // Basic format suggestions
      if (!/[\d\s\-\+\(\)]/.test(phone)) {
        result.suggestions.push('Phone number should contain only digits, spaces, hyphens, plus sign, or parentheses');
      }
    }

    return result;
  }

  private validateName(name: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      confidence: 1.0
    };

    if (typeof name !== 'string') {
      result.isValid = false;
      result.errors.push('Name must be a string');
      result.confidence = 0;
      return result;
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      result.isValid = false;
      result.errors.push('Name must be at least 2 characters long');
      result.confidence = 0;
    } else if (trimmedName.length > 100) {
      result.isValid = false;
      result.errors.push('Name is too long (maximum 100 characters)');
      result.confidence = 0;
    } else {
      // Normalize name (proper case)
      result.normalizedValue = trimmedName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      // Check for suspicious patterns
      if (!/^[a-zA-Z\s\-\.\']+$/.test(trimmedName)) {
        result.warnings.push('Name contains unusual characters');
        result.confidence = 0.8;
      }
      
      if (trimmedName.toLowerCase().includes('test') || trimmedName.toLowerCase().includes('example')) {
        result.warnings.push('Name appears to be a test/example value');
        result.confidence = 0.6;
      }
      
      // Suggest improvements
      if (trimmedName === trimmedName.toLowerCase()) {
        result.suggestions.push('Consider proper case formatting');
      }
      
      if (!trimmedName.includes(' ') && trimmedName.length > 15) {
        result.suggestions.push('Consider if this is a full name or just first/last name');
      }
    }

    return result;
  }

  private validateCompany(company: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      confidence: 1.0
    };

    if (typeof company !== 'string') {
      result.isValid = false;
      result.errors.push('Company name must be a string');
      result.confidence = 0;
      return result;
    }

    const trimmedCompany = company.trim();
    
    if (trimmedCompany.length < 2) {
      result.isValid = false;
      result.errors.push('Company name must be at least 2 characters long');
      result.confidence = 0;
    } else if (trimmedCompany.length > 200) {
      result.isValid = false;
      result.errors.push('Company name is too long (maximum 200 characters)');
      result.confidence = 0;
    } else {
      // Normalize company name
      result.normalizedValue = trimmedCompany
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      // Check for known companies (higher confidence)
      if (this.isKnownCompany(trimmedCompany)) {
        result.confidence = 1.0;
      }
      
      // Check for suspicious patterns
      if (trimmedCompany.toLowerCase().includes('test') || trimmedCompany.toLowerCase().includes('example')) {
        result.warnings.push('Company name appears to be a test/example value');
        result.confidence = 0.6;
      }
      
      // Suggest improvements
      if (trimmedCompany === trimmedCompany.toLowerCase()) {
        result.suggestions.push('Consider proper case formatting for company name');
      }
    }

    return result;
  }

  private validateDate(date: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      confidence: 1.0
    };

    let parsedDate: Date;

    if (date instanceof Date) {
      parsedDate = date;
    } else if (typeof date === 'string') {
      // Try parsing with chrono-node for natural language dates
      const chronoResults = chrono.parse(date);
      if (chronoResults.length > 0) {
        parsedDate = chronoResults[0].start.date();
      } else {
        parsedDate = new Date(date);
      }
    } else {
      result.isValid = false;
      result.errors.push('Date must be a Date object or string');
      result.confidence = 0;
      return result;
    }

    if (isNaN(parsedDate.getTime())) {
      result.isValid = false;
      result.errors.push('Invalid date format');
      result.confidence = 0;
      result.suggestions.push('Use formats like "tomorrow", "next Monday", "2024-01-15", or "January 15, 2024"');
    } else {
      result.normalizedValue = parsedDate;
      
      // Check if date is in the past
      const now = new Date();
      if (parsedDate < now) {
        const daysDiff = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 1) {
          result.warnings.push(`Date is ${daysDiff} days in the past`);
          result.confidence = 0.7;
        }
      }
      
      // Check if date is too far in the future
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      if (parsedDate > oneYearFromNow) {
        result.warnings.push('Date is more than a year in the future');
        result.confidence = 0.8;
      }
    }

    return result;
  }

  private validateTime(time: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      confidence: 1.0
    };

    if (typeof time !== 'string') {
      result.isValid = false;
      result.errors.push('Time must be a string');
      result.confidence = 0;
      return result;
    }

    const timePatterns = [
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,  // 24-hour format
      /^(1[0-2]|0?[1-9]):[0-5][0-9]\s*(AM|PM)$/i,  // 12-hour format
      /^(1[0-2]|0?[1-9])\s*(AM|PM)$/i  // Hour only with AM/PM
    ];

    const trimmedTime = time.trim();
    const isValidFormat = timePatterns.some(pattern => pattern.test(trimmedTime));

    if (!isValidFormat) {
      result.isValid = false;
      result.errors.push('Invalid time format');
      result.confidence = 0;
      result.suggestions.push('Use formats like "2:30 PM", "14:30", or "2 PM"');
    } else {
      // Normalize to 24-hour format
      result.normalizedValue = this.normalizeTime(trimmedTime);
      
      // Check for reasonable business hours
      const hour = parseInt(result.normalizedValue.split(':')[0]);
      if (hour < 8 || hour > 18) {
        result.warnings.push('Time is outside typical business hours (8 AM - 6 PM)');
        result.confidence = 0.9;
      }
    }

    return result;
  }

  private validatePriority(priority: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      confidence: 1.0
    };

    if (typeof priority !== 'string') {
      result.isValid = false;
      result.errors.push('Priority must be a string');
      result.confidence = 0;
      return result;
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent', 'critical'];
    const normalizedPriority = priority.toLowerCase().trim();

    if (!validPriorities.includes(normalizedPriority)) {
      result.isValid = false;
      result.errors.push('Invalid priority level');
      result.confidence = 0;
      result.suggestions.push(`Valid priorities: ${validPriorities.join(', ')}`);
    } else {
      result.normalizedValue = normalizedPriority;
    }

    return result;
  }

  private validateStatus(status: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      confidence: 1.0
    };

    if (typeof status !== 'string') {
      result.isValid = false;
      result.errors.push('Status must be a string');
      result.confidence = 0;
      return result;
    }

    const validStatuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
    const normalizedStatus = status.toLowerCase().trim();

    if (!validStatuses.includes(normalizedStatus)) {
      result.warnings.push('Status not in standard list');
      result.confidence = 0.8;
      result.suggestions.push(`Common statuses: ${validStatuses.join(', ')}`);
    }

    result.normalizedValue = normalizedStatus;
    return result;
  }

  private validateURL(url: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      confidence: 1.0
    };

    if (typeof url !== 'string') {
      result.isValid = false;
      result.errors.push('URL must be a string');
      result.confidence = 0;
      return result;
    }

    const trimmedUrl = url.trim();
    
    if (!validator.isURL(trimmedUrl)) {
      result.isValid = false;
      result.errors.push('Invalid URL format');
      result.confidence = 0;
      
      if (!trimmedUrl.startsWith('http')) {
        result.suggestions.push('URL should start with http:// or https://');
      }
    } else {
      result.normalizedValue = trimmedUrl;
      
      if (!trimmedUrl.startsWith('https://')) {
        result.warnings.push('Consider using HTTPS for security');
        result.confidence = 0.9;
      }
    }

    return result;
  }

  private validateGeneric(key: string, value: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      confidence: 0.8  // Lower confidence for generic validation
    };

    if (value === null || value === undefined) {
      result.isValid = false;
      result.errors.push(`${key} cannot be null or undefined`);
      result.confidence = 0;
    } else if (typeof value === 'string' && value.trim().length === 0) {
      result.isValid = false;
      result.errors.push(`${key} cannot be empty`);
      result.confidence = 0;
    } else {
      result.normalizedValue = typeof value === 'string' ? value.trim() : value;
    }

    return result;
  }

  private checkCompleteness(entities: Record<string, any>, intent: string): {
    completenessScore: number;
    missingRequired: string[];
    missingOptional: string[];
  } {
    const requiredFields = this.requiredFieldsByIntent[intent] || [];
    const optionalFields = this.optionalFieldsByIntent[intent] || [];
    
    const missingRequired = requiredFields.filter(field => 
      !entities[field] || entities[field] === null || entities[field] === undefined || entities[field] === ''
    );
    
    const missingOptional = optionalFields.filter(field => 
      !entities[field] || entities[field] === null || entities[field] === undefined || entities[field] === ''
    );
    
    const totalFields = requiredFields.length + optionalFields.length;
    const presentFields = (requiredFields.length - missingRequired.length) + (optionalFields.length - missingOptional.length);
    
    const completenessScore = totalFields > 0 ? presentFields / totalFields : 1.0;
    
    return {
      completenessScore,
      missingRequired,
      missingOptional
    };
  }

  private calculateOverallConfidence(
    validationResults: EntityValidationResults,
    completenessScore: number
  ): number {
    const validationScores = Object.values(validationResults).map(result => result.confidence);
    const avgValidationScore = validationScores.length > 0 
      ? validationScores.reduce((sum, score) => sum + score, 0) / validationScores.length 
      : 1.0;
    
    // Weight validation confidence more heavily than completeness
    return (avgValidationScore * 0.7) + (completenessScore * 0.3);
  }

  private async addContextualEnrichments(
    entities: Record<string, any>,
    intent: string
  ): Promise<Record<string, any>> {
    const enrichments: Record<string, any> = {};
    
    // Add timestamp
    enrichments.processedAt = new Date().toISOString();
    enrichments.intent = intent;
    
    // Add derived fields based on intent
    switch (intent) {
      case 'create_lead':
        if (entities.primaryName && entities.primaryCompany) {
          enrichments.leadTitle = `${entities.primaryName} - ${entities.primaryCompany}`;
        } else if (entities.names && entities.names[0] && entities.companies && entities.companies[0]) {
          enrichments.leadTitle = `${entities.names[0]} - ${entities.companies[0]}`;
        }
        if (entities.primaryEmail) {
          enrichments.emailDomain = entities.primaryEmail.split('@')[1];
        } else if (entities.emails && entities.emails[0]) {
          enrichments.emailDomain = entities.emails[0].split('@')[1];
        }
        break;
        
      case 'schedule_meeting':
        if (entities.primaryDate && entities.time) {
          enrichments.meetingDateTime = this.combineDateAndTime(entities.primaryDate, entities.time);
        }
        break;
        
      case 'create_task':
        if (!entities.priority) {
          enrichments.priority = 'medium'; // Default priority
        }
        if (entities.dueDate) {
          enrichments.daysUntilDue = this.calculateDaysUntilDue(entities.dueDate);
        }
        break;
    }
    
    return enrichments;
  }

  private normalizeTime(time: string): string {
    // Convert various time formats to 24-hour format
    const ampmMatch = time.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (ampmMatch) {
      let hour = parseInt(ampmMatch[1]);
      const minute = ampmMatch[2] || '00';
      const period = ampmMatch[3].toUpperCase();
      
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      return `${hour.toString().padStart(2, '0')}:${minute}`;
    }
    
    return time; // Already in 24-hour format or invalid
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const combined = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  }

  private calculateDaysUntilDue(dueDate: Date): number {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private isKnownCompany(company: string): boolean {
    const knownCompanies = [
      'microsoft', 'google', 'amazon', 'apple', 'facebook', 'meta',
      'salesforce', 'oracle', 'ibm', 'adobe', 'netflix', 'uber',
      'tcs', 'infosys', 'wipro', 'hcl', 'tech mahindra', 'cognizant',
      'accenture', 'deloitte', 'pwc', 'ey', 'kpmg'
    ];
    
    const normalizedCompany = company.toLowerCase();
    return knownCompanies.some(known => 
      normalizedCompany.includes(known) || known.includes(normalizedCompany)
    );
  }
}