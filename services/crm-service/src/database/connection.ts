import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

export const initDatabase = async () => {
  try {
    await pool.connect();
    console.log('CRM database connected');
  } catch (error) {
    console.error('Error connecting to CRM database:', error);
    process.exit(1);
  }
};
