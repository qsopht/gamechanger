import { sql, initializeDatabase, closeDatabase } from '../db';
import { migrations } from './schema';

export async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    // Run all migrations in order, skipping 001 if tables already exist
    const migrationKeys = Object.keys(migrations).sort();
    
    for (const key of migrationKeys) {
      console.log(`Running migration: ${key}`);
      const migrationSql = migrations[key as keyof typeof migrations];
      
      // Split by semicolon to execute statements individually
      const statements = migrationSql.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await sql.unsafe(statement);
          } catch (error: any) {
            // Skip "already exists" errors for initial schema migration
            if (key === '001_initial_schema' && error?.code === '42P07') {
              console.log(`⊘ Skipping (already exists): ${statement.substring(0, 50)}...`);
              continue;
            }
            throw error;
          }
        }
      }
      console.log(`✓ Completed: ${key}`);
    }
    
    console.log('✓ All migrations completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    throw error;
  }
}

// Execute migrations when this file is run directly
if (require.main === module) {
  initializeDatabase()
    .then(() => runMigrations())
    .then(async () => {
      await closeDatabase();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('Fatal error:', error);
      await closeDatabase();
      process.exit(1);
    });
}

