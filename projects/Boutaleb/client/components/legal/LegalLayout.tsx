import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LegalToc } from './LegalToc';
import '@/styles/legal.css';

// One layout for /privacy, /terms and /legal-notice, ported from
// Blueprinting/wireframes/public/legal.html. Prose pages pass sections and
// get the index; the legal notice passes children (its record) instead.

export type LegalPage = 'privacy' | 'terms' | 'legal-notice';

export type LegalSection = {
    id: string;
    /** Short title for the index. */
    label: string;
    /** Full section heading. */
    title: string;
    body: ReactNode;
};

export type LegalDoc = {
    page: LegalPage;
    /** Language the copy is written in; differs from the URL's until translated. */
    lang: string;
    order: string;
    ghost: string;
    title: string;
    /** Search-result description, written for the page (SEO tier 1). */
    description: string;
    updated: string;
    short?: string[];
    sections?: LegalSection[];
    /** Language of the article when it differs from the head's (the legal
     *  notice: head in the URL's language, record in French). */
    bodyLang?: string;
    /** Says the page is not translated, under the siblings. */
    note?: string;
};

const SIBLINGS: { page: LegalPage; key: 'privacy' | 'terms' | 'legalNotice' }[] = [
    { page: 'privacy', key: 'privacy' },
    { page: 'terms', key: 'terms' },
    { page: 'legal-notice', key: 'legalNotice' },
];

export async function LegalLayout({ doc, aside, children }: { doc: LegalDoc; aside?: ReactNode; children?: ReactNode }) {
    // The page body speaks the copy's language, labels included, so a page
    // still in English on /privacy reads as one English page, not a mix.
    const t = await getTranslations({ locale: doc.lang, namespace: 'legal' });
    const n = await getTranslations({ locale: doc.lang, namespace: 'nav' });
    const sections = doc.sections ?? [];
    const updated = new Intl.DateTimeFormat(doc.lang === 'en' ? 'en-GB' : doc.lang, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(doc.updated));

    return (
        <main className="legal-v1" id="main" lang={doc.lang} dir={doc.lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="wrap">
                <div className="l-head">
                    <div className="lghost" aria-hidden="true">
                        {doc.ghost}
                        <span className="dot">.</span>
                    </div>
                    <div className="eyebrow">
                        {doc.order} · {t('eyebrow')}
                    </div>
                    <h1>{doc.title}</h1>
                    <p className="l-meta">
                        {t('lastUpdated')} <time dateTime={doc.updated}>{updated}</time>
                    </p>
                    <nav className="l-sibs" aria-label={t('siblings')}>
                        {SIBLINGS.map(({ page, key }) => (
                            <Link key={page} href={`/${page}`} aria-current={page === doc.page ? 'page' : undefined}>
                                {n(key)}
                            </Link>
                        ))}
                    </nav>
                    {doc.note && <p className="l-lang">{doc.note}</p>}
                </div>

                <div className="l-body">
                    {sections.length > 0 && (
                        <LegalToc
                            items={sections.map((s, i) => ({ id: s.id, n: String(i + 1).padStart(2, '0'), label: s.label }))}
                            summary={t('contents', { count: sections.length })}
                            label={t('onThisPage')}
                        />
                    )}
                    {aside}
                    <article lang={doc.bodyLang} dir={doc.bodyLang ? 'ltr' : undefined}>
                        {doc.short && (
                            <div className="l-short">
                                <p className="t">{t('inShort')}</p>
                                <ul>
                                    {doc.short.map((line) => (
                                        <li key={line}>{line}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {sections.map((s, i) => (
                            <section key={s.id} className="l-sec inset" id={s.id}>
                                <h2>
                                    <b>{String(i + 1).padStart(2, '0')}</b>
                                    {s.title}
                                </h2>
                                {s.body}
                            </section>
                        ))}
                        {children}
                    </article>
                </div>
            </div>
        </main>
    );
}
