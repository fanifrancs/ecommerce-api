import bcrypt from 'bcrypt';
import { db } from '../plugins/db.js';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Clear existing table data (Cascade handles foreign keys)
    console.log('🧹 Clearing existing data...');

    // truncate deletes all rows from the specified tables

    // RESTART IDENTITY Resets the auto-incrementing sequence counters
    // for any columns defined as SERIAL, BIGSERIAL, or IDENTITY
    // (primary key IDs) to start from 1 again.

    // The CASCADE option ensures that any dependent rows in related
    // tables are also deleted.
    await db.query(`
      TRUNCATE TABLE cart_items, order_items, orders, products, categories, users 
      RESTART IDENTITY CASCADE;
    `);

    // 2. Hash default passwords
    // saltRounds determines the computational cost of hashing.
    // A higher value increases security but also increases
    // processing time.
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash('AdminPassword123!', saltRounds);
    const customerPasswordHash = await bcrypt.hash('CustomerPassword123!', saltRounds);

    // 3. Seed Users
    console.log('👤 Seeding users...');
    const adminResult = await db.query(
      `
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, role;
      `,
      ['admin@example.com', adminPasswordHash, 'Store', 'Admin', 'admin']
    );

    const customerResult = await db.query(
      `
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, role;
      `,
      ['customer@example.com', customerPasswordHash, 'Jane', 'Doe', 'customer']
    );

    // set the admin and customer variables to the first entry in the result
    // rows array, which contains the newly created user records
    const admin = adminResult.rows[0];
    const customer = customerResult.rows[0];

    // 4. Seed Categories
    console.log('🏷️ Seeding categories...');
    const categoryResult = await db.query(`
      INSERT INTO categories (name, slug)
      VALUES 
        ('Electronics', 'electronics'),
        ('Apparel', 'apparel'),
        ('Books', 'books')
      RETURNING id, name, slug;
    `);

    // Store the categories in a variable for later use
    // This allows us to reference the category IDs when seeding products
    const categories = categoryResult.rows;
    const electronicsCat = categories.find((c: any) => c.slug === 'electronics');
    const booksCat = categories.find((c: any) => c.slug === 'books');

    // 5. Seed Products
    console.log('📦 Seeding products...');
    const productResult = await db.query(
      `
      INSERT INTO products (category_id, name, description, price, stock_quantity)
      VALUES 
        ($1, 'Wireless Noise-Canceling Headphones', 'High-fidelity audio with active noise cancellation.', 199.99, 25),
        ($1, 'Mechanical Gaming Keyboard', 'Tactile RGB mechanical switches with low latency.', 89.50, 40),
        ($2, 'Designing Data-Intensive Applications', 'O''Reilly guide to reliable, scalable system architectures.', 45.00, 15)
      RETURNING id, name, price, stock_quantity;
      `,
      [electronicsCat.id, booksCat.id]
    );

    const products = productResult.rows;

    // 6. Seed Initial Cart Items for Test Customer
    console.log('🛒 Seeding initial cart items...');
    await db.query(
      `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3);
      `,
      [customer.id, products[0].id, 2]
    );

    console.log('\n✅ Database successfully seeded!');
    console.log('--------------------------------------------------');
    console.log('🔑 Credentials for local testing:');
    console.log(`   Admin:    ${admin.email} / AdminPassword123!`);
    console.log(`   Customer: ${customer.email} / CustomerPassword123!`);
    console.log('--------------------------------------------------');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    process.exit(0);
  }
}

seed();