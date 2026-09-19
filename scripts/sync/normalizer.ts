/**
 * Medicine Database: Data Normalizer
 * Standardizes Country, Dosage Form, Strength, and Clinical fields.
 */

// Known Bangladeshi Pharmaceutical Manufacturers
export const BD_PHARMA_REGISTRY: Record<string, { standardName: string; website?: string }> = {
  'square': { standardName: 'Square Pharmaceuticals PLC', website: 'https://www.squarepharma.com.bd' },
  'square pharmaceuticals': { standardName: 'Square Pharmaceuticals PLC', website: 'https://www.squarepharma.com.bd' },
  'beximco': { standardName: 'Beximco Pharmaceuticals Ltd.', website: 'https://www.beximcopharma.com' },
  'beximco pharma': { standardName: 'Beximco Pharmaceuticals Ltd.', website: 'https://www.beximcopharma.com' },
  'incepta': { standardName: 'Incepta Pharmaceuticals Ltd.', website: 'https://www.inceptapharma.com' },
  'renata': { standardName: 'Renata Limited', website: 'https://www.renata-ltd.com' },
  'healthcare': { standardName: 'Healthcare Pharmaceuticals Ltd.', website: 'https://www.hplbd.com' },
  'eskayef': { standardName: 'Eskayef Pharmaceuticals Ltd.', website: 'https://www.skfbd.com' },
  'sk+f': { standardName: 'Eskayef Pharmaceuticals Ltd.', website: 'https://www.skfbd.com' },
  'sk-f': { standardName: 'Eskayef Pharmaceuticals Ltd.', website: 'https://www.skfbd.com' },
  'opsonin': { standardName: 'Opsonin Pharma Ltd.', website: 'https://www.opsonin.com' },
  'aci': { standardName: 'ACI Limited', website: 'https://www.aci-bd.com' },
  'aristopharma': { standardName: 'Aristopharma Ltd.', website: 'https://www.aristopharma.com' },
  'acme': { standardName: 'The Acme Laboratories Ltd.', website: 'https://www.acmeglobal.com' },
  'popular': { standardName: 'Popular Pharmaceuticals Ltd.', website: 'https://www.popular-pharma.com' },
  'drug international': { standardName: 'Drug International Limited', website: 'https://www.drug-international.com' },
  'delta pharma': { standardName: 'Delta Pharma Limited', website: 'https://www.deltapharma.com.bd' },
  'beacon': { standardName: 'Beacon Pharmaceuticals PLC', website: 'https://www.beaconpharma.com.bd' },
  'ziska': { standardName: 'Ziska Pharmaceuticals Ltd.', website: 'https://www.ziskapharma.com' },
};

// Global Manufacturers
export const GLOBAL_PHARMA_REGISTRY: Record<string, { standardName: string; country: string; website?: string }> = {
  'pfizer': { standardName: 'Pfizer Inc.', country: 'United States', website: 'https://www.pfizer.com' },
  'gsk': { standardName: 'GlaxoSmithKline (GSK)', country: 'United Kingdom', website: 'https://www.gsk.com' },
  'glaxosmithkline': { standardName: 'GlaxoSmithKline (GSK)', country: 'United Kingdom', website: 'https://www.gsk.com' },
  'astrazeneca': { standardName: 'AstraZeneca', country: 'United Kingdom', website: 'https://www.astrazeneca.com' },
  'novartis': { standardName: 'Novartis', country: 'Switzerland', website: 'https://www.novartis.com' },
  'sanofi': { standardName: 'Sanofi', country: 'France', website: 'https://www.sanofi.com' },
  'roche': { standardName: 'F. Hoffmann-La Roche', country: 'Switzerland', website: 'https://www.roche.com' },
  'sun pharma': { standardName: 'Sun Pharmaceutical Industries', country: 'India', website: 'https://www.sunpharma.com' },
  'sun pharmaceutical': { standardName: 'Sun Pharmaceutical Industries', country: 'India', website: 'https://www.sunpharma.com' },
  'cipla': { standardName: 'Cipla Ltd.', country: 'India', website: 'https://www.cipla.com' },
  'dr. reddy': { standardName: "Dr. Reddy's Laboratories", country: 'India', website: 'https://www.drreddys.com' },
  'bayer': { standardName: 'Bayer AG', country: 'Germany', website: 'https://www.bayer.com' },
  'merck': { standardName: 'Merck & Co., Inc.', country: 'United States', website: 'https://www.merck.com' },
  'johnson & johnson': { standardName: 'Johnson & Johnson', country: 'United States', website: 'https://www.jnj.com' },
  'abbott': { standardName: 'Abbott Laboratories', country: 'United States', website: 'https://www.abbott.com' },
};

/**
 * Standardize country name to ensure exact matching and Bangladesh priority
 */
export function normalizeCountry(rawCountry?: string, companyName?: string): string {
  // If company is in Bangladeshi registry, country is ALWAYS Bangladesh
  if (companyName) {
    const cleanCo = companyName.toLowerCase();
    for (const key of Object.keys(BD_PHARMA_REGISTRY)) {
      if (cleanCo.includes(key)) {
        return 'Bangladesh';
      }
    }
  }

  if (!rawCountry) return 'Bangladesh';

  const normalized = rawCountry.trim().toLowerCase();

  const countryMap: Record<string, string> = {
    'bd': 'Bangladesh',
    'bgd': 'Bangladesh',
    'bangladesh': 'Bangladesh',
    'bangla': 'Bangladesh',
    'dhaka': 'Bangladesh',
    'us': 'United States',
    'usa': 'United States',
    'united states': 'United States',
    'united states of america': 'United States',
    'uk': 'United Kingdom',
    'gb': 'United Kingdom',
    'great britain': 'United Kingdom',
    'england': 'United Kingdom',
    'in': 'India',
    'ind': 'India',
    'india': 'India',
    'ch': 'Switzerland',
    'che': 'Switzerland',
    'switzerland': 'Switzerland',
    'fr': 'France',
    'fra': 'France',
    'france': 'France',
    'de': 'Germany',
    'deu': 'Germany',
    'germany': 'Germany',
    'jp': 'Japan',
    'jpn': 'Japan',
    'japan': 'Japan',
    'ca': 'Canada',
    'can': 'Canada',
    'canada': 'Canada',
  };

  return countryMap[normalized] || titleCase(rawCountry.trim());
}

/**
 * Standardize Company Name and Website
 */
export function normalizeCompany(rawCompany: string, rawCountry?: string): { name: string; country: string; website?: string } {
  const clean = rawCompany.trim().toLowerCase();

  // Check BD Registry
  for (const [key, info] of Object.entries(BD_PHARMA_REGISTRY)) {
    if (clean.includes(key)) {
      return {
        name: info.standardName,
        country: 'Bangladesh',
        website: info.website,
      };
    }
  }

  // Check Global Registry
  for (const [key, info] of Object.entries(GLOBAL_PHARMA_REGISTRY)) {
    if (clean.includes(key)) {
      return {
        name: info.standardName,
        country: info.country,
        website: info.website,
      };
    }
  }

  const country = normalizeCountry(rawCountry, rawCompany);
  return {
    name: titleCase(rawCompany.trim()),
    country,
  };
}

/**
 * Standardize Dosage Forms (e.g. Tab -> Tablet, Cap -> Capsule)
 */
export function normalizeDosageForm(rawForm?: string): string {
  if (!rawForm) return 'Tablet';

  const lower = rawForm.trim().toLowerCase();

  if (lower.includes('tab')) return 'Tablet';
  if (lower.includes('cap')) return 'Capsule';
  if (lower.includes('syr') || lower.includes('liquid') || lower.includes('elixir')) return 'Syrup';
  if (lower.includes('susp')) return 'Suspension';
  if (lower.includes('inj') || lower.includes('vial') || lower.includes('amp')) return 'Injection';
  if (lower.includes('eye') || lower.includes('drop') || lower.includes('ophthalmic')) return 'Eye Drops';
  if (lower.includes('inhal') || lower.includes('rotacap') || lower.includes('resp')) return 'Inhaler';
  if (lower.includes('oint') || lower.includes('cream') || lower.includes('gel')) return 'Ointment';

  return titleCase(rawForm.trim());
}

/**
 * Clean and format medicine strength (e.g. '500mg' -> '500 mg')
 */
export function normalizeStrength(rawStrength?: string): string {
  if (!rawStrength) return 'Standard';

  return rawStrength
    .trim()
    .replace(/(\d+)\s*(mg|ml|mcg|gm|g|iu|%)/gi, '$1 $2')
    .replace(/\s+/g, ' ');
}

/**
 * Clean text strings (strips HTML, collapses whitespace)
 */
export function cleanText(text?: string | string[]): string | undefined {
  if (!text) return undefined;

  let raw = Array.isArray(text) ? text.join(' ') : text;
  raw = raw.replace(/<[^>]*>/g, ' '); // remove HTML tags
  raw = raw.replace(/\s+/g, ' ').trim();

  return raw.length > 0 ? raw : undefined;
}

export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
