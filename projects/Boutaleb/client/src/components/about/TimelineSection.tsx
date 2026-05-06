import { motion } from 'framer-motion';
import { fadeInUp } from '@repo/ui/components/Variants';
import { Card } from '../../ui';

const timelineEvents = [
  {
    year: '2026',
    title: 'Boutaleb Systems',
    description: 'Founded Boutaleb to build operational software for businesses ready to scale beyond spreadsheets and manual processes.'
  },
  {
    year: '2023-2025',
    title: 'Product Leadership',
    description: 'Led product strategy and backend systems for a logistics SaaS, handling 10M+ transactions annually. Built intake, project planning, and ERP modules.'
  },
  {
    year: '2020-2022',
    title: 'Full-Stack Engineering',
    description: 'Developed financial systems, API backends, and real-time dashboards for startups scaling from pre-seed to Series A.'
  },
  {
    year: '2018-2019',
    title: 'Web & Systems Design',
    description: 'Started as a full-stack developer. Built e-commerce platforms, CMS applications, and began specializing in operational software architecture.'
  }
];

export function TimelineSection() {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      className="max-w-6xl mx-auto px-6 py-16"
    >
      <h2 className="font-display text-3xl text-primary mb-12 md:text-4xl">Timeline</h2>
      <div className="space-y-8">
        {timelineEvents.map((event, idx) => (
          <Card key={idx} className="border-l-4 border-l-accent">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{event.year}</p>
                <h3 className="font-display text-xl text-primary mb-2">{event.title}</h3>
                <p className="text-muted">{event.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}
