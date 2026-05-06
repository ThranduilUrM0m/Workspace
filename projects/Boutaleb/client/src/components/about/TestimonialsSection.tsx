import { motion } from 'framer-motion';
import { fadeInUp } from '@repo/ui/components/Variants';
import { Card, Avatar } from '../../ui';

const testimonials = [
  {
    quote: "Zakariae's ability to turn vague business problems into concrete technical solutions is exceptional. He doesn't just build features—he builds systems.",
    author: 'Founder, Series A SaaS',
    role: 'Product & Operations'
  },
  {
    quote: 'The intake and planning process he designed saved us weeks of ambiguity. Every stage was clear, every approval was justified.',
    author: 'Operations Manager, Logistics Company',
    role: 'Project Leadership'
  },
  {
    quote: 'His backend architecture handles 10M+ transactions annually without breaking a sweat. That\'s not luck—that\'s design.',
    author: 'VP Engineering, FinTech Startup',
    role: 'Systems Architecture'
  }
];

export function TestimonialsSection() {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      className="max-w-6xl mx-auto px-6 py-16"
    >
      <h2 className="font-display text-3xl text-primary mb-12 md:text-4xl">What Others Say</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, idx) => (
          <Card key={idx} className="flex flex-col justify-between">
            <p className="text-muted italic mb-6">"{testimonial.quote}"</p>
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Avatar fallback={testimonial.author.charAt(0)} />
              <div>
                <p className="text-sm font-semibold text-primary">{testimonial.author}</p>
                <p className="text-xs text-muted">{testimonial.role}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}
