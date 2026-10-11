import type { PageRecord } from '../page-record';

// Copy verbatim from Blueprinting/wireframes/public/about.html. English only
// until the French translation (plan R3, by 2026-11-15).
// The proof block's testimonial and stats come from content/proof.ts
// (placeholder, launch-blocking).

export type AboutBlocks = {
    hero: { ghost: string; eyebrow: string; heading: string; note: { before: string; strong: string; after: string } };
    standards: { label: string; heading: string; items: { title: string; short: string; long: string; expanded: string }[] };
    process: { label: string; heading: string; steps: { title: string; text: string }[]; focal: string };
    proof: { label: string };
};

export const aboutPage: PageRecord<AboutBlocks> = {
    id: 'about',
    kind: 'page',
    slug: '/about',
    locales: {
        en: {
            title: 'About',
            description:
                'Boutaleb is a name, and the standard a practice is held to: plain language, no surprises, proof over promise, and one direct line from brief to handoff.',
            blocks: {
                hero: {
                    ghost: 'BOUTALEB',
                    eyebrow: 'About · The practice',
                    heading: 'Boutaleb is a name, and the standard a practice is held to.',
                    note: {
                        before: 'It’s an Arabic name, first — not a founder’s memoir and not a company roster. What follows isn’t a biography. It’s ',
                        strong: 'how this practice works',
                        after: ', and what it holds itself to on every project.',
                    },
                },
                standards: {
                    label: 'Standards',
                    heading: 'The traits every engagement is measured against.',
                    items: [
                        {
                            title: 'No jargon',
                            short: 'Plain language, every update. If a client can’t follow the reasoning, the explanation failed — not the client.',
                            expanded: 'No jargon, expanded',
                            long: 'Every deliverable comes with a plain-language explanation of what changed and why — no unexplained technical terms in client-facing updates, ever.',
                        },
                        {
                            title: 'No surprises',
                            short: 'Scope, cost, and timeline agreed up front and tracked in the open, not discovered at delivery.',
                            expanded: 'No surprises, expanded',
                            long: 'Scope and cost are written down before work starts, and any change to either is flagged the moment it happens — not folded quietly into the next invoice.',
                        },
                        {
                            title: 'Proof over promise',
                            short: 'Decisions backed by shipped work and real numbers, not portfolio language.',
                            expanded: 'Proof over promise, expanded',
                            long: 'Design and technical choices are justified with real precedent — shipped case studies and measured outcomes, not adjectives.',
                        },
                        {
                            title: 'Direct line',
                            short: 'One point of contact throughout — no hand-off maze, no account-manager layer.',
                            expanded: 'Direct line, expanded',
                            long: 'The person building it is the person you talk to — no relay through an account manager, no context lost between hand-offs.',
                        },
                    ],
                },
                process: {
                    label: 'Process',
                    heading: 'Four stages, same order, every time.',
                    steps: [
                        { title: 'Discovery', text: 'Goals, constraints, and success criteria — written down before anything is designed.' },
                        { title: 'Design', text: 'Structure and visual direction, reviewed with the client at each stage, not at the end.' },
                        { title: 'Build', text: 'Implementation against the agreed design — no silent scope drift.' },
                        { title: 'Handoff', text: 'Documentation and a working system the client actually owns.' },
                    ],
                    focal: '[ focal photo / mark — process in motion ]',
                },
                proof: { label: 'Proof' },
            },
        },
    },
};
