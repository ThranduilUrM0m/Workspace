import { Alert } from '../../ui';

export function ContactAssuranceSection() {
  return (
    <section className="max-w-4xl mx-auto px-6 pb-20">
      <Alert className="border-accent/20 bg-accent/5">
        <p className="font-semibold text-primary">No commitment required.</p>
        <p className="mt-2 text-muted">
          The scope document is free. If we decide to work together, we'll discuss the next steps. If not, you have a clear plan to hand off to another team.
        </p>
      </Alert>
    </section>
  );
}
