import Link from 'next/link';
import { Card, Badge, Button } from '../../ui';

const featured = {
  slug: 'structuring-client-intake-before-design',
  title: 'Structuring client intake before design is what keeps serious projects calm later.',
  excerpt: 'A founder-level look at why intake quality shapes trust, scope accuracy, and delivery speed.',
  tags: ['Architecture', 'Delivery', 'Intake']
};

export function FeaturedArticleSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-6">
      <Card className="bg-primary text-surface border-primary/80" title={featured.title} description={featured.excerpt}>
        <div className="mt-4 flex flex-wrap gap-2">
          {featured.tags.map((tag) => (
            <Badge key={tag} className="border-white/[0.12] bg-white/[0.08] text-surface">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mt-6">
          <Button asChild variant="secondary">
            <Link href={`/blog/${featured.slug}`}>Read Featured Article</Link>
          </Button>
        </div>
      </Card>
    </section>
  );
}
