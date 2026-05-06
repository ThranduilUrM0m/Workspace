import { motion } from 'framer-motion';
import Link from 'next/link';
import { gridFade } from '@repo/ui/components/Variants';
import { ProjectGrid, Button, Badge } from '../../ui';

const projects = [
    {
        id: 'proj_001',
        slug: 'industrial-maintenance-suite',
        title: 'Industrial Maintenance Suite',
        industry: 'Operations',
        summary: 'Unified intake and service dispatch reduced scheduling errors by 38%.',
        tags: ['ERP', 'Intake', 'Dashboard'],
        coverImage: '/media/projects/maintenance-cover.jpg',
        year: 2025,
        resultMetric: '+38% scheduling accuracy',
    },
];

export function FeaturedWorkSection() {
    return (
        <motion.section
            variants={gridFade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-7xl mx-auto px-6 py-24"
        >
            <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
                <div className="rounded-[28px] border border-border/[0.72] bg-white/[0.58] p-6 shadow-soft backdrop-blur-xl md:p-7">
                    <Badge className="mb-4 border-secondary/20 bg-secondary/10 text-secondary">
                        Selected Work
                    </Badge>
                    <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
                        Proof that design, delivery, and operations can work together.
                    </h2>
                    <p className="mt-4 max-w-xl text-base leading-7 text-muted">
                        A focused selection of builds where UX clarity, operational control, and
                        delivery confidence improved together.
                    </p>
                </div>

                <div className="flex items-center justify-start lg:justify-end">
                    <Button asChild variant="secondary">
                        <Link href="/work">View All Work</Link>
                    </Button>
                </div>
            </div>

            <ProjectGrid items={projects} className="mt-10" />
        </motion.section>
    );
}
