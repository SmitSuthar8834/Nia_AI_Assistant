# GitHub Issues for Enhanced NLP Pipeline

## Issue 1: Fix Entity Normalization Case Sensitivity

**Title:** Fix case sensitivity in entity normalization for company names

**Labels:** `bug`, `ai-service`, `nlp`, `priority-medium`

**Description:**
The entity validation service is inconsistently handling case normalization for company names, causing test failures.

**Current Behavior:**
- Input: "TechCorp" 
- Output: "Techcorp" (incorrect capitalization)

**Expected Behavior:**
- Input: "TechCorp"
- Output: "TechCorp" (preserve original capitalization for known companies)

**Steps to Reproduce:**
1. Send request: "Create a lead for John Smith from TechCorp"
2. Check `result.entities.primaryCompany`
3. Observe incorrect case normalization

**Files Affected:**
- `services/ai-service/src/services/EntityValidationService.ts`
- `services/ai-service/src/__tests__/AIService.test.ts`

**Acceptance Criteria:**
- [ ] Company names preserve original capitalization when recognized
- [ ] Unknown companies get proper case formatting
- [ ] All related tests pass
- [ ] No regression in other entity types

---

## Issue 2: Improve Phone Number Formatting Consistency

**Title:** Standardize phone number formatting in entity extraction

**Labels:** `enhancement`, `ai-service`, `nlp`, `priority-low`

**Description:**
Phone number formatting is inconsistent between extraction and validation, causing test mismatches.

**Current Behavior:**
- Input: "+91 9876543210"
- Output: "+91 98765 43210" (adds space)

**Expected Behavior:**
- Consistent formatting across extraction and validation
- Configurable format preferences

**Files Affected:**
- `services/ai-service/src/services/NLPPipeline.ts`
- `services/ai-service/src/services/EntityValidationService.ts`

**Acceptance Criteria:**
- [ ] Consistent phone number formatting
- [ ] Support for multiple format preferences
- [ ] All phone validation tests pass

---

## Issue 3: Enhance Name Extraction Patterns

**Title:** Improve full name extraction from natural language

**Labels:** `enhancement`, `ai-service`, `nlp`, `priority-medium`

**Description:**
Current name extraction patterns sometimes capture partial names or include extra words.

**Current Issues:**
- "Sarah Johnson" → "Sarah Tomorrow" (includes time reference)
- "David Chen" → "David" (misses last name)

**Proposed Solution:**
- Improve regex patterns for name boundary detection
- Add context-aware name extraction
- Handle common name patterns better

**Files Affected:**
- `services/ai-service/src/services/NLPPipeline.ts`

**Acceptance Criteria:**
- [ ] Extract full names correctly
- [ ] Handle common name patterns
- [ ] Avoid capturing non-name words
- [ ] Maintain backward compatibility

---

## Issue 4: Add Advanced ML Model Training

**Title:** Implement continuous learning for intent classification

**Labels:** `feature`, `ai-service`, `ml`, `priority-high`

**Description:**
Current intent classification uses static training data. Implement continuous learning to improve accuracy over time.

**Proposed Features:**
- User feedback collection for intent corrections
- Automated retraining pipeline
- A/B testing for model improvements
- Performance metrics tracking

**Technical Requirements:**
- Model versioning system
- Training data management
- Performance monitoring dashboard
- Rollback capabilities

**Files to Create/Modify:**
- `services/ai-service/src/services/ModelTrainingService.ts`
- `services/ai-service/src/services/FeedbackCollectionService.ts`
- Database migrations for training data storage

**Acceptance Criteria:**
- [ ] Feedback collection API endpoints
- [ ] Automated retraining pipeline
- [ ] Model performance tracking
- [ ] Safe model deployment process

---

## Issue 5: Implement Confidence Score Calibration

**Title:** Calibrate confidence scores for better reliability

**Labels:** `enhancement`, `ai-service`, `ml`, `priority-medium`

**Description:**
Current confidence scores need calibration to better reflect actual prediction accuracy.

**Current Issues:**
- ML confidence often very low (0.001-0.01)
- Pattern matching confidence fixed at 0.8
- Overall confidence calculation needs tuning

**Proposed Improvements:**
- Implement confidence calibration techniques
- Dynamic confidence thresholds
- Confidence score validation against real accuracy
- Better weighting of different confidence sources

**Files Affected:**
- `services/ai-service/src/services/NLPPipeline.ts`
- `services/ai-service/src/services/IntentService.ts`

**Acceptance Criteria:**
- [ ] Calibrated confidence scores
- [ ] Confidence validation metrics
- [ ] Improved prediction reliability
- [ ] Documentation for confidence interpretation

---

## Issue 6: Add Support for More Indian Languages

**Title:** Extend multi-language support for regional Indian languages

**Labels:** `feature`, `ai-service`, `i18n`, `priority-low`

**Description:**
Currently supports English, Hindi, and Hinglish. Add support for more Indian regional languages.

**Proposed Languages:**
- Tamil
- Telugu
- Marathi
- Gujarati
- Bengali

**Technical Requirements:**
- Language detection for new languages
- Training data in regional languages
- Entity extraction patterns for each language
- Validation rules for regional formats

**Files Affected:**
- `services/ai-service/src/services/NLPPipeline.ts`
- Training data files
- Test cases for each language

**Acceptance Criteria:**
- [ ] Language detection for 5+ Indian languages
- [ ] Basic intent classification in each language
- [ ] Entity extraction with regional patterns
- [ ] Comprehensive test coverage

---

## Issue 7: Performance Optimization

**Title:** Optimize NLP pipeline performance for production scale

**Labels:** `performance`, `ai-service`, `priority-high`

**Description:**
Current processing time of 50-200ms needs optimization for high-volume production use.

**Performance Targets:**
- < 50ms average processing time
- Support for 1000+ concurrent requests
- Memory usage optimization
- Caching strategies

**Optimization Areas:**
- Model loading and caching
- Tokenization performance
- Entity extraction efficiency
- Database query optimization

**Files Affected:**
- All NLP service files
- Caching layer implementation
- Performance monitoring

**Acceptance Criteria:**
- [ ] < 50ms average response time
- [ ] 1000+ concurrent request support
- [ ] Memory usage < 500MB per instance
- [ ] Performance monitoring dashboard

---

## Issue 8: Add Entity Relationship Detection

**Title:** Implement entity relationship detection and linking

**Labels:** `feature`, `ai-service`, `nlp`, `priority-medium`

**Description:**
Detect and link relationships between extracted entities for better context understanding.

**Examples:**
- "John Smith from TechCorp" → Link person to company
- "Meeting with Sarah tomorrow" → Link person to event
- "Call David about the proposal" → Link person to task

**Technical Requirements:**
- Relationship detection algorithms
- Entity linking database
- Context preservation across conversations
- Relationship confidence scoring

**Files to Create:**
- `services/ai-service/src/services/EntityRelationshipService.ts`
- Database schema for entity relationships

**Acceptance Criteria:**
- [ ] Detect person-company relationships
- [ ] Link entities across conversation turns
- [ ] Relationship confidence scoring
- [ ] API endpoints for relationship queries

---

## Issue 9: Implement Intent Disambiguation

**Title:** Add intent disambiguation for ambiguous user inputs

**Labels:** `feature`, `ai-service`, `nlp`, `priority-medium`

**Description:**
When user input could match multiple intents, provide disambiguation options.

**Example Scenarios:**
- "Update John" → Could be update_lead or create_task
- "Schedule something" → Needs clarification for what to schedule
- "Find information" → Could be search_lead or general_inquiry

**Proposed Solution:**
- Detect ambiguous intents
- Generate clarification questions
- Provide intent options to user
- Learn from user selections

**Files to Create:**
- `services/ai-service/src/services/IntentDisambiguationService.ts`

**Acceptance Criteria:**
- [ ] Detect ambiguous intents
- [ ] Generate clarification questions
- [ ] Handle user disambiguation responses
- [ ] Learn from disambiguation patterns

---

## Issue 10: Add Comprehensive API Documentation

**Title:** Create comprehensive API documentation for NLP endpoints

**Labels:** `documentation`, `api`, `priority-medium`

**Description:**
Create detailed API documentation for all NLP-related endpoints with examples and schemas.

**Documentation Requirements:**
- OpenAPI/Swagger specification
- Request/response examples
- Error handling documentation
- Integration guides
- Performance guidelines

**Files to Create:**
- `services/ai-service/docs/api-documentation.md`
- `services/ai-service/swagger.yaml`
- Integration examples

**Acceptance Criteria:**
- [ ] Complete OpenAPI specification
- [ ] Interactive API documentation
- [ ] Integration examples for each endpoint
- [ ] Error handling documentation
- [ ] Performance optimization guide