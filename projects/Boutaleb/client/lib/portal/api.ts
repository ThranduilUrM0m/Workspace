import { headers } from 'next/headers';
import type { PortalView } from '@repo/schemas';
import { API, formsKey } from '@/app/api/enquiries/proxy';

// The site's server is the only caller of the API's /portal routes (the
// client's browser never sees the API address): it proves itself with the
// shared key and says whose visitor this is, so the throttle counts people,
// not the site. Server-only.

/** The visitor's address, as the host saw it: Netlify's own header first, then the standard one. */
export function visitorFrom(h: Headers): string {
    return h.get('x-nf-client-connection-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
}

export const portalHeaders = (visitor: string) => ({ 'content-type': 'application/json', 'x-forms-key': formsKey(), 'x-visitor-ip': visitor });

/** null = this link opens nothing (unknown, replaced, or the project is closed). Same answer for all three. */
export async function portalView(token: string): Promise<PortalView | null> {
    const res = await fetch(`${API}/portal/${encodeURIComponent(token)}`, {
        headers: portalHeaders(visitorFrom(await headers())),
        cache: 'no-store',
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`portal answered ${res.status}`);
    return (await res.json()) as PortalView;
}
