import { motion } from 'framer-motion';
import { fadeInUp } from '@repo/ui/components/Variants';
import { Badge, Hero } from '../../ui';

export function ContactHeroSection() {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto px-6 pt-20 pb-12"
    >
      <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">Start a Project</Badge>
      <Hero
        title="Tell me what you need. I return a scoped plan in 48 hours."
        subtitle="Share goals, constraints, and timeline. The response should feel structured, not generic."
      />
    </motion.section>
  );
}
