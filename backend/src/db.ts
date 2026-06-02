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
    console.error('✗ Database connection failed.');
    console.error('Please start PostgreSQL and ensure it is running on localhost:5432');
    console.error('');
    console.error('Options:');
    console.error('1. Install PostgreSQL: https://www.postgresql.org/download/windows/');
    console.error('2. Use Docker: docker run --name gamechanger-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=gamechanger -p 5432:5432 -d postgres:15');
    console.error('3. Update DATABASE_URL in .env with your PostgreSQL connection string');
    console.error('');
    console.error('Error details:', error);
    throw error;
  }
}

export async function closeDatabase() {
  await sql.end();
}
