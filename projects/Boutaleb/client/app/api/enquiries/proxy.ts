import type { NextRequest } from 'next/server';

// Shared by /api/enquiries and /api/enquiries/token: how the site's server
// reaches the API's public-forms endpoints. Server-only (route handlers).
//
// FORMS_PROXY_KEY proves to the API that a send came through this route.
// Against a local API the fixed dev key is used (server src/env.ts,
// DEV_FORMS_PROXY_KEY), which also covers `next start` on this machine;
// against any other API the real key must be set, on both sides.

const DEV_FORMS_PROXY_KEY = 'dev-only-forms-proxy-key-0000000000000000';

export const API = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4002';

export function formsKey(): string {
    const key = process.env.FORMS_PROXY_KEY;
    if (key) return key;
    const host = new URL(API).hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') throw new Error('FORMS_PROXY_KEY is required when the API is not local');
    return DEV_FORMS_PROXY_KEY;
}

/**
 * The visitor's address, as the host saw it, for the API's per-visitor
 * throttle. Netlify's own header first: Netlify sets it and a visitor cannot.
 * Elsewhere, the LAST entry of X-Forwarded-For: that one is appended by the
 * proxy in front of the site; every entry before it is whatever the visitor
 * chose to send, so trusting the first lets anyone dodge the throttle by
 * sending a new made-up address each time.
 */
export function visitorFrom(h: Headers): string {
    const netlify = h.get('x-nf-client-connection-ip')?.trim();
    if (netlify) return netlify;
    const hops = h.get('x-forwarded-for')?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
    return hops.at(-1) ?? 'local';
}

export const visitorIp = (req: NextRequest): string => visitorFrom(req.headers);
