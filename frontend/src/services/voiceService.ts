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
    const response = await api.post('/voice/process-text', { text });
    return response.data;
  },

  async getConversationHistory(limit = 50): Promise<ConversationHistory[]> {
    const response = await api.get(`/voice/conversations?limit=${limit}`);
    return response.data;
  },

  async getVoiceProfile(): Promise<VoiceProfile> {
    const response = await api.get('/voice/profile');
    return response.data;
  },

  async updateVoiceProfile(profile: Partial<VoiceProfile>): Promise<VoiceProfile> {
    const response = await api.put('/voice/profile', profile);
    return response.data;
  },

  async trainVoiceProfile(audioSamples: Blob[]): Promise<void> {
    const formData = new FormData();
    audioSamples.forEach((sample, index) => {
      formData.append(`sample_${index}`, sample);
    });
    
    await api.post('/voice/train', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async synthesizeSpeech(text: string): Promise<Blob> {
    const response = await api.post('/voice/synthesize', { text }, {
      responseType: 'blob',
    });
    return response.data;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/voice/conversations/${conversationId}`);
  },
};