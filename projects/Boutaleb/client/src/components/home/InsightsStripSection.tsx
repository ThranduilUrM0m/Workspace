import Link from 'next/link';
import { motion } from 'framer-motion';
import { sectionReveal, gridItem } from '@repo/ui/components/Variants';
import { Card, Badge, Button } from '../../ui';

const insights = [
    {
        slug: 'structuring-client-intake-before-design',
        type: 'Process note',
        title: 'Why the best client projects get structured before pixels start moving.',
        excerpt:
            'A short breakdown of how intake quality shapes scoping accuracy, client trust, and delivery velocity.',
    },
    {
        slug: 'approval-gates-without-killing-momentum',
        type: 'Architecture note',
        title: 'Approval gates should slow risk down, not slow the whole project down.',
        excerpt:
            'A quick look at where human checkpoints belong when AI, tickets, and finance all touch the same workflow.',
    },
];

export function InsightsStripSection() {
    return (
        <motion.section
            variants={sectionReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="max-w-7xl mx-auto px-6 py-10 md:py-14"
        >
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                    <Badge className="mb-4 border-accent/20 bg-accent/10 text-accent">
                        Latest insights
                    </Badge>
                    <h2 className="font-display text-3xl text-primary md:text-4xl">
                        A small layer of thinking behind the projects.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-muted">
                        Use the blog to show how decisions are made, not just what was shipped. This
                        keeps the public brand credible and alive.
                    </p>
                </div>

                <Button asChild variant="secondary">
                    <Link href="/blog">Read the Blog</Link>
                </Button>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
                {insights.map((item) => (
                    <motion.div key={item.slug} variants={gridItem}>
                        <Card
                            className="h-full border-border/60 bg-white/[0.78] shadow-soft backdrop-blur-xl"
                            title={item.title}
                            description={item.excerpt}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                                    {item.type}
                                </span>
                                <Link
                                    href={`/blog/${item.slug}`}
                                    className="text-sm font-medium text-primary transition hover:text-accent"
                                >
                                    Read article
                                </Link>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
