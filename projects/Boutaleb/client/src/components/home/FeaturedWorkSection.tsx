import { motion } from 'framer-motion';
import Link from 'next/link';
import { gridFade } from '@repo/ui';
import { ProjectGrid, Button } from '../../ui';

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
            className="max-w-7xl mx-auto px-6 py-20"
        >
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
                        Selected Work
                    </p>
                    <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
                        Proof that design, delivery, and operations can work together.
                    </h2>
                    <p className="mt-3 max-w-2xl text-base text-muted">
                        A focused selection of builds where UX clarity and operational control
                        improved together.
                    </p>
                </div>
                <Button asChild variant="secondary">
                    <Link href="/work">View All Work</Link>
                </Button>
            </div>

            <ProjectGrid items={projects} />
        </motion.section>
    );
}
