import Link from 'next/link';
import { Button, Card } from '../../ui';

export function ProjectsInlineCtaSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      <Card
        title="Need a system like these examples?"
        description="Share your goals and constraints. We return an actionable plan in 48 hours."
      >
        <div className="mt-6">
          <Button asChild variant="primary">
            <Link href="/contact">Start Intake</Link>
          </Button>
        </div>
      </Card>
    </section>
  );
}
