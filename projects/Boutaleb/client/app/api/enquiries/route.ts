import { contactEnquiry, HONEYPOT } from '@repo/schemas';
import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales } from '@/i18n/locales';
import { THANKS_COOKIE, THANKS_COOKIE_MAX_AGE } from '@/lib/thanks';

// Local stand-in for the server's POST /enquiries (public-forms.md §1), so
// /contact runs end to end before the API exists. It answers as the real
// one will: a bot gets the same 303 as a person, invalid input 422 with
// field codes, a valid send 303 to /thanks with the 30-minute email cookie.
// It stores and sends nothing. M8 points the form at the API and deletes
// this file. Footer sends (`source: footer`) join it in T5.3.

type Locale = (typeof locales)[number];

export async function POST(request: NextRequest) {
    const data = await request.formData();
    const raw = Object.fromEntries([...data.entries()].filter(([, v]) => typeof v === 'string')) as Record<string, string>;
    const locale: Locale = locales.includes(raw.locale as Locale) ? (raw.locale as Locale) : defaultLocale;
    const thanks = new URL(locale === defaultLocale ? '/thanks' : `/${locale}/thanks`, request.url);

    // A filled honeypot is a bot: the same answer as a real send, nothing kept.
    if (raw[HONEYPOT]) return NextResponse.redirect(thanks, 303);

    if (raw.source !== 'contact') return NextResponse.json({ errors: { source: 'required' } }, { status: 422 });
    const parsed = contactEnquiry.safeParse(raw);
    if (!parsed.success) {
        const errors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
        return NextResponse.json({ errors }, { status: 422 });
    }

    const res = NextResponse.redirect(thanks, 303);
    res.cookies.set(THANKS_COOKIE, parsed.data.email, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: THANKS_COOKIE_MAX_AGE,
        path: '/',
    });
    return res;
}
