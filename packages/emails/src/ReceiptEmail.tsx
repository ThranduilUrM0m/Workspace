import * as React from 'react';

/* The receipt sent once after a real enquiry, footer form or /contact
   (Blueprinting/wireframes/public/email-receipt.html; pipeline:
   Blueprinting/tech/public-forms.md §5). Markup is the wireframe's, as it
   ships: one 600px table, inline styles plus bgcolor attributes, no SVG, no
   script. Centred twice: align="center" for Outlook, margin:0 auto for
   webmail. Gmail drops web fonts, so every stack ends in Arial/Helvetica.
   px, not rem: mail clients size rem unreliably. The one media query only
   widens the sides from 600px; Outlook ignores it and keeps the phone
   values, which read fine at 600px too.
   The glyph is the hosted Favicon_2 PNG at 64px shown at 32, alt="", so
   blocked images leave nothing behind.
   Sent From "Zakariae Boutaleb <hello@…>", never no-reply: a reply
   reaches the owner. English until the site's copy is translated. */

export type ReceiptProps = {
  source: 'footer' | 'contact';
  name: string;
  email: string;
  /** Labelled answers in the order sent: project type, then budget and
   *  timeline on a /contact send. */
  answers: { label: string; value: string }[];
  message: string;
  /** The site's origin, e.g. https://boutaleb.dev. */
  site: string;
  /** Footer sends: /contact with this enquiry, for budget and timeline. */
  addDetailUrl?: string;
};

export const receiptSubject = 'Got it — a copy of your message';
export const receiptPreheader = 'A reply follows within two working days. Here is what you sent…';

const BODY = "Questrial,Helvetica,Arial,sans-serif";
const HEAD = "'Bricolage Grotesque',Arial,sans-serif";
const INK = '#1B1B1F';
const MUTED = '#4A4A50';

/* Inline styles: the base, phone values; the query below widens them. */
const px = (top: number, bottom = 0): React.CSSProperties => ({ padding: `${top}px 24px ${bottom}px` });

function Rule({ width, color }: { width: number | '100%'; color: string }) {
  return (
    <table role="presentation" width={width} cellPadding={0} cellSpacing={0} border={0}>
      <tbody>
        <tr>
          <td height={1} {...{ bgcolor: color }} style={{ height: 1, lineHeight: '1px', fontSize: 0, background: color }}>
            &nbsp;
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function ReceiptEmail({ source, name, email, answers, message, site, addDetailUrl }: ReceiptProps) {
  const first = name.trim().split(/\s+/)[0] || name;
  const rows = [{ label: 'Name', value: name }, { label: 'Email', value: email }, ...answers];

  return (
    <html lang="en" dir="ltr">
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{receiptSubject}</title>
        <style
          dangerouslySetInnerHTML={{
            __html:
              '@media (min-width:600px){.er-px{padding-left:40px !important;padding-right:40px !important;}.er-k{width:130px !important;}}',
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#F7F5F2' }}>
        {/* The inbox preview line; hidden in the body itself. */}
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden', opacity: 0 }}>{receiptPreheader}</div>
        <table
          role="presentation"
          width={600}
          align="center"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          {...{ bgcolor: '#F7F5F2' }}
          style={{ width: 600, maxWidth: '100%', margin: '0 auto', background: '#F7F5F2', borderCollapse: 'collapse' }}
        >
          <tbody>
            <tr>
              <td className="er-px" style={px(40)}>
                <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
                  <tbody>
                    <tr>
                      <td width={32} style={{ paddingRight: 12, verticalAlign: 'middle' }}>
                        <img src={`${site}/email/glyph-64.png`} width={32} height={30} alt="" style={{ display: 'block', border: 0 }} />
                      </td>
                      <td style={{ verticalAlign: 'middle', font: `700 18px/1 ${HEAD}`, color: INK }}>Boutaleb</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            <tr>
              <td className="er-px" style={px(40)}>
                <h1 style={{ margin: 0, font: `700 28px/1.2 ${HEAD}`, color: INK }}>{`Thanks, ${first}. It’s in.`}</h1>
                <p style={{ margin: '12px 0 0', font: `400 15px/1.6 ${BODY}`, color: MUTED }}>
                  A reply follows within two working days. Here is a copy of what you sent, for your records.
                </p>
              </td>
            </tr>

            <tr>
              <td className="er-px" style={px(32)}>
                <Rule width={48} color="#C4694A" />
              </td>
            </tr>

            <tr>
              <td className="er-px" style={px(24)}>
                <p
                  style={{ margin: '0 0 16px', font: `400 11px/1 ${BODY}`, letterSpacing: '.1em', textTransform: 'uppercase', color: MUTED }}
                >
                  What you sent
                </p>
                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={{ font: `400 14px/1.6 ${BODY}` }}>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.label}>
                        <td className={i === 0 ? 'er-k' : undefined} width={i === 0 ? 96 : undefined} valign="top" style={{ padding: '0 0 8px', color: MUTED }}>
                          {r.label}
                        </td>
                        <td style={{ padding: '0 0 8px', color: INK }}>{r.value}</td>
                      </tr>
                    ))}
                    <tr>
                      <td valign="top" style={{ padding: '8px 0 0', color: MUTED }}>
                        Message
                      </td>
                      <td style={{ padding: '8px 0 0', color: INK, whiteSpace: 'pre-line' }}>{message}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            <tr>
              <td className="er-px" style={{ ...px(28), font: `400 15px/1.6 ${BODY}`, color: INK }}>
                {/* Footer sends never gave budget and timeline: ask for them.
                    /contact sends already did: the ask is a reply. */}
                {source === 'footer' && addDetailUrl ? (
                  <a href={addDetailUrl} style={{ color: '#C4694A', textDecoration: 'underline' }}>
                    Add budget and timeline &rarr;
                  </a>
                ) : (
                  'Anything to add? Reply to this email.'
                )}
              </td>
            </tr>

            <tr>
              <td className="er-px" style={{ ...px(32), font: `400 15px/1.6 ${BODY}`, color: INK }}>
                Zakariae
              </td>
            </tr>

            <tr>
              <td className="er-px" style={px(40)}>
                <Rule width="100%" color="#E3E0DB" />
              </td>
            </tr>

            <tr>
              <td className="er-px" style={{ ...px(20, 40), font: `400 12px/1.6 ${BODY}`, color: '#6b6b70' }}>
                {/* One string, so React leaves no <!-- --> markers in the mail. */}
                {`You are getting this once, because you wrote in through ${new URL(site).host}. Your details are used only to reply (law 09-08). `}
                <a href={`${site}/privacy`} style={{ color: '#6b6b70', textDecoration: 'underline' }}>
                  Privacy policy
                </a>
                .
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
