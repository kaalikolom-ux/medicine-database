import type { OpenFdaRawRecord, NormalizedMedicine } from '../types';
import { normalizeCompany, normalizeDosageForm, normalizeStrength, cleanText } from '../normalizer';

/**
 * Adapter for openFDA (U.S. FDA Drug Data / Global Labels) records
 */
export function parseOpenFdaRecord(raw: OpenFdaRawRecord): NormalizedMedicine | null {
  // Brand name resolution
  const brandName = 
    raw.brand_name || 
    (raw.openfda?.brand_name && raw.openfda.brand_name[0]) ||
    raw.generic_name ||
    (raw.openfda?.generic_name && raw.openfda.generic_name[0]);

  // Generic name resolution
  const genericName = 
    raw.generic_name || 
    (raw.openfda?.generic_name && raw.openfda.generic_name[0]) ||
    (raw.openfda?.substance_name && raw.openfda.substance_name[0]) ||
    (raw.active_ingredient && raw.active_ingredient[0]);

  // Manufacturer resolution
  const manufacturer = 
    raw.manufacturer_name || 
    (raw.openfda?.manufacturer_name && raw.openfda.manufacturer_name[0]);

  if (!brandName || !genericName || !manufacturer) {
    return null;
  }

  // Country resolution
  const countryRaw = raw.country || 'United States';
  const companyInfo = normalizeCompany(manufacturer, countryRaw);

  const dosageFormRaw = 
    raw.dosage_form || 
    (raw.openfda?.dosage_form && raw.openfda.dosage_form[0]);
  const dosageForm = normalizeDosageForm(dosageFormRaw);

  const strength = normalizeStrength(raw.strength);

  // Extract clinical texts
  const indications = cleanText(raw.indications_and_usage || raw.purpose);
  const dosage = cleanText(raw.dosage_and_administration);
  const sideEffects = cleanText(raw.adverse_reactions);
  const precautions = cleanText(raw.warnings);

  return {
    brand_name: brandName.trim(),
    generic_name: genericName.trim(),
    producer_name: companyInfo.name,
    producer_country: companyInfo.country,
    producer_website: companyInfo.website,
    dosage_form: dosageForm,
    strength: strength,
    price: null,
    currency: 'USD',
    therapeutic_class: cleanText(raw.therapeutic_class || (raw.openfda?.product_type && raw.openfda.product_type[0])),
    indications: indications,
    dosage_and_administration: dosage,
    side_effects: sideEffects,
    precautions: precautions,
    source: 'openFDA',
  };
}

export function parseOpenFdaDataset(records: OpenFdaRawRecord[]): NormalizedMedicine[] {
  const normalized: NormalizedMedicine[] = [];
  for (const rec of records) {
    const item = parseOpenFdaRecord(rec);
    if (item) {
      normalized.push(item);
    }
  }
  return normalized;
}
