import express, { Express } from 'express';
import cors from 'cors';
import { db } from './plugins/db.js';
import authRoutes from './modules/auth/auth.routes.js';

export function buildApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/v1/auth', authRoutes);

  app.get('/health', async (req, res) => {
    try {
      const result = await db.query('SELECT NOW()');
      res.status(200).json({ status: 'ok', dbTime: result.rows[0].now });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
  });

  return app;
}