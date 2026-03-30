import Head from 'next/head';
import { HomeHeroSection } from "../src/components/home/HomeHeroSection";
import { FeaturedWorkSection } from "../src/components/home/FeaturedWorkSection";
import { ProcessTeaserSection } from "../src/components/home/ProcessTeaserSection";
import { CtaBandSection } from "../src/components/home/CtaBandSection";

export default function Home() {
    return (
        <>
            <Head>
                <title>Zakariae Boutaleb - Full-Stack Developer & Digital Architect</title>
                <meta
                    name="description"
                    content="Crafting beautiful, scalable digital experiences with modern web technologies and AI integration."
                />
            </Head>
            <main className="homepage">
                <HomeHeroSection />
                <FeaturedWorkSection />
                <ProcessTeaserSection />
                <CtaBandSection />
            </main>
        </>
    );
}
