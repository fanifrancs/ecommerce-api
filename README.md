# E-Commerce API

RESTful E-Commerce API built with Node.js, Express, TypeScript, PostgreSQL (Supabase), and Stripe.

## Features

- **Authentication & Authorization**: Secure JWT-based authentication with role-based access control (RBAC for `customer` and `admin`).
- **Product & Category Management**: Full CRUD support with database constraints and category-based filtering.
- **Persistent Shopping Cart**: Database-backed cart management with atomic `UPSERT` operations (`ON CONFLICT`).
- **ACID Order Processing**: Order fulfillment with row-level locking (`FOR UPDATE`) to prevent race conditions and stock over-selling.
- **Stripe Checkout**: Integrated server-side payment session generation for streamlined client checkout.
- **Automated Database Seeding**: One-command database population script for instant local environment setup.


## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Driver**: `node-postgres` (`pg`)
- **Payments**: Stripe Node SDK
- **Security**: `bcrypt`, `jsonwebtoken`


## Project Structure

```text
src/
├── config/             # Database schema and configs
├── middleware/         # Auth & error handling middlewares
├── modules/            # Domain-driven feature modules
│   ├── auth/           # Auth controllers, routes, and services
│   ├── cart/           # Cart endpoints and persistence
│   ├── categories/     # Category CRUD operations
│   ├── checkout/       # Stripe payment session generation
│   ├── orders/         # Order creation & transactional logic
│   └── products/       # Product catalog logic
├── plugins/            # Database pool setup
├── scripts/            # Database seed script
├── app.ts              # Express application configuration
└── server.ts           # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database or a Supabase instance

### 1. Environment Configuration

Create a `.env` file in the root directory and set the required variables:

```env
PORT=3000
HOST=127.0.0.1
DATABASE_URL=
JWT_SECRET=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```
### 3. Setup the Database

Create your database and add the connection URL in the .env file.

Run the SQL queries in config/db_schema.sql in your SQL editor to create your database tables

### 3. Install Dependencies

```bash
npm install
```

### 4. Seed the Database

Run the automated seed script to wipe, initialize tables, and insert test accounts, categories, and products:

```bash
npm run seed
```

### 5. Run the Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.


## Default Seed Credentials

After running `npm run seed`, use these accounts for testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `AdminPassword123!` |
| **Customer** | `customer@example.com` | `CustomerPassword123!` |


## Key API Endpoints
You can make use of REST client extension to test all the endpoints using the test.http file in the foot directory

### Authentication
- `POST /api/v1/auth/register` — Register a new user
- `POST /api/v1/auth/login` — Login user & receive JWT token

### Categories & Products
- `GET /api/v1/categories` — List all categories
- `GET /api/v1/products` — List all products
- `POST /api/v1/products` — Create a new product *(Admin only)*

### Cart Operations
- `GET /api/v1/cart` — Get active user cart
- `POST /api/v1/cart` — Add item to cart
- `PATCH /api/v1/cart/:id` — Update cart item quantity
- `DELETE /api/v1/cart/:id` — Remove item from cart

### Orders & Checkout
- `POST /api/v1/orders` — Direct order placement (ACID transaction)
- `POST /api/v1/checkout/create-session` — Generate Stripe Checkout URL

## Extras
This Repo serves as a solution to roadmap.sh [Ecommerce API challenge](https://roadmap.sh/projects/ecommerce-api)