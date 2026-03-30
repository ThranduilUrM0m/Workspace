import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { heroContent, heroVisual } from '@repo/ui';
import { Hero, Badge, ProjectGrid, Button } from '../../ui';

const heroData = {
    eyebrow: 'Zakariae Boutaleb',
    title: 'Full-stack systems with the calm, polish, and structure serious projects need.',
    subtitle:
        'I build premium digital experiences, structured intake flows, and the internal tooling that keeps delivery, tickets, and finance aligned.',
    primaryCta: { label: 'Start a Project', href: '/contact' },
    secondaryCta: { label: 'See Selected Work', href: '/work', variant: 'secondary' as const },
    metrics: [
        'Structured intake before design starts',
        'Approval gates before automation ships',
        'Quotes, invoices, tickets, and delivery aligned',
    ],
    portrait: {
        src: '/media/hero/boutaleb-portrait-editorial.png',
        alt: 'Editorial portrait of Zakariae Boutaleb with partially obscured identity and gold graphic stroke',
    },
};

export function HomeHeroSection() {
    return (
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
            <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                <motion.div variants={heroContent} initial="hidden" animate="show">
                    <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
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
                    className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-border bg-primary lg:min-h-[560px]"
                >
                    <Image
                        src={heroData.portrait.src}
                        alt={heroData.portrait.alt}
                        fill
                        priority
                        className="object-cover object-center opacity-95"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,106,0.22),transparent_32%),linear-gradient(180deg,rgba(14,16,22,0.06),rgba(14,16,22,0.76))]" />
                    <div className="absolute inset-x-[18%] top-[18%] h-4 rotate-[-11deg] rounded-full bg-accent/80 blur-[1px]" />
                    <div className="absolute inset-x-[22%] top-[24%] h-2 rotate-[-11deg] rounded-full bg-accent/55" />
                </motion.aside>
            </div>
        </section>
    );
}
