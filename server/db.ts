import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure neonConfig for serverless environments
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false;
neonConfig.useSecureWebSocket = true;
neonConfig.poolQueryViaFetch = true;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is missing!");
  console.error("Please set DATABASE_URL in your Render environment variables.");
  console.error("Example: postgres://user:pass@host:5432/database");
  process.exit(1);
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  maxUses: 7500,
  allowExitOnIdle: true,
});

// Add error handling for pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle({ client: pool, schema });

// Keep-alive mechanism to prevent connection timeouts
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    console.log('Keep-alive query failed (this is normal during inactive periods)');
  }
}, 30000); // Every 30 seconds