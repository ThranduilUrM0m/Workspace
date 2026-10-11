import { Fragment } from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pickLocale, type Locale } from '@/content/page-record';
import { servicesPage } from '@/content/pages/services';
import { Link } from '@/i18n/navigation';
import { seoFor } from '@/lib/seo';
import '@/styles/services.css';

// Ported from Blueprinting/wireframes/public/services.html. Absorbs /process
// (#process) and /faq (#questions); both 301 here (lib/redirects.ts).

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const { copy, translated } = pickLocale(servicesPage, locale as Locale);
    return seoFor({ title: copy.title, seo: { description: copy.description } }, locale as Locale, {
        path: servicesPage.slug,
        translated,
    });
}

const pad = (n: number) => String(n).padStart(2, '0');

export default async function ServicesPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const { copy, lang } = pickLocale(servicesPage, locale as Locale);
    const { hero, offers, process, questions } = copy.blocks;
    let step = 0;

    return (
        <main className="services-v1" id="main" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <section className="s-hero">
                <div className="ghost" aria-hidden="true">
                    {hero.ghost}
                </div>
                <div className="wrap">
                    <div className="eyebrow">{hero.eyebrow}</div>
                    <h1>{hero.heading}</h1>
                    <p className="lead">{hero.lead}</p>
                    <nav className="s-index" aria-label={hero.indexLabel}>
                        {hero.index.map((item) => (
                            <a key={item.href} href={item.href}>
                                <b>{item.figure}</b>
                                <span>{item.label}</span>
                            </a>
                        ))}
                    </nav>
                </div>
            </section>

            <section className="s-sec tint" id="offers">
                <div className="wrap">
                    <div className="label">{offers.label}</div>
                    <h2>{offers.heading}</h2>
                    <p className="note">{offers.note}</p>
                    {offers.items.map((offer, i) => (
                        <div key={offer.title} className="offer inset">
                            <div className="n" aria-hidden="true">
                                {pad(i + 1)}
                            </div>
                            <div>
                                <h3>{offer.title}</h3>
                                <div className="sit">{offer.situation}</div>
                            </div>
                            <div>
                                <p>{offer.text}</p>
                                {offer.link && (
                                    <Link className="more" href={offer.link.href}>
                                        {offer.link.label} <span className="arr">&rarr;</span>
                                    </Link>
                                )}
                            </div>
                            <ul>
                                {offer.points.map((point) => (
                                    <li key={point}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <section className="s-sec" id="process">
                <div className="wrap">
                    <div className="label">{process.label}</div>
                    <h2>{process.heading}</h2>
                    <p className="p-note">
                        <b>{process.noteLead}</b>
                        <span>{process.note}</span>
                    </p>
                    <div className="p-head" aria-hidden="true">
                        {process.columns.map((c) => (
                            <span key={c}>{c}</span>
                        ))}
                    </div>
                    <div className="p-track">
                        {process.groups.map((group) => (
                            <Fragment key={group.title}>
                                <div className="p-group inset">{group.title}</div>
                                {group.steps.map((s) => {
                                    step += 1;
                                    return (
                                        <div key={s.title} className="p-row inset">
                                            <div className="n">{pad(step)}</div>
                                            <h3>{s.title}</h3>
                                            <p>{s.text}</p>
                                            <div className="part">{s.part}</div>
                                        </div>
                                    );
                                })}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </section>

            <section className="s-sec tint" id="questions">
                <div className="wrap">
                    <div className="q-layout">
                        <div className="q-head">
                            <div className="label">{questions.label}</div>
                            <h2>{questions.heading}</h2>
                            <p className="note">{questions.note}</p>
                        </div>
                        <dl className="qa">
                            {questions.items.map((item) => (
                                <div key={item.q} className="inset">
                                    <dt>{item.q}</dt>
                                    <dd>{item.a}</dd>
                                </div>
                            ))}
                        </dl>
                        <p className="qa-end inset">
                            {questions.endLead}{' '}
                            <Link className="more" href={questions.endLink.href}>
                                {questions.endLink.label} <span className="arr">&rarr;</span>
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
