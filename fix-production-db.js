import pkg from 'pg';
const { Pool } = pkg;

// Your production database URL
const DATABASE_URL = 'postgresql://vetopapa:npg_DS6JcFVK8PCo@ep-ancient-mouse-a86ymv27-pooler.eastus2.azure.neon.tech/neondb?sslmode=require';

async function fixProductionDatabase() {
  const pool = new Pool({ 
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Connecting to production database...');
    
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Connected to production database');
    
    // Check current schema
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Current users table schema:');
    console.table(result.rows);
    
    // Drop and recreate tables with correct schema
    console.log('🔄 Recreating tables with correct schema...');
    
    await pool.query('DROP TABLE IF EXISTS login_logs CASCADE');
    await pool.query('DROP TABLE IF EXISTS orders CASCADE');
    await pool.query('DROP TABLE IF EXISTS payments CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    
    // Create users table
    await pool.query(`
      CREATE TABLE users (
        id serial PRIMARY KEY,
        uid varchar(20) NOT NULL UNIQUE,
        instagram_username text NOT NULL UNIQUE,
        password text NOT NULL,
        wallet_balance numeric(10, 2) DEFAULT '0' NOT NULL,
        bonus_claimed boolean DEFAULT false NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `);
    
    // Create orders table
    await pool.query(`
      CREATE TABLE orders (
        id serial PRIMARY KEY,
        order_id varchar(50) NOT NULL UNIQUE,
        user_id integer NOT NULL REFERENCES users(id),
        service_name text NOT NULL,
        instagram_username text NOT NULL,
        quantity integer NOT NULL,
        price numeric(10, 2) NOT NULL,
        status varchar(20) DEFAULT 'Processing' NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `);
    
    // Create payments table
    await pool.query(`
      CREATE TABLE payments (
        id serial PRIMARY KEY,
        user_id integer NOT NULL REFERENCES users(id),
        amount numeric(10, 2) NOT NULL,
        utr_number text NOT NULL,
        payment_method text NOT NULL,
        status varchar(20) DEFAULT 'Pending' NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `);
    
    // Create services table (if not exists)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id serial PRIMARY KEY,
        name text NOT NULL,
        category text NOT NULL,
        rate numeric(10, 2) NOT NULL,
        min_order integer NOT NULL,
        max_order integer NOT NULL,
        delivery_time text NOT NULL,
        active boolean DEFAULT true NOT NULL
      )
    `);
    
    // Create login_logs table
    await pool.query(`
      CREATE TABLE login_logs (
        id serial PRIMARY KEY,
        user_id integer NOT NULL REFERENCES users(id),
        instagram_username text NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `);
    
    console.log('✅ All tables recreated successfully');
    
    // Verify the new schema
    const newResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 New users table schema:');
    console.table(newResult.rows);
    
  } catch (error) {
    console.error('❌ Error fixing production database:', error);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

fixProductionDatabase();