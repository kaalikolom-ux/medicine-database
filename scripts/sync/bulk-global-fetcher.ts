/**
 * Bulk Global Medicine Fetcher & Ingestion Pipeline
 * Connects to openFDA (U.S. FDA Drug NDC Registry with 130,000+ formulations)
 * and ingests international medicines directly into Supabase PostgreSQL.
 *
 * Preserves Rule: Bangladesh priority is maintained (Priority Group 0 for BD, 1 for Global).
 */

import pg from 'pg';

const { Client } = pg;

// Comprehensive list of essential international active pharmaceutical ingredients
const GLOBAL_SEARCH_TERMS = [
  'semaglutide',      // Ozempic, Wegovy, Rybelsus
  'tirzepatide',     // Mounjaro, Zepbound
  'adalimumab',      // Humira
  'pembrolizumab',   // Keytruda
  'apixaban',        // Eliquis
  'rivaroxaban',     // Xarelto
  'dulaglutide',     // Trulicity
  'ustekinumab',     // Stelara
  'dupilumab',       // Dupixent
  'bictegravir',     // Biktarvy
  'etanercept',      // Enbrel
  'aflibercept',     // Eylea
  'sacubitril',      // Entresto
  'ibrutinib',       // Imbruvica
  'daratumumab',     // Darzalex
  'palbociclib',     // Ibrance
  'lenalidomide',    // Revlimid
  'sitagliptin',     // Januvia
  'empagliflozin',   // Jardiance
  'dapagliflozin',   // Farxiga
  'liraglutide',     // Victoza / Saxenda
  'lisdexamfetamine',// Vyvanse
  'levothyroxine',   // Synthroid
  'atorvastatin',    // Lipitor
  'rosuvastatin',    // Crestor
];

async function runGlobalSync() {
  console.log('================================================================');
  console.log('  openFDA Global Medicine Bulk Ingestion Pipeline');
  console.log(`  Querying international NDC registries for ${GLOBAL_SEARCH_TERMS.length} classes...`);
  console.log('================================================================\n');

  const connectionString = process.env.DATABASE_URL ||
    'postgresql://postgres:3-Xjs*a*KsXb6H5@db.nxwjkawsnjrebxzdkedl.supabase.co:5432/postgres';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to Supabase PostgreSQL database.');

    let totalFetched = 0;
    let totalUpserted = 0;

    for (const term of GLOBAL_SEARCH_TERMS) {
      console.log(`\n🔍 Querying openFDA for: [${term.toUpperCase()}]...`);
      const url = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(term)}"&limit=5`;

      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.log(`   ⚠️ No results found for ${term}`);
          continue;
        }

        const data = (await res.json()) as any;
        if (!data.results || !Array.isArray(data.results)) {
          continue;
        }

        console.log(`   📥 Retrieved ${data.results.length} international records from openFDA.`);
        totalFetched += data.results.length;

        for (const item of data.results) {
          const brand = item.brand_name || item.generic_name;
          const generic = item.generic_name || term;
          const producer = item.labeler_name || 'International Pharmaceutical Corp';
          const dosageForm = item.dosage_form || 'Tablet / Injection';
          const strength = (item.active_ingredients && item.active_ingredients[0]?.strength) || 'Standard Strength';
          const therapeuticClass = item.pharm_class?.[0] || 'International Registered Medicine';

          const indications = `FDA Approved Drug Product (${item.product_type || 'Prescription / OTC'}).`;
          const dosage = 'As directed by licensed medical practitioner or package insert.';
          const sideEffects = 'Consult physician or official FDA prescribing information.';
          const precautions = 'Verify formulation and potential drug interactions with pharmacist.';

          const query = `
            SELECT upsert_medicine_record(
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            );
          `;

          const values = [
            brand.trim(),
            generic.trim(),
            producer.trim(),
            'United States', // openFDA registry
            dosageForm,
            strength,
            null,
            'USD',
            item.packaging?.[0]?.description || 'Commercial Package',
            therapeuticClass,
            indications,
            dosage,
            sideEffects,
            precautions,
            'https://www.fda.gov'
          ];

          await client.query(query, values);
          totalUpserted++;
        }
      } catch (err: any) {
        console.warn(`   ⚠️ Fetch error for ${term}:`, err?.message);
      }

      // Small delay to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log('\n================================================================');
    console.log('             GLOBAL INGESTION SUMMARY                           ');
    console.log('================================================================');
    console.log(`  Fetched from openFDA:   ${totalFetched}`);
    console.log(`  Upserted into Supabase: ${totalUpserted}`);

    const resMeds = await client.query('SELECT count(*) FROM medicines;');
    const resBdMeds = await client.query("SELECT count(*) FROM view_medicines_directory WHERE LOWER(producer_country) = 'bangladesh';");
    console.log(`  📦 Total Medicines in DB:     ${resMeds.rows[0].count}`);
    console.log(`  🇧🇩 Bangladesh Priority Meds: ${resBdMeds.rows[0].count}`);
    console.log(`  🌐 Global Medicines in DB:    ${Number(resMeds.rows[0].count) - Number(resBdMeds.rows[0].count)}`);
    console.log('================================================================\n');

  } catch (e) {
    console.error('Pipeline failed:', e);
  } finally {
    await client.end();
  }
}

runGlobalSync();
