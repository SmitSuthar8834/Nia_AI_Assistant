import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIModel, ModelConfig, ConversationContext } from '../types';
import config from '../config';
import logger from '../utils/logger';

export class GeminiProvider {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!config.ai.gemini.apiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    this.genAI = new GoogleGenerativeAI(config.ai.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateResponse(
    prompt: string,
    context?: ConversationContext,
    modelConfig?: ModelConfig
  ): Promise<string> {
    try {
      const enhancedPrompt = this.buildPrompt(prompt, context);
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
        generationConfig: {
          temperature: modelConfig?.temperature || 0.7,
          topK: 40,
          topP: modelConfig?.topP || 0.95,
          maxOutputTokens: modelConfig?.maxTokens || 1024,
        },
      });

      const response = await result.response;
      const text = response.text();
      
      logger.info('Gemini response generated successfully', {
        promptLength: prompt.length,
        responseLength: text.length
      });
      
      return text;
    } catch (error) {
      logger.error('Gemini API error:', error);
      throw new Error(`Gemini API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildPrompt(userInput: string, context?: ConversationContext): string {
    const systemPrompt = `You are Nia, an AI sales assistant specialized in helping sales professionals with CRM tasks, lead management, meeting scheduling, and sales activities. You understand Indian English accents and business contexts.

Key capabilities:
- Create and manage leads in CRM systems
- Schedule meetings and manage calendar
- Create and track tasks and follow-ups
- Summarize emails and extract action items
- Search and retrieve CRM data
- Provide sales insights and recommendations

Guidelines:
- Be conversational and helpful
- Ask clarifying questions when information is missing
- Confirm actions before executing them
- Provide structured responses for CRM operations
- Handle Indian business contexts and terminology
- Support both English and Hinglish interactions`;

    let prompt = systemPrompt + '\n\n';
    
    if (context && context.history.length > 0) {
      prompt += 'Previous conversation:\n';
      context.history.slice(-5).forEach(msg => {
        prompt += `${msg.role}: ${msg.content}\n`;
      });
      prompt += '\n';
    }
    
    if (context && context.entities && Object.keys(context.entities).length > 0) {
      prompt += 'Current context entities:\n';
      Object.entries(context.entities).forEach(([key, value]) => {
        prompt += `${key}: ${JSON.stringify(value)}\n`;
      });
      prompt += '\n';
    }
    
    prompt += `User: ${userInput}\nAssistant:`;
    
    return prompt;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Hello');
      return !!result.response.text();
    } catch (error) {
      logger.error('Gemini health check failed:', error);
      return false;
    }
  }
}