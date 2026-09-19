/**
 * Cloudflare Pages Functions - Edge Caching API Proxy for Medicine Search
 * Route: /api/search
 * 
 * Features:
 * - Edge Caching with Cloudflare Cache API (caches.default)
 * - Sub-millisecond cache hits at 300+ global Cloudflare edge locations
 * - Automatic canonical query normalization for maximum cache hit ratio
 * - Bangladesh-First priority preserved from Supabase RPC 'search_medicines'
 * - Universal CORS headers for Web & Mobile APK (Capacitor/TWA)
 */

const SUPABASE_DEFAULT_URL = 'https://nxwjkawsnjrebxzdkedl.supabase.co';
const SUPABASE_DEFAULT_ANON_KEY = 'sb_publishable_N3sGFMf59Kt2EKcrusYdDw_qfcoRiy5';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  'Access-Control-Max-Age': '86400',
};

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

interface EventContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  next: () => Promise<Response>;
  data: Record<string, unknown>;
}

// Handle CORS Preflight requests
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// Handle GET & POST search queries
export async function onRequest(context: EventContext): Promise<Response> {
  const { request, env, waitUntil } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const startTime = Date.now();
  const url = new URL(request.url);

  // Extract query parameters (support both GET params and POST json body)
  let q = url.searchParams.get('q') || url.searchParams.get('search_query') || '';
  let country = url.searchParams.get('country') || url.searchParams.get('filter_country') || '';
  let dosageForm = url.searchParams.get('dosage_form') || url.searchParams.get('filter_dosage_form') || '';
  let therapeuticClass = url.searchParams.get('therapeutic_class') || url.searchParams.get('filter_therapeutic_class') || '';
  let genericId = url.searchParams.get('generic_id') || '';
  let minPrice = url.searchParams.get('min_price');
  let maxPrice = url.searchParams.get('max_price');
  let page = parseInt(url.searchParams.get('page') || '1', 10);
  let limit = parseInt(url.searchParams.get('limit') || url.searchParams.get('page_size') || '50', 10);

  if (request.method === 'POST') {
    try {
      const body = await request.clone().json() as Record<string, any>;
      if (body) {
        q = body.q || body.search_query || q;
        country = body.country || body.filter_country || country;
        dosageForm = body.dosage_form || body.filter_dosage_form || dosageForm;
        therapeuticClass = body.therapeutic_class || body.filter_therapeutic_class || therapeuticClass;
        genericId = body.generic_id || genericId;
        if (body.min_price !== undefined) minPrice = String(body.min_price);
        if (body.max_price !== undefined) maxPrice = String(body.max_price);
        if (body.page) page = parseInt(String(body.page), 10);
        if (body.limit || body.page_size) limit = parseInt(String(body.limit || body.page_size), 10);
      }
    } catch {
      // Body not JSON or empty, continue with URL searchParams
    }
  }

  // Guard limits
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 50;
  const offset = (page - 1) * limit;

  // Build canonical cache key (normalized URL for maximum edge cache hits)
  const canonicalUrl = new URL(url.origin + '/api/search');
  canonicalUrl.searchParams.set('q', q.trim().toLowerCase());
  if (country) canonicalUrl.searchParams.set('country', country.trim().toLowerCase());
  if (dosageForm) canonicalUrl.searchParams.set('dosage_form', dosageForm.trim().toLowerCase());
  if (therapeuticClass) canonicalUrl.searchParams.set('therapeutic_class', therapeuticClass.trim().toLowerCase());
  if (genericId) canonicalUrl.searchParams.set('generic_id', genericId.trim());
  if (minPrice) canonicalUrl.searchParams.set('min_price', minPrice);
  if (maxPrice) canonicalUrl.searchParams.set('max_price', maxPrice);
  canonicalUrl.searchParams.set('page', String(page));
  canonicalUrl.searchParams.set('limit', String(limit));

  const cacheKey = new Request(canonicalUrl.toString(), {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  // Access Cloudflare Edge Cache API
  // In Cloudflare Workers/Pages, caches.default is available globally
  const cache = typeof caches !== 'undefined' && 'default' in caches ? (caches as any).default : null;

  if (cache) {
    try {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const responseTime = Date.now() - startTime;
        const hitResponse = new Response(cachedResponse.body, cachedResponse);
        hitResponse.headers.set('X-Edge-Cache', 'HIT');
        hitResponse.headers.set('X-Edge-Response-Time', `${responseTime}ms`);
        Object.entries(CORS_HEADERS).forEach(([k, v]) => hitResponse.headers.set(k, v));
        return hitResponse;
      }
    } catch (e) {
      console.warn('Edge cache match error, bypassing cache:', e);
    }
  }

  // Cache MISS: Query Supabase RPC 'search_medicines'
  const supabaseUrl = env.SUPABASE_URL || SUPABASE_DEFAULT_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY;
  const rpcUrl = `${supabaseUrl}/rest/v1/rpc/search_medicines`;

  const payload = {
    search_query: q.trim(),
    filter_country: country.trim() || null,
    filter_generic_id: genericId.trim() || null,
    filter_dosage_form: dosageForm.trim() || null,
    filter_therapeutic_class: therapeuticClass.trim() || null,
    min_price: minPrice ? parseFloat(minPrice) : null,
    max_price: maxPrice ? parseFloat(maxPrice) : null,
    limit_count: limit,
    offset_count: offset,
  };

  try {
    const supabaseRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!supabaseRes.ok) {
      const errorText = await supabaseRes.text();
      return new Response(
        JSON.stringify({ error: 'Supabase RPC failed', details: errorText }),
        {
          status: supabaseRes.status,
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
          },
        }
      );
    }

    const data = await supabaseRes.json();

    // --------------------------------------------------------------------
    // Worldwide Medicine Federation (openFDA Global Fallback)
    // If query has limited results, query the 130,000+ openFDA global registry
    // --------------------------------------------------------------------
    if (Array.isArray(data) && data.length < 12 && q.trim().length >= 3 && (!country || country.toLowerCase() !== 'bangladesh')) {
      try {
        const fdaQuery = encodeURIComponent(q.trim());
        const fdaUrl = `https://api.fda.gov/drug/ndc.json?search=(brand_name:"${fdaQuery}"+generic_name:"${fdaQuery}")&limit=10`;
        const fdaRes = await fetch(fdaUrl);
        if (fdaRes.ok) {
          const fdaData = (await fdaRes.json()) as any;
          if (fdaData.results && Array.isArray(fdaData.results)) {
            const existingBrands = new Set(data.map((d: any) => d.brand_name.toLowerCase()));
            for (const item of fdaData.results) {
              const brand = item.brand_name || item.generic_name;
              if (!brand || existingBrands.has(brand.toLowerCase())) continue;
              existingBrands.add(brand.toLowerCase());

              const generic = item.generic_name || (item.active_ingredients && item.active_ingredients[0]?.name) || 'Allopathic Compound';
              const producer = item.labeler_name || 'Global Pharmaceutical Producer';
              const strength = (item.active_ingredients && item.active_ingredients[0]?.strength) || item.dosage_form || 'Standard';

              data.push({
                medicine_id: `global-fda-${item.product_ndc || Math.random().toString(36).substring(2, 9)}`,
                brand_name: brand,
                dosage_form: item.dosage_form || 'Tablet / Capsule',
                strength: strength,
                price: null,
                currency: 'USD',
                package_info: item.packaging?.[0]?.description || 'International Formulation',
                generic_name: generic,
                therapeutic_class: item.pharm_class?.[0] || 'International Therapeutic Drug',
                indications: `FDA registered drug product (${item.product_type || 'Prescription / OTC'}).`,
                dosage_and_administration: 'As prescribed by licensed medical practitioner or indicated on package label.',
                side_effects: 'Consult official product monograph or prescribing healthcare provider.',
                precautions: 'Verify active ingredient formulation with licensed physician or pharmacist.',
                producer_name: producer,
                producer_country: 'United States',
                producer_website: undefined,
                priority_group: 1, // Global priority (always placed AFTER Bangladesh medicines)
              });
            }
          }
        }
      } catch (fdaErr) {
        console.warn('openFDA fallback lookup error:', fdaErr);
      }
    }

    const duration = Date.now() - startTime;

    // Cloudflare Edge Cache-Control headers:
    // Only cache positive responses; never cache empty arrays to avoid stale empty results
    const hasData = Array.isArray(data) && data.length > 0;
    const cacheControlHeader = hasData
      ? 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400'
      : 'no-cache, no-store, must-revalidate';

    const edgeHeaders = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': cacheControlHeader,
      'X-Edge-Cache': 'MISS',
      'X-Edge-Response-Time': `${duration}ms`,
      'X-Edge-Region': (request as any).cf?.colo || 'EDGE',
      'X-Edge-Country': (request as any).cf?.country || 'BD',
      'Server-Timing': `edge-miss;desc="Cloudflare Edge MISS", dur=${duration}`,
      ...CORS_HEADERS,
    });

    const responseToCache = new Response(JSON.stringify(data), {
      status: 200,
      headers: edgeHeaders,
    });

    // Store in Cloudflare Edge Cache asynchronously only if data exists
    if (cache && hasData) {
      try {
        const cacheStorePromise = cache.put(cacheKey, responseToCache.clone());
        if (typeof waitUntil === 'function') {
          waitUntil(cacheStorePromise);
        } else {
          await cacheStorePromise;
        }
      } catch (err) {
        console.warn('Failed to store response in Edge Cache:', err);
      }
    }

    return responseToCache;
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Internal edge proxy error', message: error?.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  }
}
