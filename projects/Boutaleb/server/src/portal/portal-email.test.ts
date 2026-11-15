import { renderPortalLink } from '@repo/emails';

const url = `http://localhost:3002/p/${'A'.repeat(43)}`;
const base = { name: 'Omar Fassi', items: [{ project: 'Villa Zerhoun — Site', url }], site: 'http://localhost:3002' };
const two = [
    { project: 'Villa Zerhoun — Site', url },
    { project: 'Riad Nozha', url: `http://localhost:3002/p/${'B'.repeat(43)}` },
];

describe('the magic-link email', () => {
    it('English: left to right, greets by first name, carries the link in the button and as text', async () => {
        const { subject, html, text } = await renderPortalLink({ ...base, language: 'en' });
        expect(subject).toBe('Your brief for Villa Zerhoun — Site');
        expect(html).toContain('dir="ltr"');
        expect(html).toContain('Hello Omar,');
        expect(html).toContain(`href="${url}"`);
        expect(text).toContain(url);
    });

    it('French: its own subject and greeting', async () => {
        const { subject, html } = await renderPortalLink({ ...base, language: 'fr' });
        expect(subject).toBe('Votre brief pour Villa Zerhoun — Site');
        expect(html).toContain('lang="fr"');
        expect(html).toContain('Bonjour Omar,');
    });

    it('Arabic: right to left, with the link still readable left to right', async () => {
        const { html } = await renderPortalLink({ ...base, language: 'ar' });
        expect(html).toContain('dir="rtl"');
        expect(html).toContain('direction:ltr');
        expect(html).toContain('مرحباً Omar،');
    });

    it('several projects: one email, a labelled button and link for each, in every language', async () => {
        for (const language of ['en', 'fr', 'ar'] as const) {
            const { subject, html, text } = await renderPortalLink({ ...base, items: two, language });
            expect(subject).not.toContain('Villa');
            for (const i of two) {
                expect(html).toContain(`href="${i.url}"`);
                expect(html).toContain(i.project);
                expect(text).toContain(i.url);
            }
        }
        expect((await renderPortalLink({ ...base, items: two, language: 'en' })).subject).toBe('Your briefs');
        expect((await renderPortalLink({ ...base, items: two, language: 'fr' })).subject).toBe('Vos briefs');
    });

    it('never uses the first person in any language (public-copy rule)', async () => {
        // Arabic first person ("نحن", "نا" suffix) is checked by eye in the FR/AR copy review.
        const first = { en: /\b(we|our|us|I|me|my)\b/i, fr: /\b(nous|notre|nos|je|moi|mon|ma|mes)\b|\bj’/i };
        for (const language of ['en', 'fr'] as const) {
            const { text } = await renderPortalLink({ ...base, language });
            expect(text).not.toMatch(first[language]);
        }
    });
});
