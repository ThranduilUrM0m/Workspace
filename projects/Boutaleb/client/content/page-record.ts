import { defaultLocale, locales } from '../i18n/locales';

// The shape of a Pages API record (ERP Pages screen, shell/pages-data.js):
// one id and one English slug, then per language its own title, meta
// description and blocks. Page copy lives in content/pages/*.ts in exactly
// this shape, so M11 swaps the loader (a fetch) and the pages stay as they
// are (plan T3.5).

export type Locale = (typeof locales)[number];

export type PageKind = 'page' | 'legal' | 'system' | 'index';

export type LocaleCopy<Blocks> = {
    title: string;
    /** Meta description: SEO tier 1, written for the page. */
    description: string;
    blocks: Blocks;
};

export type PageRecord<Blocks> = {
    id: string;
    kind: PageKind;
    /** '/services'; the language goes in the prefix, never here. */
    slug: string;
    /** Only the languages the page is really written in. */
    locales: Partial<Record<Locale, LocaleCopy<Blocks>>>;
};

/**
 * The copy to render at a URL's language. A missing translation renders the
 * copy that exists (French first, then English), marked with its own `lang`,
 * and `translated` tells seoFor() to keep that URL out of the index.
 */
export function pickLocale<Blocks>(record: PageRecord<Blocks>, locale: Locale) {
    const translated = locales.filter((l) => record.locales[l]);
    const lang = record.locales[locale]
        ? locale
        : ([defaultLocale, 'en', ...locales] as Locale[]).find((l) => record.locales[l]);
    if (!lang) throw new Error(`Page "${record.id}" has no copy in any language.`);
    return { copy: record.locales[lang]!, lang, translated };
}
