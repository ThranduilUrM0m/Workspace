import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CaseStudyBody } from '@/components/public/work/CaseStudyBody';
import { CaseStudyDialog } from '@/components/public/work/CaseStudyDialog';
import { projectBySlug, workCategoryLabel } from '@/content/work';
import '@/styles/case.css';

// /portfolio/<slug> reached by a click inside the site: intercepted and
// rendered in a dialog over the page that was showing (portfolio grid or
// homepage teaser). A reload or a shared link gets the full page instead.

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function CaseStudyModal({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);
    const project = projectBySlug(slug);
    if (!project) notFound();

    return (
        <CaseStudyDialog
            titleId="case-title"
            title={project.title}
            meta={`${workCategoryLabel[project.category]} · ${project.year}`}
        >
            <div lang="en">
                <CaseStudyBody project={project} titleId="case-title" />
            </div>
        </CaseStudyDialog>
    );
}
