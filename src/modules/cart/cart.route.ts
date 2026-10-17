import { Router } from 'express';
import {
  handleGetCart,
  handleAddToCart,
  handleUpdateCartQuantity,
  handleRemoveCartItem,
  handleClearCart,
} from './cart.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', handleGetCart);
router.post('/', handleAddToCart);
router.patch('/:id', handleUpdateCartQuantity);
router.delete('/:id', handleRemoveCartItem);
router.delete('/', handleClearCart);

export default router;