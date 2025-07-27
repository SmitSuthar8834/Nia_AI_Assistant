#!/bin/bash

# GitHub Issues Creation Script
# Make sure you have GitHub CLI installed: https://cli.github.com/

echo "Creating GitHub issues for NLP pipeline improvements..."

# Issue 1: Entity Normalization Bug
gh issue create \
  --title "Fix case sensitivity in entity normalization for company names" \
  --body-file issue-1-entity-normalization.md \
  --label "bug,ai-service,nlp,priority-medium"

# Issue 2: Phone Formatting Enhancement
gh issue create \
  --title "Standardize phone number formatting in entity extraction" \
  --body-file issue-2-phone-formatting.md \
  --label "enhancement,ai-service,nlp,priority-low"

# Issue 3: Name Extraction Enhancement
gh issue create \
  --title "Improve full name extraction from natural language" \
  --body-file issue-3-name-extraction.md \
  --label "enhancement,ai-service,nlp,priority-medium"

# Issue 4: ML Training Feature
gh issue create \
  --title "Implement continuous learning for intent classification" \
  --body-file issue-4-ml-training.md \
  --label "feature,ai-service,ml,priority-high"

# Issue 5: Confidence Calibration Enhancement
gh issue create \
  --title "Calibrate confidence scores for better reliability" \
  --body-file issue-5-confidence-calibration.md \
  --label "enhancement,ai-service,ml,priority-medium"

echo "✅ All GitHub issues created successfully!"
echo "Visit your repository to view and manage the issues."