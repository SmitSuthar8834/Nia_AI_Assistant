import { Pool } from 'pg';
import { connectDatabase, getPool, closeDatabase } from '../../config/database';

// Mock pg module
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    }),
    end: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('Database Configuration', () => {
  const mockPool = new Pool();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('connectDatabase', () => {
    it('should establish database connection successfully', async () => {
      await expect(connectDatabase()).resolves.not.toThrow();
      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'localhost',
          port: 5432,
          database: 'nia_admin',
          user: 'postgres',
        })
      );
    });

    it('should test connection with SELECT NOW() query', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);

      await connectDatabase();

      expect(mockClient.query).toHaveBeenCalledWith('SELECT NOW()');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('getPool', () => {
    it('should return pool instance after connection', async () => {
      await connectDatabase();
      const pool = getPool();
      expect(pool).toBeDefined();
    });

    it('should throw error if pool not initialized', () => {
      expect(() => getPool()).toThrow('Database pool not initialized');
    });
  });

  describe('closeDatabase', () => {
    it('should close database connection', async () => {
      await connectDatabase();
      await closeDatabase();
      expect(mockPool.end).toHaveBeenCalled();
    });
  });
});
