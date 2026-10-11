import type { PageRecord } from '../page-record';

// Copy verbatim from Blueprinting/wireframes/public/about.html. English only
// until the French translation (plan R3, by 2026-11-15).
// PLACEHOLDER, LAUNCH-BLOCKING: the whole `proof` block (the testimonial,
// its name and company, and the four stats) is wireframe filler, not fact.
// Developer decision 2026-10-11: placeholders until launch prep; the real
// values are on the long-lead list (plan, "About proof").

export type AboutBlocks = {
    hero: { ghost: string; eyebrow: string; heading: string; note: { before: string; strong: string; after: string } };
    standards: { label: string; heading: string; items: { title: string; short: string; long: string; expanded: string }[] };
    process: { label: string; heading: string; steps: { title: string; text: string }[]; focal: string };
    proof: {
        placeholder: boolean;
        label: string;
        quote: string;
        name: string;
        role: string;
        company: string;
        stats: { value: string; mark: string; title: string; text: string }[];
    };
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
                proof: {
                    placeholder: true,
                    label: 'Proof',
                    quote: 'Shipped faster than I expected, and every choice was explained before it was made.',
                    name: 'Client Name',
                    role: 'Founder, Web Platform Project',
                    company: 'Client One',
                    stats: [
                        { value: '12', mark: '+', title: 'Client Projects', text: 'Shipped end to end.' },
                        { value: '100', mark: '%', title: 'On-Time Rate', text: 'Every project delivered on schedule.' },
                        { value: '5', mark: 'yr', title: 'Experience', text: 'Building web platforms and tooling.' },
                        { value: '2', mark: 'd', title: 'Response Time', text: 'Working days, reply window.' },
                    ],
                },
            },
        },
    },
};
