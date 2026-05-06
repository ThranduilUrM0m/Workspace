import { Alert, Card } from '../../ui';

export function ApprovalGatesSection() {
  return (
    <section className="max-w-6xl mx-auto grid gap-6 px-6 py-10 md:grid-cols-2">
      <Alert className="border-accent/20 bg-accent/5">
        <p className="font-semibold text-primary">Approval Gates</p>
        <p className="mt-2 text-muted">No stage unlocks until explicit PM/client approval is recorded.</p>
      </Alert>
      <Card
        title="Governance"
        description="Every approval decision is logged so scope, cost, and delivery stay aligned as the project moves forward."
      />
    </section>
  );
}
