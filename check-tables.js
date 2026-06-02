const postgres = require('postgres');

const sql = postgres('postgresql://postgres:password@localhost:5432/gamechanger');

async function checkTables() {
  try {
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables in database:');
    tables.forEach(t => console.log('  -', t.table_name));
    await sql.end();
  } catch(e) {
    console.error('Error:', e.message);
    await sql.end();
    process.exit(1);
  }
}

checkTables();
