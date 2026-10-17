import { Router } from 'express';
import {
  handleCreateOrder,
  handleGetUserOrders,
  handleGetOrderDetails,
} from './order.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken); // Protect all order endpoints

router.post('/', handleCreateOrder);
router.get('/', handleGetUserOrders);
router.get('/:id', handleGetOrderDetails);

export default router;
