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


/* 
  This function handles order creation using a dedicated database connection 
  obtained via db.connect() rather than a standard pooled query. A dedicated 
  client is required because database transactions must occur on a single, 
  uninterrupted session to maintain stateful commands like BEGIN, COMMIT, 
  and ROLLBACK. It also ensures row locks created with FOR UPDATE persist 
  properly across multiple sequential queries without switching connections.

  Inside a try block, it initiates the transaction with 'BEGIN' and sets up 
  a loop to validate every item. For each product, it queries the database 
  with 'FOR UPDATE' to lock that specific row, preventing race conditions 
  where two users buy the last item at the exact same time. It verifies 
  that the product exists and has sufficient stock, calculates the unit 
  price, accumulates the total order amount, and pushes validated data 
  into an itemsToInsert array.

  Next, it inserts a master record into the orders table with a pending 
  status and the total amount, using RETURNING to immediately capture the 
  new order ID. It then loops through the validated items to record them 
  in the order_items table and concurrently decrements the purchased 
  quantity from the products table stock_quantity column.

  If all steps complete successfully, it calls 'COMMIT' to permanently 
  save the changes. If any error occurs anywhere in the process, the 
  catch block executes 'ROLLBACK' to undo all database modifications, 
  ensuring data integrity. Finally, the client.release() method in the 
  finally block safely returns the dedicated database client back to the 
  pool to prevent connection leaks, regardless of success or failure.
*/

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

/* 
  This function fetches detailed information for a specific order by taking
  an orderId and userId as parameters. First, it queries the orders table
  to verify that the order exists and strictly belongs to that user,
  returning null if unauthorized or not found for security purposes. If the
  order is valid, it runs a second query on the order_items table, joining
  it with the products table to retrieve line items along with their product
  names. Finally, it constructs and returns a single nested response object
  using the JavaScript spread operator (...order) to copy all order
  properties to the root level, while simultaneously attaching the items
  array containing all fetched itemsResult.rows, creating a clean and unified
  API payload.
*/
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
