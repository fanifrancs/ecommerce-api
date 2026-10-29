import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { createOrder, getUserOrders, getOrderDetails } from './order.service.js';

interface OrderParams {
  id: string;
}

export async function handleCreateOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { items } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User unauthenticated' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    const order = await createOrder(userId, items);
    return res.status(201).json({ message: 'Order created successfully', order });
  } catch (err: any) {
    console.error('Create order error:', err.message);
    // code 400 is used for bad requests, which is appropriate here since the 
    // error is likely due to invalid input or request data.
    return res.status(400).json({ message: err.message || 'Failed to place order' });
  }
}


export async function handleGetUserOrders(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User unauthenticated' });
    }

    const orders = await getUserOrders(userId);
    return res.status(200).json({ orders });
  } catch (err) {
    console.error('Get orders error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function handleGetOrderDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) {
      return res.status(401).json({ message: 'User unauthenticated' });
    }

    const order = await getOrderDetails(id, userId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ order });
  } catch (err) {
    console.error('Get order details error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
