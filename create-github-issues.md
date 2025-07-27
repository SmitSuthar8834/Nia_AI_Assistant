# GitHub Issues Creation Guide

## Quick Issue Creation Commands

You can create these issues directly on GitHub using the GitHub CLI or through the web interface. Here are the formatted issues ready to copy-paste:

### 1. Bug Fix: Entity Normalization Case Sensitivity

```
Title: Fix case sensitivity in entity normalization for company names
Labels: bug, ai-service, nlp, priority-medium

The entity validation service is inconsistently handling case normalization for company names, causing test failures.

**Current Behavior:**
- Input: "TechCorp" 
- Output: "Techcorp" (incorrect capitalization)

**Expected Behavior:**
- Input: "TechCorp"
- Output: "TechCorp" (preserve original capitalization for known companies)

**Files Affected:**
- services/ai-service/src/services/EntityValidationService.ts
- services/ai-service/src/__tests__/AIService.test.ts

**Acceptance Criteria:**
- [ ] Company names preserve original capitalization when recognized
- [ ] Unknown companies get proper case formatting
- [ ] All related tests pass
```

### 2. Enhancement: Phone Number Formatting

```
Title: Standardize phone number formatting in entity extraction
Labels: enhancement, ai-service, nlp, priority-low

Phone number formatting is inconsistent between extraction and validation, causing test mismatches.

**Current Behavior:**
- Input: "+91 9876543210"
- Output: "+91 98765 43210" (adds space)

**Files Affected:**
- services/ai-service/src/services/NLPPipeline.ts
- services/ai-service/src/services/EntityValidationService.ts

**Acceptance Criteria:**
- [ ] Consistent phone number formatting
- [ ] Support for multiple format preferences
- [ ] All phone validation tests pass
```

### 3. Enhancement: Name Extraction Patterns

```
Title: Improve full name extraction from natural language
Labels: enhancement, ai-service, nlp, priority-medium

Current name extraction patterns sometimes capture partial names or include extra words.

**Current Issues:**
- "Sarah Johnson" → "Sarah Tomorrow" (includes time reference)
- "David Chen" → "David" (misses last name)

**Files Affected:**
- services/ai-service/src/services/NLPPipeline.ts

**Acceptance Criteria:**
- [ ] Extract full names correctly
- [ ] Handle common name patterns
- [ ] Avoid capturing non-name words
```

### 4. Feature: Advanced ML Model Training

```
Title: Implement continuous learning for intent classification
Labels: feature, ai-service, ml, priority-high

Current intent classification uses static training data. Implement continuous learning to improve accuracy over time.

**Proposed Features:**
- User feedback collection for intent corrections
- Automated retraining pipeline
- A/B testing for model improvements
- Performance metrics tracking

**Acceptance Criteria:**
- [ ] Feedback collection API endpoints
- [ ] Automated retraining pipeline
- [ ] Model performance tracking
- [ ] Safe model deployment process
```

### 5. Enhancement: Confidence Score Calibration

```
Title: Calibrate confidence scores for better reliability
Labels: enhancement, ai-service, ml, priority-medium

Current confidence scores need calibration to better reflect actual prediction accuracy.

**Current Issues:**
- ML confidence often very low (0.001-0.01)
- Pattern matching confidence fixed at 0.8
- Overall confidence calculation needs tuning

**Acceptance Criteria:**
- [ ] Calibrated confidence scores
- [ ] Confidence validation metrics
- [ ] Improved prediction reliability
```

## GitHub CLI Commands (if you have gh CLI installed)

```bash
# Create issues using GitHub CLI
gh issue create --title "Fix case sensitivity in entity normalization for company names" --label "bug,ai-service,nlp,priority-medium" --body-file issue1.md

gh issue create --title "Standardize phone number formatting in entity extraction" --label "enhancement,ai-service,nlp,priority-low" --body-file issue2.md

gh issue create --title "Improve full name extraction from natural language" --label "enhancement,ai-service,nlp,priority-medium" --body-file issue3.md

gh issue create --title "Implement continuous learning for intent classification" --label "feature,ai-service,ml,priority-high" --body-file issue4.md

gh issue create --title "Calibrate confidence scores for better reliability" --label "enhancement,ai-service,ml,priority-medium" --body-file issue5.md
```

## Priority Levels

- **High Priority**: Core functionality improvements, performance issues
- **Medium Priority**: User experience improvements, moderate bugs
- **Low Priority**: Nice-to-have features, minor formatting issues

## Recommended Issue Creation Order

1. **Issue #4** - Advanced ML Model Training (High Priority)
2. **Issue #7** - Performance Optimization (High Priority)  
3. **Issue #1** - Fix Entity Normalization (Medium Priority)
4. **Issue #3** - Improve Name Extraction (Medium Priority)
5. **Issue #5** - Confidence Score Calibration (Medium Priority)
6. **Issue #2** - Phone Number Formatting (Low Priority)

## Next Steps

1. Go to your GitHub repository: https://github.com/SmitSuthar8834/Nia_AI_Assistant
2. Click on "Issues" tab
3. Click "New Issue"
4. Copy-paste the issue content from above
5. Add appropriate labels
6. Assign to team members if needed
7. Create the issue

This will help track and prioritize the improvements needed for the enhanced NLP pipeline!