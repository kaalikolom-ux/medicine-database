import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const client = new pg.Client({
    host: 'db.nxwjkawsnjrebxzdkedl.supabase.co',
    port: 5432,
    user: 'postgres',
    password: '3-Xjs*a*KsXb6H5',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL successfully.');

    const sqlPath = path.resolve(__dirname, '../supabase/migrations/004_multi_token_search.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Applying migration 004_multi_token_search.sql...');
    await client.query(sql);
    console.log('Migration 004 applied successfully!\n');

    console.log('--- VERIFICATION TESTS ---');
    // Test 1: 'fusid 40 plus'
    const r1 = await client.query(`SELECT brand_name, strength, generic_name, producer_name FROM search_medicines('fusid 40 plus', NULL, NULL, NULL, NULL, NULL, NULL, 5, 0);`);
    console.log(`Test 1: 'fusid 40 plus' -> found ${r1.rows.length} row(s):`, r1.rows);

    // Test 2: 'fusid 40'
    const r2 = await client.query(`SELECT brand_name, strength, generic_name FROM search_medicines('fusid 40', NULL, NULL, NULL, NULL, NULL, NULL, 5, 0);`);
    console.log(`Test 2: 'fusid 40' -> found ${r2.rows.length} row(s):`, r2.rows);

    // Test 3: 'napa 500'
    const r3 = await client.query(`SELECT brand_name, strength, generic_name FROM search_medicines('napa 500', NULL, NULL, NULL, NULL, NULL, NULL, 5, 0);`);
    console.log(`Test 3: 'napa 500' -> found ${r3.rows.length} row(s):`, r3.rows);

    // Test 4: 'cardex 6.25'
    const r4 = await client.query(`SELECT brand_name, strength, generic_name FROM search_medicines('cardex 6.25', NULL, NULL, NULL, NULL, NULL, NULL, 5, 0);`);
    console.log(`Test 4: 'cardex 6.25' -> found ${r4.rows.length} row(s):`, r4.rows);

    await client.end();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
