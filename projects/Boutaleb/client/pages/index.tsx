import Head from "next/head";
import { HomeHeroSection } from "../src/components/home/HomeHeroSection";
import { FeaturedProjectsSection } from "../src/components/home/FeaturedProjectsSection";
import { InsightsStripSection } from "../src/components/home/InsightsStripSection";
import { ProcessTeaserSection } from "../src/components/home/ProcessTeaserSection";
import { CtaBandSection } from "../src/components/home/CtaBandSection";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Zakariae Boutaleb | Full-Stack Developer & Digital Architect</title>
        <meta
          name="description"
          content="Crafting beautiful, scalable digital experiences with modern web technologies and AI integration."
        />
      </Head>

      <main className="page-shell--public home-page">
        <HomeHeroSection />
        <FeaturedProjectsSection />
        <InsightsStripSection />
        <ProcessTeaserSection />
        <CtaBandSection />
      </main>
    </>
  );
}