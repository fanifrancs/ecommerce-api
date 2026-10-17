import { db } from '../../plugins/db.js';

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface OrderRow {
  id: string;
  user_id: string;
  total_amount: string;
  status: string;
  created_at: Date;
}

export async function createOrder(
  userId: string,
  items: OrderItemInput[]
): Promise<OrderRow> {
  const client = await db.connect();

  try {
    // 1. Begin SQL Transaction
    await client.query('BEGIN');

    let totalAmount = 0;
    const itemsToInsert: { productId: string; quantity: number; unitPrice: number }[] = [];

    // 2. Validate stock and calculate total price
    for (const item of items) {
      const productResult = await client.query(
        `SELECT price, stock_quantity FROM products WHERE id = $1 FOR UPDATE`,
        [item.productId]
      );

      const product = productResult.rows[0];

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ID ${item.productId}`);
      }

      const unitPrice = parseFloat(product.price);
      totalAmount += unitPrice * item.quantity;

      itemsToInsert.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
      });
    }

    // 3. Create Order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, status)
       VALUES ($1, $2, 'pending')
       RETURNING id, user_id, total_amount, status, created_at`,
      [userId, totalAmount]
    );

    const order = orderResult.rows[0];

    // 4. Create Order Items & Decrement Stock
    for (const item of itemsToInsert) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.productId, item.quantity, item.unitPrice]
      );

      await client.query(
        `UPDATE products
         SET stock_quantity = stock_quantity - $1
         WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }

    // 5. Commit Transaction
    await client.query('COMMIT');
    return order;
  } catch (err) {
    // Abort all database operations if anything fails
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getUserOrders(userId: string): Promise<OrderRow[]> {
  const query = `
    SELECT id, total_amount, status, created_at
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
}

export async function getOrderDetails(orderId: string, userId: string) {
  const orderQuery = `
    SELECT id, user_id, total_amount, status, created_at
    FROM orders
    WHERE id = $1 AND user_id = $2;
  `;
  const orderResult = await db.query(orderQuery, [orderId, userId]);
  const order = orderResult.rows[0];

  if (!order) return null;

  const itemsQuery = `
    SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price, p.name AS product_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = $1;
  `;
  const itemsResult = await db.query(itemsQuery, [orderId]);

  return {
    ...order,
    items: itemsResult.rows,
  };
}

