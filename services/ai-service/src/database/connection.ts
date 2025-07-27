import { Pool } from 'pg';
import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';
import logger from '../utils/logger';
import config from '../config';

dotenv.config();

// PostgreSQL connection pool
export const pool = new Pool({
  user: config.database.username,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port,
});

// Redis client
export let redisClient: RedisClientType;

// Initialize all database connections
export const initializeConnections = async (): Promise<void> => {
  try {
    // Connect to PostgreSQL
    await pool.connect();
    logger.info('PostgreSQL connected successfully');

    // Connect to Redis
    redisClient = createClient({
      password: config.redis.password,
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
    });

    redisClient.on('error', (err) => logger.error('Redis Client Error', err));

    await redisClient.connect();
    logger.info('Redis connected successfully');

  } catch (error) {
    logger.error('Failed to initialize database connections:', error);
    process.exit(1);
  }
};

// Close all database connections
export const closeConnections = async (): Promise<void> => {
  try {
    // Close PostgreSQL pool
    await pool.end();
    logger.info('PostgreSQL pool has been closed');

    // Close Redis client
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis client has been closed');
    }
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
};
