import request from 'supertest';
import { app } from '../server';

describe('Server Setup', () => {
  describe('Health Check', () => {
    it('should return 200 for health check endpoint', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('API Routes', () => {
    it('should return 404 for unknown API endpoints', async () => {
      const response = await request(app).get('/api/unknown').expect(404);

      expect(response.body).toHaveProperty('message', 'API endpoint not found');
    });
  });
});
