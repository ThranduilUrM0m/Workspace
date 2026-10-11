import type { PageRecord } from '../page-record';

// Copy verbatim from Blueprinting/wireframes/public/services.html. English
// only until the French translation (plan R3, by 2026-11-15). The ids
// #offers, #process and #questions are linked from every footer and the
// homepage, and stay English in all three languages.

export type ServicesBlocks = {
    hero: {
        ghost: string;
        eyebrow: string;
        heading: string;
        lead: string;
        index: { href: string; figure: string; label: string }[];
        indexLabel: string;
    };
    offers: {
        label: string;
        heading: string;
        note: string;
        items: { title: string; situation: string; text: string; link?: { href: string; label: string }; points: string[] }[];
    };
    process: {
        label: string;
        heading: string;
        noteLead: string;
        note: string;
        columns: [string, string, string, string];
        groups: { title: string; steps: { title: string; text: string; part: string }[] }[];
    };
    questions: {
        label: string;
        heading: string;
        note: string;
        items: { q: string; a: string }[];
        endLead: string;
        endLink: { href: string; label: string };
    };
};

export const servicesPage: PageRecord<ServicesBlocks> = {
    id: 'services',
    kind: 'page',
    slug: '/services',
    locales: {
        en: {
            title: 'Services',
            description:
                'Websites, internal tools and care after launch, run in seven steps by email with no account, and straight answers to the questions asked before starting.',
            blocks: {
                hero: {
                    ghost: 'SERVICES',
                    eyebrow: '001 · Services',
                    heading: 'Websites and internal tools, built by the person you talk to.',
                    lead: 'Three kinds of work, one way of running it, and the questions people ask before they start. Everything below is how a project actually goes, not a price tier.',
                    indexLabel: 'On this page',
                    index: [
                        { href: '#offers', figure: '3', label: 'kinds of work' },
                        { href: '#process', figure: '7', label: 'steps, all by email' },
                        { href: '#questions', figure: '8', label: 'straight answers' },
                    ],
                },
                offers: {
                    label: '002 · What gets built',
                    heading: 'Three kinds of work.',
                    note: 'Whatever you start with, it runs through the same seven steps below.',
                    items: [
                        {
                            title: 'Websites',
                            situation: 'New build or redesign',
                            text: 'Sites for businesses that need to be found and trusted: fast, quiet, and written in the languages your clients read.',
                            link: { href: '/portfolio', label: 'See the work' },
                            points: ['Design and build, one person', 'French, English, Arabic (right to left)', 'Pages and posts you edit yourself'],
                        },
                        {
                            title: 'Internal tools',
                            situation: 'New build, or replacing a spreadsheet',
                            text: 'The systems behind the business: clients, quotes, invoices, stock, whatever a spreadsheet is currently holding together.',
                            points: ['Shaped around how you already work', 'Roles for the people on your team', 'Your data, exportable, yours'],
                        },
                        {
                            title: 'Care & maintenance',
                            situation: 'After launch',
                            text: 'Updates, fixes and small changes on something that already runs, so it keeps doing its job after the launch week is over.',
                            points: ['Security and dependency updates', 'Backups checked, not assumed', 'Small changes on request'],
                        },
                    ],
                },
                process: {
                    label: '003 · Process',
                    heading: 'Seven steps, each one a link in your email.',
                    noteLead: 'No account.',
                    note: 'No portal, no password. Each step arrives in your inbox: open it, do your part, done.',
                    columns: ['#', 'Step', 'What arrives', 'Your part'],
                    groups: [
                        {
                            title: 'Before work starts',
                            steps: [
                                { title: 'Intake', text: 'A confirmation that your request arrived, and what happens next.', part: 'Send the form' },
                                {
                                    title: 'Brief',
                                    text: 'What you asked for, written back in plain language. Drafted, then read and edited by hand before you see it.',
                                    part: 'Comment',
                                },
                                {
                                    title: 'Project plan',
                                    text: 'Scope, budget, payment schedule and contract on one page. Nothing starts until you approve it.',
                                    part: 'Approve',
                                },
                            ],
                        },
                        {
                            title: 'While it’s built',
                            steps: [
                                { title: 'Progress', text: 'An update at each milestone: what is done, what is next.', part: 'Read' },
                                {
                                    title: 'Payment',
                                    text: 'A payment link when an invoice falls due, on the schedule you approved at step 3.',
                                    part: 'Pay',
                                },
                            ],
                        },
                        {
                            title: 'After delivery',
                            steps: [
                                {
                                    title: 'Delivery',
                                    text: 'Everything handed over in one place: files, access, documentation, and anything not yet in your name transferred to it.',
                                    part: 'Receive',
                                },
                                { title: 'Check-in', text: 'A short note at 30, 60 and 90 days. Is it still doing its job?', part: 'Reply' },
                            ],
                        },
                    ],
                },
                questions: {
                    label: '004 · Questions',
                    heading: 'Before you ask.',
                    note: 'The ones that come up in almost every first message.',
                    items: [
                        {
                            q: 'How much does a project cost?',
                            a: 'It depends on scope, which is why the plan comes before the price. As a guide, most projects land in one of the ranges on the contact form: under $2k, $2k–$5k, $5k–$15k, or $15k and up. Clients in Morocco are quoted in dirhams.',
                        },
                        {
                            q: 'How do I pay?',
                            a: 'Card or PayPal, through a payment link. In Morocco, bank transfer or cash work too. The schedule is in the plan you approve at step 3, so nothing falls due that you haven’t already seen.',
                        },
                        {
                            q: 'Do I need an account to follow my project?',
                            a: 'No. Every step is a link sent to your email. Lose one, and the site will re-send your links, one for each project you have running.',
                        },
                        {
                            q: 'Who owns the site, the code and the domain?',
                            a: 'You do, from day one wherever possible: accounts are opened in your name, with collaborator access for the build. If something has to start under another name, its transfer is written into the contract, and delivery waits until it’s done.',
                        },
                        {
                            q: 'Do you use AI?',
                            a: 'For first drafts of the brief and the plan, yes. Every one is read and edited by hand before it reaches you, and nothing is ever sent automatically.',
                        },
                        {
                            q: 'I’m not sure what I need. Where do I start?',
                            a: 'Pick “Not sure yet” on the contact form and write a line about the problem. The brief at step 2 is where it takes shape, and you comment on it before anything is priced.',
                        },
                        {
                            q: 'What happens after launch?',
                            a: 'Check-ins at 30, 60 and 90 days, and care & maintenance if you want the work to continue.',
                        },
                        {
                            q: 'Do you work with clients outside Morocco?',
                            a: 'Yes. The work runs by email and links, so distance changes nothing. Sites ship in French, English and Arabic, in any combination.',
                        },
                    ],
                    endLead: 'Still unsure?',
                    endLink: { href: '/contact', label: 'Start from where you are' },
                },
            },
        },
    },
};
