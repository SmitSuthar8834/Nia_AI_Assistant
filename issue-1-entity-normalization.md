# Fix case sensitivity in entity normalization for company names

## Problem Description
The entity validation service is inconsistently handling case normalization for company names, causing test failures.

## Current Behavior
- Input: "TechCorp" 
- Output: "Techcorp" (incorrect capitalization)

## Expected Behavior
- Input: "TechCorp"
- Output: "TechCorp" (preserve original capitalization for known companies)

## Steps to Reproduce
1. Send request: "Create a lead for John Smith from TechCorp"
2. Check `result.entities.primaryCompany`
3. Observe incorrect case normalization

## Files Affected
- `services/ai-service/src/services/EntityValidationService.ts`
- `services/ai-service/src/__tests__/AIService.test.ts`

## Acceptance Criteria
- [ ] Company names preserve original capitalization when recognized
- [ ] Unknown companies get proper case formatting
- [ ] All related tests pass
- [ ] No regression in other entity types

## Priority
Medium

## Labels
`bug`, `ai-service`, `nlp`, `priority-medium`