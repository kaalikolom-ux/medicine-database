/**
 * Standalone Cloudflare Worker - High-Throughput Edge Caching API Proxy
 * Project: Medicine Database (Bangladesh & Worldwide Directory)
 * 
 * Intercepts search queries from Web and Mobile App (PWA/Capacitor APK),
 * checks Cloudflare Edge Cache (`caches.default`), proxies cache misses
 * to Supabase RPC `search_medicines`, and returns millisecond responses.
 */

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

const DEFAULT_SUPABASE_URL = 'https://nxwjkawsnjrebxzdkedl.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_N3sGFMf59Kt2EKcrusYdDw_qfcoRiy5';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Route matching
    if (pathname === '/api/search' || pathname === '/search') {
      return handleSearch(request, env, ctx);
    }

    if (pathname === '/api/medicine' || pathname === '/medicine') {
      return handleMedicine(request, env, ctx);
    }

    if (pathname === '/api/health' || pathname === '/health') {
      return handleHealth(request);
    }

    if (pathname === '/api/cache/purge' && request.method === 'POST') {
      return handleCachePurge(request, ctx);
    }

    return new Response(
      JSON.stringify({
        error: 'Not Found',
        message: 'Valid endpoints: /api/search, /api/medicine?id=..., /api/health',
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  },
};

/**
 * Handle Search Queries with Edge Caching
 */
async function handleSearch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const startTime = Date.now();
  const url = new URL(request.url);

  // Extract query parameters
  let q = url.searchParams.get('q') || url.searchParams.get('search_query') || '';
  let country = url.searchParams.get('country') || url.searchParams.get('filter_country') || '';
  let dosageForm = url.searchParams.get('dosage_form') || url.searchParams.get('filter_dosage_form') || '';
  let therapeuticClass = url.searchParams.get('therapeutic_class') || url.searchParams.get('filter_therapeutic_class') || '';
  let genericId = url.searchParams.get('generic_id') || '';
  let minPrice = url.searchParams.get('min_price');
  let maxPrice = url.searchParams.get('max_price');
  let page = parseInt(url.searchParams.get('page') || '1', 10);
  let limit = parseInt(url.searchParams.get('limit') || url.searchParams.get('page_size') || '50', 10);

  // If POST request with JSON body
  if (request.method === 'POST') {
    try {
      const body = (await request.clone().json()) as Record<string, any>;
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
      // Use URL search params
    }
  }

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 50;
  const offset = (page - 1) * limit;

  // Canonical Edge Cache Key
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

  const cache = (caches as any).default;

  // 1. Check Cloudflare Edge Cache
  if (cache) {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const hitDuration = Date.now() - startTime;
        const hitResponse = new Response(cached.body, cached);
        hitResponse.headers.set('X-Edge-Cache', 'HIT');
        hitResponse.headers.set('X-Edge-Latency', `${hitDuration}ms`);
        Object.entries(CORS_HEADERS).forEach(([k, v]) => hitResponse.headers.set(k, v));
        return hitResponse;
      }
    } catch (e) {
      console.warn('Cache lookup failed, proceeding to origin:', e);
    }
  }

  // 2. Cache MISS: Proxy to Supabase RPC 'search_medicines'
  const supabaseUrl = env?.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = env?.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  const rpcEndpoint = `${supabaseUrl}/rest/v1/rpc/search_medicines`;

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
    const originResponse = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!originResponse.ok) {
      const errText = await originResponse.text();
      return new Response(
        JSON.stringify({ error: 'Origin query failed', details: errText }),
        {
          status: originResponse.status,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }

    const data = await originResponse.json();
    const duration = Date.now() - startTime;
    const cf = (request as any).cf || {};

    // Cloudflare Edge Cache headers
    const responseHeaders = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400',
      'X-Edge-Cache': 'MISS',
      'X-Edge-Latency': `${duration}ms`,
      'X-Edge-Region': cf.colo || 'GLOBAL',
      'X-Edge-Country': cf.country || 'BD',
      'Server-Timing': `edge-miss;desc="Cache Miss", dur=${duration}`,
      ...CORS_HEADERS,
    });

    const responseToCache = new Response(JSON.stringify(data), {
      status: 200,
      headers: responseHeaders,
    });

    // Asynchronously store in Cloudflare Edge Cache
    if (cache) {
      ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));
    }

    return responseToCache;
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Edge proxy exception', message: error?.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
}

/**
 * Handle Individual Medicine Details Lookup with Edge Caching
 */
async function handleMedicine(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing medicine id parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const cache = (caches as any).default;
  const canonicalUrl = new URL(url.origin + '/api/medicine');
  canonicalUrl.searchParams.set('id', id.trim());

  const cacheKey = new Request(canonicalUrl.toString(), {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (cache) {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const hit = new Response(cached.body, cached);
        hit.headers.set('X-Edge-Cache', 'HIT');
        Object.entries(CORS_HEADERS).forEach(([k, v]) => hit.headers.set(k, v));
        return hit;
      }
    } catch (e) {
      console.warn('Medicine cache error:', e);
    }
  }

  const supabaseUrl = env?.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = env?.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  const queryUrl = `${supabaseUrl}/rest/v1/medicines?id=eq.${encodeURIComponent(id)}&select=*,generic:generics(*),producer:producers(*)`;

  try {
    const res = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Supabase medicine query failed' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Medicine not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const medicine = rows[0];
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=1800, s-maxage=86400, stale-while-revalidate=604800',
      'X-Edge-Cache': 'MISS',
      ...CORS_HEADERS,
    });

    const response = new Response(JSON.stringify(medicine), { status: 200, headers });
    if (cache) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal edge error', message: err?.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}

/**
 * Health & Telemetry Endpoint
 */
function handleHealth(request: Request): Response {
  const cf = (request as any).cf || {};
  return new Response(
    JSON.stringify({
      status: 'online',
      service: 'medicine-database-edge-proxy',
      edgeLocation: cf.colo || 'LOCAL_EDGE',
      country: cf.country || 'UNKNOWN',
      city: cf.city || 'UNKNOWN',
      cacheApi: 'Cloudflare Cache API (caches.default)',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS_HEADERS },
    }
  );
}

/**
 * Optional Cache Purge
 */
async function handleCachePurge(request: Request, ctx: ExecutionContext): Promise<Response> {
  // Purging specific key if requested
  const url = new URL(request.url);
  const targetKey = url.searchParams.get('url');

  if (targetKey) {
    const cache = (caches as any).default;
    if (cache) {
      const deleted = await cache.delete(new Request(targetKey));
      return new Response(JSON.stringify({ success: true, deleted, targetKey }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Provide ?url=<cacheKeyUrl> to purge' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
