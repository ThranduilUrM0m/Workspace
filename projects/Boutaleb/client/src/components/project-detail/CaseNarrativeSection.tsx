import { motion } from 'framer-motion';
import { fadeInUp } from '@repo/ui/components/Variants';
import { Card } from '../../ui';

interface CaseNarrativeSectionProps {
  title: string;
  body: string;
}

export function CaseNarrativeSection({ title, body }: CaseNarrativeSectionProps) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="max-w-5xl mx-auto px-6 py-8"
    >
      <Card title={title} description={body} />
    </motion.section>
  );
}
