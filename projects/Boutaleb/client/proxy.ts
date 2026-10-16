import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { LOCALE_COOKIE, routing } from './i18n/routing';

const intl = createMiddleware(routing);

// Clerk only attaches the session here. Each owner page checks it itself
// (lib/owner-auth.ts): Clerk deprecated route protection in the proxy.
const clerk = clerkMiddleware({ signInUrl: '/login' });

// The owner side: the ERP (/app) and the auth screens. English only, never
// localised, and the only place Clerk runs. The public site carries no
// Clerk script and sets no Clerk cookie.
const OWNER = /^\/(app|login|forgot-password|reset-password)(\/|$)/;

export default function proxy(request: NextRequest, event: NextFetchEvent) {
    const { pathname } = request.nextUrl;
    if (OWNER.test(pathname)) return clerk(request, event);

    // Only the bare home page follows a remembered language choice; every
    // other URL names its language and opens in it for everyone.
    const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
    if (pathname === '/' && chosen && chosen !== routing.defaultLocale && routing.locales.some((l) => l === chosen)) {
        return NextResponse.redirect(new URL(`/${chosen}`, request.url), 307);
    }
    return intl(request);
}

export const config = {
    // Everything except the API, Next internals and files (anything with a dot).
    matcher: '/((?!api|_next|.*\\..*).*)',
};
