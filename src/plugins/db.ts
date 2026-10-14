import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15000, // 15s timeout
});

export async function connectDB() {
  try {
    const client = await db.connect();
    console.log('Successfully connected to PostgreSQL database');
    client.release();
  } catch (err) {
    console.error('Failed to connect to PostgreSQL database:', err);
    process.exit(1);
  }
}
