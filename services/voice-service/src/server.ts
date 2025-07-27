import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import { voiceRoutes } from './routes/voice';
import { VoiceProcessor } from './services/VoiceProcessor';
import { logger } from './utils/logger';
import { initDatabase } from './database/connection';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3002;
const voiceProcessor = new VoiceProcessor();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'voice-service',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/', voiceRoutes);

// WebSocket handling for real-time voice processing
io.on('connection', (socket) => {
  logger.info(`Voice client connected: ${socket.id}`);
  
  let isRecording = false;
  let audioChunks: Buffer[] = [];
  
  socket.on('start-recording', async (data) => {
    try {
      const { userId } = data;
      isRecording = true;
      audioChunks = [];
      
      logger.info(`Started recording for user: ${userId}`);
      socket.emit('recording-started');
    } catch (error) {
      logger.error('Start recording error:', error);
      socket.emit('error', { message: 'Failed to start recording' });
    }
  });
  
  socket.on('audio-chunk', async (chunk) => {
    if (isRecording) {
      audioChunks.push(Buffer.from(chunk));
    }
  });
  
  socket.on('stop-recording', async (data) => {
    try {
      if (!isRecording) return;
      
      isRecording = false;
      const { userId } = data;
      
      // Combine audio chunks
      const audioBuffer = Buffer.concat(audioChunks);
      
      // Process speech-to-text
      const transcription = await voiceProcessor.speechToText(audioBuffer);
      
      socket.emit('transcription', {
        text: transcription.text,
        confidence: transcription.confidence
      });
      
      // Send to AI service for processing
      const aiResponse = await voiceProcessor.processWithAI(transcription.text, userId);
      
      // Generate speech response
      const audioResponse = await voiceProcessor.textToSpeech(aiResponse.text);
      
      socket.emit('ai-response', {
        text: aiResponse.text,
        audio: audioResponse,
        intent: aiResponse.intent,
        entities: aiResponse.entities
      });
      
      logger.info(`Processed voice interaction for user: ${userId}`);
    } catch (error) {
      logger.error('Stop recording error:', error);
      socket.emit('error', { message: 'Failed to process audio' });
    }
  });
  
  socket.on('disconnect', () => {
    logger.info(`Voice client disconnected: ${socket.id}`);
    isRecording = false;
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    
    server.listen(PORT, () => {
      logger.info(`Voice Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();