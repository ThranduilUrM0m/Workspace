import { contactEnquiry, footerEnquiry, HONEYPOT } from '@repo/schemas';
import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales } from '@/i18n/locales';
import { THANKS_COOKIE, THANKS_COOKIE_MAX_AGE } from '@/lib/thanks';

// Local stand-in for the server's POST /enquiries (public-forms.md §1), so
// both forms run end to end before the API exists. It answers as the real
// one will: invalid input 422 with field codes; a valid /contact send 303
// to /thanks with the 30-minute email cookie; a valid footer send 201 with
// the lead it made, for the card's "Add budget and timeline" link. A bot
// gets the same answer as a person. It stores and sends nothing. M8 points
// the forms at the API and deletes this file.

type Locale = (typeof locales)[number];

export async function POST(request: NextRequest) {
    const data = await request.formData();
    const raw = Object.fromEntries([...data.entries()].filter(([, v]) => typeof v === 'string')) as Record<string, string>;
    const locale: Locale = locales.includes(raw.locale as Locale) ? (raw.locale as Locale) : defaultLocale;
    const thanks = new URL(locale === defaultLocale ? '/thanks' : `/${locale}/thanks`, request.url);

    const bot = Boolean(raw[HONEYPOT]);

    if (raw.source === 'footer') {
        // A filled honeypot is a bot: the same answer as a real send, nothing kept.
        if (bot) return NextResponse.json({ lead: 'L-0000' }, { status: 201 });
        const parsed = footerEnquiry.safeParse(raw);
        if (!parsed.success) return invalid(parsed.error.issues);
        return NextResponse.json({ lead: `L-${parsed.data.idempotencyKey.slice(0, 4).toUpperCase()}` }, { status: 201 });
    }

    if (bot) return NextResponse.redirect(thanks, 303);
    if (raw.source !== 'contact') return NextResponse.json({ errors: { source: 'required' } }, { status: 422 });
    const parsed = contactEnquiry.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error.issues);

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

function invalid(issues: { path: PropertyKey[]; message: string }[]) {
    const errors = Object.fromEntries(issues.map((i) => [String(i.path[0]), i.message]));
    return NextResponse.json({ errors }, { status: 422 });
}
