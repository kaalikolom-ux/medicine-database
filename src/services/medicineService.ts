import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { MedicineDirectoryItem, MedicineSearchParams } from '../types/database.types';
import { ESSENTIAL_MEDICINES } from '../data/essentialMedicines';

// In-memory full dataset cache loaded on demand from /data/medicines.json (21,646 items)
let fullLocalDataset: MedicineDirectoryItem[] | null = null;
let isLoadingFullDataset = false;

// Preload the full 21k medicines dataset in the background
export async function preloadFullLocalDataset(): Promise<MedicineDirectoryItem[]> {
  if (fullLocalDataset && fullLocalDataset.length > 0) {
    return fullLocalDataset;
  }
  if (isLoadingFullDataset) {
    return ESSENTIAL_MEDICINES;
  }

  isLoadingFullDataset = true;
  try {
    const res = await fetch('/data/medicines.json');
    if (res.ok) {
      const data = (await res.json()) as MedicineDirectoryItem[];
      if (Array.isArray(data) && data.length > 0) {
        fullLocalDataset = data;
        console.info(`[MedicineDatabase] Successfully loaded full local dataset (${data.length} medicines).`);
        return data;
      }
    }
  } catch (err) {
    console.warn('[MedicineDatabase] Could not load /data/medicines.json, using essential bundle:', err);
  } finally {
    isLoadingFullDataset = false;
  }

  return ESSENTIAL_MEDICINES;
}

// Start preloading immediately in browser environment
if (typeof window !== 'undefined') {
  setTimeout(() => {
    preloadFullLocalDataset().catch(() => {});
  }, 100);
}

export function getLocalMedicines(): MedicineDirectoryItem[] {
  return (fullLocalDataset && fullLocalDataset.length > 0) ? fullLocalDataset : ESSENTIAL_MEDICINES;
}

// Fallback mock medicines for backward compatibility
export const MOCK_MEDICINES: MedicineDirectoryItem[] = ESSENTIAL_MEDICINES.slice(0, 50);

// Database connection telemetry
export interface EdgeCacheStatus {
  source: 'EDGE_HIT' | 'EDGE_MISS' | 'SUPABASE_DIRECT' | 'LOCAL_BACKUP';
  latencyMs: number;
  region?: string;
  cacheControl?: string;
}

let lastEdgeStatus: EdgeCacheStatus = {
  source: 'LOCAL_BACKUP',
  latencyMs: 0,
};

let remoteDatabaseOffline = false;
type ConnectionListener = (offline: boolean) => void;
const connectionListeners = new Set<ConnectionListener>();

export function isRemoteDatabaseOffline(): boolean {
  return remoteDatabaseOffline;
}

export function subscribeDatabaseStatus(listener: ConnectionListener): () => void {
  connectionListeners.add(listener);
  listener(remoteDatabaseOffline);
  return () => {
    connectionListeners.delete(listener);
  };
}

function setRemoteDatabaseOffline(offline: boolean) {
  if (remoteDatabaseOffline !== offline) {
    remoteDatabaseOffline = offline;
    connectionListeners.forEach((l) => l(offline));
  }
}

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
 * Multi-token local searching over Bangladesh & Global medicine database
 */
function searchLocalMedicines(params: MedicineSearchParams): MedicineDirectoryItem[] {
  const {
    searchQuery = '',
    country = null,
    dosageForm = null,
    therapeuticClass = null,
    minPrice = null,
    maxPrice = null,
    page = 1,
    pageSize = 50,
  } = params;

  const dataset = getLocalMedicines();
  const rawQuery = searchQuery.trim().toLowerCase();
  const tokens = rawQuery ? rawQuery.split(/\s+/).filter(Boolean) : [];

  const filtered = dataset.filter((item) => {
    // 1. Multi-token text matching across brand, generic, strength, manufacturer, and dosage form
    if (tokens.length > 0) {
      const brand = item.brand_name.toLowerCase();
      const generic = item.generic_name.toLowerCase();
      const strength = (item.strength || '').toLowerCase();
      const producer = item.producer_name.toLowerCase();
      const form = item.dosage_form.toLowerCase();
      const thClass = (item.therapeutic_class || '').toLowerCase();

      const allTokensMatch = tokens.every(
        (token) =>
          brand.includes(token) ||
          generic.includes(token) ||
          strength.includes(token) ||
          producer.includes(token) ||
          form.includes(token) ||
          thClass.includes(token)
      );
      if (!allTokensMatch) return false;
    }

    // 2. Filters
    if (country && item.producer_country.toLowerCase() !== country.toLowerCase()) {
      return false;
    }
    if (dosageForm && item.dosage_form.toLowerCase() !== dosageForm.toLowerCase()) {
      return false;
    }
    if (
      therapeuticClass &&
      item.therapeutic_class?.toLowerCase() !== therapeuticClass.toLowerCase()
    ) {
      return false;
    }
    if (minPrice !== null && minPrice !== undefined && (item.price === null || item.price < minPrice)) {
      return false;
    }
    if (maxPrice !== null && maxPrice !== undefined && (item.price === null || item.price > maxPrice)) {
      return false;
    }

    return true;
  });

  // 3. Bangladesh Priority Sorting:
  // - Priority group 0 (Bangladesh) first
  // - Then country ASC
  // - Then brand name ASC
  filtered.sort((a, b) => {
    const aIsBd = a.producer_country.toLowerCase() === 'bangladesh' ? 0 : 1;
    const bIsBd = b.producer_country.toLowerCase() === 'bangladesh' ? 0 : 1;
    if (aIsBd !== bIsBd) return aIsBd - bIsBd;

    const cComp = a.producer_country.localeCompare(b.producer_country);
    if (cComp !== 0) return cComp;

    return a.brand_name.localeCompare(b.brand_name);
  });

  // 4. Pagination
  const offset = (page - 1) * pageSize;
  return filtered.slice(offset, offset + pageSize);
}

/**
 * Search medicines with multi-tier architecture:
 * 1. Cloudflare Edge Caching Proxy
 * 2. Direct Supabase RPC
 * 3. Resilient Local Database (21,500+ medicines with zero-latency fallback)
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

  // Tier 1: Try Cloudflare Edge Cache proxy
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
    const timeoutId = setTimeout(() => controller.abort(), 4000);

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

      setRemoteDatabaseOffline(false);

      if (Array.isArray(data) && (data.length > 0 || !searchQuery.trim())) {
        return data;
      }
    }
  } catch (edgeErr) {
    console.warn('[MedicineService] Edge proxy unavailable, trying Supabase direct:', edgeErr);
  }

  // Tier 2: Direct Supabase RPC
  if (isSupabaseConfigured) {
    try {
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

      if (!error && data && Array.isArray(data) && data.length > 0) {
        lastEdgeStatus = {
          source: 'SUPABASE_DIRECT',
          latencyMs: Date.now() - startTime,
        };
        setRemoteDatabaseOffline(false);
        return data as MedicineDirectoryItem[];
      }
      if (error) {
        console.warn('[MedicineService] Supabase RPC returned error:', error.message);
      }
    } catch (supaErr) {
      console.warn('[MedicineService] Supabase network error:', supaErr);
    }
  }

  // Tier 3: Local Offline Resilient Database (21,500+ medicines)
  setRemoteDatabaseOffline(true);
  lastEdgeStatus = {
    source: 'LOCAL_BACKUP',
    latencyMs: Date.now() - startTime,
  };

  return searchLocalMedicines({
    searchQuery,
    country,
    genericId,
    dosageForm,
    therapeuticClass,
    minPrice,
    maxPrice,
    page,
    pageSize,
  });
}

/**
 * Fetch full details of a single medicine via Edge, Supabase, or Local Database
 */
export async function getMedicineDetails(id: string): Promise<MedicineDirectoryItem | null> {
  const edgeBase = getEdgeApiBase();

  // 1. Try Edge
  try {
    const res = await fetch(`${edgeBase}/api/medicine?id=${encodeURIComponent(id)}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      return (await res.json()) as MedicineDirectoryItem;
    }
  } catch {
    // Continue to fallback
  }

  // 2. Try Supabase
  if (isSupabaseConfigured) {
    try {
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
          indications: data.generic?.indications,
          dosage_and_administration: data.generic?.dosage_and_administration,
          side_effects: data.generic?.side_effects,
          precautions: data.generic?.precautions,
          producer_name: data.producer?.name || 'N/A',
          producer_country: data.producer?.country || 'Unknown',
          priority_group: data.producer?.country?.toLowerCase() === 'bangladesh' ? 0 : 1,
        };
      }
    } catch {
      // Continue to local
    }
  }

  // 3. Fallback to local dataset
  const localList = getLocalMedicines();
  const found = localList.find(
    (m) => m.medicine_id === id || m.brand_name.toLowerCase() === id.toLowerCase()
  );

  return found || null;
}
