import fs from 'fs';
import path from 'path';
import { parseDgdaDataset } from './adapters/dgdaAdapter';
import { parseOpenFdaDataset } from './adapters/openFdaAdapter';
import { runBatchIngestion } from './batchEngine';
import type { NormalizedMedicine } from './types';

// Parse command-line flags
function parseArgs() {
  const args = process.argv.slice(2);
  const options: {
    source: 'dgda' | 'openfda' | 'all';
    file?: string;
    batchSize: number;
  } = {
    source: 'all',
    batchSize: 25,
  };

  for (const arg of args) {
    if (arg.startsWith('--source=')) {
      const src = arg.split('=')[1].toLowerCase();
      if (src === 'dgda' || src === 'openfda' || src === 'all') {
        options.source = src;
      }
    } else if (arg.startsWith('--file=')) {
      options.file = arg.split('=')[1];
    } else if (arg.startsWith('--batch-size=')) {
      const size = parseInt(arg.split('=')[1], 10);
      if (!isNaN(size) && size > 0) {
        options.batchSize = size;
      }
    }
  }

  return options;
}

async function main() {
  console.log('================================================================');
  console.log('  Worldwide Medicine Database: Multi-Source Data Sync Engine');
  console.log('  Rule: Bangladesh Pharmaceuticals First, Deduplicated Upsert');
  console.log('================================================================\n');

  const options = parseArgs();
  console.log(`Configuration: Source = [${options.source.toUpperCase()}], Batch Size = [${options.batchSize}]`);

  const queue: NormalizedMedicine[] = [];

  // 1. Process DGDA (Bangladesh Data Source)
  if (options.source === 'dgda' || options.source === 'all') {
    const filePath = (options.source === 'dgda' && options.file)
      ? path.resolve(options.file)
      : path.resolve('data/dgda_sample_bd.json');

    if (fs.existsSync(filePath)) {
      console.log(`\n[Adapter: DGDA] Loading Bangladesh data from: ${filePath}`);
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const normalized = parseDgdaDataset(Array.isArray(raw) ? raw : [raw]);
      console.log(`[Adapter: DGDA] Normalized ${normalized.length} Bangladesh records.`);
      queue.push(...normalized);
    } else {
      console.warn(`[Adapter: DGDA] Warning: File not found at ${filePath}`);
    }
  }

  // 2. Process openFDA / WHO ATC (Global Data Source)
  if (options.source === 'openfda' || options.source === 'all') {
    const filePath = (options.source === 'openfda' && options.file)
      ? path.resolve(options.file)
      : path.resolve('data/openfda_sample_global.json');

    if (fs.existsSync(filePath)) {
      console.log(`\n[Adapter: openFDA] Loading global data from: ${filePath}`);
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const normalized = parseOpenFdaDataset(Array.isArray(raw) ? raw : [raw]);
      console.log(`[Adapter: openFDA] Normalized ${normalized.length} global records.`);
      queue.push(...normalized);
    } else {
      console.warn(`[Adapter: openFDA] Warning: File not found at ${filePath}`);
    }
  }

  if (queue.length === 0) {
    console.error('\nError: No medicine records found to sync.');
    process.exit(1);
  }

  // 3. Execute Batch Ingestion with Bangladesh Priority
  console.log(`\nStarting ingestion pipeline for ${queue.length} total medicines...`);
  const stats = await runBatchIngestion(queue, {
    batchSize: options.batchSize,
  });

  // 4. Output Final Ingestion Summary
  console.log('\n================================================================');
  console.log('                 DATA SYNC COMPLETED SUCCESSFULLY               ');
  console.log('================================================================');
  console.log(`Total Records Processed:     ${stats.totalProcessed}`);
  console.log(`🇧🇩 Bangladesh Records:       ${stats.bangladeshCount}`);
  console.log(`🌐 International Records:     ${stats.internationalCount}`);
  console.log(`Successful Upserts:          ${stats.successfulUpserts}`);
  console.log(`Failed Upserts:              ${stats.failedUpserts}`);
  console.log(`Execution Duration:          ${stats.durationSeconds}s`);
  console.log('================================================================\n');

  if (stats.errors.length > 0) {
    console.warn(`Encountered ${stats.errors.length} non-fatal error(s):`);
    stats.errors.forEach(e => console.warn(` - ${e.item}: ${e.error}`));
  }
}

main().catch((err) => {
  console.error('\nFatal Sync Error:', err);
  process.exit(1);
});
