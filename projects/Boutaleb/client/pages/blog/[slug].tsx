import Head from 'next/head';
import { useRouter } from 'next/router';
import { Card } from '../../src/ui';
import { Button } from '../../src/ui';
import Link from 'next/link';

const blogPosts: Record<string, any> = {
  'structuring-client-intake-before-design': {
    slug: 'structuring-client-intake-before-design',
    title: 'Structuring client intake before design is what keeps serious projects calm later.',
    excerpt: 'A founder-level look at why intake quality shapes trust, scope accuracy, and delivery speed.',
    type: 'Architecture',
    body: `Intake is the first impression of your process. Get it right, and the entire project runs smoother.

When clients fill out a structured intake form—rather than just emailing a vague brief—they're forced to clarify their own thinking. And that clarity is where real projects begin.

I've seen projects blow up not because the engineering was bad, but because nobody asked the right questions upfront. So I built an intake system that asks those questions systematically.

The result? Fewer scope creep incidents. Better cost estimates. Faster decision-making. And clients who feel heard, not rushed.`
  },
  'approval-gates-without-killing-momentum': {
    slug: 'approval-gates-without-killing-momentum',
    title: 'Approval gates without killing momentum',
    excerpt: 'How to preserve speed while still keeping the project safe.',
    type: 'Delivery',
    body: `Approval gates are necessary. But they're also where projects get stuck.

The trick is not to remove gates. The trick is to make them transparent and fast.

When a client knows exactly what needs approval before a stage unlocks—and they've already seen the decision framework—approvals happen in hours instead of weeks.

This is what proper documentation does. It doesn't slow you down. It speeds everything up.`
  }
};

export default function BlogDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const post = slug ? blogPosts[slug as string] : null;

  if (!post) {
    return (
      <Head>
        <title>Article Not Found</title>
      </Head>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} | Boutaleb Blog</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <main className="blog-detail-page page-shell--public">
        <article className="max-w-3xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">{post.type}</p>
          <h1 className="font-display text-4xl text-primary mb-6 md:text-5xl">{post.title}</h1>
          <div className="prose prose-lg max-w-none text-muted mb-12">
            {post.body.split('\n\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="mb-6 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="border-t border-border pt-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="primary">
                <Link href="/contact">Start a Project</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/blog">Back to Blog</Link>
              </Button>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
