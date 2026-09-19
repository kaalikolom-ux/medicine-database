import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || 
    `postgresql://postgres:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD || '')}@db.nxwjkawsnjrebxzdkedl.supabase.co:5432/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    const sqlFilePath = path.resolve('supabase/migrations/001_initial_schema.sql');
    console.log(`Reading migration SQL file: ${sqlFilePath}`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing migration on Supabase...');
    await client.query(sql);
    console.log('Migration executed successfully!');
  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
