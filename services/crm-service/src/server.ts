import express from 'express';
import dotenv from 'dotenv';
import { leadRoutes } from './routes/leads';
import { taskRoutes } from './routes/tasks';
import { meetingRoutes } from './routes/meetings';
import { configRoutes } from './routes/config';
import { syncRoutes } from './routes/sync';
import { CRMSyncService } from './services/CRMSyncService';
import { logger } from './utils/logger';
import { initDatabase } from './database/connection';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Initialize CRM sync service
const crmSyncService = new CRMSyncService();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'crm-service',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/leads', leadRoutes);
app.use('/tasks', taskRoutes);
app.use('/meetings', meetingRoutes);
app.use('/config', configRoutes);
app.use('/sync', syncRoutes);

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
    
    // Start CRM sync service
    crmSyncService.startPeriodicSync();
    
    app.listen(PORT, () => {
      logger.info(`CRM Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();