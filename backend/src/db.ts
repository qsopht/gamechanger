import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

// Only load .env if it exists (local development only)
const envPath = path.resolve(process.cwd(), '.env');
try {
  const fs = require('fs');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
} catch (e) {
  // Ignore errors when checking for .env file
}

// Get connection string - Railway sets DATABASE_URL in production
const connectionString = process.env.DATABASE_URL;

// Log for debugging
if (process.env.NODE_ENV !== 'production') {
  console.log('Database configuration:');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  DATABASE_URL exists:', !!connectionString);
}

// Create postgres connection
const pgOptions: any = {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  socket: { family: 4 }, // Force IPv4 (::1 is IPv6, causing issues)
};

// Enable SSL for Railway (detect by connection string or NODE_ENV)
if (connectionString) {
  if (connectionString.includes('.railway.') || process.env.NODE_ENV === 'production') {
    pgOptions.ssl = { rejectUnauthorized: false };
  }
}

export const sql = postgres(
  connectionString || 'postgresql://user:password@localhost:5432/gamechanger',
  pgOptions
);

export async function initializeDatabase() {
  try {
    console.log('Checking database connection...');
    await sql`SELECT 1`;
    console.log('✓ Database connection successful');
  } catch (error) {
    console.warn('⚠ Database connection unavailable on startup');
    console.warn('The API will start but database features will not work until PostgreSQL is available.');
    console.warn('Error details:', error);
    // Don't throw - allow server to start without database
  }
}

export async function closeDatabase() {
  await sql.end();
}
