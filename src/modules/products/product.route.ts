import { Router } from 'express';
import {
  handleCreateProduct,
  handleGetProducts,
  handleGetProductById,
} from './product.controller.js';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', handleGetProducts);
router.get('/:id', handleGetProductById);

// Admin-only route
router.post('/', authenticateToken, requireRole('admin'), handleCreateProduct);

export default router;
