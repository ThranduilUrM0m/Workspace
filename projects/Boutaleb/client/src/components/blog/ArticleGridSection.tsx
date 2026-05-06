import Link from 'next/link';
import { Card } from '../../ui';

const posts = [
  {
    slug: 'approval-gates-without-killing-momentum',
    type: 'Architecture note',
    title: 'Approval gates without killing momentum',
    excerpt: 'How to preserve speed while still keeping the project safe.'
  },
  {
    slug: 'why-projects-need-an-internal-operating-model',
    type: 'Systems note',
    title: 'Why projects need an internal operating model',
    excerpt: 'Interfaces are easier to ship when the delivery system behind them is coherent.'
  }
];

export function ArticleGridSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid gap-5 md:grid-cols-2">
        {posts.map((post) => (
          <Card key={post.slug} title={post.title} description={post.excerpt} className="bg-white/[0.78]">
            <div className="flex items-center justify-between gap-4 mt-4">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{post.type}</span>
              <Link href={`/blog/${post.slug}`} className="text-sm font-medium text-primary transition hover:text-accent">
                Read article
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
