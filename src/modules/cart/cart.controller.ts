import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import {
  getCartByUserId,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from './cart.service.js';

export async function handleGetCart(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });

    const items = await getCartByUserId(userId);
    const cartTotal = items.reduce((acc, item) => acc + Number(item.subtotal), 0);

    return res.status(200).json({ items, cartTotal });
  } catch (err) {
    console.error('Get cart error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function handleAddToCart(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { productId, quantity } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid productId and positive quantity are required' });
    }

    const item = await addToCart(userId, productId, quantity);
    return res.status(201).json({ message: 'Item added to cart', item });
  } catch (err) {
    console.error('Add to cart error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function handleUpdateCartQuantity(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;
    const { quantity } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const updatedItem = await updateCartItemQuantity(userId, id, quantity);
    if (!updatedItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    return res.status(200).json({ message: 'Cart item updated', item: updatedItem });
  } catch (err) {
    console.error('Update cart item error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function handleRemoveCartItem(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    const id = req.params.id as string;

    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });

    const deleted = await removeCartItem(userId, id);
    if (!deleted) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    return res.status(200).json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Remove cart item error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function handleClearCart(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });

    await clearCart(userId);
    return res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Clear cart error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}