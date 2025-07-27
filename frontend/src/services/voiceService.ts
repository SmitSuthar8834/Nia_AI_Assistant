import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface VoiceResponse {
  text: string;
  confidence: number;
  intent?: string;
  entities?: Record<string, any>;
}

interface ConversationHistory {
  id: string;
  sessionId: string;
  messages: Array<{
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    confidence?: number;
  }>;
  createdAt: Date;
}

interface VoiceProfile {
  id: string;
  userId: string;
  languagePreferences: string[];
  voiceSettings: {
    speed: number;
    pitch: number;
    volume: number;
  };
  trainingData?: any;
}

export const voiceService = {
  async processTextMessage(text: string): Promise<VoiceResponse> {
    // Mock voice processing for testing UI
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay
    
    const mockResponses = [
      `I understand you said: "${text}". How can I help you with your sales tasks?`,
      `Based on your request "${text}", I can help you create leads, schedule meetings, or manage tasks.`,
      `I've processed your message: "${text}". Would you like me to take any specific action?`,
      `Thank you for saying "${text}". I'm here to assist with your CRM and sales activities.`
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    return {
      text: randomResponse,
      confidence: 0.85 + Math.random() * 0.1,
      intent: 'general_inquiry',
      entities: {}
    };
  },

  async getConversationHistory(limit = 50): Promise<ConversationHistory[]> {
    // Mock conversation history for testing UI
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        sessionId: 'session_1',
        messages: [
          {
            id: '1',
            type: 'user',
            content: 'Show me my leads',
            timestamp: new Date(Date.now() - 3600000),
            confidence: 0.92
          },
          {
            id: '2',
            type: 'assistant',
            content: 'Here are your current leads. You have 5 active leads in your pipeline.',
            timestamp: new Date(Date.now() - 3590000)
          }
        ],
        createdAt: new Date(Date.now() - 3600000)
      }
    ];
  },

  async getVoiceProfile(): Promise<VoiceProfile> {
    // Mock voice profile for testing UI
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id: '1',
      userId: '1',
      languagePreferences: ['en-IN', 'hi-IN'],
      voiceSettings: {
        speed: 1.0,
        pitch: 0.0,
        volume: 0.8
      },
      trainingData: { samples: 10, accuracy: 0.92 }
    };
  },

  async updateVoiceProfile(profile: Partial<VoiceProfile>): Promise<VoiceProfile> {
    // Mock voice profile update for testing UI
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id: '1',
      userId: '1',
      languagePreferences: profile.languagePreferences || ['en-IN'],
      voiceSettings: profile.voiceSettings || { speed: 1.0, pitch: 0.0, volume: 0.8 },
      trainingData: { samples: 10, accuracy: 0.92 }
    };
  },

  async trainVoiceProfile(audioSamples: Blob[]): Promise<void> {
    // Mock voice training for testing UI
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate training delay
    console.log(`Mock: Trained voice profile with ${audioSamples.length} samples`);
  },

  async synthesizeSpeech(text: string): Promise<Blob> {
    // Mock speech synthesis for testing UI
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a mock audio blob (empty blob for testing)
    return new Blob(['mock audio data'], { type: 'audio/mp3' });
  },

  async deleteConversation(conversationId: string): Promise<void> {
    // Mock conversation deletion for testing UI
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Mock: Deleted conversation ${conversationId}`);
  },
};