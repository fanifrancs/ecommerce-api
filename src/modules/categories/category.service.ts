import { db } from '../../plugins/db.js';

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
}

export async function createCategory(name: string, slug: string): Promise<CategoryRow> {
  const query = `
    INSERT INTO categories (name, slug)
    VALUES ($1, $2)
    RETURNING id, name, slug, created_at;
  `;
  const result = await db.query(query, [name, slug]);
  return result.rows[0];
}

export async function getAllCategories(): Promise<CategoryRow[]> {
  /**
 * Fetches all records from the 'categories' table, selecting only the id, name, 
 * slug, and created_at columns, and returns them sorted alphabetically (A to Z) by name.
 */
  const query = `SELECT id, name, slug, created_at FROM categories ORDER BY name ASC;`;
  const result = await db.query(query);
  return result.rows;
}

export async function getCategoryById(id: string): Promise<CategoryRow | null> {
  /**
 * Fetches a single category by its unique ID using a parameterized query. 
 * Returns the category object if found, or null if no matching record exists.
 */
  const query = `SELECT id, name, slug, created_at FROM categories WHERE id = $1;`;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}