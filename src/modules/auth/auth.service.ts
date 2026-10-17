// Imports the centralized PostgreSQL database client/pool
// instance (db) configured with the pg library from the
// plugin directory.
import { db } from '../../plugins/db.js';

// Defines a TypeScript type matching the structure of
// a row returned from your users SQL table.
export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: Date;
}

// Exports an asynchronous function that takes user
// registration details and resolves to a promise
// returning a single UserRow
export async function createUser(
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string
): Promise<UserRow> {

  // $1, $2, $3, $4 are parametrized positional placeholders.
  // Using parameterized queries prevents SQL Injection.

  // RETURNING id, email, ...is a PostgreSQL feature that
  // instructs the database to immediately return generated
  // column values (like default UUID id, default role, and
  // created_at timestamp) from the inserted row without
  // needing a second SELECT query.

  // [email, passwordHash...] maps the function arguments
  // directly to positional parameters $1 through $4.
  const query = `
    INSERT INTO users (email, password_hash, first_name, last_name)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, first_name, last_name, role, created_at;
  `;
  const values = [email, passwordHash, firstName, lastName];
  const result = await db.query(query, values);
  return result.rows[0];
}

// When you run a query using the pg (node-postgres) library
// in Node.js, the database driver resolves the promise with
// a QueryResult object that looks like this:

// {
//   // The SQL command that was executed
//   command: 'INSERT',

//   // The number of rows affected or returned by the query
//   rowCount: 1,

//   // Internal PostgreSQL object ID (largely historical/deprecated, usually 0 for modern inserts)
//   oid: 0,

//   // An array containing the actual data rows returned by your RETURNING clause
//   rows: [
//     {
//       id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
//       email: 'fanikufran6@gmail.com',
//       first_name: 'Francis',
//       last_name: 'Faniku',
//       role: 'admin',
//       created_at: 2026-10-17T07:39:00.000Z // JavaScript Date object mapped from Postgres timestamp
//     }
//   ],

//   // Metadata about the columns returned in the result set
//   fields: [
//     {
//       name: 'id',
//       tableID: 16425,
//       columnID: 1,
//       dataTypeID: 2950, // Represents UUID type in Postgres internal OIDs
//       dataTypeSize: 16,
//       dataTypeModifier: -1,
//       format: 'text'
//     },
//     {
//       name: 'email',
//       tableID: 16425,
//       columnID: 2,
//       dataTypeID: 1043, // Represents VARCHAR
//       dataTypeSize: -1,
//       dataTypeModifier: 259,
//       format: 'text'
//     },
//     // ... metadata objects continue for first_name, last_name, role, and created_at
//   ]
// }

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const query = `SELECT * FROM users WHERE email = $1;`;
  const result = await db.query(query, [email]);
  // Because a SELECT query returns an empty array [] when nothing is found,
  // result.rows[0] would evaluate to undefined. Adding || null ensures the
  // TypeScript function cleanly returns null instead of undefined,
  // matching the Promise<UserRow null |> return type
  return result.rows[0] || null;
}
