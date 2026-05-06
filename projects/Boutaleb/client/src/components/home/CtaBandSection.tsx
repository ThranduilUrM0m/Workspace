import Link from 'next/link';
import { motion } from 'framer-motion';
import { sectionReveal } from '@repo/ui/components/Variants';
import { Button, Alert } from '../../ui';

export function CtaBandSection() {
    return (
        <motion.section
            variants={sectionReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="max-w-6xl mx-auto px-6 pb-28"
        >
            <div className="relative overflow-hidden rounded-[34px] border border-primary/85 bg-primary px-8 py-12 text-surface shadow-hero md:px-12 md:py-16">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,106,0.22),transparent_28%),radial-gradient(circle_at_left_center,rgba(28,106,106,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.08))]" />
                <div className="pointer-events-none absolute right-10 top-8 h-24 w-24 rounded-full border border-white/[0.08]" />
                <div className="relative max-w-3xl">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                        Start here
                    </p>
                    <h2 className="mt-4 font-display text-3xl leading-tight md:text-4xl">
                        Need a site and a system that can actually grow with the work?
                    </h2>
                    <p className="mt-4 max-w-2xl text-base text-surface/[0.75]">
                        Send your brief. The first response should feel structured, confident, and
                        implementation-ready.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button
                            asChild
                            variant="primary"
                            className="border-accent bg-accent text-primary hover:bg-accent/[0.92]"
                        >
                            <Link href="/contact">Start Intake</Link>
                        </Button>
                        <Button
                            asChild
                            variant="secondary"
                            className="border-white/[0.14] bg-white/[0.08] text-surface hover:border-white/[0.22] hover:bg-white/[0.12]"
                        >
                            <Link href="/process">See the Process</Link>
                        </Button>
                    </div>
                    <Alert tone="info" invert className="mt-6 border-white/[0.12] bg-white/[0.08]">
                        AI drafts can accelerate the process, but every important step stays behind
                        a human approval gate.
                    </Alert>
                </div>
            </div>
        </motion.section>
    );
}
