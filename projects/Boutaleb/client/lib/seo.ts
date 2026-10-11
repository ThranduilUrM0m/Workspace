import type { Metadata } from 'next';
import { defaultLocale, locales } from '../i18n/locales';

// The SEO contract (Blueprinting/tech/seo-boutaleb.md §1, §2, §8). Every
// public page's generateMetadata goes through seoFor(); nothing else writes
// titles, canonicals or hreflang.

type Locale = (typeof locales)[number];

/** Production origin. NEXT_PUBLIC_SITE_URL overrides it on the dev site. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://boutaleb.dev').replace(/\/$/, '');

const OG_LOCALE: Record<Locale, string> = { fr: 'fr_MA', en: 'en_US', ar: 'ar_MA' };

type SeoFields = { title?: string; description?: string };

export type SeoRecord = {
    /** The page or post title, tier 3 of the title chain. */
    title: string;
    /** Plain text of the body, tier 3 of the description chain. */
    body?: string;
    /** Tier 1: what the owner typed in the SEO fields. */
    seo?: SeoFields;
    /** Tier 2: an AI suggestion the owner accepted. */
    aiSeo?: SeoFields;
    /** Featured image URL; the sitewide default share image otherwise. */
    image?: string;
};

export type SeoPage = {
    /** English slug path without the language prefix: '/privacy', '/' for home. */
    path: string;
    /** Languages the page is really written in. Others are left out of
     *  hreflang and kept out of the index (§2). Defaults to all three. */
    translated?: readonly Locale[];
    /** Pages that must never be indexed (/thanks, 404). */
    noindex?: boolean;
};

/** First ~155 characters, cut at a word. */
export function excerpt(text: string, max = 155) {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max + 1);
    const space = cut.lastIndexOf(' ');
    return `${cut.slice(0, space > 0 ? space : max).replace(/[\s,;:.—-]+$/, '')}…`;
}

/** Manual field, then accepted AI suggestion, then derived. Never empty. */
export function resolveSeo(record: SeoRecord): { title: string; description: string } {
    const title = record.seo?.title || record.aiSeo?.title || record.title;
    const description = record.seo?.description || record.aiSeo?.description || excerpt(record.body ?? '') || record.title;
    return { title, description };
}

export function localePath(path: string, locale: Locale) {
    const prefix = locale === defaultLocale ? '' : `/${locale}`;
    if (path === '/') return prefix || '/';
    return `${prefix}${path}`;
}

export function seoFor(record: SeoRecord, locale: Locale, page: SeoPage): Metadata {
    const { title, description } = resolveSeo(record);
    const translated = page.translated ?? locales;
    const real = translated.includes(locale);
    const url = localePath(page.path, locale);
    // A page's openGraph replaces its parent's, file-based image included,
    // so the default ([locale]/opengraph-image.tsx) is named here.
    const image = { url: record.image ?? localePath('/opengraph-image', locale), width: 1200, height: 630, alt: title };

    const languages: Record<string, string> = {};
    if (!page.noindex) {
        for (const l of translated) languages[l] = localePath(page.path, l);
        const xDefault = translated.includes(defaultLocale) ? defaultLocale : translated[0];
        if (xDefault) languages['x-default'] = localePath(page.path, xDefault);
    }

    return {
        title,
        description,
        alternates: { canonical: url, languages },
        robots: page.noindex || !real ? { index: false, follow: true } : undefined,
        openGraph: {
            type: 'website',
            siteName: 'Boutaleb',
            title,
            description,
            url,
            locale: OG_LOCALE[locale],
            alternateLocale: translated.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
            images: [image],
        },
        twitter: { card: 'summary_large_image', title, description, images: [image] },
    };
}
