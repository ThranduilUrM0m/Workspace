import { NextResponse, type NextRequest } from 'next/server';
import { API } from '@/app/api/enquiries/proxy';
import { portalHeaders, visitorFrom } from '@/lib/portal/api';

// The client's page saves and sends through here, never to the API itself.
// PUT /api/portal/<token>/draft   → API PUT  /portal/<token>/draft
// POST /api/portal/<token>/submit → API POST /portal/<token>/submit
// The API answers 404 for every way a link can be dead, 400 for a body that
// breaks the contract; anything else is 502 and the page shows its retry.

const ACTIONS = { draft: 'PUT', submit: 'POST' } as const;
type Action = keyof typeof ACTIONS;

async function forward(request: NextRequest, { params }: { params: Promise<{ token: string; action: string }> }, method: 'PUT' | 'POST') {
    const { token, action } = await params;
    if (!(action in ACTIONS) || ACTIONS[action as Action] !== method) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const body = await request.text();
    let res: Response;
    try {
        res = await fetch(`${API}/portal/${encodeURIComponent(token)}/${action}`, {
            method,
            headers: portalHeaders(visitorFrom(request.headers)),
            body,
            cache: 'no-store',
        });
    } catch {
        return NextResponse.json({ error: 'unavailable' }, { status: 502 });
    }
    if (res.status === 404 || res.status === 400 || res.status === 429) return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
    if (!res.ok) return NextResponse.json({ error: 'unavailable' }, { status: 502 });
    return NextResponse.json(await res.json(), { status: 200 });
}

export const PUT = (request: NextRequest, ctx: { params: Promise<{ token: string; action: string }> }) => forward(request, ctx, 'PUT');
export const POST = (request: NextRequest, ctx: { params: Promise<{ token: string; action: string }> }) => forward(request, ctx, 'POST');
