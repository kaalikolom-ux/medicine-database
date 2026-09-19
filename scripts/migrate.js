import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

async function runMigration() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || '3-Xjs*a*KsXb6H5';
  const connectionString = process.env.DATABASE_URL || 
    `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.nxwjkawsnjrebxzdkedl.supabase.co:5432/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    // Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Record 001_initial_schema.sql as applied if not already recorded
    await client.query(`
      INSERT INTO _migrations (name) VALUES ('001_initial_schema.sql') ON CONFLICT DO NOTHING;
    `);

    const { rows: appliedRows } = await client.query('SELECT name FROM _migrations;');
    const applied = new Set(appliedRows.map(r => r.name));

    const migrationsDir = path.resolve('supabase/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skipping already applied migration: ${file}`);
        continue;
      }

      const sqlFilePath = path.join(migrationsDir, file);
      console.log(`\nExecuting migration: ${file}...`);
      const sql = fs.readFileSync(sqlFilePath, 'utf8');
      
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1);', [file]);
        await client.query('COMMIT');
        console.log(`Successfully applied: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    console.log('\nAll pending migrations completed successfully!');
  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
