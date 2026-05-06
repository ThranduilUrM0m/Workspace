import { Badge } from '../../ui';

export function CaseHeroSection({ caseStudy }: { caseStudy: any }) {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-20 pb-10">
      <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">{caseStudy.clientType}</Badge>
      <h1 className="font-display text-4xl text-primary md:text-6xl">{caseStudy.title}</h1>
      <p className="mt-4 text-muted">{caseStudy.year} • {caseStudy.role}</p>
    </section>
  );
}
