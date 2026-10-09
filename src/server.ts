import dotenv from 'dotenv';
dotenv.config();

import { buildApp } from './app.js';
import { connectDB } from './plugins/db.js';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';

async function main() {
  // 1. Connect to PostgreSQL
  await connectDB();

  // 2. Build Express instance
  const app = buildApp();

  // 3. Start listening
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

main();