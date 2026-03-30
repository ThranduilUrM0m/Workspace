import { motion } from 'framer-motion';
import { gridItem, cardHover, sectionReveal } from '@repo/ui';
import { Card, Badge } from '../../ui';

const steps = [
    { title: 'Discover', description: 'Goals, constraints, and risk mapping before visuals.' },
    { title: 'Design', description: 'Flows, wireframes, and approvals before build starts.' },
    { title: 'Build', description: 'Tickets, QA, ERP rollout, and reporting in one track.' },
];

export function ProcessTeaserSection() {
    return (
        <section className="max-w-7xl mx-auto px-6 py-20">
            <motion.div
                variants={sectionReveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className="max-w-3xl"
            >
                <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
                    Process
                </Badge>
                <h2 className="font-display text-3xl text-primary md:text-4xl">
                    A delivery process built to stay clear under pressure.
                </h2>
                <p className="mt-4 text-lg text-muted">
                    Every engagement moves from structured discovery into approvals, then into
                    implementation and reporting.
                </p>
            </motion.div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.title}
                        variants={gridItem}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ delay: index * 0.08 }}
                    >
                        <motion.div
                            variants={cardHover}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <Card title={step.title} description={step.description} />
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
