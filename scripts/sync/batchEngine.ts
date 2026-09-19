import pg from 'pg';
import type { NormalizedMedicine, SyncStats } from './types';

const { Client } = pg;

export interface BatchEngineOptions {
  batchSize?: number;
  dbPassword?: string;
  connectionString?: string;
  onProgress?: (processed: number, total: number, currentItem: NormalizedMedicine) => void;
}

export async function runBatchIngestion(
  medicines: NormalizedMedicine[],
  options: BatchEngineOptions = {}
): Promise<SyncStats> {
  const startTime = Date.now();
  const batchSize = options.batchSize || 25;

  const dbPassword = options.dbPassword || process.env.SUPABASE_DB_PASSWORD || '3-Xjs*a*KsXb6H5';
  const connectionString = options.connectionString || process.env.DATABASE_URL ||
    `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.nxwjkawsnjrebxzdkedl.supabase.co:5432/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const stats: SyncStats = {
    totalProcessed: 0,
    bangladeshCount: 0,
    internationalCount: 0,
    successfulUpserts: 0,
    failedUpserts: 0,
    errors: [],
    durationSeconds: 0,
  };

  console.log(`\nConnecting to Supabase database for batch ingestion...`);
  await client.connect();
  console.log(`Connected. Preparing ${medicines.length} medicine records.`);

  // 1. Bangladesh Priority Partitioning:
  // Bangladesh medicines are queued first, followed by others alphabetically by country
  const sortedMedicines = [...medicines].sort((a, b) => {
    const aIsBd = a.producer_country.toLowerCase() === 'bangladesh' ? 0 : 1;
    const bIsBd = b.producer_country.toLowerCase() === 'bangladesh' ? 0 : 1;
    if (aIsBd !== bIsBd) return aIsBd - bIsBd;

    const countryCmp = a.producer_country.localeCompare(b.producer_country);
    if (countryCmp !== 0) return countryCmp;

    return a.brand_name.localeCompare(b.brand_name);
  });

  // Calculate country breakdown
  for (const m of sortedMedicines) {
    if (m.producer_country.toLowerCase() === 'bangladesh') {
      stats.bangladeshCount++;
    } else {
      stats.internationalCount++;
    }
  }

  console.log(`[Queue Analysis] 🇧🇩 Bangladesh: ${stats.bangladeshCount} | 🌐 International: ${stats.internationalCount}`);

  // 2. Process in Batches
  const total = sortedMedicines.length;
  for (let i = 0; i < total; i += batchSize) {
    const batch = sortedMedicines.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(total / batchSize);

    console.log(`\nProcessing Batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);

    for (const item of batch) {
      try {
        const query = `
          SELECT upsert_medicine_record(
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
          ) AS medicine_id;
        `;

        await client.query(query, [
          item.brand_name,
          item.generic_name,
          item.producer_name,
          item.producer_country,
          item.dosage_form,
          item.strength,
          item.price ?? null,
          item.currency || 'BDT',
          item.package_info || null,
          item.therapeutic_class || null,
          item.indications || null,
          item.dosage_and_administration || null,
          item.side_effects || null,
          item.precautions || null,
          item.producer_website || null,
        ]);

        stats.successfulUpserts++;
      } catch (err: any) {
        stats.failedUpserts++;
        stats.errors.push({
          item: `${item.brand_name} (${item.producer_name})`,
          error: err.message,
        });
        console.error(`  [!] Error upserting ${item.brand_name}:`, err.message);
      } finally {
        stats.totalProcessed++;
        if (options.onProgress) {
          options.onProgress(stats.totalProcessed, total, item);
        }
      }
    }

    console.log(`Batch ${batchNumber} complete. (Progress: ${stats.totalProcessed}/${total})`);
  }

  stats.durationSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
  await client.end();

  return stats;
}
