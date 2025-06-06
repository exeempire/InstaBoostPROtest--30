#!/usr/bin/env node
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const db = drizzle({ client: pool });

async function migrate() {
  try {
    console.log('🔄 Running database migration...');
    
    // Test connection
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "uid" varchar(255) NOT NULL,
        "instagram_username" varchar(255) NOT NULL,
        "password" varchar(255) NOT NULL,
        "wallet_balance" numeric(10, 2) DEFAULT '0' NOT NULL,
        "bonus_claimed" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "users_uid_unique" UNIQUE("uid"),
        CONSTRAINT "users_instagram_username_unique" UNIQUE("instagram_username")
      )
    `);
    console.log('✅ Users table ready');

    // Create orders table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "order_id" varchar(255) NOT NULL,
        "service_name" varchar(255) NOT NULL,
        "instagram_username" varchar(255) NOT NULL,
        "quantity" integer NOT NULL,
        "price" numeric(10, 2) NOT NULL,
        "status" varchar(255) DEFAULT 'pending' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")
      )
    `);
    console.log('✅ Orders table ready');

    // Create payments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "amount" numeric(10, 2) NOT NULL,
        "utr_number" varchar(255) NOT NULL,
        "payment_method" varchar(255) NOT NULL,
        "status" varchar(255) DEFAULT 'pending' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "payments_utr_number_unique" UNIQUE("utr_number")
      )
    `);
    console.log('✅ Payments table ready');

    // Create services table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "services" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "category" varchar(255) NOT NULL,
        "rate" numeric(10, 2) NOT NULL,
        "min_order" integer NOT NULL,
        "max_order" integer NOT NULL,
        "delivery_time" varchar(255) NOT NULL,
        "active" boolean DEFAULT true NOT NULL
      )
    `);
    console.log('✅ Services table ready');

    // Create login logs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "login_logs" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "instagram_username" varchar(255) NOT NULL,
        "login_count" integer NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    console.log('✅ Login logs table ready');

    // Add foreign key constraints
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'orders_user_id_users_id_fk') THEN
          ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" 
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
        END IF;
      END $$
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'payments_user_id_users_id_fk') THEN
          ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" 
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
        END IF;
      END $$
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'login_logs_user_id_users_id_fk') THEN
          ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_users_id_fk" 
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
        END IF;
      END $$
    `);
    console.log('✅ Foreign key constraints ready');

    // Initialize services data
    const servicesCount = await db.execute(sql`SELECT COUNT(*) FROM services`);
    const count = servicesCount.rows[0].count;
    
    if (parseInt(count) === 0) {
      await db.execute(sql`
        INSERT INTO services (name, category, rate, min_order, max_order, delivery_time, active) VALUES
        ('Instagram Followers', 'Instagram', 0.50, 100, 10000, '24-48 hours', true),
        ('Instagram Likes', 'Instagram', 0.25, 50, 5000, '1-6 hours', true),
        ('Instagram Views', 'Instagram', 0.15, 100, 50000, '1-12 hours', true),
        ('Instagram Comments', 'Instagram', 2.00, 10, 1000, '12-24 hours', true),
        ('Instagram Story Views', 'Instagram', 0.30, 100, 10000, '1-6 hours', true)
      `);
      console.log('✅ Services data initialized');
    } else {
      console.log('✅ Services data already exists');
    }

    console.log('🎉 Database migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();