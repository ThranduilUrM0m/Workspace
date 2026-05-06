import Head from 'next/head';
import { ContactHeroSection } from '../src/components/contact/ContactHeroSection';
import { ContactFormSection } from '../src/components/contact/ContactFormSection';
import { ContactFaqSection } from '../src/components/contact/ContactFaqSection';
import { ContactAssuranceSection } from '../src/components/contact/ContactAssuranceSection';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Start a Project | Zakariae Boutaleb</title>
        <meta
          name="description"
          content="Project intake form. Share goals, constraints, and timeline. I return a scoped plan in 48 hours."
        />
      </Head>

      <main className="contact-page page-shell--public">
        <ContactHeroSection />
        <ContactFormSection />
        <ContactFaqSection />
        <ContactAssuranceSection />
      </main>
    </>
  );
}
