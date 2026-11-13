import { NextResponse } from 'next/server';
import { API, formsKey } from '../proxy';

// A form asks for its signed timestamp here when the visitor first
// touches it (lib/form-token.ts). The API signs it; the key never leaves
// the API. Never cached: each token carries the moment it was issued.

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const res = await fetch(`${API}/enquiries/token`, { headers: { 'x-forms-key': formsKey() }, cache: 'no-store' });
        if (!res.ok) return NextResponse.json({ error: 'unavailable' }, { status: 502 });
        return NextResponse.json(await res.json(), { headers: { 'cache-control': 'no-store' } });
    } catch {
        return NextResponse.json({ error: 'unavailable' }, { status: 502 });
    }
}
