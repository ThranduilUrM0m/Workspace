import { Card, Badge } from '../../ui';

const stages = [
  {
    stage: 'Stage 1',
    title: 'Discovery',
    description: 'Intake questionnaire, constraints mapping, initial scope estimate.',
    approval: 'Client signs off on discovery summary.'
  },
  {
    stage: 'Stage 2',
    title: 'Strategy',
    description: 'Technical architecture, timeline breakdown, cost estimate, team structure.',
    approval: 'Client approves strategy and budget.'
  },
  {
    stage: 'Stage 3',
    title: 'Requirements',
    description: 'Detailed requirements document, data models, API contracts, acceptance criteria.',
    approval: 'Client approves requirements before building starts.'
  },
  {
    stage: 'Stage 4',
    title: 'Build & Testing',
    description: 'Implementation, feature delivery, testing, performance optimization.',
    approval: 'Client reviews deliverables and approves before deployment.'
  },
  {
    stage: 'Stage 5',
    title: 'Deployment & Support',
    description: 'Production deployment, monitoring setup, team handoff, post-launch support.',
    approval: 'Live system with ongoing support access.'
  }
];

export function ProcessTimelineSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="space-y-4">
        {stages.map((item, idx) => (
          <Card key={idx} className="border-l-4 border-l-accent">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{item.stage}</p>
                <h3 className="font-display text-xl text-primary mb-2">{item.title}</h3>
                <p className="text-muted mb-3">{item.description}</p>
                <p className="text-sm text-primary font-semibold">✓ {item.approval}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
