import { db } from '../../plugins/db.js';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: Date;
}

export async function createUser(
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string
): Promise<UserRow> {
  const query = `
    INSERT INTO users (email, password_hash, first_name, last_name)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, first_name, last_name, role, created_at;
  `;
  const values = [email, passwordHash, firstName, lastName];
  const result = await db.query(query, values);
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const query = `SELECT * FROM users WHERE email = $1;`;
  const result = await db.query(query, [email]);
  return result.rows[0] || null;
}