import type { PageRecord } from '../page-record';

// English copy verbatim from Blueprinting/wireframes/public/services.html;
// French and Arabic translated 2026-11-21 (plan R3). The ids
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
        fr: {
            title: 'Services',
            description:
                'Sites web, outils internes et suivi après lancement, menés en sept étapes par e-mail sans compte à créer, avec des réponses franches aux questions posées avant de commencer.',
            blocks: {
                hero: {
                    ghost: 'SERVICES',
                    eyebrow: '001 · Services',
                    heading: 'Sites web et outils internes, construits par la personne à qui vous parlez.',
                    lead: 'Trois types de travail, une seule façon de les mener, et les questions posées avant de commencer. Tout ce qui suit décrit le vrai déroulement d’un projet, pas une grille tarifaire.',
                    indexLabel: 'Sur cette page',
                    index: [
                        { href: '#offers', figure: '3', label: 'types de travail' },
                        { href: '#process', figure: '7', label: 'étapes, toutes par e-mail' },
                        { href: '#questions', figure: '8', label: 'réponses franches' },
                    ],
                },
                offers: {
                    label: '002 · Ce qui est construit',
                    heading: 'Trois types de travail.',
                    note: 'Quel que soit le point de départ, tout passe par les sept étapes ci-dessous.',
                    items: [
                        {
                            title: 'Sites web',
                            situation: 'Création ou refonte',
                            text: 'Des sites pour les entreprises qui doivent être trouvées et inspirer confiance : rapides, sobres, et écrits dans les langues que lisent vos clients.',
                            link: { href: '/portfolio', label: 'Voir les réalisations' },
                            points: ['Design et développement, une seule personne', 'Français, anglais, arabe (de droite à gauche)', 'Pages et articles que vous modifiez vous-même'],
                        },
                        {
                            title: 'Outils internes',
                            situation: 'Création, ou remplacement d’un tableur',
                            text: 'Les systèmes derrière l’activité : clients, devis, factures, stock, tout ce qu’un tableur tient aujourd’hui à bout de bras.',
                            points: ['Pensés autour de votre façon de travailler', 'Des rôles pour les membres de votre équipe', 'Vos données, exportables, à vous'],
                        },
                        {
                            title: 'Suivi & maintenance',
                            situation: 'Après le lancement',
                            text: 'Mises à jour, corrections et petits changements sur ce qui tourne déjà, pour que tout continue de fonctionner une fois la semaine de lancement passée.',
                            points: ['Mises à jour de sécurité et des dépendances', 'Sauvegardes vérifiées, pas supposées', 'Petits changements à la demande'],
                        },
                    ],
                },
                process: {
                    label: '003 · Méthode',
                    heading: 'Sept étapes, chacune un lien dans vos e-mails.',
                    noteLead: 'Aucun compte.',
                    note: 'Pas de portail, pas de mot de passe. Chaque étape arrive dans votre boîte mail : ouvrez, faites votre part, c’est fait.',
                    columns: ['#', 'Étape', 'Ce qui arrive', 'Votre part'],
                    groups: [
                        {
                            title: 'Avant le début du travail',
                            steps: [
                                { title: 'Réception', text: 'Une confirmation que votre demande est arrivée, et ce qui suit.', part: 'Envoyer le formulaire' },
                                {
                                    title: 'Brief',
                                    text: 'Votre demande, reformulée en langage clair. Rédigée, puis relue et corrigée à la main avant de vous parvenir.',
                                    part: 'Commenter',
                                },
                                {
                                    title: 'Plan de projet',
                                    text: 'Périmètre, budget, échéancier de paiement et contrat sur une seule page. Rien ne commence sans votre accord.',
                                    part: 'Approuver',
                                },
                            ],
                        },
                        {
                            title: 'Pendant la réalisation',
                            steps: [
                                { title: 'Avancement', text: 'Un point à chaque jalon : ce qui est fait, ce qui vient.', part: 'Lire' },
                                {
                                    title: 'Paiement',
                                    text: 'Un lien de paiement quand une facture arrive à échéance, selon l’échéancier approuvé à l’étape 3.',
                                    part: 'Payer',
                                },
                            ],
                        },
                        {
                            title: 'Après la livraison',
                            steps: [
                                {
                                    title: 'Livraison',
                                    text: 'Tout remis au même endroit : fichiers, accès, documentation, et tout ce qui n’est pas encore à votre nom transféré à votre nom.',
                                    part: 'Recevoir',
                                },
                                { title: 'Suivi', text: 'Un court message à 30, 60 et 90 jours. Tout fonctionne-t-il toujours ?', part: 'Répondre' },
                            ],
                        },
                    ],
                },
                questions: {
                    label: '004 · Questions',
                    heading: 'Avant que vous ne demandiez.',
                    note: 'Celles qui reviennent dans presque chaque premier message.',
                    items: [
                        {
                            q: 'Combien coûte un projet ?',
                            a: 'Cela dépend du périmètre, c’est pourquoi le plan vient avant le prix. À titre indicatif, la plupart des projets se situent dans l’une des fourchettes du formulaire de contact : moins de 2 k$, 2 k$–5 k$, 5 k$–15 k$, ou 15 k$ et plus. Les clients au Maroc reçoivent un devis en dirhams.',
                        },
                        {
                            q: 'Comment payer ?',
                            a: 'Par carte ou PayPal, via un lien de paiement. Au Maroc, le virement bancaire ou les espèces conviennent aussi. L’échéancier figure dans le plan approuvé à l’étape 3 : rien n’arrive à échéance sans que vous l’ayez déjà vu.',
                        },
                        {
                            q: 'Faut-il un compte pour suivre mon projet ?',
                            a: 'Non. Chaque étape est un lien envoyé par e-mail. Un lien perdu ? Le site renvoie vos liens, un par projet en cours.',
                        },
                        {
                            q: 'À qui appartiennent le site, le code et le domaine ?',
                            a: 'À vous, dès le premier jour autant que possible : les comptes sont ouverts à votre nom, avec un accès collaborateur pour la réalisation. Si quelque chose doit démarrer sous un autre nom, son transfert est inscrit au contrat, et la livraison attend qu’il soit fait.',
                        },
                        {
                            q: 'Utilisez-vous l’IA ?',
                            a: 'Pour les premiers jets du brief et du plan, oui. Chacun est relu et corrigé à la main avant de vous parvenir, et rien n’est jamais envoyé automatiquement.',
                        },
                        {
                            q: 'Je ne sais pas exactement ce qu’il me faut. Par où commencer ?',
                            a: 'Choisissez « Pas encore sûr » dans le formulaire de contact et écrivez une ligne sur le problème. Le brief de l’étape 2 lui donne forme, et vous le commentez avant tout chiffrage.',
                        },
                        {
                            q: 'Que se passe-t-il après le lancement ?',
                            a: 'Des points de suivi à 30, 60 et 90 jours, et le suivi & maintenance si vous souhaitez que le travail continue.',
                        },
                        {
                            q: 'Travaillez-vous avec des clients hors du Maroc ?',
                            a: 'Oui. Tout passe par e-mail et par liens, la distance ne change rien. Les sites sont livrés en français, en anglais et en arabe, dans toutes les combinaisons.',
                        },
                    ],
                    endLead: 'Toujours un doute ?',
                    endLink: { href: '/contact', label: 'Partir de là où vous en êtes' },
                },
            },
        },
        ar: {
            title: 'الخدمات',
            description:
                'مواقع إلكترونية وأدوات داخلية ومتابعة بعد الإطلاق، تُدار في سبع خطوات عبر البريد الإلكتروني بلا حساب، مع إجابات صريحة عن الأسئلة التي تُطرح قبل البدء.',
            blocks: {
                hero: {
                    ghost: 'الخدمات',
                    eyebrow: '001 · الخدمات',
                    heading: 'مواقع إلكترونية وأدوات داخلية، يبنيها الشخص الذي تتحدّث إليه.',
                    lead: 'ثلاثة أنواع من العمل، وطريقة واحدة لإدارتها، والأسئلة التي تُطرح قبل البدء. كل ما يلي يصف كيف يسير المشروع فعلًا، لا باقة أسعار.',
                    indexLabel: 'في هذه الصفحة',
                    index: [
                        { href: '#offers', figure: '3', label: 'أنواع من العمل' },
                        { href: '#process', figure: '7', label: 'خطوات، كلّها عبر البريد' },
                        { href: '#questions', figure: '8', label: 'إجابات صريحة' },
                    ],
                },
                offers: {
                    label: '002 · ما يُبنى',
                    heading: 'ثلاثة أنواع من العمل.',
                    note: 'أيًّا كانت نقطة البداية، يمرّ كل شيء بالخطوات السبع أدناه.',
                    items: [
                        {
                            title: 'مواقع إلكترونية',
                            situation: 'بناء جديد أو إعادة تصميم',
                            text: 'مواقع لأنشطة تحتاج أن يجدها الناس وأن تكسب ثقتهم: سريعة، هادئة، ومكتوبة باللغات التي يقرؤها عملاؤك.',
                            link: { href: '/portfolio', label: 'شاهد الأعمال' },
                            points: ['تصميم وتطوير، شخص واحد', 'الفرنسية والإنجليزية والعربية (من اليمين إلى اليسار)', 'صفحات ومقالات تعدّلها بنفسك'],
                        },
                        {
                            title: 'أدوات داخلية',
                            situation: 'بناء جديد، أو بديل لجدول بيانات',
                            text: 'الأنظمة التي تقف خلف النشاط: العملاء، عروض الأسعار، الفواتير، المخزون، وكل ما يمسكه جدول بيانات اليوم بصعوبة.',
                            points: ['مصمّمة حول طريقة عملك الحالية', 'صلاحيات لأعضاء فريقك', 'بياناتك، قابلة للتصدير، ملكك'],
                        },
                        {
                            title: 'متابعة وصيانة',
                            situation: 'بعد الإطلاق',
                            text: 'تحديثات وإصلاحات وتعديلات صغيرة على ما يعمل أصلًا، ليواصل أداء مهمّته بعد انقضاء أسبوع الإطلاق.',
                            points: ['تحديثات الأمان والمكتبات', 'نسخ احتياطية يُتحقَّق منها، لا تُفترض', 'تعديلات صغيرة عند الطلب'],
                        },
                    ],
                },
                process: {
                    label: '003 · طريقة العمل',
                    heading: 'سبع خطوات، كلّ واحدة رابط في بريدك.',
                    noteLead: 'بلا حساب.',
                    note: 'لا بوابة ولا كلمة مرور. كل خطوة تصل إلى بريدك: افتحها، أنجز دورك، وانتهى الأمر.',
                    columns: ['#', 'الخطوة', 'ما يصلك', 'دورك'],
                    groups: [
                        {
                            title: 'قبل بدء العمل',
                            steps: [
                                { title: 'الاستلام', text: 'تأكيد بوصول طلبك، وما يحدث بعد ذلك.', part: 'أرسل النموذج' },
                                {
                                    title: 'الملخّص',
                                    text: 'ما طلبته، مكتوبًا من جديد بلغة واضحة. يُصاغ أولًا، ثم يُقرأ ويُحرَّر يدويًا قبل أن تراه.',
                                    part: 'علّق',
                                },
                                {
                                    title: 'خطة المشروع',
                                    text: 'النطاق والميزانية وجدول الدفع والعقد في صفحة واحدة. لا يبدأ شيء قبل موافقتك.',
                                    part: 'وافق',
                                },
                            ],
                        },
                        {
                            title: 'أثناء البناء',
                            steps: [
                                { title: 'التقدّم', text: 'تحديث عند كل مرحلة: ما أُنجز، وما التالي.', part: 'اقرأ' },
                                {
                                    title: 'الدفع',
                                    text: 'رابط دفع عند حلول موعد فاتورة، وفق الجدول الذي وافقت عليه في الخطوة 3.',
                                    part: 'ادفع',
                                },
                            ],
                        },
                        {
                            title: 'بعد التسليم',
                            steps: [
                                {
                                    title: 'التسليم',
                                    text: 'كل شيء يُسلَّم في مكان واحد: الملفات والصلاحيات والتوثيق، وكل ما ليس باسمك بعدُ يُنقل إلى اسمك.',
                                    part: 'استلم',
                                },
                                { title: 'المتابعة', text: 'رسالة قصيرة بعد 30 و60 و90 يومًا. هل ما زال يؤدّي مهمّته؟', part: 'ردّ' },
                            ],
                        },
                    ],
                },
                questions: {
                    label: '004 · أسئلة',
                    heading: 'قبل أن تسأل.',
                    note: 'الأسئلة التي ترد في كل رسالة أولى تقريبًا.',
                    items: [
                        {
                            q: 'كم يكلّف المشروع؟',
                            a: 'يتوقّف ذلك على النطاق، ولهذا تأتي الخطة قبل السعر. للاسترشاد، تقع معظم المشاريع في إحدى الفئات الواردة في نموذج التواصل: أقل من 2000 دولار، من 2000 إلى 5000، من 5000 إلى 15000، أو 15000 دولار فأكثر. يتلقّى العملاء في المغرب عروض أسعارهم بالدرهم.',
                        },
                        {
                            q: 'كيف أدفع؟',
                            a: 'بالبطاقة أو PayPal عبر رابط دفع. وفي المغرب، يمكن أيضًا التحويل البنكي أو الدفع نقدًا. جدول الدفع مذكور في الخطة التي توافق عليها في الخطوة 3، فلا يحلّ موعد أي مبلغ لم تطّلع عليه مسبقًا.',
                        },
                        {
                            q: 'هل أحتاج إلى حساب لمتابعة مشروعي؟',
                            a: 'لا. كل خطوة رابط يُرسَل إلى بريدك. إن أضعت رابطًا، يعيد الموقع إرسال روابطك، رابطًا لكل مشروع جارٍ.',
                        },
                        {
                            q: 'لمن يعود الموقع والشيفرة واسم النطاق؟',
                            a: 'لك، منذ اليوم الأول كلّما أمكن: تُفتح الحسابات باسمك، مع صلاحية متعاون لأجل البناء. وإن اضطرّ شيء إلى البدء باسم آخر، يُنصّ على نقله في العقد، ولا يتمّ التسليم حتى يُنجَز النقل.',
                        },
                        {
                            q: 'هل يُستعمل الذكاء الاصطناعي؟',
                            a: 'نعم، للمسوّدات الأولى من الملخّص والخطة. كل واحدة منها تُقرأ وتُحرَّر يدويًا قبل أن تصلك، ولا يُرسَل أي شيء آليًا أبدًا.',
                        },
                        {
                            q: 'لست متأكدًا مما أحتاجه. من أين أبدأ؟',
                            a: 'اختر «لست متأكدًا بعد» في نموذج التواصل واكتب سطرًا عن المشكلة. في ملخّص الخطوة 2 يتّضح الأمر، وتعلّق عليه قبل أي تسعير.',
                        },
                        {
                            q: 'ماذا يحدث بعد الإطلاق؟',
                            a: 'متابعة بعد 30 و60 و90 يومًا، ثم المتابعة والصيانة إن أردت أن يستمرّ العمل.',
                        },
                        {
                            q: 'هل يشمل العمل عملاء خارج المغرب؟',
                            a: 'نعم. يسير العمل عبر البريد والروابط، فلا تغيّر المسافة شيئًا. تُسلَّم المواقع بالفرنسية والإنجليزية والعربية، بأي تركيبة.',
                        },
                    ],
                    endLead: 'ما زلت متردّدًا؟',
                    endLink: { href: '/contact', label: 'ابدأ من حيث أنت' },
                },
            },
        },
    },
};
