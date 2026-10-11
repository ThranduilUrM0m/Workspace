import { CONTACT_STEPS, commentInput, contactEnquiry, footerEnquiry } from '@repo/schemas';

// The shared schemas (@repo/schemas), run here because this app's Jest is
// the one the forms use; the server will run the same rules (public-forms §2).

const key = '0b6f3f2e-5d0a-4c8e-9a51-2f6d1c7e8a90';
const codes = (r: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
    Object.fromEntries((r.error?.issues ?? []).map((i) => [String(i.path[0]), i.message]));

describe('footerEnquiry', () => {
    const ok = { name: '  Sara L. ', email: ' Sara@Atlas-Riads.MA ', projectType: 'both', message: 'A site.', idempotencyKey: key };

    it('trims, lowercases the email and keeps the rest', () => {
        const r = footerEnquiry.parse({ ...ok, extra: 'dropped' });
        expect(r).toEqual({ name: 'Sara L.', email: 'sara@atlas-riads.ma', projectType: 'both', message: 'A site.', idempotencyKey: key });
    });

    it('answers in codes the form turns into words', () => {
        const r = footerEnquiry.safeParse({ ...ok, name: '   ', email: 'nope', message: 'x'.repeat(5001) });
        expect(codes(r)).toEqual({ name: 'required', email: 'email', message: 'tooLong' });
        expect(codes(footerEnquiry.safeParse({ ...ok, email: '' }))).toEqual({ email: 'required' });
    });

    it('refuses an unknown project type and a missing key', () => {
        expect(footerEnquiry.safeParse({ ...ok, projectType: 'app' }).success).toBe(false);
        expect(footerEnquiry.safeParse({ ...ok, idempotencyKey: 'x' }).success).toBe(false);
    });
});

describe('contactEnquiry', () => {
    const ok = {
        name: 'Hamza R.',
        email: 'hamza@example.ma',
        category: 'new',
        message: 'A booking site.',
        budget: 'not-sure',
        timeline: 'flexible',
        via: 'email',
        stage: 'idea',
        idempotencyKey: key,
    };

    it('needs only steps 1 and 2; every optional field may stay empty', () => {
        expect(contactEnquiry.safeParse(ok).success).toBe(true);
        expect(contactEnquiry.safeParse({ ...ok, phone: '', site: 'instagram.com/atlas', outcome: '' }).success).toBe(true);
    });

    it('names every schema field in exactly one step', () => {
        const stepped = CONTACT_STEPS.flat().sort();
        const fields = Object.keys(contactEnquiry.shape)
            .filter((k) => k !== 'idempotencyKey' && k !== 'lead')
            .sort();
        expect(stepped).toEqual(fields);
    });
});

describe('commentInput', () => {
    it('needs a name, an email and the comment', () => {
        const r = commentInput.safeParse({ name: '', email: 'a@b.ma', comment: '', slug: 'p', idempotencyKey: key });
        expect(codes(r)).toEqual({ name: 'required', comment: 'required' });
    });
});
