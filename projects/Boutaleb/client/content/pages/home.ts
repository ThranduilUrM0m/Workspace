import type { PageRecord } from '../page-record';

// English copy verbatim from Blueprinting/wireframes/public/homepage.html;
// French and Arabic translated 2026-11-21 (plan R3). Projects, posts, testimonials
// and stats come from content/work.ts, posts.ts and proof.ts.

type Card = { eyebrow: string; title: string; text: string };

export type HomeBlocks = {
    hero: { built: string; alt: string; script: string; word: string; eyebrow: string; line: [string, string]; cta: string; strip: string };
    approach: { eyebrow: string; heading: string; sub: string; items: { icon: ApproachIcon; title: string; text: string }[]; mock: MockCopy };
    about: { eyebrow: string; image: string; heading: string; text: string; cta: string; inspector: InspectorCopy };
    process: { eyebrow: string; heading: string; sub: string; cards: Card[]; link: string; image: string };
    work: { eyebrow: string; all: string; image: string };
    trust: { eyebrow: string; clientsLabel: string };
    blog: { eyebrow: string; slide: string };
};

import type { InspectorCopy } from '@/components/public/home/AboutInspector';
import type { MockCopy } from '@/components/public/home/ApproachMock';

/** Which faded icon sits behind each Approach promise (mapped to lucide icons in the page). */
export type ApproachIcon = 'drawn' | 'language' | 'keys';

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
                    eyebrow: '002 · websites & web apps',
                    line: ['A template fits everyone a little.', 'Your website should fit you exactly.'],
                    cta: 'Start your website →',
                    strip: '2026 · MOROCCO',
                },
                approach: {
                    eyebrow: '003 · approach',
                    heading: 'No surprises, from first message to the keys.',
                    sub: 'What usually goes wrong with a web project is ruled out before the work begins.',
                    items: [
                        {
                            icon: 'drawn',
                            title: 'See it before it is built',
                            text: 'Every screen is drawn and approved by you before any code is written.',
                        },
                        {
                            icon: 'language',
                            title: 'Every step in your language',
                            text: 'Questions, plans and updates in French, Arabic or English, in plain words.',
                        },
                        {
                            icon: 'keys',
                            title: 'The keys are yours from day one',
                            text: 'Domain, hosting and accounts are opened in your name. Access is shared, never held back.',
                        },
                    ],
                    mock: { site: 'Riad Nozha', domain: 'riadnozha.ma', active: 'en' },
                },
                about: {
                    eyebrow: '004 · how boutaleb builds',
                    image: 'image, PNG',
                    heading: 'Built to just work.',
                    text: 'Every decision explained in plain language, shipped early, refined in the open, and handed off clean enough that any developer could pick it up tomorrow.',
                    cta: 'Read the full story',
                    inspector: {
                        grid: 'Every line sits on one grid, so pages stay calm on any screen',
                        measure: 'Lines kept short: easier to read on a phone',
                        chars: 'characters per line',
                        sketch: 'Drawn and approved before any code',
                        hide: 'Hide the design notes',
                        show: 'Show the design notes',
                    },
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
                    word: 'Unique',
                    eyebrow: '002 · sites et applications web',
                    line: ['Un modèle va un peu à tout le monde.', 'Votre site web doit vous aller exactement.'],
                    cta: 'Lancer votre site →',
                    strip: '2026 · MAROC',
                },
                approach: {
                    eyebrow: '003 · approche',
                    heading: 'Aucune surprise, du premier message à la remise des clés.',
                    sub: 'Ce qui tourne mal d’habitude dans un projet web est écarté avant même le début du travail.',
                    items: [
                        {
                            icon: 'drawn',
                            title: 'Vous le voyez avant qu’il soit construit',
                            text: 'Chaque écran est dessiné et validé par vous avant la moindre ligne de code.',
                        },
                        {
                            icon: 'language',
                            title: 'Chaque étape dans votre langue',
                            text: 'Questions, plans et points d’avancement en français, en arabe ou en anglais, en mots simples.',
                        },
                        {
                            icon: 'keys',
                            title: 'Les clés sont à vous dès le premier jour',
                            text: 'Nom de domaine, hébergement et comptes sont ouverts à votre nom. L’accès est partagé, jamais retenu.',
                        },
                    ],
                    mock: { site: 'Riad Nozha', domain: 'riadnozha.ma', active: 'fr' },
                },
                about: {
                    eyebrow: '004 · la méthode boutaleb',
                    image: 'image, PNG',
                    heading: 'Fait pour fonctionner, tout simplement.',
                    text: 'Chaque décision expliquée en langage clair, livrée tôt, affinée au grand jour, et remise assez propre pour que n’importe quel développeur puisse la reprendre demain.',
                    cta: 'Lire toute l’histoire',
                    inspector: {
                        grid: 'Chaque ligne repose sur une même grille : la page reste calme sur tout écran',
                        measure: 'Des lignes courtes : plus faciles à lire sur téléphone',
                        chars: 'caractères par ligne',
                        sketch: 'Dessiné et validé avant la moindre ligne de code',
                        hide: 'Masquer les notes de conception',
                        show: 'Afficher les notes de conception',
                    },
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
                    script: 'صُنع بكل عناية',
                    word: 'على مقاسك',
                    eyebrow: '002 · مواقع وتطبيقات ويب',
                    line: ['القالب الجاهز قد يناسب الجميع.', 'موقعك يجب أن يناسبك أنت.'],
                    cta: 'ابدأ موقعك ←',
                    strip: '2026 · المغرب',
                },
                approach: {
                    eyebrow: '003 · المنهج',
                    heading: 'بلا مفاجآت، من أول رسالة حتى تسليم المفاتيح.',
                    sub: 'ما يسوء عادةً في مشاريع المواقع يُستبعَد قبل أن يبدأ العمل.',
                    items: [
                        {
                            icon: 'drawn',
                            title: 'تراه قبل أن يُبنى',
                            text: 'كل شاشة تُرسَم وتوافق عليها قبل كتابة أي سطر من الشيفرة.',
                        },
                        {
                            icon: 'language',
                            title: 'كل خطوة بلغتك',
                            text: 'الأسئلة والخطط والمستجدّات بالعربية أو الفرنسية أو الإنجليزية، بكلمات واضحة.',
                        },
                        {
                            icon: 'keys',
                            title: 'المفاتيح لك منذ اليوم الأول',
                            text: 'النطاق والاستضافة والحسابات تُفتح باسمك. الوصول مشترك، ولا يُحجَب عنك أبدًا.',
                        },
                    ],
                    mock: { site: 'رياض نزهة', domain: 'riadnozha.ma', active: 'ar' },
                },
                about: {
                    eyebrow: '004 · كيف يبني بوطالب',
                    image: 'image, PNG',
                    heading: 'مبنيّ ليعمل، ببساطة.',
                    text: 'كل قرار يُشرح بلغة واضحة، ويُسلَّم مبكرًا، ويُحسَّن على مرأى منك، ثم يُسلَّم نظيفًا بما يكفي ليتسلّمه أي مطوّر غدًا.',
                    cta: 'اقرأ القصة كاملة',
                    inspector: {
                        grid: 'كل سطر على شبكة واحدة، فتبقى الصفحة هادئة على أي شاشة',
                        measure: 'أسطر قصيرة: أسهل للقراءة على الهاتف',
                        chars: 'حرفًا في السطر',
                        sketch: 'رُسم ووُوفق عليه قبل أي سطر برمجي',
                        hide: 'إخفاء ملاحظات التصميم',
                        show: 'إظهار ملاحظات التصميم',
                    },
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
