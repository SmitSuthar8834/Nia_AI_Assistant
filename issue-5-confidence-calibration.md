# Calibrate confidence scores for better reliability

## Problem Description
Current confidence scores need calibration to better reflect actual prediction accuracy.

## Current Issues
- ML confidence often very low (0.001-0.01)
- Pattern matching confidence fixed at 0.8
- Overall confidence calculation needs tuning

## Proposed Improvements
- Implement confidence calibration techniques
- Dynamic confidence thresholds
- Confidence score validation against real accuracy
- Better weighting of different confidence sources

## Files Affected
- `services/ai-service/src/services/NLPPipeline.ts`
- `services/ai-service/src/services/IntentService.ts`

## Acceptance Criteria
- [ ] Calibrated confidence scores
- [ ] Confidence validation metrics
- [ ] Improved prediction reliability
- [ ] Documentation for confidence interpretation

## Priority
Medium

## Labels
`enhancement`, `ai-service`, `ml`, `priority-medium`