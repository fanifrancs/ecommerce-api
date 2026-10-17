import { db } from '../../plugins/db.js';

export interface CartItemRow {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  price: string;
  quantity: number;
  subtotal: number;
}

export async function getCartByUserId(userId: string): Promise<CartItemRow[]> {
  const query = `
    SELECT 
      c.id, 
      c.user_id, 
      c.product_id, 
      p.name AS product_name, 
      p.price, 
      c.quantity,
      (p.price * c.quantity) AS subtotal
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC;
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  const query = `
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET 
      quantity = cart_items.quantity + EXCLUDED.quantity,
      updated_at = NOW()
    RETURNING id, user_id, product_id, quantity;
  `;
  const result = await db.query(query, [userId, productId, quantity]);
  return result.rows[0];
}

export async function updateCartItemQuantity(
  userId: string,
  cartItemId: string,
  quantity: number
) {
  const query = `
    UPDATE cart_items
    SET quantity = $1, updated_at = NOW()
    WHERE id = $2 AND user_id = $3
    RETURNING id, user_id, product_id, quantity;
  `;
  const result = await db.query(query, [quantity, cartItemId, userId]);
  return result.rows[0] || null;
}

export async function removeCartItem(userId: string, cartItemId: string) {
  const query = `
    DELETE FROM cart_items
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const result = await db.query(query, [cartItemId, userId]);
  return result.rows[0] || null;
}

export async function clearCart(userId: string) {
  await db.query(`DELETE FROM cart_items WHERE user_id = $1;`, [userId]);
}