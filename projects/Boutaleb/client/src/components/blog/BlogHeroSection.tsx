import { motion } from 'framer-motion';
import { fadeInUp } from '@repo/ui/components/Variants';
import { Badge, Hero } from '../../ui';

export function BlogHeroSection() {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-6 pt-20 pb-12"
    >
      <Badge className="mb-4 border-accent/20 bg-accent/10 text-accent">Blog</Badge>
      <Hero
        title="Technical writing that supports the same standards as the project work."
        subtitle="Articles on architecture, delivery, and systems thinking. Practical insight without the noise."
      />
    </motion.section>
  );
}
