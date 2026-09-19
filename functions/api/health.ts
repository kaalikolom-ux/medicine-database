/**
 * Cloudflare Pages Functions - Edge Health & Telemetry
 * Route: /api/health
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequest(context: any): Promise<Response> {
  const { request } = context;
  const cf = (request as any).cf || {};

  return new Response(
    JSON.stringify({
      status: 'healthy',
      service: 'medicine-database-edge-proxy',
      edgeLocation: cf.colo || 'LOCAL_DEV',
      country: cf.country || 'UNKNOWN',
      city: cf.city || 'UNKNOWN',
      timestamp: new Date().toISOString(),
      cacheEngine: 'Cloudflare Cache API (caches.default)',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        ...CORS_HEADERS,
      },
    }
  );
}
