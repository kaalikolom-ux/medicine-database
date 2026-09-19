import type { DgdaRawRecord, NormalizedMedicine } from '../types';
import { normalizeCompany, normalizeDosageForm, normalizeStrength, cleanText } from '../normalizer';

/**
 * Adapter for DGDA (Directorate General of Drug Administration, Bangladesh) records
 */
export function parseDgdaRecord(raw: DgdaRawRecord): NormalizedMedicine | null {
  const brandName = (raw.brand_name || raw.brandName || raw.name)?.trim();
  const genericName = (raw.generic_name || raw.genericName)?.trim();
  const companyRaw = (raw.manufacturer || raw.company || raw.company_name)?.trim();

  if (!brandName || !genericName || !companyRaw) {
    return null;
  }

  // DGDA records are inherently Bangladeshi companies
  const companyInfo = normalizeCompany(companyRaw, 'Bangladesh');

  const dosageForm = normalizeDosageForm(raw.dosage_form || raw.form);
  const strength = normalizeStrength(raw.strength);

  let price: number | null = null;
  if (raw.price !== undefined && raw.price !== null) {
    const parsed = typeof raw.price === 'number' ? raw.price : parseFloat(String(raw.price).replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) price = parsed;
  } else if (raw.unit_price !== undefined && raw.unit_price !== null) {
    const parsed = typeof raw.unit_price === 'number' ? raw.unit_price : parseFloat(String(raw.unit_price).replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) price = parsed;
  }

  return {
    brand_name: brandName,
    generic_name: genericName,
    producer_name: companyInfo.name,
    producer_country: 'Bangladesh', // Explicitly Bangladesh
    producer_website: companyInfo.website,
    dosage_form: dosageForm,
    strength: strength,
    price: price,
    currency: 'BDT',
    package_info: cleanText(raw.package_info || raw.pack_size),
    therapeutic_class: cleanText(raw.therapeutic_class),
    indications: cleanText(raw.indications),
    dosage_and_administration: cleanText(raw.dosage),
    side_effects: cleanText(raw.side_effects),
    source: 'DGDA',
  };
}

export function parseDgdaDataset(records: DgdaRawRecord[]): NormalizedMedicine[] {
  const normalized: NormalizedMedicine[] = [];
  for (const rec of records) {
    const item = parseDgdaRecord(rec);
    if (item) {
      normalized.push(item);
    }
  }
  return normalized;
}
