import { motion } from 'framer-motion';
import { fadeInUp } from '@repo/ui/components/Variants';
import { Badge, Hero } from '../../ui';

export function AboutHeroSection() {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-6 pt-20 pb-12"
    >
      <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">About</Badge>
      <Hero
        title="Founder and full-stack systems architect."
        subtitle="Zakariae Boutaleb builds operational software for businesses that want to scale beyond chaos. 8 years of product thinking, backend systems, and technical leadership."
      />
    </motion.section>
  );
}
