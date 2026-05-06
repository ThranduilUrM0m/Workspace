import { Hero, Badge } from '../../ui';

export function ProcessHeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <Badge className="mb-4">Process</Badge>
      <Hero
        title="A 5-stage process with approval gates before automation."
        subtitle="Every stage is explicit, reviewable, and linked to scope, cost, and execution tickets."
      />
    </section>
  );
}
