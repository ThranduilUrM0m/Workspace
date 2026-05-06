import { motion } from 'framer-motion';
import { gridFade } from '@repo/ui/components/Variants';
import { ProjectGrid } from '../../ui';

const items = [
  {
    id: 'proj_001',
    slug: 'erp-retail-rollout',
    title: 'Retail ERP Rollout',
    industry: 'Retail',
    summary: 'Quote-to-cash cycle reduced from 12 to 5 days.',
    tags: ['Finance', 'Invoice', 'Automation'],
    coverImage: '/media/projects/retail-erp.jpg',
    year: 2026,
    resultMetric: '-58% cycle time'
  },
  {
    id: 'proj_002',
    slug: 'supply-chain-visibility',
    title: 'Supply Chain Visibility',
    industry: 'Logistics',
    summary: 'Real-time tracking for fleet and inventory across 50+ locations.',
    tags: ['Real-time', 'Mobile', 'Tracking'],
    coverImage: '/media/projects/supply-chain.jpg',
    year: 2026,
    resultMetric: '100% location visibility'
  }
];

export function ProjectsGridSection() {
  return (
    <motion.section
      variants={gridFade}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      <ProjectGrid items={items} />
    </motion.section>
  );
}
