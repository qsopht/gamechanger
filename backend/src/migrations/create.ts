import { runMigrations } from './run';
import { closeDatabase } from '../db';

async function main() {
  try {
    await runMigrations();
    await closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Failed to run migrations:', error);
    await closeDatabase();
    process.exit(1);
  }
}

main();
