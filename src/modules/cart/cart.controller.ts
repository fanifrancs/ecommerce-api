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

    // .reduce() is an array method that loops through every element in the items array
    // and "reduces" them down into a single final value (in this case, a single total number)

    /* 
      The line declares a constant variable named cartTotal to store the final
      calculated sum of all items. It uses the Array.prototype.reduce() method
      to loop through every element in the items array and reduce them down into
      a single final numerical value. Inside the reduce callback function, it
      accepts two primary arguments: 'acc', which acts as the accumulator or
      running total that holds the accumulated sum from previous iterations, and
      'item', which represents the specific product object currently being
      processed in the loop. For every single item, it takes the current running
      total stored in 'acc' and adds the item's subtotal to it. It wraps
      'item.subtotal' inside the Number() function to ensure that whatever format
      the subtotal is in—even if it accidentally arrived from a database or API
      as a string like "49.99"—it gets safely converted into a real number,
      preventing bugs like string concatenation where 100 + "50" turns into
      "10050". Finally, the comma followed by 0 at the very end (, 0) defines
      the initial value of the accumulator, instructing JavaScript to start
      the running total at 0 on the very first loop iteration.
    */
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