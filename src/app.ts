import express, { Express } from 'express';
import cors from 'cors';
import { db } from './plugins/db.js';
import authRoutes from './modules/auth/auth.route.js';
import categoryRoutes from './modules/categories/category.route.js';
import productRoutes from './modules/products/product.route.js';
import orderRoutes from './modules/orders/order.route.js';
import cartRoutes from './modules/cart/cart.route.js';
import checkoutRoutes from './modules/checkout/checkout.route.js';

export function buildApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/checkout', checkoutRoutes);
  
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