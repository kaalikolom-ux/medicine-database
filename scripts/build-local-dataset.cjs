const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// 1. Load Clinical Info from seed_medicines_expanded.json
const clinicalMap = new Map();
try {
  const seedData = JSON.parse(fs.readFileSync('./data/seed_medicines_expanded.json', 'utf8'));
  for (const item of seedData) {
    if (item.generic && item.generic.name) {
      const gKey = item.generic.name.trim().toLowerCase();
      if (!clinicalMap.has(gKey)) {
        clinicalMap.set(gKey, {
          therapeutic_class: item.generic.therapeutic_class,
          indications: item.generic.indications,
          dosage_and_administration: item.generic.dosage_and_administration,
          side_effects: item.generic.side_effects,
          precautions: item.generic.precautions,
        });
      }
    }
  }
  console.log(`Loaded clinical reference for ${clinicalMap.size} generics.`);
} catch (e) {
  console.warn('Could not load seed_medicines_expanded:', e.message);
}

// 2. Parse 21k CSV
const csvRaw = fs.readFileSync('./data/bangladesh_medicines_21k.csv', 'utf8');
const lines = csvRaw.split(/\r?\n/).filter(l => l.trim().length > 0);

const medicines = [];
const seen = new Set();

for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
  const brand = row[1];
  const generic = row[5];
  if (!brand || !generic) continue;

  const id = row[0] || String(i);
  const form = row[4] || 'Tablet';
  const strength = row[6] || '';
  const manufacturer = row[7] || 'Unknown';
  const pkg = (row[8] || '').replace(/^"|"$/g, '').trim();

  let price = null;
  const priceMatch = pkg.match(/৳\s*([\d.]+)/);
  if (priceMatch) {
    price = parseFloat(priceMatch[1]);
  }

  const dedupeKey = `${brand.toLowerCase()}|${strength.toLowerCase()}|${form.toLowerCase()}|${manufacturer.toLowerCase()}`;
  if (seen.has(dedupeKey)) continue;
  seen.add(dedupeKey);

  // Check clinical map
  const clinical = clinicalMap.get(generic.toLowerCase()) || {};

  medicines.push({
    medicine_id: `bd-${id}`,
    brand_name: brand,
    dosage_form: form,
    strength: strength,
    price: price,
    currency: 'BDT',
    package_info: pkg || undefined,
    generic_name: generic,
    therapeutic_class: clinical.therapeutic_class || undefined,
    indications: clinical.indications || undefined,
    dosage_and_administration: clinical.dosage_and_administration || undefined,
    side_effects: clinical.side_effects || undefined,
    precautions: clinical.precautions || undefined,
    producer_name: manufacturer,
    producer_country: 'Bangladesh',
    priority_group: 0,
  });
}

console.log(`Parsed ${medicines.length} unique medicines.`);

// 3. Ensure public/data directory exists
const publicDataDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(publicDataDir)) {
  fs.mkdirSync(publicDataDir, { recursive: true });
}

// 4. Save full 21k JSON into public/data/medicines.json
const fullJsonPath = path.join(publicDataDir, 'medicines.json');
fs.writeFileSync(fullJsonPath, JSON.stringify(medicines));
const fullSizeMb = (fs.statSync(fullJsonPath).size / (1024 * 1024)).toFixed(2);
console.log(`Saved full dataset: ${fullJsonPath} (${fullSizeMb} MB)`);

// 5. Select top popular / essential medicines for immediate bundle
// Identify popular brands & top manufacturers (Square, Beximco, Incepta, Renata, Opsonin, ACME, ACI, Eskayef, Healthcare, Drug International)
const topProducers = [
  'square', 'beximco', 'incepta', 'renata', 'opsonin', 'acme', 'aci', 'eskayef', 'sk+f', 'healthcare', 'aristopharma', 'popular'
];

const priorityKeywords = [
  'napa', 'ace', 'cardex', 'seclo', 'sergel', 'ciprox', 'monas', 'bestcol', '3bion', 'fusid',
  'pantobex', 'finix', 'maxpro', 'losectil', 'alatrol', 'fexo', 'fenadin', 'provair', 'montene',
  'azithromycin', 'paracetamol', 'omeprazole', 'esomeprazole', 'metformin', 'losartan', 'amlodipine',
  'cefixime', 'ceftriaxone', 'moxifloxacin', 'ciprofloxacin', 'rosuvastatin', 'atorvastatin'
];

const essentialList = [];
const essentialSeen = new Set();

// First add exact or starting priority keyword matches (up to 30 per keyword)
for (const k of priorityKeywords) {
  let countForK = 0;
  for (const med of medicines) {
    if (countForK >= 25) break;
    const bLow = med.brand_name.toLowerCase();
    const gLow = med.generic_name.toLowerCase();
    if ((bLow.startsWith(k) || bLow === k || gLow.startsWith(k)) && !essentialSeen.has(med.medicine_id)) {
      essentialSeen.add(med.medicine_id);
      essentialList.push(med);
      countForK++;
    }
  }
}

// Then fill with top medicines from top manufacturers up to 500 items
for (const med of medicines) {
  if (essentialList.length >= 500) break;
  const pLow = med.producer_name.toLowerCase();
  const isTopProducer = topProducers.some(tp => pLow.includes(tp));
  if (isTopProducer && !essentialSeen.has(med.medicine_id)) {
    essentialSeen.add(med.medicine_id);
    essentialList.push(med);
  }
}

console.log(`Selected ${essentialList.length} essential medicines for synchronous zero-latency bundle.`);

// 6. Generate src/data/essentialMedicines.ts
const srcDataDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(srcDataDir)) {
  fs.mkdirSync(srcDataDir, { recursive: true });
}

const tsContent = `// Auto-generated essential offline medicine dataset
import type { MedicineDirectoryItem } from '../types/database.types';

export const ESSENTIAL_MEDICINES: MedicineDirectoryItem[] = ${JSON.stringify(essentialList, null, 2)};
`;

fs.writeFileSync(path.join(srcDataDir, 'essentialMedicines.ts'), tsContent);
console.log('Saved src/data/essentialMedicines.ts');
