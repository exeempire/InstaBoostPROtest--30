import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = 'postgresql://vetopapa:npg_DS6JcFVK8PCo@ep-ancient-mouse-a86ymv27-pooler.eastus2.azure.neon.tech/neondb?sslmode=require';

async function checkProductionSchema() {
  const pool = new Pool({ 
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Checking production database schema...');
    
    // List all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Available tables:');
    console.table(tables.rows);
    
    // Check users table structure
    if (tables.rows.some(row => row.table_name === 'users')) {
      const userColumns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Users table schema:');
      console.table(userColumns.rows);
    }
    
    // Try to add missing columns instead of dropping tables
    console.log('🔄 Attempting to add missing columns...');
    
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS uid varchar(20) UNIQUE');
      console.log('✅ Added uid column');
    } catch (e) {
      console.log('⚠️ uid column issue:', e.message);
    }
    
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram_username text UNIQUE');
      console.log('✅ Added instagram_username column');
    } catch (e) {
      console.log('⚠️ instagram_username column issue:', e.message);
    }
    
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance numeric(10, 2) DEFAULT 0');
      console.log('✅ Added wallet_balance column');
    } catch (e) {
      console.log('⚠️ wallet_balance column issue:', e.message);
    }
    
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS bonus_claimed boolean DEFAULT false');
      console.log('✅ Added bonus_claimed column');
    } catch (e) {
      console.log('⚠️ bonus_claimed column issue:', e.message);
    }
    
    // Verify final schema
    const finalColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Final users table schema:');
    console.table(finalColumns.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkProductionSchema();