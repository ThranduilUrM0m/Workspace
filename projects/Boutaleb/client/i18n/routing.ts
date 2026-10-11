import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from './locales';

// Route rule (site-completeness §0): English slugs in every language, the
// language in the prefix. French is the unprefixed default.
export const routing = defineRouting({
    locales,
    defaultLocale,
    localePrefix: 'as-needed',
    // A URL names its language; the browser's Accept-Language never
    // redirects a visitor (or a crawler) off the address it asked for.
    localeDetection: false,
    // The language switch writes the cookie itself (SiteHeader), and only
    // "/" reads it (proxy.ts); next-intl's own cookie would follow every visit.
    localeCookie: false,
    // hreflang is emitted per page from what really exists (seo-boutaleb §2,
    // ticket T2.6); the automatic Link header would list every language for
    // every path, untranslated ones and 404s included.
    alternateLinks: false,
});

export const LOCALE_COOKIE = 'NEXT_LOCALE';

export type Locale = (typeof routing.locales)[number];
