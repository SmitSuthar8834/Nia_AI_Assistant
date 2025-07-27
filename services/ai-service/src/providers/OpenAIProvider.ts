import OpenAI from 'openai';
import { AIModel, ModelConfig, ConversationContext } from '../types';
import config from '../config';
import logger from '../utils/logger';

export class OpenAIProvider {
  private openai: OpenAI;

  constructor() {
    if (!config.ai.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    this.openai = new OpenAI({
      apiKey: config.ai.openai.apiKey,
      organization: config.ai.openai.organization,
    });
  }

  async generateResponse(
    prompt: string,
    context?: ConversationContext,
    modelConfig?: ModelConfig
  ): Promise<string> {
    try {
      const messages = this.buildMessages(prompt, context);
      const model = modelConfig?.model === AIModel.GPT_4 ? 'gpt-4' : 'gpt-3.5-turbo';
      
      const completion = await this.openai.chat.completions.create({
        model,
        messages,
        temperature: modelConfig?.temperature || 0.7,
        max_tokens: modelConfig?.maxTokens || 1024,
        top_p: modelConfig?.topP || 1,
        frequency_penalty: modelConfig?.frequencyPenalty || 0,
        presence_penalty: modelConfig?.presencePenalty || 0,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      logger.info('OpenAI response generated successfully', {
        model,
        promptLength: prompt.length,
        responseLength: response.length,
        tokensUsed: completion.usage?.total_tokens
      });
      
      return response;
    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw new Error(`OpenAI API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildMessages(userInput: string, context?: ConversationContext): OpenAI.Chat.ChatCompletionMessageParam[] {
    const systemMessage: OpenAI.Chat.ChatCompletionMessageParam = {
      role: 'system',
      content: `You are Nia, an AI sales assistant specialized in helping sales professionals with CRM tasks, lead management, meeting scheduling, and sales activities. You understand Indian English accents and business contexts.

Key capabilities:
- Create and manage leads in CRM systems (Salesforce, Creatio, SAP)
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
- Support both English and Hinglish interactions
- When creating leads, tasks, or meetings, extract structured data and confirm with user

Response format for actions:
- For lead creation: Extract name, company, email, phone, and other details
- For meeting scheduling: Extract date, time, participants, and purpose
- For task creation: Extract description, due date, priority, and assignee`
    };

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [systemMessage];
    
    // Add conversation history
    if (context && context.history.length > 0) {
      context.history.slice(-10).forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }
    
    // Add current user input
    messages.push({
      role: 'user',
      content: userInput
    });
    
    return messages;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });
      return !!completion.choices[0]?.message?.content;
    } catch (error) {
      logger.error('OpenAI health check failed:', error);
      return false;
    }
  }
}