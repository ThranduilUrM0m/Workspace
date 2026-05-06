import Head from 'next/head';
import { ProcessHeroSection } from '../src/components/process/ProcessHeroSection';
import { ProcessTimelineSection } from '../src/components/process/ProcessTimelineSection';
import { DeliverablesSection } from '../src/components/process/DeliverablesSection';
import { ApprovalGatesSection } from '../src/components/process/ApprovalGatesSection';
import { ProcessCtaSection } from '../src/components/process/ProcessCtaSection';

export default function ProcessPage() {
  return (
    <>
      <Head>
        <title>Process | Zakariae Boutaleb</title>
        <meta
          name="description"
          content="5-stage delivery process with approval gates and clear deliverables."
        />
      </Head>

      <main className="process-page page-shell--public">
        <ProcessHeroSection />
        <ProcessTimelineSection />
        <DeliverablesSection />
        <ApprovalGatesSection />
        <ProcessCtaSection />
      </main>
    </>
  );
}
