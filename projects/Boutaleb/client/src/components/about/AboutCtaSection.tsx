import Link from 'next/link';
import { Button, Card } from '../../ui';

export function AboutCtaSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      <Card
        title="Ready to work with someone who understands both business and systems?"
        description="Let's talk about what you're building, what's slowing you down, and how to fix it."
      >
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button asChild variant="primary">
            <Link href="/contact">Start a Project</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/projects">View Case Studies</Link>
          </Button>
        </div>
      </Card>
    </section>
  );
}
