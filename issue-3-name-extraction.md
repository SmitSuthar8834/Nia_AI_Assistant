# Improve full name extraction from natural language

## Problem Description
Current name extraction patterns sometimes capture partial names or include extra words.

## Current Issues
- "Sarah Johnson" → "Sarah Tomorrow" (includes time reference)
- "David Chen" → "David" (misses last name)

## Proposed Solution
- Improve regex patterns for name boundary detection
- Add context-aware name extraction
- Handle common name patterns better

## Files Affected
- `services/ai-service/src/services/NLPPipeline.ts`

## Acceptance Criteria
- [ ] Extract full names correctly
- [ ] Handle common name patterns
- [ ] Avoid capturing non-name words
- [ ] Maintain backward compatibility

## Priority
Medium

## Labels
`enhancement`, `ai-service`, `nlp`, `priority-medium`