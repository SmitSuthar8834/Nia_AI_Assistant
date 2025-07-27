import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3006",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3006",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      auth: process.env.AUTH_SERVICE_URL,
      voice: process.env.VOICE_SERVICE_URL,
      crm: process.env.CRM_SERVICE_URL,
      ai: process.env.AI_SERVICE_URL,
      notification: process.env.NOTIFICATION_SERVICE_URL
    }
  });
});

// Service proxy configurations
const serviceProxies = {
  '/api/auth': {
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' }
  },
  '/api/voice': {
    target: process.env.VOICE_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/api/voice': '' }
  },
  '/api/crm': {
    target: process.env.CRM_SERVICE_URL || 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: { '^/api/crm': '' }
  },
  '/api/ai': {
    target: process.env.AI_SERVICE_URL || 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: { '^/api/ai': '' }
  },
  '/api/notifications': {
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: { '^/api/notifications': '' }
  }
};

// Apply authentication middleware to protected routes
const protectedRoutes = ['/api/voice', '/api/crm', '/api/ai', '/api/notifications'];
protectedRoutes.forEach(route => {
  app.use(route, authMiddleware);
});

// Setup service proxies
Object.entries(serviceProxies).forEach(([path, config]) => {
  app.use(path, createProxyMiddleware({
    ...config,
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${path}:`, err);
      res.status(503).json({ 
        error: 'Service temporarily unavailable',
        service: path 
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${config.target}`);
    }
  }));
});

// WebSocket handling for real-time features
io.use((socket, next) => {
  // Add authentication for WebSocket connections
  const token = socket.handshake.auth.token;
  if (token) {
    // Verify JWT token here
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Handle voice streaming
  socket.on('voice-stream', (data) => {
    // Forward to voice service
    socket.broadcast.emit('voice-data', data);
  });
  
  // Handle real-time notifications
  socket.on('subscribe-notifications', (userId) => {
    socket.join(`user-${userId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info('Service endpoints:', serviceProxies);
});

export { io };