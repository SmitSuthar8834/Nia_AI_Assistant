# Standardize phone number formatting in entity extraction

## Problem Description
Phone number formatting is inconsistent between extraction and validation, causing test mismatches.

## Current Behavior
- Input: "+91 9876543210"
- Output: "+91 98765 43210" (adds space)

## Expected Behavior
- Consistent formatting across extraction and validation
- Configurable format preferences

## Files Affected
- `services/ai-service/src/services/NLPPipeline.ts`
- `services/ai-service/src/services/EntityValidationService.ts`

## Acceptance Criteria
- [ ] Consistent phone number formatting
- [ ] Support for multiple format preferences
- [ ] All phone validation tests pass

## Priority
Low

## Labels
`enhancement`, `ai-service`, `nlp`, `priority-low`