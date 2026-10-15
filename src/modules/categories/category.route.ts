import { Router } from 'express';
import {
  handleCreateCategory,
  handleGetCategories,
  handleGetCategoryById,
} from './category.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', handleGetCategories);
router.get('/:id', handleGetCategoryById);

// Protected admin route
router.post('/', authenticateToken, handleCreateCategory);

export default router;