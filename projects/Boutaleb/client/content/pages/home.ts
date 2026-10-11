import type { PageRecord } from '../page-record';

// Copy verbatim from Blueprinting/wireframes/public/homepage.html. English
// only until the French translation (plan R3). Projects, posts, testimonials
// and stats come from content/work.ts, posts.ts and proof.ts.

type Card = { eyebrow: string; title: string; text: string };

export type HomeBlocks = {
    hero: { built: string; script: string; word: string; eyebrow: string; line: [string, string]; cta: string; strip: string };
    approach: { eyebrow: string; heading: string; sub: string; items: { title: string; text: string }[]; image: string };
    about: { eyebrow: string; image: string; heading: string; text: string; cta: string };
    process: { eyebrow: string; heading: string; sub: string; cards: Card[]; link: string; image: string };
    work: { eyebrow: string; all: string; image: string };
    trust: { eyebrow: string; clientsLabel: string };
    blog: { eyebrow: string; slide: string };
};

export const homePage: PageRecord<HomeBlocks> = {
    id: 'home',
    kind: 'page',
    slug: '/',
    locales: {
        en: {
            title: 'Boutaleb — custom web products',
            description:
                'Bespoke websites and internal tools for small teams in Morocco and beyond, scoped, designed and shipped by the one person you talk to.',
            blocks: {
                hero: {
                    built: 'BUILT',
                    script: 'made with care',
                    word: 'Bespoke',
                    eyebrow: '002 · custom web products',
                    line: ['Around your business.', 'Not a template.'],
                    cta: 'Start a project →',
                    strip: '2026 · MOROCCO',
                },
                approach: {
                    eyebrow: '003 · approach',
                    heading: 'One person, no assembly line.',
                    sub: 'Every project is scoped, designed, and shipped by the same person who talks to you at the start — no handoffs, no account manager relaying messages between departments.',
                    items: [
                        {
                            title: 'Direct collaboration',
                            text: 'You talk directly to the person building it — no relay through project managers or support tickets.',
                        },
                        {
                            title: 'Full ownership',
                            text: 'One person accountable for the whole build, start to finish — no dropped threads between teams.',
                        },
                        {
                            title: 'No overhead tax',
                            text: 'Solo means no agency margin stacked on top of the work. You pay for the build, not the org chart.',
                        },
                    ],
                    image: 'image, PNG',
                },
                about: {
                    eyebrow: '004 · how boutaleb builds',
                    image: 'image, PNG',
                    heading: 'Built to just work.',
                    text: 'Every decision explained in plain language, shipped early, refined in the open, and handed off clean enough that any developer could pick it up tomorrow.',
                    cta: 'Read the full story',
                },
                process: {
                    eyebrow: '005 · process',
                    heading: 'Built to your spec.',
                    sub: 'Three ways to work together, depending on how much you already know about what you need.',
                    cards: [
                        {
                            eyebrow: 'Custom',
                            title: 'No templates, no compromises',
                            text: 'Every build starts from your actual requirements, not a theme you have to bend your business around.',
                        },
                        {
                            eyebrow: 'Direct',
                            title: 'No middleman',
                            text: 'Feedback goes straight to the person writing the code — changes land in hours, not sprint cycles.',
                        },
                        {
                            eyebrow: 'Lean',
                            title: 'Speed without the bloat',
                            text: 'No unnecessary dependencies, no framework churn — just what the project actually needs to run well.',
                        },
                    ],
                    link: 'Learn more →',
                    image: 'image, PNG',
                },
                work: { eyebrow: '006 · selected work', all: 'See full portfolio →', image: 'image, PNG' },
                trust: { eyebrow: '007 · trusted by', clientsLabel: 'worked with' },
                blog: { eyebrow: '008 · from the blog', slide: 'Post {n}' },
            },
        },
    },
};
