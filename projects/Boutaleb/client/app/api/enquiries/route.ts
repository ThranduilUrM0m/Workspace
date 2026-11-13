import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales } from '@/i18n/locales';
import { THANKS_COOKIE, THANKS_COOKIE_MAX_AGE } from '@/lib/thanks';
import { API, formsKey, visitorIp } from './proxy';

// Both public forms send here; this route passes the send to the API's
// POST /enquiries (public-forms.md §1), which does the real work: spam,
// rate limit, validation, idempotency, the write, the emails. Kept on the
// site's own address so the /thanks cookie is the site's, and so the API
// endpoint is never reachable from a browser.
//
// The API answers 201 { ref, email }; this route turns that into each
// form's answer: the footer gets 201 { lead } (its card links /contact
// with it), /contact gets 303 to /thanks with the 30-minute email cookie.
// 422 and 429 pass through; anything else is 502 and the form shows its
// failure state.

type Locale = (typeof locales)[number];

export async function POST(request: NextRequest) {
    const data = await request.formData();
    // Strings only: files are not sent on yet (no storage for them in T8.1).
    const fields = Object.fromEntries([...data.entries()].filter(([, v]) => typeof v === 'string')) as Record<string, string>;
    const locale: Locale = locales.includes(fields.locale as Locale) ? (fields.locale as Locale) : defaultLocale;

    let res: Response;
    try {
        res = await fetch(`${API}/enquiries`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-forms-key': formsKey(), 'x-visitor-ip': visitorIp(request) },
            body: JSON.stringify(fields),
            cache: 'no-store',
        });
    } catch {
        return NextResponse.json({ error: 'unavailable' }, { status: 502 });
    }

    if (res.status === 422 || res.status === 429) return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
    if (res.status !== 201) return NextResponse.json({ error: 'unavailable' }, { status: 502 });

    const { ref, email } = (await res.json()) as { ref: string; email: string };
    if (fields.source === 'footer') return NextResponse.json({ lead: ref }, { status: 201 });

    const thanks = new URL(locale === defaultLocale ? '/thanks' : `/${locale}/thanks`, request.url);
    const out = NextResponse.redirect(thanks, 303);
    // A bot's fake success has its email too; the cookie only ever shows a visitor what they typed.
    if (email) {
        out.cookies.set(THANKS_COOKIE, email, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: THANKS_COOKIE_MAX_AGE,
            path: '/',
        });
    }
    return out;
}
