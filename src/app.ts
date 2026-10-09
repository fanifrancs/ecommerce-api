import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { db } from './plugins/db.js';

export function buildApp(): Express {
  const app = express();

  // Core Middleware
  app.use(cors());
  app.use(express.json()); // Parses incoming JSON request bodies

  // Health check route with PostgreSQL test query
  app.get('/health', async (req: Request, res: Response) => {
    try {
      const result = await db.query('SELECT NOW()');
      res.status(200).json({
        status: 'ok',
        dbTime: result.rows[0].now,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
  });

  return app;
}