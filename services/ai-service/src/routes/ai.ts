import express from 'express';
import { AIService } from '../services/AIService';
import { AIRequest, AIModel } from '../types';
import logger from '../utils/logger';

const router = express.Router();
const aiService = new AIService();

// Process AI request
router.post('/process', async (req, res) => {
  try {
    const { text, userId, sessionId, context, language } = req.body;

    if (!text || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: text and userId'
      });
    }

    const request: AIRequest = {
      text,
      userId,
      sessionId,
      context,
      language: language || 'en-IN'
    };

    const response = await aiService.processRequest(request);
    
    res.json(response);
  } catch (error) {
    logger.error('Error in /process endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get conversation context
router.get('/context/:userId/:sessionId?', async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    
    const summary = await aiService.getContextSummary(userId, sessionId || 'default');
    
    res.json({
      userId,
      sessionId: sessionId || 'default',
      summary
    });
  } catch (error) {
    logger.error('Error in /context endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clear conversation context
router.delete('/context/:userId/:sessionId?', async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    
    await aiService.clearUserContext(userId, sessionId);
    
    res.json({
      message: 'Context cleared successfully',
      userId,
      sessionId: sessionId || 'default'
    });
  } catch (error) {
    logger.error('Error in DELETE /context endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Switch AI model
router.post('/model/switch', async (req, res) => {
  try {
    const { model } = req.body;

    if (!model || !Object.values(AIModel).includes(model)) {
      return res.status(400).json({
        error: 'Invalid model specified',
        availableModels: Object.values(AIModel)
      });
    }

    const success = await aiService.switchModel(model);
    
    if (success) {
      res.json({
        message: `Successfully switched to ${model}`,
        currentModel: model
      });
    } else {
      res.status(500).json({
        error: `Failed to switch to ${model}`,
        currentModel: aiService.getCurrentModel()
      });
    }
  } catch (error) {
    logger.error('Error in /model/switch endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get model status
router.get('/model/status', async (req, res) => {
  try {
    const status = await aiService.getModelStatus();
    const currentModel = aiService.getCurrentModel();
    
    res.json({
      currentModel,
      modelStatus: status,
      availableModels: Object.values(AIModel)
    });
  } catch (error) {
    logger.error('Error in /model/status endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Process multi-language text
router.post('/language/process', async (req, res) => {
  try {
    const { text, languages } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'Missing required field: text'
      });
    }

    const result = await aiService.processMultiLanguage(
      text,
      languages || ['en-IN', 'hi', 'hi-en']
    );
    
    res.json(result);
  } catch (error) {
    logger.error('Error in /language/process endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test NLP pipeline
router.post('/nlp/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'Missing required field: text'
      });
    }

    // Import NLP services for direct testing
    const { NLPPipeline } = await import('../services/NLPPipeline');
    const { EntityValidationService } = await import('../services/EntityValidationService');
    
    const nlpPipeline = new NLPPipeline();
    const entityValidator = new EntityValidationService();
    
    const nlpResult = await nlpPipeline.processText(text);
    const enrichmentResult = await entityValidator.validateAndEnrichEntities(
      nlpResult.entities.entities,
      nlpResult.intent.intent
    );
    
    res.json({
      input: text,
      nlpAnalysis: nlpResult,
      entityValidation: enrichmentResult,
      summary: {
        detectedIntent: nlpResult.intent.intent,
        intentConfidence: nlpResult.intent.confidence,
        language: nlpResult.language,
        sentiment: nlpResult.sentiment.label,
        entityCount: Object.keys(nlpResult.entities.entities).length,
        validationErrors: Object.values(enrichmentResult.validationResults)
          .reduce((acc: string[], result) => [...acc, ...result.errors], []),
        overallConfidence: enrichmentResult.overallConfidence
      }
    });
  } catch (error) {
    logger.error('Error in /nlp/analyze endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const modelStatus = await aiService.getModelStatus();
    const currentModel = aiService.getCurrentModel();
    
    const isHealthy = Object.values(modelStatus).some(status => status === true);
    
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'ai-service',
      currentModel,
      modelStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in /health endpoint:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'ai-service',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;