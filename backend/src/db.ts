import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/gamechanger';

export const sql = postgres(connectionString, {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
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
