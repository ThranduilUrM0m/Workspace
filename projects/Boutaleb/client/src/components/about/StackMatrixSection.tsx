import { motion } from 'framer-motion';
import { fadeInUp } from '@repo/ui/components/Variants';
import { Badge, Card } from '../../ui';

const stackCategories = [
  {
    category: 'Backend & APIs',
    tags: ['Node.js / NestJS', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST']
  },
  {
    category: 'Frontend & UI',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Shadcn/ui']
  },
  {
    category: 'Systems & Infrastructure',
    tags: ['Docker', 'AWS / Cloud', 'GitHub Actions', 'Vercel', 'Render', 'Database Design', 'System Architecture']
  },
  {
    category: 'Product & Operations',
    tags: ['Project intake design', 'ERP systems', 'Approval workflows', 'AI integration', 'Technical leadership', 'Team scaling']
  }
];

export function StackMatrixSection() {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      className="max-w-6xl mx-auto px-6 py-16"
    >
      <h2 className="font-display text-3xl text-primary mb-12 md:text-4xl">Stack & Expertise</h2>
      <div className="grid gap-8 md:grid-cols-2">
        {stackCategories.map((group, idx) => (
          <Card key={idx} title={group.category}>
            <div className="flex flex-wrap gap-2 mt-4">
              {group.tags.map((tag) => (
                <Badge key={tag} className="bg-accent/10 text-accent border-accent/20">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}
