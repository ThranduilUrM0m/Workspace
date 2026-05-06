import { motion } from 'framer-motion';
import { fadeInUp } from '@repo/ui/components/Variants';
import { Badge, Hero } from '../../ui';

export function ProjectsIntroSection() {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto px-6 pt-20 pb-12"
    >
      <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">Selected Projects</Badge>
      <Hero
        title="Systems built for measurable outcomes."
        subtitle="Filter by industry, module, or delivery type to inspect outcomes and implementation detail."
      />
    </motion.section>
  );
}
