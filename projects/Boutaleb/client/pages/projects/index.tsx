import Head from 'next/head';
import { ProjectsIntroSection } from '../../src/components/projects/ProjectsIntroSection';
import { ProjectsFiltersSection } from '../../src/components/projects/ProjectsFiltersSection';
import { ProjectsGridSection } from '../../src/components/projects/ProjectsGridSection';
import { ProjectsInlineCtaSection } from '../../src/components/projects/ProjectsInlineCtaSection';

export default function ProjectsPage() {
  return (
    <>
      <Head>
        <title>Selected Projects | Zakariae Boutaleb</title>
        <meta name="description" content="Browse case studies and selected project outcomes." />
      </Head>

      <main className="projects-page page-shell--public">
        <ProjectsIntroSection />
        <ProjectsFiltersSection />
        <ProjectsGridSection />
        <ProjectsInlineCtaSection />
      </main>
    </>
  );
}
