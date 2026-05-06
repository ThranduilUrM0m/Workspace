import Head from 'next/head';
import { AboutHeroSection } from '../src/components/about/AboutHeroSection';
import { TimelineSection } from '../src/components/about/TimelineSection';
import { StackMatrixSection } from '../src/components/about/StackMatrixSection';
import { TestimonialsSection } from '../src/components/about/TestimonialsSection';
import { AboutCtaSection } from '../src/components/about/AboutCtaSection';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About | Zakariae Boutaleb</title>
        <meta
          name="description"
          content="Profile, timeline, stack, and working philosophy behind the Boutaleb brand."
        />
      </Head>

      <main className="about-page page-shell--public">
        <AboutHeroSection />
        <TimelineSection />
        <StackMatrixSection />
        <TestimonialsSection />
        <AboutCtaSection />
      </main>
    </>
  );
}
