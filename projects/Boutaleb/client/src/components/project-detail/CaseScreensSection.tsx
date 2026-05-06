import { Card } from '../../ui';

export function CaseScreensSection({ caseStudy }: { caseStudy: any }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <h2 className="font-display text-2xl text-primary md:text-3xl">Selected Screens</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {caseStudy.screens.map((screen: any) => (
          <Card key={screen.label} title={screen.label}>
            <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="w-full h-full bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
                <p className="text-muted">{screen.label} Screenshot</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
