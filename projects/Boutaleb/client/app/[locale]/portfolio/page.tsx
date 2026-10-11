import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { WorkIndex } from '@/components/public/work/WorkIndex';
import { featuredProjects, projects, workCategoryLabel } from '@/content/work';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { seoFor } from '@/lib/seo';
import '@/styles/work.css';

// Ported from Blueprinting/wireframes/public/portfolio.html. Copy English only
// until translated; projects from content/work.ts (placeholder, plan R5).
// Each entry opens its case study in a dialog over this page
// (@modal/(.)portfolio/[slug]); the same URL loaded directly is a full page.

const TRANSLATED = ['en'] as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return seoFor(
        { title: 'Portfolio', seo: { description: 'Builds scoped, designed and shipped solo: web platforms, internal tools and sites. Each entry opens a full case study.' } },
        locale as Locale,
        { path: '/portfolio', translated: TRANSLATED },
    );
}

const pad = (n: number) => String(n).padStart(2, '0');

export default async function PortfolioPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const lang = TRANSLATED.includes(locale as 'en') ? locale : 'en';

    return (
        <main className="work-v1" id="main" lang={lang}>
            <section className="w-hero">
                <div className="wrap w-hero-row">
                    <div className="gwork font-display" aria-hidden="true">
                        WORK<span className="dot">.</span>
                    </div>
                    <div>
                        <div className="meta">003 · all projects</div>
                        <h1 className="font-display">
                            The work<span>.</span>
                        </h1>
                    </div>
                    <div className="w-aside">
                        <div className="accent" />
                        <p className="desc">
                            {projects.length} builds, start to finish — scoped, designed and shipped solo. Each entry opens a full case study.
                        </p>
                    </div>
                </div>
            </section>

            <div className="wrap">
                <div className="feat">
                    {featuredProjects().map((p, i) => (
                        <Link key={p.slug} className={i % 2 ? 'f-row flip' : 'f-row'} href={`/portfolio/${p.slug}`} scroll={false}>
                            <div className="ph" data-id={pad(i + 1)} />
                            <div className="txt">
                                <span className="idxtag">{pad(i + 1)}</span>
                                <div className="meta">{workCategoryLabel[p.category]}</div>
                                <h2 className="title">{p.title}</h2>
                                <div className="accent" />
                                <p className="desc">{p.blurb}</p>
                                <span className="cs">
                                    View case study <span className="arr">&rarr;</span>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="divider" />

                <div className="idx-head">
                    <div className="count">
                        <span className="num font-display">{pad(projects.length)}</span>
                        <div>
                            <div className="meta">003 · all projects</div>
                            <h2 className="font-display">Portfolio</h2>
                        </div>
                    </div>
                    <p className="desc">Filter by discipline, or scan the whole index. Any card opens the full case study.</p>
                </div>

                <WorkIndex
                    cards={projects.map((p) => ({
                        slug: p.slug,
                        title: p.title,
                        category: p.category,
                        categoryLabel: workCategoryLabel[p.category],
                        year: p.year,
                        blurb: p.blurb,
                    }))}
                    allLabel="All"
                    filterLabel="Filter projects"
                    cta="View case study"
                />
            </div>
        </main>
    );
}
