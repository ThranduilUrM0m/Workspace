import type { PageRecord } from '../page-record';

// English copy verbatim from Blueprinting/wireframes/public/about.html; French
// and Arabic translated 2026-11-21 (plan R3).
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
        fr: {
            title: 'À propos',
            description:
                'Boutaleb est un nom, et l’exigence à laquelle une pratique se tient : langage clair, pas de surprises, des preuves plutôt que des promesses, et une seule ligne directe du brief à la livraison.',
            blocks: {
                hero: {
                    ghost: 'BOUTALEB',
                    eyebrow: 'À propos · La pratique',
                    heading: 'Boutaleb est un nom, et l’exigence à laquelle une pratique se tient.',
                    note: {
                        before: 'C’est d’abord un nom arabe — ni les mémoires d’un fondateur, ni une liste d’employés. Ce qui suit n’est pas une biographie. C’est ',
                        strong: 'la façon dont cette pratique travaille',
                        after: ', et ce qu’elle s’impose sur chaque projet.',
                    },
                },
                standards: {
                    label: 'Exigences',
                    heading: 'Les principes à l’aune desquels chaque mission est mesurée.',
                    items: [
                        {
                            title: 'Sans jargon',
                            short: 'Un langage clair, à chaque point d’étape. Si un client ne suit pas le raisonnement, c’est l’explication qui a échoué — pas le client.',
                            expanded: 'Sans jargon, en détail',
                            long: 'Chaque livrable s’accompagne d’une explication claire de ce qui a changé et pourquoi — jamais de terme technique inexpliqué dans les échanges avec le client.',
                        },
                        {
                            title: 'Pas de surprises',
                            short: 'Périmètre, coût et délais convenus dès le départ et suivis au grand jour, pas découverts à la livraison.',
                            expanded: 'Pas de surprises, en détail',
                            long: 'Le périmètre et le coût sont écrits avant le début du travail, et tout changement de l’un ou de l’autre est signalé au moment où il survient — pas glissé discrètement dans la facture suivante.',
                        },
                        {
                            title: 'Des preuves, pas des promesses',
                            short: 'Des décisions appuyées sur du travail livré et de vrais chiffres, pas sur un discours de portfolio.',
                            expanded: 'Des preuves, pas des promesses, en détail',
                            long: 'Les choix de design et les choix techniques sont justifiés par de vrais précédents — des études de cas livrées et des résultats mesurés, pas des adjectifs.',
                        },
                        {
                            title: 'Ligne directe',
                            short: 'Un seul interlocuteur du début à la fin — pas de labyrinthe de relais, pas de couche de chargés de compte.',
                            expanded: 'Ligne directe, en détail',
                            long: 'La personne qui construit est celle à qui vous parlez — aucun relais par un chargé de compte, aucun contexte perdu en route.',
                        },
                    ],
                },
                process: {
                    label: 'Méthode',
                    heading: 'Quatre étapes, dans le même ordre, à chaque fois.',
                    steps: [
                        { title: 'Découverte', text: 'Objectifs, contraintes et critères de réussite — écrits avant que quoi que ce soit ne soit conçu.' },
                        { title: 'Conception', text: 'Structure et direction visuelle, revues avec le client à chaque étape, pas à la fin.' },
                        { title: 'Réalisation', text: 'Mise en œuvre fidèle au design convenu — aucune dérive silencieuse du périmètre.' },
                        { title: 'Livraison', text: 'Une documentation et un système qui fonctionne, dont le client est réellement propriétaire.' },
                    ],
                    focal: '[ photo focale / marque — la méthode en mouvement ]',
                },
                proof: { label: 'Preuves' },
            },
        },
        ar: {
            title: 'نبذة',
            description:
                'بوطالب اسم، ومعيار تلتزم به هذه الممارسة: لغة واضحة، بلا مفاجآت، الدليل قبل الوعد، وخطّ مباشر واحد من الطلب إلى التسليم.',
            blocks: {
                hero: {
                    ghost: 'بوطالب',
                    eyebrow: 'نبذة · الممارسة',
                    heading: 'بوطالب اسم، ومعيار تلتزم به هذه الممارسة.',
                    note: {
                        before: 'إنه اسم عربي قبل كل شيء — ليس مذكّرات مؤسّس ولا قائمة موظفين. ما يلي ليس سيرة ذاتية، بل ',
                        strong: 'طريقة عمل هذه الممارسة',
                        after: '، وما تلتزم به في كل مشروع.',
                    },
                },
                standards: {
                    label: 'المعايير',
                    heading: 'المبادئ التي يُقاس بها كل مشروع.',
                    items: [
                        {
                            title: 'بلا مصطلحات معقّدة',
                            short: 'لغة واضحة في كل تحديث. إن لم يفهم العميل المنطق، فالخلل في الشرح — لا في العميل.',
                            expanded: 'بلا مصطلحات معقّدة، بالتفصيل',
                            long: 'كل تسليم يرافقه شرح واضح لما تغيّر ولماذا — لا مصطلحات تقنية بلا شرح في أي تحديث موجّه إلى العميل، أبدًا.',
                        },
                        {
                            title: 'بلا مفاجآت',
                            short: 'النطاق والتكلفة والمدة يُتّفق عليها مسبقًا وتُتابَع بشفافية، لا تُكتشف عند التسليم.',
                            expanded: 'بلا مفاجآت، بالتفصيل',
                            long: 'النطاق والتكلفة يُكتبان قبل بدء العمل، وأي تغيير في أحدهما يُبلَّغ عنه فور حدوثه — لا يُدسّ بصمت في الفاتورة التالية.',
                        },
                        {
                            title: 'الدليل قبل الوعد',
                            short: 'قرارات تستند إلى أعمال منجزة وأرقام حقيقية، لا إلى عبارات الترويج.',
                            expanded: 'الدليل قبل الوعد، بالتفصيل',
                            long: 'خيارات التصميم والتقنية تُبرَّر بسوابق حقيقية — دراسات حالة منجزة ونتائج مقيسة، لا صفات.',
                        },
                        {
                            title: 'خطّ مباشر',
                            short: 'جهة تواصل واحدة طوال المشروع — لا متاهة وسطاء ولا طبقة مسؤولي حسابات.',
                            expanded: 'خطّ مباشر، بالتفصيل',
                            long: 'من يبني المشروع هو من تتحدّث إليه — لا وسيط، ولا سياق يضيع بين الأيدي.',
                        },
                    ],
                },
                process: {
                    label: 'طريقة العمل',
                    heading: 'أربع مراحل، بالترتيب نفسه، في كل مرة.',
                    steps: [
                        { title: 'الاستكشاف', text: 'الأهداف والقيود ومعايير النجاح — مكتوبة قبل تصميم أي شيء.' },
                        { title: 'التصميم', text: 'البنية والاتجاه البصري، يُراجَعان مع العميل في كل مرحلة، لا في النهاية.' },
                        { title: 'البناء', text: 'التنفيذ وفق التصميم المتّفق عليه — بلا توسّع صامت في النطاق.' },
                        { title: 'التسليم', text: 'توثيق ونظام يعمل ويملكه العميل فعلًا.' },
                    ],
                    focal: '[ صورة محورية / علامة — طريقة العمل أثناء التنفيذ ]',
                },
                proof: { label: 'الدليل' },
            },
        },
    },
};
