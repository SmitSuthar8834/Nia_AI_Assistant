import { createClient } from 'redis';
import { connectRedis, getRedisClient, closeRedis } from '../../config/redis';

// Mock redis module
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue(undefined),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  }),
}));

describe('Redis Configuration', () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockClient);
  });

  afterEach(async () => {
    await closeRedis();
  });

  describe('connectRedis', () => {
    it('should establish Redis connection successfully', async () => {
      await expect(connectRedis()).resolves.not.toThrow();
      expect(createClient).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'redis://localhost:6379/0',
        })
      );
    });

    it('should test connection with ping', async () => {
      await connectRedis();
      expect(mockClient.ping).toHaveBeenCalled();
    });

    it('should set up event listeners', async () => {
      await connectRedis();
      expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('end', expect.any(Function));
    });
  });

  describe('getRedisClient', () => {
    it('should return client instance after connection', async () => {
      await connectRedis();
      const client = getRedisClient();
      expect(client).toBeDefined();
    });

    it('should throw error if client not initialized', () => {
      expect(() => getRedisClient()).toThrow('Redis client not initialized');
    });
  });

  describe('closeRedis', () => {
    it('should close Redis connection', async () => {
      await connectRedis();
      await closeRedis();
      expect(mockClient.quit).toHaveBeenCalled();
    });
  });
});
