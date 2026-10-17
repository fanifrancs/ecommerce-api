import { Router } from 'express';
import {
  handleCreateCategory,
  handleGetCategories,
  handleGetCategoryById,
} from './category.controller.js';
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Public routes (anyone can view categories)
router.get('/', handleGetCategories);
router.get('/:id', handleGetCategoryById);

// Admin-only route (must have valid token AND role = 'admin')
router.post('/', authenticateToken, requireRole('admin'), handleCreateCategory);

export default router;