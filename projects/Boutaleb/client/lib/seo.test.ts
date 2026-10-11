import { excerpt, localePath, resolveSeo, seoFor } from './seo';

describe('resolveSeo', () => {
    it('prefers the manual field, then the accepted AI suggestion, then the record', () => {
        const record = { title: 'Privacy policy', body: 'What is collected is what you send.' };
        expect(resolveSeo({ ...record, seo: { title: 'Manual' }, aiSeo: { title: 'AI' } }).title).toBe('Manual');
        expect(resolveSeo({ ...record, aiSeo: { title: 'AI' } }).title).toBe('AI');
        expect(resolveSeo(record)).toEqual({ title: 'Privacy policy', description: 'What is collected is what you send.' });
    });

    it('never returns an empty description', () => {
        expect(resolveSeo({ title: 'Thanks' }).description).toBe('Thanks');
    });
});

describe('excerpt', () => {
    it('cuts at a word near 155 characters', () => {
        const text = 'word '.repeat(60);
        const out = excerpt(text);
        expect(out.length).toBeLessThanOrEqual(156);
        expect(out.endsWith('word…')).toBe(true);
    });
});

describe('localePath', () => {
    it('leaves French unprefixed', () => {
        expect(localePath('/', 'fr')).toBe('/');
        expect(localePath('/', 'en')).toBe('/en');
        expect(localePath('/about', 'ar')).toBe('/ar/about');
    });
});

describe('seoFor', () => {
    const record = { title: 'About', seo: { description: 'Who builds it.' } };

    it('is self-canonical with hreflang for all three and x-default to French', () => {
        const m = seoFor(record, 'en', { path: '/about' });
        expect(m.alternates?.canonical).toBe('/en/about');
        expect(m.alternates?.languages).toEqual({ fr: '/about', en: '/en/about', ar: '/ar/about', 'x-default': '/about' });
        expect(m.openGraph).toMatchObject({ locale: 'en_US', alternateLocale: ['fr_MA', 'ar_MA'] });
        expect(m.robots).toBeUndefined();
    });

    it('uses the featured image, or the default share image of the page language', () => {
        const og = (m: ReturnType<typeof seoFor>) => (m.openGraph?.images as { url: string }[])[0].url;
        expect(og(seoFor(record, 'ar', { path: '/about' }))).toBe('/ar/opengraph-image');
        expect(og(seoFor(record, 'fr', { path: '/about' }))).toBe('/opengraph-image');
        expect(og(seoFor({ ...record, image: '/images/a.jpg' }, 'en', { path: '/about' }))).toBe('/images/a.jpg');
    });

    it('leaves untranslated languages out and keeps their URL out of the index', () => {
        const m = seoFor(record, 'fr', { path: '/privacy', translated: ['en'] });
        expect(m.alternates?.languages).toEqual({ en: '/en/privacy', 'x-default': '/en/privacy' });
        expect(m.robots).toEqual({ index: false, follow: true });
    });

    it('emits no hreflang on noindex pages', () => {
        const m = seoFor(record, 'ar', { path: '/thanks', noindex: true });
        expect(m.alternates?.languages).toEqual({});
        expect(m.robots).toEqual({ index: false, follow: true });
    });
});
