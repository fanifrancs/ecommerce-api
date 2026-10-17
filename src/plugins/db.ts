// Imports the node-postgres library (pg), which is the
// standard PostgreSQL driver for Node.js applications.
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Extracts the Pool class from the imported pg object using
// object destructuring. A connection pool manages multiple
// reusable database connections instead of opening and
// closing a new connection for every single request.
// same as: const Pool = pg.Pool;
const { Pool } = pg;

// creates and exports a new connection pool instance as db
// so other files (like query models) can import and use it
// to run queries.
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false,
  },
});

// max: 10: Sets the maximum number of simultaneous clients/connections
// allowed in the pool. Once 10 connections are active, additional requests
// must wait for a connection to free up.

// idleTimeoutMillis: 30000: Closes any idle connection that sits unused
// in the pool for more than 30 seconds (30,000 milliseconds) to free
// up database server resources.

// connectionTimeoutMillis: 10000: Tells the pool to throw an error if
// it takes longer than 10 seconds to establish a brand new connection
// to the database.

// ssl: { rejectUnauthorized: false }: Configures Secure Sockets Layer
// (SSL) encryption for database communication. Setting
// rejectUnauthorized: false allows connections to managed cloud
// databases (like Render, Neon, or Supabase) that use self-signed
// SSL certificates.

export async function connectDB() {
  try {
    const client = await db.connect();
    console.log('Successfully connected to PostgreSQL database');
    // client.release() is a crucial step! It returns the test client
    // back to the connection pool so it can be reused by incoming
    // HTTP requests. If you forget to release it, you leak pool
    // connections.
    client.release();
  } catch (err) {
    console.error('Failed to connect to PostgreSQL database:', err);
    // exit code 1 indicates that the program terminated due to an error
    // exit code 0 indicates that the program terminated successfully
    process.exit(1);
  }
}
