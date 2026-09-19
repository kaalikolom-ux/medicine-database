import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

async function ingestData() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || '3-Xjs*a*KsXb6H5';
  const connectionString = process.env.DATABASE_URL || 
    `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.nxwjkawsnjrebxzdkedl.supabase.co:5432/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const inputFilePath = process.argv[2] 
    ? path.resolve(process.argv[2]) 
    : path.resolve('data/seed_medicines_expanded.json');

  if (!fs.existsSync(inputFilePath)) {
    console.error(`Error: File not found at ${inputFilePath}`);
    process.exit(1);
  }

  console.log(`Reading dataset from: ${inputFilePath}`);
  const rawData = fs.readFileSync(inputFilePath, 'utf8');
  let items = [];

  try {
    items = JSON.parse(rawData);
  } catch (err) {
    console.error('Failed to parse JSON file:', err.message);
    process.exit(1);
  }

  console.log(`Found ${items.length} medicines in the dataset. Connecting to Supabase...`);

  await client.connect();
  console.log('Connected to Supabase PostgreSQL database.');

  let insertedGenerics = 0;
  let insertedProducers = 0;
  let insertedMedicines = 0;
  let updatedMedicines = 0;

  try {
    for (const item of items) {
      // 1. Generic Upsert
      let genericId;
      const genericQuery = `
        INSERT INTO generics (name, therapeutic_class, indications, dosage_and_administration, side_effects, precautions)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (name) DO UPDATE SET
          therapeutic_class = COALESCE(EXCLUDED.therapeutic_class, generics.therapeutic_class),
          indications = COALESCE(EXCLUDED.indications, generics.indications),
          dosage_and_administration = COALESCE(EXCLUDED.dosage_and_administration, generics.dosage_and_administration),
          side_effects = COALESCE(EXCLUDED.side_effects, generics.side_effects),
          precautions = COALESCE(EXCLUDED.precautions, generics.precautions),
          updated_at = NOW()
        RETURNING id;
      `;
      const genericRes = await client.query(genericQuery, [
        item.generic.name.trim(),
        item.generic.therapeutic_class?.trim() || null,
        item.generic.indications?.trim() || null,
        item.generic.dosage_and_administration?.trim() || null,
        item.generic.side_effects?.trim() || null,
        item.generic.precautions?.trim() || null,
      ]);
      genericId = genericRes.rows[0].id;
      insertedGenerics++;

      // 2. Producer Upsert
      let producerId;
      const findProducerRes = await client.query(
        'SELECT id FROM producers WHERE LOWER(name) = LOWER($1) AND LOWER(country) = LOWER($2)',
        [item.producer.name.trim(), item.producer.country.trim()]
      );

      if (findProducerRes.rows.length > 0) {
        producerId = findProducerRes.rows[0].id;
        if (item.producer.website) {
          await client.query(
            'UPDATE producers SET website = $1, updated_at = NOW() WHERE id = $2',
            [item.producer.website.trim(), producerId]
          );
        }
      } else {
        const insertProducerRes = await client.query(
          `INSERT INTO producers (name, country, website) VALUES ($1, $2, $3) RETURNING id;`,
          [item.producer.name.trim(), item.producer.country.trim(), item.producer.website?.trim() || null]
        );
        producerId = insertProducerRes.rows[0].id;
        insertedProducers++;
      }

      // 3. Medicine Upsert
      const findMedRes = await client.query(
        `SELECT id FROM medicines 
         WHERE LOWER(brand_name) = LOWER($1) 
           AND producer_id = $2 
           AND LOWER(strength) = LOWER($3) 
           AND LOWER(dosage_form) = LOWER($4)`,
        [item.brand_name.trim(), producerId, item.strength.trim(), item.dosage_form.trim()]
      );

      if (findMedRes.rows.length > 0) {
        const medId = findMedRes.rows[0].id;
        await client.query(
          `UPDATE medicines 
           SET price = $1, currency = $2, package_info = $3, generic_id = $4, updated_at = NOW() 
           WHERE id = $5`,
          [item.price ?? null, item.currency || 'BDT', item.package_info || null, genericId, medId]
        );
        updatedMedicines++;
      } else {
        await client.query(
          `INSERT INTO medicines (brand_name, generic_id, producer_id, dosage_form, strength, price, currency, package_info)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            item.brand_name.trim(),
            genericId,
            producerId,
            item.dosage_form.trim(),
            item.strength.trim(),
            item.price ?? null,
            item.currency || 'BDT',
            item.package_info?.trim() || null,
          ]
        );
        insertedMedicines++;
      }
    }

    console.log('\n--- Ingestion Summary ---');
    console.log(`Total Records Processed: ${items.length}`);
    console.log(`Generics Processed:      ${insertedGenerics}`);
    console.log(`Producers Managed:       ${insertedProducers}`);
    console.log(`New Medicines Inserted:  ${insertedMedicines}`);
    console.log(`Medicines Updated:       ${updatedMedicines}`);

    // Verify current counts
    const countMeds = await client.query('SELECT COUNT(*) FROM medicines WHERE is_active = TRUE;');
    const countGenerics = await client.query('SELECT COUNT(*) FROM generics;');
    const countProducers = await client.query('SELECT COUNT(*) FROM producers;');

    console.log('\n--- Live Database Totals ---');
    console.log(`Active Medicines in DB:  ${countMeds.rows[0].count}`);
    console.log(`Generics in DB:          ${countGenerics.rows[0].count}`);
    console.log(`Producers in DB:         ${countProducers.rows[0].count}`);

  } catch (err) {
    console.error('Error during ingestion:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

ingestData();
