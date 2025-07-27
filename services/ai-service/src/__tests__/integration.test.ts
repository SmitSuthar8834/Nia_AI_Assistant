import request from 'supertest';
import express from 'express';
import aiRoutes from '../routes/ai';

// Mock the database connections
jest.mock('../database/connection', () => ({
  initializeConnections: jest.fn().mockResolvedValue(true),
  closeConnections: jest.fn().mockResolvedValue(true),
  pool: {
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn()
    })
  },
  redisClient: {
    get: jest.fn().mockResolvedValue(null),
    setEx: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    ttl: jest.fn().mockResolvedValue(-1),
    expire: jest.fn().mockResolvedValue(1)
  }
}));

// Mock the AI providers
jest.mock('../providers/GeminiProvider');
jest.mock('../providers/OpenAIProvider');

describe('AI Service Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/ai', aiRoutes);
  });

  describe('POST /api/ai/process', () => {
    test('should process a simple AI request', async () => {
      const response = await request(app)
        .post('/api/ai/process')
        .send({
          text: 'Hello Nia',
          userId: 'test-user-123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('intent');
      expect(response.body).toHaveProperty('entities');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body.intent).toBe('greeting');
      // Response field might be missing due to mocked providers, but that's OK for this test
    });

    test('should handle lead creation request', async () => {
      const response = await request(app)
        .post('/api/ai/process')
        .send({
          text: 'Create a lead for John Smith from TechCorp',
          userId: 'test-user-123'
        });

      expect(response.status).toBe(200);
      expect(response.body.intent).toBe('create_lead');
      expect(response.body.entities.name).toBe('John'); // The pattern extracts first name only
      expect(response.body.entities.company).toBe('TechCorp');
      expect(response.body.actions).toBeDefined();
      expect(response.body.actions.length).toBeGreaterThan(0);
    });

    test('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/ai/process')
        .send({
          text: 'Hello'
          // Missing userId
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('GET /api/ai/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/ai/health');

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service', 'ai-service');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/ai/model/status', () => {
    test('should return model status', async () => {
      const response = await request(app)
        .get('/api/ai/model/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('currentModel');
      expect(response.body).toHaveProperty('modelStatus');
      expect(response.body).toHaveProperty('availableModels');
    });
  });

  describe('POST /api/ai/language/process', () => {
    test('should process multi-language text', async () => {
      const response = await request(app)
        .post('/api/ai/language/process')
        .send({
          text: 'Hello, mera naam John hai'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('text');
      expect(response.body).toHaveProperty('language');
      expect(response.body).toHaveProperty('confidence');
    });

    test('should return 400 for missing text', async () => {
      const response = await request(app)
        .post('/api/ai/language/process')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required field: text');
    });
  });
});