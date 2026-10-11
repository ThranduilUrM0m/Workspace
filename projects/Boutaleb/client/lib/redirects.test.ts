import { retiredRedirects } from './redirects';

describe('retiredRedirects', () => {
    const all = retiredRedirects();
    const find = (source: string) => all.find((r) => r.source === source);

    it('sends each retired address to its page in all three languages', () => {
        expect(find('/process')).toEqual({ source: '/process', destination: '/services#process', statusCode: 301 });
        expect(find('/en/faq')?.destination).toBe('/en/services#questions');
        expect(find('/ar/privacy-policy')?.destination).toBe('/ar/privacy');
        expect(find('/en/a-propos')?.destination).toBe('/en/about');
    });

    it('never prefixes the default language', () => {
        expect(all.some((r) => r.source.startsWith('/fr/'))).toBe(false);
    });

    it('has one rule per address and language', () => {
        expect(new Set(all.map((r) => r.source)).size).toBe(all.length);
        expect(all).toHaveLength(36);
    });
});
