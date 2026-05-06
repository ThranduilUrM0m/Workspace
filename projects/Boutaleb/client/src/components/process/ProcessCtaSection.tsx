import Link from 'next/link';
import { Button, Card } from '../../ui';

export function ProcessCtaSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      <Card
        title="Ready to move from vague brief to structured execution?"
        description="Start the intake. The next step should produce clarity, not more ambiguity."
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
