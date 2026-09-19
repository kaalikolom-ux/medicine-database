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

// Edge telemetry tracker
export interface EdgeCacheStatus {
  source: 'EDGE_HIT' | 'EDGE_MISS' | 'SUPABASE_DIRECT' | 'CLIENT_MOCK';
  latencyMs: number;
  region?: string;
  cacheControl?: string;
}

let lastEdgeStatus: EdgeCacheStatus = {
  source: 'SUPABASE_DIRECT',
  latencyMs: 0,
};

export function getLastEdgeStatus(): EdgeCacheStatus {
  return lastEdgeStatus;
}

/**
 * Determine best Edge API base URL
 */
function getEdgeApiBase(): string {
  if (import.meta.env.VITE_EDGE_API_URL) {
    return import.meta.env.VITE_EDGE_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // On Cloudflare Pages or Workers domains, use relative URL
    if (host.includes('workers.dev') || host.includes('pages.dev')) {
      return '';
    }
  }
  // Default to live Cloudflare Worker edge endpoint
  return 'https://medicine-database.notabeneinc.workers.dev';
}

/**
 * Search medicines via Cloudflare Worker Edge Caching layer
 * with automatic fallback to direct Supabase RPC.
 *
 * Guarantees custom sorting:
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
  const startTime = Date.now();

  // Try fetching through Cloudflare Edge Cache proxy
  try {
    const edgeBase = getEdgeApiBase();
    const queryParams = new URLSearchParams();
    if (searchQuery.trim()) queryParams.set('q', searchQuery.trim());
    if (country) queryParams.set('country', country);
    if (dosageForm) queryParams.set('dosage_form', dosageForm);
    if (therapeuticClass) queryParams.set('therapeutic_class', therapeuticClass);
    if (genericId) queryParams.set('generic_id', genericId);
    if (minPrice !== null && minPrice !== undefined) queryParams.set('min_price', String(minPrice));
    if (maxPrice !== null && maxPrice !== undefined) queryParams.set('max_price', String(maxPrice));
    queryParams.set('page', String(page));
    queryParams.set('limit', String(pageSize));

    const edgeUrl = `${edgeBase}/api/search?${queryParams.toString()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const edgeResponse = await fetch(edgeUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (edgeResponse.ok) {
      const data = (await edgeResponse.json()) as MedicineDirectoryItem[];
      const latency = Date.now() - startTime;
      const edgeCacheHeader = edgeResponse.headers.get('X-Edge-Cache');
      const edgeRegion = edgeResponse.headers.get('X-Edge-Region') || 'Cloudflare Global Edge';

      lastEdgeStatus = {
        source: edgeCacheHeader === 'HIT' ? 'EDGE_HIT' : 'EDGE_MISS',
        latencyMs: latency,
        region: edgeRegion,
        cacheControl: edgeResponse.headers.get('Cache-Control') || undefined,
      };

      return data;
    }
  } catch (edgeErr) {
    // If edge proxy request is aborted or network fails, gracefully fall back to direct Supabase
    console.warn('[EdgeProxy] Falling back to direct Supabase client:', edgeErr);
  }

  // Fallback 1: Direct Supabase RPC
  if (isSupabaseConfigured) {
    const offset = (page - 1) * pageSize;
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

    if (!error && data) {
      lastEdgeStatus = {
        source: 'SUPABASE_DIRECT',
        latencyMs: Date.now() - startTime,
      };
      return data as MedicineDirectoryItem[];
    }
    console.error('Error fetching medicines from Supabase RPC:', error);
  }

  // Fallback 2: Client-side mock filtering
  lastEdgeStatus = {
    source: 'CLIENT_MOCK',
    latencyMs: Date.now() - startTime,
  };

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

/**
 * Fetch full details of a single medicine via Edge Cache or Supabase
 */
export async function getMedicineDetails(id: string): Promise<MedicineDirectoryItem | null> {
  const edgeBase = getEdgeApiBase();
  try {
    const res = await fetch(`${edgeBase}/api/medicine?id=${encodeURIComponent(id)}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      return (await res.json()) as MedicineDirectoryItem;
    }
  } catch {
    // Fallback to Supabase
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('medicines')
      .select('*, generic:generics(*), producer:producers(*)')
      .eq('id', id)
      .single();

    if (!error && data) {
      return {
        medicine_id: data.id,
        brand_name: data.brand_name,
        dosage_form: data.dosage_form,
        strength: data.strength,
        price: data.price,
        currency: data.currency,
        package_info: data.package_info,
        generic_name: data.generic?.name || 'N/A',
        therapeutic_class: data.generic?.therapeutic_class || 'N/A',
        producer_name: data.producer?.name || 'N/A',
        producer_country: data.producer?.country || 'Unknown',
        priority_group: data.producer?.country?.toLowerCase() === 'bangladesh' ? 0 : 1,
      };
    }
  }

  return MOCK_MEDICINES.find((m) => m.medicine_id === id) || null;
}
