import Link from 'next/link';
import { Button, Card } from '../../ui';

export function CaseNextCtaSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      <Card
        title="Ready to build something similar?"
        description="Share your operational challenge and timeline. I'll return a scoped plan in 48 hours."
      >
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button asChild variant="primary">
            <Link href="/contact">Start Intake</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/projects">Back to Projects</Link>
          </Button>
        </div>
      </Card>
    </section>
  );
}
