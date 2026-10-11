import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pickLocale, type Locale } from '@/content/page-record';
import { aboutPage } from '@/content/pages/about';
import { seoFor } from '@/lib/seo';
import '@/styles/about.css';

// Ported from Blueprinting/wireframes/public/about.html. The proof block is
// placeholder content until launch prep (content/pages/about.ts).

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const { copy, translated } = pickLocale(aboutPage, locale as Locale);
    return seoFor({ title: copy.title, seo: { description: copy.description } }, locale as Locale, {
        path: aboutPage.slug,
        translated,
    });
}

const pad = (n: number) => String(n).padStart(2, '0');

export default async function AboutPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const { copy, lang } = pickLocale(aboutPage, locale as Locale);
    const { hero, standards, process, proof } = copy.blocks;

    return (
        <main className="about-v1" id="main" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <section className="a-hero">
                <div className="ghost" aria-hidden="true">
                    {hero.ghost}
                </div>
                <div className="wrap">
                    <div className="eyebrow">{hero.eyebrow}</div>
                    <h1>{hero.heading}</h1>
                    <div className="namenote">
                        {hero.note.before}
                        <strong>{hero.note.strong}</strong>
                        {hero.note.after}
                    </div>
                </div>
            </section>

            <section className="a-standards">
                <div className="wrap">
                    <div className="label">{standards.label}</div>
                    <h2>{standards.heading}</h2>
                    <div className="a-grid">
                        {standards.items.map((item, i) => (
                            // Focusable so the long version a mouse finds by
                            // hovering is reachable by Tab (gate box 2, 2026-10-08).
                            <article key={item.title} className="a-card" tabIndex={0}>
                                <div className="num" aria-hidden="true">
                                    {pad(i + 1)}
                                </div>
                                <h3>{item.title}</h3>
                                <p>{item.short}</p>
                                <div className="hover-panel">
                                    <div className="ln" />
                                    <div className="t">{item.expanded}</div>
                                    <p>{item.long}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="a-process">
                <div className="wrap a-process-inner">
                    <div>
                        <div className="label">{process.label}</div>
                        <h2>{process.heading}</h2>
                        <div className="a-steps">
                            {process.steps.map((s, i) => (
                                <div key={s.title} className="a-step">
                                    <div className="n">{pad(i + 1)}</div>
                                    <div>
                                        <h3>{s.title}</h3>
                                        <p>{s.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="focal" aria-hidden="true">
                        <span>{process.focal}</span>
                    </div>
                </div>
            </section>

            <section className="a-proof">
                <div className="wrap">
                    <div className="label">{proof.label}</div>
                    <div className="a-proof-inner">
                        <div>
                            <figure className="r-figure">
                                <blockquote>
                                    <p className="r-quote">{proof.quote}</p>
                                </blockquote>
                                <figcaption className="r-people">
                                    <div className="r-avatar" aria-hidden="true" />
                                    <div className="r-who">
                                        <span className="r-name">{proof.name}</span>
                                        <span className="r-role">{proof.role}</span>
                                    </div>
                                    <div className="r-vdiv" aria-hidden="true" />
                                    <div className="r-brand">{proof.company}</div>
                                </figcaption>
                            </figure>
                            <div className="full-divider inset" />
                            <div className="stats-row">
                                {proof.stats.map((stat) => (
                                    <div key={stat.title} className="stat">
                                        <div className="stat-value">
                                            {stat.value}
                                            <span className="mark">{stat.mark}</span>
                                        </div>
                                        <div className="stat-text">
                                            <div className="stat-title">{stat.title}</div>
                                            <div className="stat-desc">{stat.text}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="a-mood" aria-hidden="true">
                            <div className="m-circle" />
                            <div className="m-line" />
                            <div className="m-square" />
                            <div className="m-dot-grid">
                                {Array.from({ length: 8 }, (_, i) => (
                                    <span key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
