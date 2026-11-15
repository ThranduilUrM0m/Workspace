import { PORTAL_LANGS } from './copy';
import { pickLang, RESEND_COPY, RESEND_LINK } from './resend-copy';

// "Email me my access link" (T8.5): three languages, the public-copy rule
// (no "I", "we", "me"), and the language a first visit opens in.

const everyString = (c: unknown): string[] => (typeof c === 'string' ? [c] : c && typeof c === 'object' ? Object.values(c).flatMap(everyString) : []);

describe('resend copy', () => {
    it('every language has every line, and a link text', () => {
        for (const { key } of PORTAL_LANGS) {
            for (const line of everyString(RESEND_COPY[key])) expect(line.trim()).not.toBe('');
            expect(RESEND_LINK[key]).toBeTruthy();
        }
    });

    it('Arabic is right to left, the others left to right', () => {
        expect(RESEND_COPY.ar.dir).toBe('rtl');
        expect(RESEND_COPY.en.dir).toBe('ltr');
        expect(RESEND_COPY.fr.dir).toBe('ltr');
    });

    it('English and French never speak in the first person', () => {
        expect(everyString([RESEND_COPY.en, RESEND_LINK.en]).join(' ')).not.toMatch(/\b(we|our|ours|us|I|me|my)\b/i);
        expect(everyString([RESEND_COPY.fr, RESEND_LINK.fr]).join(' ')).not.toMatch(/\b(nous|notre|nos|je|moi|mon|ma|mes)\b|\bj’|\bm’/i);
    });

    it('the answer says nothing that tells a client address from any other', () => {
        for (const { key } of PORTAL_LANGS) expect(RESEND_COPY[key].doneH + RESEND_COPY[key].doneP).not.toMatch(/not found|no client|unknown|inconnu|introuvable|غير موجود/i);
    });
});

describe('pickLang', () => {
    it('takes the first language the page speaks, in the visitor\'s order', () => {
        expect(pickLang('en-US,en;q=0.9,fr;q=0.8')).toBe('en');
        expect(pickLang('de-DE,ar-MA;q=0.9,fr;q=0.5')).toBe('ar');
        expect(pickLang('fr-MA')).toBe('fr');
    });

    it('French when it knows none, or is told nothing', () => {
        expect(pickLang('de,es;q=0.8')).toBe('fr');
        expect(pickLang('')).toBe('fr');
        expect(pickLang(null)).toBe('fr');
    });
});
