import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import aiRoutes from './routes/ai';
import { initializeConnections, closeConnections } from './database/connection';
import { extractUserFromHeader } from './middleware/auth';
import config from './config';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = config.port;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3006'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// User context extraction for internal service communication
app.use(extractUserFromHeader);

// Routes
app.use('/api/ai', aiRoutes);

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Initialize and start server
async function startServer() {
  try {
    // Initialize database connections
    await initializeConnections();
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`AI Service running on port ${PORT}`);
      logger.info('Available endpoints:');
      logger.info('  POST /api/ai/process - Process AI requests');
      logger.info('  GET  /api/ai/context/:userId/:sessionId? - Get conversation context');
      logger.info('  DELETE /api/ai/context/:userId/:sessionId? - Clear conversation context');
      logger.info('  POST /api/ai/model/switch - Switch AI model');
      logger.info('  GET  /api/ai/model/status - Get model status');
      logger.info('  POST /api/ai/language/process - Process multi-language text');
      logger.info('  GET  /api/ai/health - Health check');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await closeConnections();
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();