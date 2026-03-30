import Link from 'next/link';
import { motion } from 'framer-motion';
import { sectionReveal } from '@repo/ui';
import { Button, Alert } from '../../ui';

export function CtaBandSection() {
    return (
        <motion.section
            variants={sectionReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="max-w-6xl mx-auto px-6 pb-24"
        >
            <div className="rounded-[28px] bg-primary px-8 py-12 text-surface md:px-12 md:py-14">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                    Start here
                </p>
                <h2 className="mt-4 font-display text-3xl md:text-4xl">
                    Need a site and a system that can actually grow with the work?
                </h2>
                <p className="mt-4 max-w-2xl text-base text-surface/75">
                    Send your brief. The first response should feel structured, confident, and
                    implementation-ready.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="primary">
                        <Link href="/contact">Start Intake</Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/process">See the Process</Link>
                    </Button>
                </div>
                <Alert className="mt-6 border-white/15 bg-white/5 text-surface">
                    AI drafts can accelerate the process, but every important step stays behind a
                    human approval gate.
                </Alert>
            </div>
        </motion.section>
    );
}
