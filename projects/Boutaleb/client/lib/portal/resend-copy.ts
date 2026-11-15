import type { PortalLang } from './copy';

// "Email me my access link" (T8.5), in three languages. Kept apart from
// copy.ts: that module is the questionnaire, this is the one page a visitor
// with no working link can reach.
//
// PUBLIC COPY RULE: no "I", "we" or "me". The reader is "you". The answer
// never says whether the address belongs to a client: it is the same words
// for every address. French and Arabic are drafts and join the open FR/AR
// copy verdict (HANDOFF).

export interface ResendCopy {
    dir: 'ltr' | 'rtl';
    h1: string;
    lede: string;
    label: string;
    placeholder: string;
    button: string;
    sending: string;
    /** Shown when the field is empty or not an address. */
    invalid: string;
    /** The one answer, whatever the address. */
    doneH: string;
    doneP: string;
    /** The network or the server failed: nothing was sent, trying again is safe. */
    failed: string;
}

export const RESEND_COPY: Record<PortalLang, ResendCopy> = {
    en: {
        dir: 'ltr',
        h1: 'Get your link by email.',
        lede: 'Enter the email address Boutaleb writes to. If a brief is waiting on it, a new link is sent there. A new link replaces the old one, and one request a day is enough.',
        label: 'Your email address',
        placeholder: 'name@example.com',
        button: 'Send the link',
        sending: 'Sending…',
        invalid: 'That does not look like an email address.',
        doneH: 'Done, if there was something to send.',
        doneP: 'If that address has a brief waiting, a link is on its way. It can take a few minutes. Nothing arrives if no brief is waiting on it, or if a link was already sent in the last 24 hours.',
        failed: 'Nothing was sent. Try again in a moment.',
    },
    fr: {
        dir: 'ltr',
        h1: 'Recevez votre lien par e-mail.',
        lede: 'Saisissez l’adresse e-mail à laquelle Boutaleb écrit. Si un brief l’attend, un nouveau lien y est envoyé. Un nouveau lien remplace l’ancien, et une demande par jour suffit.',
        label: 'Votre adresse e-mail',
        placeholder: 'nom@exemple.com',
        button: 'Envoyer le lien',
        sending: 'Envoi…',
        invalid: 'Cela ne ressemble pas à une adresse e-mail.',
        doneH: 'C’est fait, s’il y avait quelque chose à envoyer.',
        doneP: 'Si un brief attend sur cette adresse, un lien est en route. Cela peut prendre quelques minutes. Rien n’arrive si aucun brief n’attend sur cette adresse, ou si un lien a déjà été envoyé ces dernières 24 heures.',
        failed: 'Rien n’a été envoyé. Réessayez dans un instant.',
    },
    ar: {
        dir: 'rtl',
        h1: 'احصلوا على رابطكم بالبريد الإلكتروني.',
        lede: 'أدخلوا عنوان البريد الذي يراسله Boutaleb. إذا كان هناك موجز ينتظر عليه، يُرسل إليه رابط جديد. الرابط الجديد يحلّ محل القديم، وطلب واحد في اليوم يكفي.',
        label: 'عنوان بريدكم الإلكتروني',
        placeholder: 'name@example.com',
        button: 'أرسلوا الرابط',
        sending: 'جارٍ الإرسال…',
        invalid: 'هذا لا يبدو عنوان بريد إلكتروني.',
        doneH: 'تم، إن كان هناك ما يُرسل.',
        doneP: 'إذا كان هناك موجز ينتظر على هذا العنوان فالرابط في طريقه إليكم. قد يستغرق بضع دقائق. لا يصل شيء إذا لم يكن هناك موجز ينتظر عليه، أو إذا أُرسل رابط خلال الأربع والعشرين ساعة الماضية.',
        failed: 'لم يُرسل شيء. أعيدوا المحاولة بعد قليل.',
    },
};

/** The line on the "this link no longer opens anything" page that leads here. */
export const RESEND_LINK: Record<PortalLang, string> = {
    fr: 'Recevoir un nouveau lien par e-mail',
    en: 'Get a new link by email',
    ar: 'احصلوا على رابط جديد بالبريد الإلكتروني',
};

/** First language of Accept-Language that the page speaks; French when none does (the studio's default). */
export function pickLang(acceptLanguage: string | null): PortalLang {
    for (const part of (acceptLanguage ?? '').split(',')) {
        const code = part.trim().slice(0, 2).toLowerCase();
        if (code === 'fr' || code === 'en' || code === 'ar') return code;
    }
    return 'fr';
}
