import postgres from 'postgres';
import dotenv from 'dotenv';

// Load from .env file in development (won't exist in production)
dotenv.config();

// Always check environment variables directly (they're set by Railway)
const connectionString = process.env.DATABASE_URL;
console.log('DATABASE_URL available:', !!connectionString);

if (!connectionString) {
  console.warn('⚠️  DATABASE_URL not set - will use fallback');
}

export const sql = postgres(connectionString || 'postgresql://user:password@localhost:5432/gamechanger', {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  // Always require SSL in production/railway
  ssl: process.env.NODE_ENV === 'production' || connectionString?.includes('.railway.') ? {
    rejectUnauthorized: false
  } : false,
});

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
