import { distance } from 'fastest-levenshtein';

// The 404 page's "did you mean" row. Every public address is a short
// English slug, so a typo is one or two edits away from the real one.

export type RouteKey = 'services' | 'portfolio' | 'about' | 'blog' | 'contact' | 'privacy' | 'terms' | 'legalNotice' | 'process' | 'faq';

const ROUTES: { slug: string; key: RouteKey; href: string }[] = [
    { slug: 'services', key: 'services', href: '/services' },
    { slug: 'portfolio', key: 'portfolio', href: '/portfolio' },
    { slug: 'about', key: 'about', href: '/about' },
    { slug: 'blog', key: 'blog', href: '/blog' },
    { slug: 'contact', key: 'contact', href: '/contact' },
    { slug: 'privacy', key: 'privacy', href: '/privacy' },
    { slug: 'terms', key: 'terms', href: '/terms' },
    { slug: 'legal-notice', key: 'legalNotice', href: '/legal-notice' },
    { slug: 'process', key: 'process', href: '/services#process' },
    { slug: 'faq', key: 'faq', href: '/services#questions' },
];

/** `path` without its language prefix, e.g. "/proces". */
export function closestRoute(path: string) {
    const asked = path.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (!asked) return null;
    let best: (typeof ROUTES)[number] | null = null;
    let bestDistance = Infinity;
    for (const route of ROUTES) {
        const d = distance(asked, route.slug);
        if (d < bestDistance) {
            best = route;
            bestDistance = d;
        }
    }
    // One edit for short slugs, up to a quarter of the slug for long ones.
    if (!best || bestDistance > Math.max(1, Math.floor(best.slug.length / 4))) return null;
    return { key: best.key, href: best.href };
}
