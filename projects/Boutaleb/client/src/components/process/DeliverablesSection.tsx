import { Card } from '../../ui';

const deliverables = [
  {
    deliverable: 'Intake Summary PDF',
    owner: 'PM',
    stage: 'Discovery'
  },
  {
    deliverable: 'Strategy & Architecture Document',
    owner: 'PM + Architecture',
    stage: 'Strategy'
  },
  {
    deliverable: 'Requirements & Data Models',
    owner: 'PM + Developer',
    stage: 'Requirements'
  },
  {
    deliverable: 'Working Code & Feature Tests',
    owner: 'Developer',
    stage: 'Build'
  },
  {
    deliverable: 'Live System + Handoff Docs',
    owner: 'Team',
    stage: 'Deployment'
  }
];

export function DeliverablesSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <h2 className="font-display text-2xl text-primary mb-8">Deliverables</h2>
      <p className="text-muted mb-8 max-w-3xl">
        Each stage produces something reviewable and usable, not just conversation. Nothing moves forward without explicit approval.
      </p>
      <div className="space-y-3">
        {deliverables.map((item, idx) => (
          <Card key={idx} className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted uppercase tracking-widest">Deliverable</p>
              <p className="text-sm font-semibold text-primary">{item.deliverable}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-widest">Owner</p>
              <p className="text-sm font-semibold text-primary">{item.owner}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-widest">Stage</p>
              <p className="text-sm font-semibold text-accent">{item.stage}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
