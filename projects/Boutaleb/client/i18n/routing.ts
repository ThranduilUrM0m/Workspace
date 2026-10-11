import { defineRouting } from 'next-intl/routing';

// Route rule (site-completeness §0): English slugs in every language, the
// language in the prefix. French is the unprefixed default.
export const routing = defineRouting({
    locales: ['fr', 'en', 'ar'],
    defaultLocale: 'fr',
    localePrefix: 'as-needed',
    // A URL names its language; the browser's Accept-Language never
    // redirects a visitor (or a crawler) off the address it asked for.
    localeDetection: false,
    // hreflang is emitted per page from what really exists (seo-boutaleb §2,
    // ticket T2.6); the automatic Link header would list every language for
    // every path, untranslated ones and 404s included.
    alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
