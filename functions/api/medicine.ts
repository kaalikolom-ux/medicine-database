/**
 * Cloudflare Pages Functions - Edge Caching API for Medicine Details
 * Route: /api/medicine
 * Query: ?id=<uuid>
 */

const SUPABASE_DEFAULT_URL = 'https://nxwjkawsnjrebxzdkedl.supabase.co';
const SUPABASE_DEFAULT_ANON_KEY = 'sb_publishable_N3sGFMf59Kt2EKcrusYdDw_qfcoRiy5';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  'Access-Control-Max-Age': '86400',
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequest(context: any): Promise<Response> {
  const { request, env, waitUntil } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing medicine id parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const cache = typeof caches !== 'undefined' && 'default' in caches ? (caches as any).default : null;
  const canonicalUrl = new URL(url.origin + '/api/medicine');
  canonicalUrl.searchParams.set('id', id.trim());

  const cacheKey = new Request(canonicalUrl.toString(), {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  // Check Edge Cache
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
      console.warn('Medicine cache match error:', e);
    }
  }

  const supabaseUrl = env.SUPABASE_URL || SUPABASE_DEFAULT_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY;
  const apiUrl = `${supabaseUrl}/rest/v1/medicines?id=eq.${encodeURIComponent(id)}&select=*,generic:generics(*),producer:producers(*)`;

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Supabase lookup failed' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Medicine not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const medicine = items[0];
    const edgeHeaders = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=1800, s-maxage=86400, stale-while-revalidate=604800',
      'X-Edge-Cache': 'MISS',
      'X-Edge-Region': request.cf?.colo || 'EDGE',
      ...CORS_HEADERS,
    });

    const responseToCache = new Response(JSON.stringify(medicine), {
      status: 200,
      headers: edgeHeaders,
    });

    if (cache) {
      const putPromise = cache.put(cacheKey, responseToCache.clone());
      if (typeof waitUntil === 'function') waitUntil(putPromise);
      else await putPromise;
    }

    return responseToCache;
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal edge error', message: err?.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}
