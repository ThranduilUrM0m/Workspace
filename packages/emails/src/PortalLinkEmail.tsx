import * as React from 'react';

/* The email that carries a client's magic link (T8.4). One 600px table,
   inline styles, same bones as ReceiptEmail. Three languages, Arabic
   right-to-left. The copy is client-centred (no "I", "we" or "me"); the
   drafts for French and Arabic are unreviewed (open FR/AR copy verdict).
   Sent From "Zakariae Boutaleb <hello@…>", never no-reply: a reply reaches
   the owner. */

export type PortalLinkLanguage = 'en' | 'fr' | 'ar';

export type PortalLinkProps = {
  language: PortalLinkLanguage;
  /** The client's name; the first word greets them. */
  name: string;
  project: string;
  /** The magic link, shown as a button and as plain text. */
  url: string;
  /** The site's origin, for the glyph. */
  site: string;
};

type Copy = {
  subject: (project: string) => string;
  hello: (first: string) => string;
  body: (project: string) => string;
  button: string;
  note: string;
  sign: string;
};

const COPY: Record<PortalLinkLanguage, Copy> = {
  en: {
    subject: (p) => `Your brief for ${p}`,
    hello: (f) => `Hello ${f},`,
    body: (p) =>
      `Your brief for ${p} is ready to fill in. It takes about twenty minutes, saves as you type, and the same link picks it up again whenever you come back.`,
    button: 'Open your brief',
    note: 'This link is yours alone. Anyone who has it can open the page, so keep it to yourself. Replying to this email reaches Zakariae directly.',
    sign: 'Zakariae',
  },
  fr: {
    subject: (p) => `Votre brief pour ${p}`,
    hello: (f) => `Bonjour ${f},`,
    body: (p) =>
      `Votre brief pour ${p} est prêt à remplir. Comptez une vingtaine de minutes : les réponses s’enregistrent au fil de la saisie, et le même lien permet de reprendre à tout moment.`,
    button: 'Ouvrir votre brief',
    note: 'Ce lien est personnel. Toute personne qui le possède peut ouvrir la page : mieux vaut le garder pour vous. Répondre à ce message écrit directement à Zakariae.',
    sign: 'Zakariae',
  },
  ar: {
    subject: (p) => `موجزكم الخاص بمشروع ${p}`,
    hello: (f) => `مرحباً ${f}،`,
    body: (p) =>
      `موجز مشروع ${p} جاهز للتعبئة. يستغرق نحو عشرين دقيقة، وتُحفظ إجاباتكم أثناء الكتابة، ويمكن متابعتها في أي وقت من الرابط نفسه.`,
    button: 'افتحوا الموجز',
    note: 'هذا الرابط خاص بكم. كل من يملكه يستطيع فتح الصفحة، فاحتفظوا به لأنفسكم. الرد على هذه الرسالة يصل مباشرة إلى زكرياء.',
    sign: 'زكرياء',
  },
};

export const portalLinkSubject = (language: PortalLinkLanguage, project: string) => COPY[language].subject(project);

const BODY = "Questrial,Helvetica,Arial,sans-serif";
const HEAD = "'Bricolage Grotesque',Arial,sans-serif";
const INK = '#1B1B1F';
const MUTED = '#4A4A50';
const CLAY = '#C4694A';

export function PortalLinkEmail({ language, name, project, url, site }: PortalLinkProps) {
  const c = COPY[language];
  const rtl = language === 'ar';
  const first = name.trim().split(/\s+/)[0] || name;
  const align = rtl ? 'right' : 'left';

  return (
    <html lang={language} dir={rtl ? 'rtl' : 'ltr'}>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{c.subject(project)}</title>
      </head>
      <body style={{ margin: 0, padding: 0, background: '#F7F5F2' }}>
        <table
          role="presentation"
          width={600}
          align="center"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          {...{ bgcolor: '#F7F5F2' }}
          style={{ width: 600, maxWidth: '100%', margin: '0 auto', background: '#F7F5F2', borderCollapse: 'collapse', textAlign: align }}
        >
          <tbody>
            <tr>
              <td style={{ padding: '40px 24px 0' }}>
                <img src={`${site}/email/glyph-64.png`} width={32} height={30} alt="" style={{ display: 'inline-block', border: 0, verticalAlign: 'middle' }} />
                <span style={{ font: `700 18px/1 ${HEAD}`, color: INK, padding: '0 12px', verticalAlign: 'middle' }}>Boutaleb</span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '40px 24px 0' }}>
                <h1 style={{ margin: 0, font: `700 28px/1.2 ${HEAD}`, color: INK }}>{c.hello(first)}</h1>
                <p style={{ margin: '12px 0 0', font: `400 15px/1.6 ${BODY}`, color: MUTED }}>{c.body(project)}</p>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '32px 24px 0' }}>
                {/* Square, per the brand: no radius. */}
                <a
                  href={url}
                  style={{ display: 'inline-block', padding: '14px 28px', background: INK, color: '#FFFFFF', font: `400 15px/1 ${BODY}`, textDecoration: 'none' }}
                >
                  {c.button}
                </a>
                <p style={{ margin: '16px 0 0', font: `400 12px/1.5 ${BODY}`, color: MUTED, wordBreak: 'break-all', direction: 'ltr', textAlign: align }}>
                  <a href={url} style={{ color: CLAY }}>
                    {url}
                  </a>
                </p>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '32px 24px 0', font: `400 15px/1.6 ${BODY}`, color: INK }}>{c.sign}</td>
            </tr>
            <tr>
              <td style={{ padding: '40px 24px 40px', font: `400 12px/1.6 ${BODY}`, color: '#6b6b70' }}>{c.note}</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
