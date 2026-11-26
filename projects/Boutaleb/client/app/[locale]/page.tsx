import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { cookie, reemKufi, ruqaa } from '@/app/fonts';
import { AboutGuidesToggle, AboutInspector } from '@/components/public/home/AboutInspector';
import { ApproachDrawing } from '@/components/public/home/ApproachIcons';
import { ApproachMock } from '@/components/public/home/ApproachMock';
import { BlogSlider, type SlidePost } from '@/components/public/home/BlogSlider';
import { HeroFit } from '@/components/public/home/HeroFit';
import { pickLocale, type Locale } from '@/content/page-record';
import { homePage } from '@/content/pages/home';
import { newestPosts, postCategoryLabel } from '@/content/posts';
import { clientNames, stats, testimonials } from '@/content/proof';
import { featuredProjects, workCategoryLabel } from '@/content/work';
import { Link } from '@/i18n/navigation';
import { seoFor } from '@/lib/seo';
import aboutWall from '@/public/images/home/about-wall-test.jpg';
import heroFigure from '@/public/images/hero/wall-figure.png';
import heroScene from '@/public/images/hero/wall-scene.jpg';
import '@/styles/home.css';

// Ported from Blueprinting/wireframes/public/homepage.html (locked). Work,
// posts and proof come from content/; all of it is placeholder until launch.

type Props = { params: Promise<{ locale: string }> };


export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const { copy, translated } = pickLocale(homePage, locale as Locale);
    const meta = seoFor({ title: copy.title, seo: { description: copy.description } }, locale as Locale, {
        path: homePage.slug,
        translated,
    });
    // The home title is the brand line itself, not "{page} — Boutaleb".
    return { ...meta, title: { absolute: copy.title } };
}

export default async function HomePage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const { copy, lang } = pickLocale(homePage, locale as Locale);
    const { hero, approach, about, process, work, trust, blog } = copy.blocks;

    const date = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : lang, { day: 'numeric', month: 'short', year: 'numeric' });
    const slides: SlidePost[] = newestPosts(2).map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: postCategoryLabel[p.category],
        author: p.author,
        date: date.format(new Date(p.publishedAt)),
        dateTime: p.publishedAt,
        comments: p.comments,
        likes: p.likes,
        views: p.views,
    }));
    const logoRows = [clientNames.slice(0, 4), clientNames.slice(4)];
    // The heading's final full stop is drawn as a clay square (the wordmark's accent dot).
    const aboutDot = about.heading.endsWith('.');
    const aboutHead = aboutDot ? about.heading.slice(0, -1) : about.heading;

    return (
        <div className={`home-v1 ${cookie.variable} ${ruqaa.variable} ${reemKufi.variable}`} id="page-wrap">
            <main id="main" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <section id="sec-hero">
                    {/* Layers, back to front: wall, BESPOKE, figure, "made with care". The words'
                        wrapper creates no stacking context, so the figure can sit between them.
                        The page heading is the pitch line below (it names the offer); these two
                        words are the visual slogan. */}
                    <div className="h-stage">
                        <Image className="h-img" src={heroScene} alt={hero.alt} fill preload sizes="100vw" placeholder="blur" />
                        <p className="h-word">
                            <span className="h-care">{hero.script}</span> <span className="h-bespoke">{hero.word}</span>
                        </p>
                        <Image className="h-img h-fig" src={heroFigure} alt="" fill preload sizes="100vw" />
                    </div>
                    <HeroFit />
                    <div className="hero-main">
                        <div className="h-built" aria-hidden="true">
                            {hero.built}
                        </div>
                        <div className="h-pitch">
                            <div className="eyebrow">{hero.eyebrow}</div>
                            <h1 className="h-line">
                                {hero.line[0]}
                                <br />
                                {hero.line[1]}
                            </h1>
                            <Link className="h-cta" href="/contact">
                                {hero.cta}
                            </Link>
                        </div>
                    </div>
                    <div className="h-strip">
                        <span>{hero.strip}</span>
                    </div>
                </section>

                <section id="sec-approach">
                    <div className="sec">
                        <div className="eyebrow">{approach.eyebrow}</div>
                        <h2 className="ap-head">{approach.heading}</h2>
                        <p className="ap-sub">{approach.sub}</p>
                        <div className="ap-row">
                            <div className="ap-left">
                                {approach.items.map((item, i) => {
                                    return (
                                        <div key={item.icon} className="ap-item">
                                            <ApproachDrawing icon={item.icon} seed={5 + i * 31} />
                                            <h3 className="ap-item-title">{item.title}</h3>
                                            <p className="ap-item-body">{item.text}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="ap-right">
                                <ApproachMock copy={approach.mock} />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="sec-about">
                    {/* r4 "The Inspector" (2026-11-24): big heading across the page landing on
                        a square photo (columns 1-6), text in 8-12; a live designer's inspection
                        layer gives each detail its reason (AboutInspector), and the visitor can
                        switch the notes off. */}
                    <div className="sec ab">
                        <div className="eyebrow ab-eyebrow">{about.eyebrow}</div>
                        <h2 className="ab-head">
                            {aboutHead}
                            {aboutDot && <span className="ab-dot">.</span>}
                        </h2>
                        {/* TEST 2026-11-22: Perchance sketch for the developer to judge, not final. */}
                        <div className="ab-img">
                            <Image src={aboutWall} alt="" fill sizes="(min-width: 48rem) 92vw, 100vw" className="ab-photo" />
                        </div>
                        <div className="ab-text">
                            <p className="ab-body">{about.text}</p>
                            <Link className="ct-cta" href="/blog">
                                <span>{about.cta}</span>
                                <span className="flip-rtl" aria-hidden="true">
                                    &rarr;
                                </span>
                            </Link>
                            <AboutGuidesToggle copy={about.inspector} />
                        </div>
                        <AboutInspector copy={about.inspector} />
                    </div>
                </section>

                <section id="sec-process">
                    <div className="sec">
                        <div className="eyebrow">{process.eyebrow}</div>
                        <h2 className="pr-head">{process.heading}</h2>
                        <p className="pr-sub">{process.sub}</p>
                        <div className="pr-grid">
                            {process.cards.map((card) => (
                                <div key={card.title} className="pr-card">
                                    <div className="pr-img ph" aria-hidden="true">
                                        {process.image}
                                    </div>
                                    <div className="pr-eyebrow">{card.eyebrow}</div>
                                    <h3 className="pr-title">{card.title}</h3>
                                    <div className="pr-body">{card.text}</div>
                                    <Link className="pr-link" href="/services#process">
                                        <span>{process.link}</span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="sec-portfolio">
                    <div className="sec">
                        <div className="eyebrow">{work.eyebrow}</div>
                        <div className="c3-row">
                            {featuredProjects().map((p) => (
                                <Link key={p.slug} className="c3-project" href={`/portfolio/${p.slug}`} scroll={false}>
                                    <div className="c3-media ph" aria-hidden="true">
                                        {work.image}
                                    </div>
                                    <div className="tag">{workCategoryLabel[p.category]}</div>
                                    <h3 className="c3-title">{p.title}</h3>
                                    <div className="c3-accent" />
                                    <div className="c3-blurb">{p.blurb}</div>
                                </Link>
                            ))}
                        </div>
                        <div className="seeall-row">
                            <Link className="seeall" href="/portfolio">
                                <span>{work.all}</span>
                            </Link>
                        </div>
                    </div>
                </section>

                <section id="sec-trust">
                    <div className="sec">
                        <div className="eyebrow">{trust.eyebrow}</div>
                        <div className="slider">
                            {testimonials.map((t, i) => (
                                <figure key={t.company} className={`slide s${i + 1}`}>
                                    <blockquote>
                                        <p className="r-quote">{t.quote}</p>
                                    </blockquote>
                                    <figcaption className="r-people">
                                        <div className="r-avatar" aria-hidden="true" />
                                        <div className="r-who">
                                            <span className="r-name">{t.name}</span>
                                            <span className="r-role">{t.role}</span>
                                        </div>
                                        <div className="r-vdiv" aria-hidden="true" />
                                        <div className="r-brand">{t.company}</div>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                        <div className="dots" aria-hidden="true">
                            {testimonials.map((t, i) => (
                                <i key={t.company} className={i === 0 ? 'on' : undefined} />
                            ))}
                        </div>
                        <div className="full-divider" />
                        <div className="stats-row">
                            {stats.map((s) => (
                                <div key={s.title} className="stat">
                                    <div className="stat-value">
                                        {s.value}
                                        <span className="mark">{s.mark}</span>
                                    </div>
                                    <div className="stat-text">
                                        <div className="stat-title">{s.title}</div>
                                        <div className="stat-desc">{s.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="logos-label">{trust.clientsLabel}</div>
                        <div className="logo-grid">
                            {logoRows.map((row, r) => (
                                <div key={r} className="logo-row">
                                    {row.map((name) => (
                                        <span key={name} className="logo-item">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="sec-blog">
                    <div className="sec blog-head">
                        <div className="eyebrow">{blog.eyebrow}</div>
                    </div>
                    <BlogSlider posts={slides} slideLabel={blog.slide} />
                </section>
            </main>
        </div>
    );
}
