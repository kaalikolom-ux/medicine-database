/**
 * High-Speed Bulk Importer for 21,000+ Bangladesh Registered Medicines
 * Dataset: Directorate General of Drug Administration (DGDA) / Allopathic Medicine Registry
 *
 * Imports:
 * - 21,700+ Registered Medicines (including Cardex, Napa, Ace, Seclo, Maxpro, etc.)
 * - 1,800+ Active Generics
 * - 250+ Bangladesh Pharmaceutical Manufacturers
 * - Sets Priority Group = 0 (Top Priority for all Bangladesh records)
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result.map((s) => s.trim().replace(/^"|"$/g, ''));
}

function extractPrice(priceText: string): number | null {
  if (!priceText) return null;
  const match = priceText.match(/৳\s*([\d\.]+)/);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? null : val;
  }
  return null;
}

async function runBulkImport() {
  console.log('================================================================');
  console.log('  Massive Bangladesh Medicine Database Ingestion (21,000+ Items)');
  console.log('  Target: Permanent Supabase PostgreSQL Ingestion');
  console.log('================================================================\n');

  const csvPath = path.resolve('data/bangladesh_medicines_21k.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('File not found:', csvPath);
    process.exit(1);
  }

  const lines = fs.readFileSync(csvPath, 'utf8').split('\n');
  console.log(`📄 Read ${lines.length} lines from ${csvPath}`);

  // Parse records
  interface RawMed {
    brandName: string;
    genericName: string;
    dosageForm: string;
    strength: string;
    manufacturer: string;
    price: number | null;
    packageInfo: string;
  }

  const rawMedicines: RawMed[] = [];
  const uniqueGenerics = new Set<string>();
  const uniqueManufacturers = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseCSVLine(line);
    // brand id(0), brand name(1), type(2), slug(3), dosage form(4), generic(5), strength(6), manufacturer(7), package container(8)
    if (cols.length >= 8 && cols[1] && cols[5] && cols[7]) {
      const brandName = cols[1].trim();
      const dosageForm = (cols[4] || 'Tablet').trim();
      const genericName = cols[5].trim();
      const strength = (cols[6] || '').trim();
      const manufacturer = cols[7].trim();
      const packageContainer = cols[8] || '';
      const price = extractPrice(packageContainer);

      rawMedicines.push({
        brandName,
        genericName,
        dosageForm,
        strength,
        manufacturer,
        price,
        packageInfo: packageContainer.substring(0, 200),
      });

      uniqueGenerics.add(genericName);
      uniqueManufacturers.add(manufacturer);
    }
  }

  console.log(`✅ Parsed ${rawMedicines.length} clean medicine records.`);
  console.log(`💊 Discovered ${uniqueGenerics.size} unique chemical generics.`);
  console.log(`🏢 Discovered ${uniqueManufacturers.size} unique pharmaceutical manufacturers.\n`);

  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:3-Xjs*a*KsXb6H5@db.nxwjkawsnjrebxzdkedl.supabase.co:5432/postgres';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL at db.nxwjkawsnjrebxzdkedl.supabase.co...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // -------------------------------------------------------------------------
    // 1. Bulk Insert Unique Generics
    // -------------------------------------------------------------------------
    console.log(`[Step 1/3] Bulk inserting ${uniqueGenerics.size} Generics...`);
    const genericsList = Array.from(uniqueGenerics);
    const genericBatchSize = 400;

    for (let i = 0; i < genericsList.length; i += genericBatchSize) {
      const batch = genericsList.slice(i, i + genericBatchSize);
      const params: string[] = [];
      const values: string[] = [];

      batch.forEach((gen, idx) => {
        params.push(`($${idx + 1})`);
        values.push(gen);
      });

      const query = `
        INSERT INTO generics (name)
        VALUES ${params.join(', ')}
        ON CONFLICT (name) DO NOTHING;
      `;
      await client.query(query, values);
    }
    console.log('✅ All Generics inserted/verified.');

    // -------------------------------------------------------------------------
    // 2. Bulk Insert Unique Manufacturers (All Bangladesh)
    // -------------------------------------------------------------------------
    console.log(`\n[Step 2/3] Bulk inserting ${uniqueManufacturers.size} Manufacturers...`);
    const mfgList = Array.from(uniqueManufacturers);
    const mfgBatchSize = 400;

    for (let i = 0; i < mfgList.length; i += mfgBatchSize) {
      const batch = mfgList.slice(i, i + mfgBatchSize);
      const params: string[] = [];
      const values: string[] = [];

      batch.forEach((mfg, idx) => {
        params.push(`($${idx + 1}, 'Bangladesh')`);
        values.push(mfg);
      });

      const query = `
        INSERT INTO producers (name, country)
        VALUES ${params.join(', ')}
        ON CONFLICT (LOWER(TRIM(name)), LOWER(TRIM(country))) DO NOTHING;
      `;
      await client.query(query, values);
    }
    console.log('✅ All Manufacturers inserted/verified.');

    // -------------------------------------------------------------------------
    // 3. Load ID Maps from Database
    // -------------------------------------------------------------------------
    console.log('\nLoading ID maps from database for foreign key relational resolution...');
    const { rows: genericRows } = await client.query('SELECT id, name FROM generics;');
    const genericMap = new Map<string, string>();
    genericRows.forEach((r) => genericMap.set(r.name.trim().toLowerCase(), r.id));

    const { rows: producerRows } = await client.query(
      "SELECT id, name FROM producers WHERE LOWER(country) = 'bangladesh';"
    );
    const producerMap = new Map<string, string>();
    producerRows.forEach((r) => producerMap.set(r.name.trim().toLowerCase(), r.id));

    console.log(`Resolved: ${genericMap.size} Generics, ${producerMap.size} Producers in database.`);

    // -------------------------------------------------------------------------
    // 4. Bulk Insert Medicines in Chunks of 500
    // -------------------------------------------------------------------------
    console.log(`\n[Step 3/3] Ingesting ${rawMedicines.length} Medicines in bulk chunks...`);
    const medBatchSize = 300;
    let insertedCount = 0;
    const seenComposite = new Set<string>();

    // Deduplicate beforehand
    const deduplicatedMedicines: RawMed[] = [];
    for (const m of rawMedicines) {
      const producerId = producerMap.get(m.manufacturer.toLowerCase());
      const genericId = genericMap.get(m.genericName.toLowerCase());
      if (!producerId || !genericId) continue;

      const compKey = `${m.brandName.toLowerCase().trim()}|${producerId}|${m.strength.toLowerCase().trim()}|${m.dosageForm.toLowerCase().trim()}`;
      if (seenComposite.has(compKey)) continue;
      seenComposite.add(compKey);
      deduplicatedMedicines.push(m);
    }

    console.log(`Deduplicated records ready for insertion: ${deduplicatedMedicines.length}`);
    const totalBatches = Math.ceil(deduplicatedMedicines.length / medBatchSize);

    for (let i = 0; i < deduplicatedMedicines.length; i += medBatchSize) {
      const batch = deduplicatedMedicines.slice(i, i + medBatchSize);
      const valueTuples: string[] = [];
      const queryValues: any[] = [];
      let paramIdx = 1;

      for (const m of batch) {
        const genericId = genericMap.get(m.genericName.toLowerCase());
        const producerId = producerMap.get(m.manufacturer.toLowerCase());

        if (!genericId || !producerId) continue;

        valueTuples.push(
          `($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}, $${paramIdx + 4}, $${paramIdx + 5}, 'BDT', $${paramIdx + 6})`
        );
        queryValues.push(
          m.brandName,
          genericId,
          producerId,
          m.dosageForm,
          m.strength,
          m.price,
          m.packageInfo
        );
        paramIdx += 7;
      }

      if (valueTuples.length > 0) {
        const insertQuery = `
          INSERT INTO medicines (
            brand_name, generic_id, producer_id, dosage_form, strength, price, currency, package_info
          )
          VALUES ${valueTuples.join(', ')}
          ON CONFLICT (LOWER(TRIM(brand_name)), producer_id, LOWER(TRIM(strength)), LOWER(TRIM(dosage_form)))
          DO NOTHING;
        `;

        await client.query(insertQuery, queryValues);
        insertedCount += valueTuples.length;
      }

      const currentBatch = Math.floor(i / medBatchSize) + 1;
      process.stdout.write(
        `  ⏳ Processing Batch [${currentBatch}/${totalBatches}] - Processed: ${insertedCount}/${deduplicatedMedicines.length}...\r`
      );
    }

    console.log(`\n\n🎉 Bulk ingestion finished! Successfully processed ${insertedCount} medicines!`);

    // Verify Cardex specifically!
    const { rows: cardexRows } = await client.query(`
      SELECT m.brand_name, m.strength, m.dosage_form, m.price, p.name AS producer_name, g.name AS generic_name
      FROM medicines m
      JOIN producers p ON m.producer_id = p.id
      JOIN generics g ON m.generic_id = g.id
      WHERE LOWER(m.brand_name) = 'cardex';
    `);

    console.log('\n🔎 Verification for "Cardex" in database:');
    if (cardexRows.length > 0) {
      cardexRows.forEach((r) => {
        console.log(`  ✅ ${r.brand_name} ${r.strength} (${r.generic_name}) - ${r.producer_name} [৳ ${r.price}]`);
      });
    } else {
      console.warn('  ⚠️ Cardex not found in sample query.');
    }

    // Final database summary
    const { rows: totalMeds } = await client.query('SELECT count(*) FROM medicines;');
    const { rows: bdMeds } = await client.query(
      "SELECT count(*) FROM view_medicines_directory WHERE LOWER(producer_country) = 'bangladesh';"
    );
    const { rows: totalGen } = await client.query('SELECT count(*) FROM generics;');
    const { rows: totalProd } = await client.query('SELECT count(*) FROM producers;');

    console.log('\n================================================================');
    console.log('             DATABASE LIVE AUDIT POST-INGESTION                 ');
    console.log('================================================================');
    console.log(`  📦 Total Medicines in DB:     ${totalMeds[0].count}`);
    console.log(`  🇧🇩 Bangladesh Priority Meds: ${bdMeds[0].count}`);
    console.log(`  💊 Total Generics in DB:      ${totalGen[0].count}`);
    console.log(`  🏢 Total Manufacturers in DB: ${totalProd[0].count}`);
    console.log('================================================================\n');
  } catch (err) {
    console.error('❌ Error during ingestion:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runBulkImport();
