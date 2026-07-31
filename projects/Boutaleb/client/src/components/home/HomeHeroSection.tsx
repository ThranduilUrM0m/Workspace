import Image from 'next/image';
import { motion } from 'framer-motion';
import { heroContent, heroVisual } from '@repo/ui/components/Variants';
import { Hero, Badge } from '../../ui';

const heroData = {
    eyebrow: 'Zakariae Boutaleb',
    title: 'Full-stack systems with the calm, polish, and structure serious projects need.',
    subtitle:
        'I build premium digital experiences, structured intake flows, and the internal tooling that keeps delivery, tickets, and finance aligned.',
    primaryCta: { label: 'Start a Project', href: '/contact' },
    secondaryCta: {
        label: 'See Selected Projects',
        href: '/projects',
        variant: 'secondary' as const,
    },
    metrics: [
        'Structured intake before design starts',
        'Approval gates before automation ships',
        'Quotes, invoices, tickets, and delivery aligned',
    ],
    portrait: {
        src: '/media/hero/boutaleb-portrait-editorial.png',
        alt: 'Editorial portrait of Zakariae Boutaleb with partially obscured identity and gold graphic stroke',
    },
    focusAreas: ['Intake systems', 'Delivery ops', 'ERP clarity'],
};

export function HomeHeroSection() {
    return (
        <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
            <div
                aria-hidden
                className="pointer-events-none absolute left-6 top-10 -z-10 h-52 w-52 rounded-full bg-accent/[0.10] blur-3xl"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute right-10 top-20 -z-10 h-44 w-44 rounded-full bg-secondary/[0.08] blur-3xl"
            />

            <div className="grid items-end gap-12 lg:grid-cols-[1.08fr_0.92fr]">
                <motion.div variants={heroContent} initial="hidden" animate="show">
                    <Badge className="mb-5 border-accent/25 bg-accent/10 px-3.5 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-accent">
                        {heroData.eyebrow}
                    </Badge>
                    <Hero
                        title={heroData.title}
                        subtitle={heroData.subtitle}
                        primaryCta={heroData.primaryCta}
                        secondaryCta={heroData.secondaryCta}
                        metrics={heroData.metrics}
                    />
                </motion.div>

                <motion.aside
                    variants={heroVisual}
                    initial="hidden"
                    animate="show"
                    className="relative isolate min-h-[460px] overflow-hidden rounded-[32px] border border-primary/80 bg-primary shadow-hero lg:min-h-[620px]"
                >
                    <Image
                        src={heroData.portrait.src}
                        alt={heroData.portrait.alt}
                        fill
                        priority
                        className="object-cover object-center opacity-95"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,106,0.24),transparent_30%),radial-gradient(circle_at_20%_12%,rgba(28,106,106,0.18),transparent_26%),linear-gradient(180deg,rgba(14,16,22,0.04),rgba(14,16,22,0.82))]" />
                    <div className="absolute inset-0 rounded-[32px] border border-white/[0.08]" />
                    <div className="absolute inset-x-[18%] top-[18%] h-4 rotate-[-11deg] rounded-full bg-accent/[0.82] blur-[1px]" />
                    <div className="absolute inset-x-[22%] top-[24%] h-2 rotate-[-11deg] rounded-full bg-accent/[0.55]" />

                    <div className="absolute bottom-5 left-5 right-5 rounded-[24px] border border-white/[0.12] bg-white/[0.08] p-4 backdrop-blur-2xl shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-surface/[0.58]">
                            Current focus
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {heroData.focusAreas.map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-white/[0.10] bg-white/[0.06] px-3 py-1.5 text-xs tracking-[0.01em] text-surface/[0.82]"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.aside>
            </div>
        </section>
    );
}
