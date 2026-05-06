import Head from 'next/head';
import { BlogHeroSection } from '../../src/components/blog/BlogHeroSection';
import { BlogFiltersSection } from '../../src/components/blog/BlogFiltersSection';
import { FeaturedArticleSection } from '../../src/components/blog/FeaturedArticleSection';
import { ArticleGridSection } from '../../src/components/blog/ArticleGridSection';
import { BlogCtaSection } from '../../src/components/blog/BlogCtaSection';

export default function BlogPage() {
  return (
    <>
      <Head>
        <title>Blog | Zakariae Boutaleb</title>
        <meta
          name="description"
          content="Technical writing about architecture, delivery, and systems thinking."
        />
      </Head>

      <main className="blog-page page-shell--public">
        <BlogHeroSection />
        <BlogFiltersSection />
        <FeaturedArticleSection />
        <ArticleGridSection />
        <BlogCtaSection />
      </main>
    </>
  );
}
