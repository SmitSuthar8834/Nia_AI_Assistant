import React, { createContext, useContext, useReducer, useRef } from 'react';
import { voiceService } from '../services/voiceService';

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isConnected: boolean;
  transcript: string;
  response: string;
  error: string | null;
  conversationHistory: ConversationMessage[];
}

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
}

type VoiceAction =
  | { type: 'START_LISTENING' }
  | { type: 'STOP_LISTENING' }
  | { type: 'START_PROCESSING' }
  | { type: 'STOP_PROCESSING' }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_TRANSCRIPT'; payload: string }
  | { type: 'SET_RESPONSE'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: ConversationMessage }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_CONVERSATION' };

const initialState: VoiceState = {
  isListening: false,
  isProcessing: false,
  isConnected: false,
  transcript: '',
  response: '',
  error: null,
  conversationHistory: [],
};

const voiceReducer = (state: VoiceState, action: VoiceAction): VoiceState => {
  switch (action.type) {
    case 'START_LISTENING':
      return { ...state, isListening: true, error: null };
    case 'STOP_LISTENING':
      return { ...state, isListening: false };
    case 'START_PROCESSING':
      return { ...state, isProcessing: true, error: null };
    case 'STOP_PROCESSING':
      return { ...state, isProcessing: false };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_TRANSCRIPT':
      return { ...state, transcript: action.payload };
    case 'SET_RESPONSE':
      return { ...state, response: action.payload };
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversationHistory: [...state.conversationHistory, action.payload],
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isListening: false, isProcessing: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'CLEAR_CONVERSATION':
      return { ...state, conversationHistory: [], transcript: '', response: '' };
    default:
      return state;
  }
};

interface VoiceContextType extends VoiceState {
  startListening: () => Promise<void>;
  stopListening: () => void;
  sendTextMessage: (text: string) => Promise<void>;
  clearConversation: () => void;
  clearError: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(voiceReducer, initialState);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  const startListening = async () => {
    try {
      dispatch({ type: 'START_LISTENING' });
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize WebSocket connection
      const ws = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:8080/voice');
      websocketRef.current = ws;
      
      ws.onopen = () => {
        dispatch({ type: 'SET_CONNECTED', payload: true });
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'transcript') {
          dispatch({ type: 'SET_TRANSCRIPT', payload: data.text });
        } else if (data.type === 'response') {
          dispatch({ type: 'SET_RESPONSE', payload: data.text });
          dispatch({ type: 'ADD_MESSAGE', payload: {
            id: Date.now().toString(),
            type: 'assistant',
            content: data.text,
            timestamp: new Date(),
          }});
        }
      };
      
      ws.onerror = () => {
        dispatch({ type: 'SET_ERROR', payload: 'WebSocket connection failed' });
      };
      
      ws.onclose = () => {
        dispatch({ type: 'SET_CONNECTED', payload: false });
      };
      
      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };
      
      mediaRecorder.start(100); // Send data every 100ms
      
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to start voice recognition' });
    }
  };

  const stopListening = () => {
    dispatch({ type: 'STOP_LISTENING' });
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.close();
    }
    
    // Add user message to conversation
    if (state.transcript) {
      dispatch({ type: 'ADD_MESSAGE', payload: {
        id: Date.now().toString(),
        type: 'user',
        content: state.transcript,
        timestamp: new Date(),
      }});
    }
  };

  const sendTextMessage = async (text: string) => {
    try {
      dispatch({ type: 'START_PROCESSING' });
      
      // Add user message to conversation
      dispatch({ type: 'ADD_MESSAGE', payload: {
        id: Date.now().toString(),
        type: 'user',
        content: text,
        timestamp: new Date(),
      }});
      
      const response = await voiceService.processTextMessage(text);
      
      // Add assistant response to conversation
      dispatch({ type: 'ADD_MESSAGE', payload: {
        id: Date.now().toString(),
        type: 'assistant',
        content: response.text,
        timestamp: new Date(),
      }});
      
      dispatch({ type: 'SET_RESPONSE', payload: response.text });
      dispatch({ type: 'STOP_PROCESSING' });
      
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to process message' });
      dispatch({ type: 'STOP_PROCESSING' });
    }
  };

  const clearConversation = () => {
    dispatch({ type: 'CLEAR_CONVERSATION' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: VoiceContextType = {
    ...state,
    startListening,
    stopListening,
    sendTextMessage,
    clearConversation,
    clearError,
  };

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};