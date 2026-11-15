import { NextResponse, type NextRequest } from 'next/server';
import { API } from '@/app/api/enquiries/proxy';
import { portalHeaders, visitorFrom } from '@/lib/portal/api';

// "Email me my access link" (T8.5). POST /api/portal/resend → API POST /portal/resend.
// The API answers { ok: true } whatever the address (it never says whether
// the address is a client's); 400 is a malformed address, 429 the per-visitor
// throttle. Anything else is 502 and the page offers a retry.

export async function POST(request: NextRequest) {
    let res: Response;
    try {
        res = await fetch(`${API}/portal/resend`, {
            method: 'POST',
            headers: portalHeaders(visitorFrom(request.headers)),
            body: await request.text(),
            cache: 'no-store',
        });
    } catch {
        return NextResponse.json({ error: 'unavailable' }, { status: 502 });
    }
    if (res.status === 400 || res.status === 429) return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
    if (!res.ok) return NextResponse.json({ error: 'unavailable' }, { status: 502 });
    return NextResponse.json({ ok: true }, { status: 200 });
}
