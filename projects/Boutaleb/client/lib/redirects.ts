import { defaultLocale, locales } from '../i18n/locales';

// Retired public addresses, 301 in every language (seo-boutaleb §7,
// site-completeness §0). Sources are path-only: next.config cannot match a
// #fragment, but a Location header may carry one and browsers keep it.
// Relative import on purpose: next.config.ts loads this file, and the @/
// alias is not resolved there.

const RETIRED: [from: string, to: string][] = [
    // Folded into /services (2026-09-26).
    ['/process', '/services#process'],
    ['/faq', '/services#questions'],
    // Renamed on the 2026-08-29 route map.
    ['/privacy-policy', '/privacy'],
    // The French slugs of the ERP Pages fixture, switched to English.
    ['/realisations', '/portfolio'],
    ['/a-propos', '/about'],
    ['/journal', '/blog'],
    ['/confidentialite', '/privacy'],
    ['/conditions', '/terms'],
    ['/mentions-legales', '/legal-notice'],
    ['/merci', '/thanks'],
];

export type Redirect = { source: string; destination: string; statusCode: 301 };

export function retiredRedirects(): Redirect[] {
    const prefixes = locales.map((l) => (l === defaultLocale ? '' : `/${l}`));
    return RETIRED.flatMap(([from, to]) =>
        prefixes.map((p) => ({ source: `${p}${from}`, destination: `${p}${to}`, statusCode: 301 as const })),
    );
}
