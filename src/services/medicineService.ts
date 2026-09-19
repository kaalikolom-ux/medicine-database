import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { MedicineDirectoryItem, MedicineSearchParams } from '../types/database.types';

// Mock data used when Supabase credentials have not been supplied yet
export const MOCK_MEDICINES: MedicineDirectoryItem[] = [
  {
    medicine_id: '1',
    brand_name: 'Ace',
    dosage_form: 'Tablet',
    strength: '500 mg',
    price: 1.20,
    currency: 'BDT',
    package_info: '10 x 50 tablets',
    generic_name: 'Paracetamol',
    therapeutic_class: 'Analgesics & Antipyretics',
    producer_name: 'Square Pharmaceuticals PLC',
    producer_country: 'Bangladesh',
    priority_group: 0,
  },
  {
    medicine_id: '2',
    brand_name: 'Ace Plus',
    dosage_form: 'Tablet',
    strength: '500 mg + 65 mg',
    price: 2.50,
    currency: 'BDT',
    package_info: '10 x 20 tablets',
    generic_name: 'Paracetamol + Caffeine',
    therapeutic_class: 'Analgesics & Antipyretics',
    producer_name: 'Square Pharmaceuticals PLC',
    producer_country: 'Bangladesh',
    priority_group: 0,
  },
  {
    medicine_id: '3',
    brand_name: 'Napa',
    dosage_form: 'Tablet',
    strength: '500 mg',
    price: 1.20,
    currency: 'BDT',
    package_info: '10 x 50 tablets',
    generic_name: 'Paracetamol',
    therapeutic_class: 'Analgesics & Antipyretics',
    producer_name: 'Beximco Pharmaceuticals Ltd.',
    producer_country: 'Bangladesh',
    priority_group: 0,
  },
  {
    medicine_id: '4',
    brand_name: 'Napa Extra',
    dosage_form: 'Tablet',
    strength: '500 mg + 65 mg',
    price: 2.50,
    currency: 'BDT',
    package_info: '10 x 20 tablets',
    generic_name: 'Paracetamol + Caffeine',
    therapeutic_class: 'Analgesics & Antipyretics',
    producer_name: 'Beximco Pharmaceuticals Ltd.',
    producer_country: 'Bangladesh',
    priority_group: 0,
  },
  {
    medicine_id: '5',
    brand_name: 'Seclo',
    dosage_form: 'Capsule',
    strength: '20 mg',
    price: 5.00,
    currency: 'BDT',
    package_info: '10 x 10 capsules',
    generic_name: 'Omeprazole',
    therapeutic_class: 'Proton Pump Inhibitor (PPI)',
    producer_name: 'Square Pharmaceuticals PLC',
    producer_country: 'Bangladesh',
    priority_group: 0,
  },
  {
    medicine_id: '6',
    brand_name: 'Pantocid',
    dosage_form: 'Tablet',
    strength: '40 mg',
    price: 15.00,
    currency: 'INR',
    package_info: '1 x 15 tablets',
    generic_name: 'Pantoprazole',
    therapeutic_class: 'Proton Pump Inhibitor (PPI)',
    producer_name: 'Sun Pharmaceutical Industries',
    producer_country: 'India',
    priority_group: 1,
  },
  {
    medicine_id: '7',
    brand_name: 'Panadol',
    dosage_form: 'Tablet',
    strength: '500 mg',
    price: 3.50,
    currency: 'GBP',
    package_info: '2 x 12 tablets',
    generic_name: 'Paracetamol',
    therapeutic_class: 'Analgesics & Antipyretics',
    producer_name: 'GlaxoSmithKline (GSK)',
    producer_country: 'United Kingdom',
    priority_group: 1,
  },
  {
    medicine_id: '8',
    brand_name: 'Zithromax',
    dosage_form: 'Tablet',
    strength: '250 mg',
    price: 25.00,
    currency: 'USD',
    package_info: '6 tablets bottle',
    generic_name: 'Azithromycin',
    therapeutic_class: 'Macrolide Antibiotic',
    producer_name: 'Pfizer Inc.',
    producer_country: 'United States',
    priority_group: 1,
  },
];

/**
 * Fetch medicines with Bangladesh-First custom sorting logic:
 * 1. priority_group: Bangladesh = 0, Others = 1
 * 2. producer_country ASC
 * 3. brand_name ASC
 */
export async function searchMedicines({
  searchQuery = '',
  country = null,
  genericId = null,
  dosageForm = null,
  therapeuticClass = null,
  minPrice = null,
  maxPrice = null,
  page = 1,
  pageSize = 50,
}: MedicineSearchParams): Promise<MedicineDirectoryItem[]> {
  if (!isSupabaseConfigured) {
    // Client-side simulation of the exact PostgreSQL sorting rule
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return MOCK_MEDICINES.filter((item) => {
      const matchQuery =
        !normalizedQuery ||
        item.brand_name.toLowerCase().includes(normalizedQuery) ||
        item.generic_name.toLowerCase().includes(normalizedQuery) ||
        item.producer_name.toLowerCase().includes(normalizedQuery);

      const matchCountry = !country || item.producer_country.toLowerCase() === country.toLowerCase();
      const matchForm = !dosageForm || item.dosage_form.toLowerCase() === dosageForm.toLowerCase();
      const matchClass = !therapeuticClass || item.therapeutic_class?.toLowerCase() === therapeuticClass.toLowerCase();

      return matchQuery && matchCountry && matchForm && matchClass;
    }).sort((a, b) => {
      // 1. Bangladesh First (0 vs 1)
      const aIsBd = a.producer_country.toLowerCase() === 'bangladesh' ? 0 : 1;
      const bIsBd = b.producer_country.toLowerCase() === 'bangladesh' ? 0 : 1;
      if (aIsBd !== bIsBd) return aIsBd - bIsBd;

      // 2. Country A to Z
      const countryCompare = a.producer_country.localeCompare(b.producer_country);
      if (countryCompare !== 0) return countryCompare;

      // 3. Brand name A to Z
      return a.brand_name.localeCompare(b.brand_name);
    });
  }

  const offset = (page - 1) * pageSize;

  // Execute database Stored Procedure (RPC)
  const { data, error } = await supabase.rpc('search_medicines', {
    search_query: searchQuery.trim(),
    filter_country: country || null,
    filter_generic_id: genericId || null,
    filter_dosage_form: dosageForm || null,
    filter_therapeutic_class: therapeuticClass || null,
    min_price: minPrice || null,
    max_price: maxPrice || null,
    limit_count: pageSize,
    offset_count: offset,
  });

  if (error) {
    console.error('Error fetching medicines from Supabase:', error);
    throw error;
  }

  return (data as MedicineDirectoryItem[]) || [];
}
