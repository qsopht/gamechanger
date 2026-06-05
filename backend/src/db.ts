import postgres from 'postgres';

// Railway-only mode: DATABASE_URL must be provided
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

console.log('Database URL found, configuring postgres connection...');

// Create postgres connection with proper options for Railway
const pgOptions: any = {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  ssl: { rejectUnauthorized: false }, // Railway requires SSL
};

export const sql = postgres(connectionString, pgOptions);

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
