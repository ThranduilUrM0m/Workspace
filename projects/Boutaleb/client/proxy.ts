import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { LOCALE_COOKIE, routing } from './i18n/routing';

const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
    // Only the bare home page follows a remembered language choice; every
    // other URL names its language and opens in it for everyone.
    const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
    if (request.nextUrl.pathname === '/' && chosen && chosen !== routing.defaultLocale && routing.locales.some((l) => l === chosen)) {
        return NextResponse.redirect(new URL(`/${chosen}`, request.url), 307);
    }
    return intl(request);
}

export const config = {
    // Everything except the API, Next internals, files (anything with a dot),
    // and the owner side: the ERP (/app) and the auth screens are English
    // only and never localised.
    matcher: '/((?!api|_next|app|login|forgot-password|reset-password|.*\\..*).*)',
};
