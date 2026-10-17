import { db } from '../../plugins/db.js';

export interface ProductRow {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: string;
  stock_quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductInput {
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
}

export async function createProduct(input: CreateProductInput): Promise<ProductRow> {
  const query = `
    INSERT INTO products (category_id, name, description, price, stock_quantity)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, category_id, name, description, price, stock_quantity, created_at, updated_at;
  `;
  const values = [
    input.categoryId || null,
    input.name,
    input.description || null,
    input.price,
    input.stockQuantity,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
}

export async function getAllProducts(categoryId?: string): Promise<ProductRow[]> {
  let query = `
    SELECT p.id, p.category_id, p.name, p.description, p.price, p.stock_quantity, p.created_at, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `;
  const values: any[] = [];

  if (categoryId) {
    query += ` WHERE p.category_id = $1`;
    values.push(categoryId);
  }

  query += ` ORDER BY p.created_at DESC;`;

  const result = await db.query(query, values);
  return result.rows;
}


export async function getProductById(id: string): Promise<ProductRow | null> {
  const query = `
    SELECT p.id, p.category_id, p.name, p.description, p.price, p.stock_quantity, p.created_at, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = $1;
  `;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}
