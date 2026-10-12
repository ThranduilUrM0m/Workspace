import { renderReceipt } from '@repo/emails';

// The receipt email (@repo/emails), rendered, not sent: the Trigger.dev
// job sends it from M8. Checked here against the rules email-receipt.html
// ships with.

const base = {
    name: 'Sara Alaoui',
    email: 'sara@atlas-riads.ma',
    message: 'A booking site for a riad.\nSix rooms.',
    site: 'https://boutaleb.dev',
};

describe('receipt email', () => {
    it('a footer send asks for budget and timeline', async () => {
        const { subject, html, text } = await renderReceipt({
            ...base,
            source: 'footer',
            answers: [{ label: 'Project type', value: 'Website' }],
            addDetailUrl: 'https://boutaleb.dev/en/contact?lead=L-0B6F',
        });
        expect(subject).toBe('Got it — a copy of your message');
        expect(html).toContain('Thanks, Sara. It’s in.');
        expect(html).toContain('href="https://boutaleb.dev/en/contact?lead=L-0B6F"');
        expect(html).not.toContain('Reply to this email');
        expect(text).toContain('Add budget and timeline');
    });

    it('a /contact send lists its answers and asks for a reply', async () => {
        const { html } = await renderReceipt({
            ...base,
            source: 'contact',
            answers: [
                { label: 'Project type', value: 'New project' },
                { label: 'Budget', value: '$2k–$5k' },
                { label: 'Timeline', value: 'ASAP' },
            ],
        });
        expect(html).toContain('Anything to add? Reply to this email.');
        expect(html).toContain('$2k–$5k');
        expect(html).not.toContain('Add budget and timeline');
    });

    it('ships as email clients need it', async () => {
        const { html } = await renderReceipt({ ...base, source: 'contact', answers: [] });
        expect(html).not.toMatch(/<svg|<script/);
        // Blocked images leave nothing behind.
        expect(html).toContain('<img alt="" src="https://boutaleb.dev/email/glyph-64.png" width="32" height="30"');
        expect(html).toMatch(/<table[^>]*width="600"[^>]*align="center"/);
        expect(html).toContain('bgcolor="#F7F5F2"');
        // A visitor's text is text, never markup.
        const { html: escaped } = await renderReceipt({ ...base, source: 'contact', answers: [], message: '<b>hi</b>' });
        expect(escaped).toContain('&lt;b&gt;hi&lt;/b&gt;');
    });
});
