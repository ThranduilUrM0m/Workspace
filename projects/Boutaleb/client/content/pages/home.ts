import type { PageRecord } from '../page-record';

// English copy verbatim from Blueprinting/wireframes/public/homepage.html;
// French and Arabic translated 2026-11-21 (plan R3). Projects, posts, testimonials
// and stats come from content/work.ts, posts.ts and proof.ts.

type Card = { eyebrow: string; title: string; text: string };

export type HomeBlocks = {
    hero: { built: string; alt: string; script: string; word: string; eyebrow: string; line: [string, string]; cta: string; strip: string };
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
                    alt: 'A man in a charcoal suit sits on a tall black stool in front of a sunlit earthen wall, his face covered by a torn terracotta paper patch.',
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
        fr: {
            title: 'Boutaleb — produits web sur mesure',
            description:
                'Sites web et outils internes sur mesure pour les petites équipes, au Maroc et ailleurs : cadrés, conçus et livrés par la seule personne à qui vous parlez.',
            blocks: {
                hero: {
                    built: 'BÂTI',
                    alt: 'Un homme en costume anthracite, assis sur un haut tabouret noir devant un mur de terre ensoleillé, le visage caché par un morceau de papier terracotta déchiré.',
                    script: 'fait avec soin',
                    word: 'Sur-mesure',
                    eyebrow: '002 · produits web sur mesure',
                    line: ['Pensé pour votre activité.', 'Pas un modèle.'],
                    cta: 'Lancer un projet →',
                    strip: '2026 · MAROC',
                },
                approach: {
                    eyebrow: '003 · approche',
                    heading: 'Une seule personne, pas de chaîne de montage.',
                    sub: 'Chaque projet est cadré, conçu et livré par la personne qui vous parle dès le départ — sans relais, sans chargé de compte qui fait passer les messages d’un service à l’autre.',
                    items: [
                        {
                            title: 'Collaboration directe',
                            text: 'Vous parlez directement à la personne qui construit — sans passer par un chef de projet ni par des tickets de support.',
                        },
                        {
                            title: 'Responsabilité entière',
                            text: 'Une seule personne responsable de tout le projet, du début à la fin — aucun fil perdu entre deux équipes.',
                        },
                        {
                            title: 'Pas de frais de structure',
                            text: 'En solo, aucune marge d’agence ne s’ajoute au travail. Vous payez la réalisation, pas l’organigramme.',
                        },
                    ],
                    image: 'image, PNG',
                },
                about: {
                    eyebrow: '004 · la méthode boutaleb',
                    image: 'image, PNG',
                    heading: 'Fait pour fonctionner, tout simplement.',
                    text: 'Chaque décision expliquée en langage clair, livrée tôt, affinée au grand jour, et remise assez propre pour que n’importe quel développeur puisse la reprendre demain.',
                    cta: 'Lire toute l’histoire',
                },
                process: {
                    eyebrow: '005 · méthode',
                    heading: 'Construit selon votre cahier des charges.',
                    sub: 'Trois façons de travailler ensemble, selon ce que vous savez déjà de votre besoin.',
                    cards: [
                        {
                            eyebrow: 'Sur mesure',
                            title: 'Ni modèle, ni compromis',
                            text: 'Chaque projet part de vos besoins réels, pas d’un thème autour duquel il faudrait plier votre activité.',
                        },
                        {
                            eyebrow: 'Direct',
                            title: 'Sans intermédiaire',
                            text: 'Vos retours vont droit à la personne qui écrit le code — les changements arrivent en quelques heures, pas au rythme des sprints.',
                        },
                        {
                            eyebrow: 'Sobre',
                            title: 'La vitesse sans le superflu',
                            text: 'Aucune dépendance inutile, aucun changement de framework pour la forme — seulement ce dont le projet a vraiment besoin pour bien tourner.',
                        },
                    ],
                    link: 'En savoir plus →',
                    image: 'image, PNG',
                },
                work: { eyebrow: '006 · réalisations choisies', all: 'Voir tout le portfolio →', image: 'image, PNG' },
                trust: { eyebrow: '007 · ils font confiance', clientsLabel: 'collaborations' },
                blog: { eyebrow: '008 · sur le blog', slide: 'Article {n}' },
            },
        },
        ar: {
            title: 'Boutaleb — منتجات ويب على المقاس',
            description:
                'مواقع وأدوات داخلية على المقاس للفرق الصغيرة في المغرب وخارجه، يحدّد نطاقها ويصمّمها ويسلّمها الشخص نفسه الذي تتحدّث إليه.',
            blocks: {
                hero: {
                    built: 'بناء',
                    alt: 'رجل ببدلة رمادية داكنة يجلس على كرسي أسود عالٍ أمام جدار طيني مشمس، ووجهه مغطّى بقطعة ورق ممزّقة بلون التراكوتا.',
                    script: 'بإتقان',
                    word: 'على المقاس',
                    eyebrow: '002 · منتجات ويب على المقاس',
                    line: ['مبنيّ حول نشاطك.', 'لا على قالب جاهز.'],
                    cta: 'ابدأ مشروعًا ←',
                    strip: '2026 · المغرب',
                },
                approach: {
                    eyebrow: '003 · المنهج',
                    heading: 'شخص واحد، لا خطّ إنتاج.',
                    sub: 'كل مشروع يحدّد نطاقه ويصمّمه ويسلّمه الشخص نفسه الذي يتحدّث إليك منذ البداية — بلا وسطاء، وبلا مسؤول حسابات ينقل الرسائل بين الأقسام.',
                    items: [
                        {
                            title: 'تواصل مباشر',
                            text: 'تتحدّث مباشرة مع من يبني المشروع — بلا مدير مشروع يتوسّط، ولا تذاكر دعم.',
                        },
                        {
                            title: 'مسؤولية كاملة',
                            text: 'شخص واحد مسؤول عن المشروع كلّه من أوّله إلى آخره — لا خيوط تضيع بين الفرق.',
                        },
                        {
                            title: 'بلا تكاليف زائدة',
                            text: 'العمل الفردي يعني ألّا يُضاف هامش وكالة فوق العمل. تدفع ثمن البناء، لا ثمن الهيكل الإداري.',
                        },
                    ],
                    image: 'image, PNG',
                },
                about: {
                    eyebrow: '004 · كيف يبني بوطالب',
                    image: 'image, PNG',
                    heading: 'مبنيّ ليعمل، ببساطة.',
                    text: 'كل قرار يُشرح بلغة واضحة، ويُسلَّم مبكرًا، ويُحسَّن على مرأى منك، ثم يُسلَّم نظيفًا بما يكفي ليتسلّمه أي مطوّر غدًا.',
                    cta: 'اقرأ القصة كاملة',
                },
                process: {
                    eyebrow: '005 · طريقة العمل',
                    heading: 'مبنيّ وفق مواصفاتك.',
                    sub: 'ثلاث طرق للعمل معًا، حسب ما تعرفه مسبقًا عمّا تحتاجه.',
                    cards: [
                        {
                            eyebrow: 'على المقاس',
                            title: 'لا قوالب ولا تنازلات',
                            text: 'كل مشروع ينطلق من احتياجاتك الفعلية، لا من قالب جاهز تُضطرّ إلى تطويع نشاطك ليناسبه.',
                        },
                        {
                            eyebrow: 'مباشر',
                            title: 'بلا وسيط',
                            text: 'ملاحظاتك تصل مباشرة إلى من يكتب الشيفرة — والتعديلات تتمّ في ساعات، لا في دورات عمل طويلة.',
                        },
                        {
                            eyebrow: 'خفيف',
                            title: 'سرعة بلا حشو',
                            text: 'لا مكتبات زائدة ولا تبديل لأطر العمل بلا داعٍ — فقط ما يحتاجه المشروع ليعمل جيدًا.',
                        },
                    ],
                    link: 'اعرف المزيد ←',
                    image: 'image, PNG',
                },
                work: { eyebrow: '006 · أعمال مختارة', all: 'كل الأعمال ←', image: 'image, PNG' },
                trust: { eyebrow: '007 · ثقة العملاء', clientsLabel: 'شركاء العمل' },
                blog: { eyebrow: '008 · من المدونة', slide: 'مقال {n}' },
            },
        },
    },
};
