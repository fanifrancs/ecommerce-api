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
  const query = `SELECT id, name, slug, created_at FROM categories ORDER BY name ASC;`;
  const result = await db.query(query);
  return result.rows;
}

export async function getCategoryById(id: string): Promise<CategoryRow | null> {
  const query = `SELECT id, name, slug, created_at FROM categories WHERE id = $1;`;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}