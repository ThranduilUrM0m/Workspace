import type { BriefAreaKey } from '@repo/schemas';

// The client's page, in three languages (T8.4). One typed module, not
// messages/*.json: the page lives outside the [locale] tree, the language
// is the client's record and switchable on the page, and switching must not
// reload (a reload would lose nothing, but the reveal would replay).
//
// PUBLIC COPY RULE: no "I", "we" or "me". The studio is "Boutaleb", the
// reader is "you". French and Arabic are drafts, unreviewed: they join the
// open FR/AR copy verdict (HANDOFF). Arabic addresses the reader in the
// respectful plural ("كم").

export type PortalLang = 'en' | 'fr' | 'ar';
export const PORTAL_LANGS: { key: PortalLang; label: string }[] = [
    { key: 'fr', label: 'Français' },
    { key: 'ar', label: 'العربية' },
    { key: 'en', label: 'English' },
];

export interface PortalCopy {
    dir: 'ltr' | 'rtl';
    /** The two opening lines of the scroll reveal. */
    beat1: string;
    beat2: string;
    scroll: string;
    kicker: (project: string) => string;
    h1: string;
    /** [before, bold, after]: the bold word is rendered as <b>. */
    lede1: [string, string, string];
    lede2: string;
    lede3: string;
    turnK: string;
    turnH: string;
    phases: { n: string; h: string; p: string }[];
    dealK: string;
    dealH: string;
    dealP: (who: string) => string;
    promise: [string, string];
    expect: (questions: number, parts: number) => [string, string, string];
    start: string;
    talk: string;
    foot: string;
    areas: Record<BriefAreaKey, { name: string; why: string }>;
    questions: Record<string, string>;
    part: (i: number, n: number) => string;
    questionCount: (n: number) => string;
    placeholder: string;
    answered: (n: number, total: number) => string;
    saveIdle: string;
    saving: string;
    saved: string;
    saveFailed: string;
    jump: string;
    sendNote: string;
    send: string;
    sending: string;
    sendLater: string;
    sendFailed: string;
    backH: string;
    backP: string;
    sentH: string;
    sentP1: string;
    sentP2: string;
    close: string;
}

const en: PortalCopy = {
    dir: 'ltr',
    beat1: 'Anyone can vibecode a website in an afternoon.',
    beat2: 'Almost none of them survive their first real month.',
    scroll: 'Scroll',
    kicker: (p) => `${p} · your brief`,
    h1: 'This is the part that decides whether it works.',
    lede1: ['Most of what gets built today is ', 'vibecoded', ' — prompted out of an AI until something appears on the screen. It looks finished on day one, and there is nothing underneath it.'],
    lede2: 'Boutaleb is a studio, not a generator. Each project is built from the business outward: what it does, who it is for, what breaks today, what has to still be true in three years. Every decision is written down and reasoned before it is built, so what is handed over can be explained, changed and maintained, by Boutaleb or by whoever comes next.',
    lede3: 'That is not a claim about talent. It is a claim about method, and the method has three phases.',
    turnK: 'What a generated site never had',
    turnH: 'All three happen before a single line is written.',
    phases: [
        { n: '01', h: 'Conception', p: 'What the business actually does, who it is for, what breaks today. Written down and agreed before anything is built, so nothing gets built on a guess.' },
        { n: '02', h: 'Design', p: 'Structure before surface. What goes where, and why, decided before a colour is chosen, so the version that looks right is also the version that works.' },
        { n: '03', h: 'Engineering', p: 'Built to be understood and maintained by whoever comes next, not just to look complete on handover day.' },
    ],
    dealK: 'Why these questions',
    dealH: 'The hour spent below is the most valuable hour of this project.',
    dealP: (who) =>
        `Every screen, every decision and every line written afterwards comes out of these answers. It is the difference between something generated and something designed for ${who}. The questions are long because the detail is the point: a vague answer does not produce a vague website, it produces the wrong one.`,
    promise: ['The questions are asked once.', ' There is no second round and no follow-up form. Whatever can be given in one sitting is what the work starts from, so write plainly, in your own words, and skip anything not yet known.'],
    expect: (q, n) => [`${q} questions, in ${n} parts`, 'about 20 minutes', 'Saved as you type: stop and come back whenever'],
    start: 'Start the brief',
    talk: 'Would rather talk it through? Reply to the email, and a call replaces the form.',
    foot: 'This page is yours alone. The link in your email is what opens it.',
    areas: {
        discovery: { name: 'About you', why: 'Who you are and what the business actually does. Good work is impossible for a business only half understood.' },
        strategy: { name: 'What success looks like', why: 'How both sides will know, a year from now, whether this was worth doing.' },
        requirements: { name: 'What it has to do', why: 'The functional list. Everything here becomes something built, or something deliberately left out.' },
        ux: { name: 'How it should feel', why: 'Tone, taste, and the things customers get wrong today.' },
        erp: { name: 'After it launches', why: 'Who runs it once it is handed over. This is where most projects quietly die.' },
    },
    questions: {
        'discovery.what': 'What does the business do? What does it sell, to whom, and how does it make money today?',
        'discovery.who': 'Who is it for? The people who will actually use this, not the market it sits in.',
        'discovery.broken': 'What is broken today? The thing that made this project worth starting.',
        'strategy.success': 'What does success look like in a year? State it so that it could turn out false.',
        'strategy.measure': 'How will you know it worked? The number, the behaviour or the phone call that proves it.',
        'requirements.day1': 'What must it do on day one? One line each.',
        'requirements.out': 'What is deliberately out of scope? Writing it down now stops it arriving later as an assumption.',
        'ux.feel': 'How should it feel? A few words, not a paragraph.',
        'ux.wrong': 'What do people get wrong today? Where they hesitate, misread, or give up.',
        'erp.runs': 'Who runs it after launch? Names, and how comfortable they are with a computer.',
        'erp.needs': 'What will they need? Training, a handover document, a support arrangement, or nothing.',
    },
    part: (i, n) => `Part ${i} of ${n}`,
    questionCount: (n) => `${n} questions`,
    placeholder: 'In your own words. A few lines is plenty.',
    answered: (n, t) => `${n} of ${t} answered`,
    saveIdle: 'Nothing to save yet',
    saving: 'Saving…',
    saved: 'Saved',
    saveFailed: 'Not saved yet. Retrying.',
    jump: 'Parts of this brief',
    sendNote: 'Once sent, the answers go to Boutaleb to be read. Nothing more is asked afterwards.',
    send: 'Send to Boutaleb',
    sending: 'Sending…',
    sendLater: 'Or close this page: the answers are kept, and the link opens it again.',
    sendFailed: 'Could not send. Check the connection and try again.',
    backH: 'A few answers need another look.',
    backP: 'Boutaleb read the brief and asked for this:',
    sentH: 'That is everything needed.',
    sentP1: 'The answers are with Boutaleb. They are read properly, not skimmed, and a reply follows within two working days with what was understood, including anything assumed because it was not covered.',
    sentP2: 'If something was understood wrongly, that reply is where to correct it. Nothing is built before it has been seen.',
    close: 'You can close this page.',
};

const fr: PortalCopy = {
    dir: 'ltr',
    beat1: 'N’importe qui peut « vibecoder » un site en un après-midi.',
    beat2: 'Presque aucun ne tient son premier vrai mois.',
    scroll: 'Défiler',
    kicker: (p) => `${p} · votre brief`,
    h1: 'C’est cette étape qui décide si le projet fonctionnera.',
    lede1: ['La plupart de ce qui se construit aujourd’hui est ', 'vibecodé', ' : soutiré à une IA à coups de prompts jusqu’à ce que quelque chose s’affiche à l’écran. Cela paraît terminé dès le premier jour, et il n’y a rien dessous.'],
    lede2: 'Boutaleb est un studio, pas un générateur. Chaque projet se construit depuis l’entreprise vers l’extérieur : ce qu’elle fait, pour qui, ce qui ne marche pas aujourd’hui, ce qui devra encore être vrai dans trois ans. Chaque décision est écrite et raisonnée avant d’être construite, de sorte que ce qui est livré peut être expliqué, modifié et maintenu, par Boutaleb ou par quiconque prendra la suite.',
    lede3: 'Ce n’est pas une affirmation sur le talent, mais sur la méthode, qui compte trois phases.',
    turnK: 'Ce qu’un site généré n’a jamais eu',
    turnH: 'Les trois ont lieu avant qu’une seule ligne soit écrite.',
    phases: [
        { n: '01', h: 'Conception', p: 'Ce que fait réellement l’entreprise, pour qui, ce qui ne marche pas aujourd’hui. Écrit et validé avant toute construction, pour que rien ne repose sur une supposition.' },
        { n: '02', h: 'Design', p: 'La structure avant la surface. Ce qui va où, et pourquoi, décidé avant de choisir une couleur, pour que la version qui a l’air juste soit aussi celle qui fonctionne.' },
        { n: '03', h: 'Ingénierie', p: 'Construit pour être compris et maintenu par la personne qui reprendra, pas seulement pour avoir l’air fini le jour de la livraison.' },
    ],
    dealK: 'Pourquoi ces questions',
    dealH: 'L’heure passée ci-dessous est la plus précieuse du projet.',
    dealP: (who) =>
        `Chaque écran, chaque décision et chaque ligne écrite ensuite découlent de ces réponses. C’est la différence entre quelque chose de généré et quelque chose de conçu pour ${who}. Les questions sont longues parce que le détail est l’enjeu : une réponse vague ne produit pas un site vague, elle produit le mauvais site.`,
    promise: ['Les questions ne sont posées qu’une fois.', ' Pas de deuxième tour, pas de formulaire de relance. Le travail part de ce qui peut être donné en une séance : écrivez simplement, avec vos mots, et passez ce qui n’est pas encore connu.'],
    expect: (q, n) => [`${q} questions, en ${n} parties`, '20 minutes environ', 'Enregistré au fil de la saisie : à reprendre quand vous voulez'],
    start: 'Commencer le brief',
    talk: 'Vous préférez en parler ? Répondez à l’e-mail : un appel remplace le formulaire.',
    foot: 'Cette page est la vôtre. Le lien reçu par e-mail est ce qui l’ouvre.',
    areas: {
        discovery: { name: 'À propos de vous', why: 'Qui vous êtes et ce que fait vraiment l’entreprise. Bien travailler est impossible pour une entreprise à moitié comprise.' },
        strategy: { name: 'À quoi ressemble le succès', why: 'Comment chacun saura, dans un an, si cela valait la peine.' },
        requirements: { name: 'Ce que cela doit faire', why: 'La liste fonctionnelle. Tout ce qui figure ici devient du travail, ou est volontairement écarté.' },
        ux: { name: 'Ce que cela doit inspirer', why: 'Le ton, le goût, et ce que vos clients ratent aujourd’hui.' },
        erp: { name: 'Après la mise en ligne', why: 'Qui fait tourner l’ensemble après la livraison. C’est là que la plupart des projets s’éteignent discrètement.' },
    },
    questions: {
        'discovery.what': 'Que fait l’entreprise ? Que vend-elle, à qui, et comment gagne-t-elle de l’argent aujourd’hui ?',
        'discovery.who': 'Pour qui est-ce ? Les personnes qui s’en serviront réellement, pas le marché qui les entoure.',
        'discovery.broken': 'Qu’est-ce qui ne marche pas aujourd’hui ? Ce qui a rendu ce projet utile à lancer.',
        'strategy.success': 'À quoi ressemble le succès dans un an ? Formulez-le de façon à ce qu’il puisse se révéler faux.',
        'strategy.measure': 'Comment saurez-vous que cela a marché ? Le chiffre, le comportement ou l’appel qui le prouve.',
        'requirements.day1': 'Que doit-il faire dès le premier jour ? Une ligne par élément.',
        'requirements.out': 'Qu’est-ce qui est volontairement hors du périmètre ? L’écrire maintenant évite que cela revienne plus tard comme une supposition.',
        'ux.feel': 'Quelle impression doit-il donner ? Quelques mots, pas un paragraphe.',
        'ux.wrong': 'Qu’est-ce que les gens ratent aujourd’hui ? Là où ils hésitent, se trompent ou abandonnent.',
        'erp.runs': 'Qui le fait tourner après la mise en ligne ? Des noms, et leur aisance avec un ordinateur.',
        'erp.needs': 'De quoi auront-ils besoin ? Une formation, un document de passation, un accord de support, ou rien.',
    },
    part: (i, n) => `Partie ${i} sur ${n}`,
    questionCount: (n) => `${n} questions`,
    placeholder: 'Avec vos mots. Quelques lignes suffisent.',
    answered: (n, t) => `${n} réponses sur ${t}`,
    saveIdle: 'Rien à enregistrer pour l’instant',
    saving: 'Enregistrement…',
    saved: 'Enregistré',
    saveFailed: 'Pas encore enregistré. Nouvel essai.',
    jump: 'Parties de ce brief',
    sendNote: 'Une fois envoyées, les réponses arrivent chez Boutaleb pour être lues. Rien d’autre n’est demandé ensuite.',
    send: 'Envoyer à Boutaleb',
    sending: 'Envoi…',
    sendLater: 'Ou fermez cette page : les réponses sont gardées, et le lien la rouvre.',
    sendFailed: 'Envoi impossible. Vérifiez la connexion et réessayez.',
    backH: 'Quelques réponses méritent un second regard.',
    backP: 'Boutaleb a lu le brief et demande ceci :',
    sentH: 'C’est tout ce qu’il fallait.',
    sentP1: 'Les réponses sont chez Boutaleb. Elles sont lues attentivement, pas survolées, et une réponse suit sous deux jours ouvrés avec ce qui a été compris, y compris ce qui a dû être supposé faute de précisions.',
    sentP2: 'Si quelque chose a été mal compris, cette réponse est l’endroit pour le corriger. Rien n’est construit avant d’avoir été vu.',
    close: 'Vous pouvez fermer cette page.',
};

const ar: PortalCopy = {
    dir: 'rtl',
    beat1: 'أي شخص يستطيع إنتاج موقع بالذكاء الاصطناعي في بعد ظهر واحد.',
    beat2: 'قلّة منها فقط تصمد في شهرها الحقيقي الأول.',
    scroll: 'مرّروا',
    kicker: (p) => `${p} · موجزكم`,
    h1: 'هذه هي المرحلة التي تحسم نجاح المشروع.',
    lede1: ['معظم ما يُبنى اليوم يُنتَج بأسلوب ', 'vibecoding', ': أي أن يُستخرج من الذكاء الاصطناعي بتعليمات متتالية إلى أن يظهر شيء على الشاشة. يبدو مكتملاً من اليوم الأول، ولا شيء تحته.'],
    lede2: 'Boutaleb استوديو وليس مولّداً. يُبنى كل مشروع من النشاط نحو الخارج: ماذا يفعل، ولمن، وما الذي يتعطل اليوم، وما الذي يجب أن يبقى صحيحاً بعد ثلاث سنوات. يُكتب كل قرار ويُعلَّل قبل البناء، ليكون ما يُسلَّم قابلاً للشرح والتعديل والصيانة، سواء من Boutaleb أو ممن يأتي بعده.',
    lede3: 'هذا ليس ادعاءً عن الموهبة، بل عن المنهج، وللمنهج ثلاث مراحل.',
    turnK: 'ما لم يكن للموقع المولَّد',
    turnH: 'تحدث المراحل الثلاث كلها قبل كتابة سطر واحد.',
    phases: [
        { n: '01', h: 'التصور', p: 'ما يفعله النشاط فعلاً، ولمن، وما الذي يتعطل اليوم. يُكتب ويُتفق عليه قبل أي بناء، فلا يقوم شيء على تخمين.' },
        { n: '02', h: 'التصميم', p: 'البنية قبل الشكل. ما يوضع أين ولماذا يُحسم قبل اختيار أي لون، ليكون الشكل الصحيح هو نفسه الذي يعمل.' },
        { n: '03', h: 'الهندسة', p: 'يُبنى ليفهمه ويصونه من يأتي بعد ذلك، لا ليبدو مكتملاً يوم التسليم فقط.' },
    ],
    dealK: 'لماذا هذه الأسئلة',
    dealH: 'الساعة التي تقضونها أدناه هي أثمن ساعة في المشروع.',
    dealP: (who) =>
        `كل شاشة وكل قرار وكل سطر يُكتب بعد ذلك ينبع من هذه الإجابات. وهذا هو الفرق بين شيء مولَّد وشيء صُمم خصيصاً لـ${who}. الأسئلة طويلة لأن التفاصيل هي الأساس: الإجابة الغامضة لا تُنتج موقعاً غامضاً، بل موقعاً خاطئاً.`,
    promise: ['تُطرح الأسئلة مرة واحدة فقط.', ' لا جولة ثانية ولا استمارة متابعة. ينطلق العمل مما يمكن تقديمه في جلسة واحدة، فاكتبوا ببساطة وبكلماتكم، وتجاوزوا ما لا تعرفونه بعد.'],
    expect: (q, n) => [`${q} سؤالاً في ${n} أجزاء`, 'نحو 20 دقيقة', 'يُحفظ أثناء الكتابة: يمكنكم التوقف والعودة متى شئتم'],
    start: 'ابدأوا الموجز',
    talk: 'تفضلون الحديث بدل الكتابة؟ ردّوا على الرسالة الإلكترونية، وتحلّ مكالمة محل الاستمارة.',
    foot: 'هذه الصفحة لكم وحدكم. الرابط الذي وصلكم بالبريد هو ما يفتحها.',
    areas: {
        discovery: { name: 'عنكم', why: 'من أنتم وماذا يفعل النشاط فعلاً. لا يمكن العمل الجيد على نشاط مفهوم بالنصف.' },
        strategy: { name: 'كيف يبدو النجاح', why: 'كيف سيعرف الطرفان بعد سنة هل كان الأمر يستحق.' },
        requirements: { name: 'ما يجب أن يفعله', why: 'القائمة الوظيفية. كل ما يرد هنا يصبح عملاً، أو يُستبعد عمداً.' },
        ux: { name: 'كيف يجب أن يكون الإحساس', why: 'النبرة والذوق، وما يخطئ فيه زبناؤكم اليوم.' },
        erp: { name: 'بعد الإطلاق', why: 'من يشغّله بعد التسليم. هنا تموت معظم المشاريع بصمت.' },
    },
    questions: {
        'discovery.what': 'ماذا يفعل النشاط؟ ماذا يبيع، ولمن، وكيف يحقق دخله اليوم؟',
        'discovery.who': 'لمن هو؟ الأشخاص الذين سيستعملونه فعلاً، لا السوق المحيط بهم.',
        'discovery.broken': 'ما الذي لا يعمل اليوم؟ الأمر الذي جعل هذا المشروع يستحق الانطلاق.',
        'strategy.success': 'كيف يبدو النجاح بعد سنة؟ صيغوه بحيث يمكن أن يتبين خطؤه.',
        'strategy.measure': 'كيف ستعرفون أنه نجح؟ الرقم أو السلوك أو المكالمة التي تثبت ذلك.',
        'requirements.day1': 'ماذا يجب أن يفعل منذ اليوم الأول؟ سطر واحد لكل أمر.',
        'requirements.out': 'ما المستبعد عمداً؟ كتابته الآن تمنع عودته لاحقاً في صورة افتراض.',
        'ux.feel': 'كيف يجب أن يكون الإحساس؟ بضع كلمات لا فقرة.',
        'ux.wrong': 'ما الذي يخطئ فيه الناس اليوم؟ حيث يترددون أو يسيئون الفهم أو يتخلون.',
        'erp.runs': 'من سيشغّله بعد الإطلاق؟ بالأسماء، ومدى ارتياحهم لاستعمال الحاسوب.',
        'erp.needs': 'ماذا سيحتاجون؟ تدريباً أو وثيقة تسليم أو اتفاق دعم، أو لا شيء.',
    },
    part: (i, n) => `الجزء ${i} من ${n}`,
    questionCount: (n) => `${n} سؤالاً`,
    placeholder: 'بكلماتكم. بضعة أسطر تكفي.',
    answered: (n, t) => `${n} من ${t} أُجيب عنها`,
    saveIdle: 'لا شيء للحفظ بعد',
    saving: 'جارٍ الحفظ…',
    saved: 'تم الحفظ',
    saveFailed: 'لم يُحفظ بعد. تجري إعادة المحاولة.',
    jump: 'أجزاء هذا الموجز',
    sendNote: 'بعد الإرسال تصل الإجابات إلى Boutaleb لتُقرأ. لا يُطلب شيء آخر بعد ذلك.',
    send: 'أرسلوا إلى Boutaleb',
    sending: 'جارٍ الإرسال…',
    sendLater: 'أو أغلقوا هذه الصفحة: الإجابات محفوظة، والرابط يفتحها من جديد.',
    sendFailed: 'تعذّر الإرسال. تحققوا من الاتصال وأعيدوا المحاولة.',
    backH: 'بعض الإجابات تحتاج إلى نظرة أخرى.',
    backP: 'قرأ Boutaleb الموجز وطلب ما يلي:',
    sentH: 'هذا كل ما كان مطلوباً.',
    sentP1: 'الإجابات الآن عند Boutaleb. تُقرأ بإمعان لا بنظرة سريعة، ويصلكم ردّ خلال يومي عمل بما تم فهمه، بما في ذلك ما افتُرض لأنه لم يرد.',
    sentP2: 'إن فُهم شيء خطأً فهذا الرد هو موضع تصحيحه. لا يُبنى شيء قبل أن تروه.',
    close: 'يمكنكم إغلاق هذه الصفحة.',
};

export const COPY: Record<PortalLang, PortalCopy> = { en, fr, ar };
