import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CaseStudyBody } from '@/components/public/work/CaseStudyBody';
import { projectBySlug, projects, workCategoryLabel } from '@/content/work';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { seoFor } from '@/lib/seo';
import '@/styles/case.css';

// A case study loaded directly (a shared link, a search result, a reload):
// the full page every project needs to be found (seo-boutaleb §4). Opened
// from the grid, the same URL renders in a dialog instead (@modal).

const TRANSLATED = ['en'] as const;

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
    return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const project = projectBySlug(slug);
    if (!project) return {};
    return seoFor({ title: project.title, body: `${project.blurb} ${project.caseStudy.overview}` }, locale as Locale, {
        path: `/portfolio/${slug}`,
        translated: TRANSLATED,
    });
}

export default async function CaseStudyPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);
    const project = projectBySlug(slug);
    if (!project) notFound();

    return (
        <main id="main" lang="en">
            <article className="case-v1 case-page" aria-labelledby="case-title">
                <div className="m-head">
                    <div className="htitle">
                        <span className="meta">
                            {workCategoryLabel[project.category]} · {project.year}
                        </span>
                    </div>
                    <Link className="back" href="/portfolio">
                        <span className="flip-rtl" aria-hidden="true">
                            ←
                        </span>
                        &nbsp;All projects
                    </Link>
                </div>
                <CaseStudyBody project={project} titleId="case-title" />
            </article>
        </main>
    );
}
