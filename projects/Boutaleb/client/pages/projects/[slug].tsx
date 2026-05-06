import Head from 'next/head';
import { useRouter } from 'next/router';
import { CaseHeroSection } from '../../src/components/project-detail/CaseHeroSection';
import { CaseNarrativeSection } from '../../src/components/project-detail/CaseNarrativeSection';
import { CaseScreensSection } from '../../src/components/project-detail/CaseScreensSection';
import { CaseNextCtaSection } from '../../src/components/project-detail/CaseNextCtaSection';

const caseStudies: Record<string, any> = {
  'erp-retail-rollout': {
    slug: 'erp-retail-rollout',
    title: 'Retail ERP Rollout',
    clientType: 'Retail Operations',
    year: 2026,
    role: 'Full-Stack Architect',
    problem: 'Quote-to-cash process took 12 days with multiple manual touchpoints, creating delays and error risk.',
    process: 'Designed intake workflow, mapped current process, built ERP module integrating quotes, invoices, payments, and inventory.',
    solution: 'Automated quote-to-invoice pipeline with approval gates. Integrated payment tracking and inventory sync.',
    screens: [
      { label: 'Quote Dashboard', image: '/media/projects/quote-dashboard.jpg' },
      { label: 'Invoice Editor', image: '/media/projects/invoice-editor.jpg' }
    ]
  },
  'supply-chain-visibility': {
    slug: 'supply-chain-visibility',
    title: 'Supply Chain Visibility System',
    clientType: 'Logistics & Supply Chain',
    year: 2026,
    role: 'Systems Architect',
    problem: 'Field teams and office staff lacked real-time visibility into delivery status and inventory levels.',
    process: 'Built real-time tracking system with mobile app integration and WebSocket updates for live status.',
    solution: 'Live dashboard showing field locations, delivery progress, and inventory levels updated in real-time.',
    screens: [
      { label: 'Live Tracking Map', image: '/media/projects/tracking-map.jpg' },
      { label: 'Inventory Dashboard', image: '/media/projects/inventory-dash.jpg' }
    ]
  }
};

export default function ProjectCaseStudyPage() {
  const router = useRouter();
  const { slug } = router.query;
  const caseStudy = slug ? caseStudies[slug as string] : null;

  if (!caseStudy) {
    return (
      <Head>
        <title>Project Not Found</title>
      </Head>
    );
  }

  return (
    <>
      <Head>
        <title>{caseStudy.title} | Zakariae Boutaleb</title>
        <meta name="description" content={`Case study: ${caseStudy.title}`} />
      </Head>

      <main className="project-detail-page page-shell--public">
        <CaseHeroSection caseStudy={caseStudy} />
        <CaseNarrativeSection title="Problem" body={caseStudy.problem} />
        <CaseNarrativeSection title="Process" body={caseStudy.process} />
        <CaseNarrativeSection title="Solution" body={caseStudy.solution} />
        <CaseScreensSection caseStudy={caseStudy} />
        <CaseNextCtaSection />
      </main>
    </>
  );
}
