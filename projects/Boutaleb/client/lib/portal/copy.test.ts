import { BRIEF_AREAS, BRIEF_PARTS } from '@repo/schemas';
import { COPY, PORTAL_LANGS } from './copy';

// The page's three languages stay in step with the brief's prompts, and the
// public-copy rule (no "I", "we", "me") holds in the languages it can be checked in.

const everyString = (c: unknown): string[] => (typeof c === 'string' ? [c] : typeof c === 'function' ? [] : c && typeof c === 'object' ? Object.values(c).flatMap(everyString) : []);

describe('portal copy', () => {
    it('has a question for every prompt and a name and reason for every area, in every language', () => {
        for (const { key } of PORTAL_LANGS) {
            const c = COPY[key];
            for (const p of BRIEF_PARTS) expect(c.questions[p.key]).toBeTruthy();
            expect(Object.keys(c.questions)).toHaveLength(BRIEF_PARTS.length);
            for (const a of BRIEF_AREAS) {
                expect(c.areas[a.key].name).toBeTruthy();
                expect(c.areas[a.key].why).toBeTruthy();
            }
        }
    });

    it('Arabic is right to left, the others left to right', () => {
        expect(COPY.ar.dir).toBe('rtl');
        expect(COPY.en.dir).toBe('ltr');
        expect(COPY.fr.dir).toBe('ltr');
    });

    it('English never speaks in the first person', () => {
        const text = everyString(COPY.en).join(' ');
        expect(text).not.toMatch(/\b(we|our|ours|us|I|me|my)\b/i);
    });

    it('French never speaks in the first person', () => {
        const text = everyString(COPY.fr).join(' ');
        expect(text).not.toMatch(/\b(nous|notre|nos|je|moi|mon|ma|mes)\b|\bj’|\bm’/i);
    });

    it('the functions interpolate what they are given', () => {
        expect(COPY.en.kicker('Villa Zerhoun')).toBe('Villa Zerhoun · your brief');
        expect(COPY.en.dealP('Villa Zerhoun')).toContain('designed for Villa Zerhoun');
        expect(COPY.fr.answered(3, 11)).toBe('3 réponses sur 11');
        expect(COPY.ar.part(2, 5)).toContain('2');
    });
});
