import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PostCard, postDates } from '@/components/public/blog/PostCard';
import { postCategoryLabel, posts, type PostCategory } from '@/content/posts';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { archive, blogHref, curation, parseBlogQuery, type BlogQuery, type Sort } from '@/lib/blog';
import { seoFor } from '@/lib/seo';
import '@/styles/blog.css';

// Ported from Blueprinting/wireframes/public/blog.html. Copy English only
// until translated; posts from content/posts.ts (placeholder). Category,
// tag, sort, view and "Load more" are links to query strings (lib/blog.ts),
// so every view is shareable and works without JavaScript; every one of
// them names /blog as its canonical address.

const TRANSLATED = ['en'] as const;

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return seoFor(
        {
            title: 'Blog',
            seo: { description: 'Process, pricing and the small decisions behind a build like yours, written down as they happen.' },
        },
        locale as Locale,
        { path: '/blog', translated: TRANSLATED },
    );
}

const SORT_LABEL: Record<Sort, string> = { newest: 'Newest', read: 'Most read', discussed: 'Most discussed' };
const CATEGORIES = Object.keys(postCategoryLabel) as PostCategory[];
const TAGS = [...new Set(posts.flatMap((p) => p.tags))];

export default async function BlogPage({ params, searchParams }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const lang = TRANSLATED.includes(locale as 'en') ? locale : 'en';
    const q = parseBlogQuery(await searchParams, CATEGORIES, TAGS);
    const date = postDates(lang);

    const { featured, best, topRated, mostViewed } = curation(posts);
    const { tagged, shown, more } = archive(posts, q);
    // A filter is drawn only for a category with posts, so none leads nowhere.
    const counts = CATEGORIES.map((c) => [c, tagged.filter((p) => p.category === c).length] as const).filter(([, n]) => n > 0);
    const [bigViewed, ...viewedRows] = mostViewed;
    const at = (change: Partial<BlogQuery>) => blogHref(q, change);

    return (
        <main className="blog-v1" id="main" lang={lang}>
            <section className="b-hero">
                <div className="wrap b-hero-row">
                    <div className="gblog" aria-hidden="true">
                        BLOG<span className="dot">.</span>
                    </div>
                    <div>
                        <div className="meta">005 · journal</div>
                        <h1>
                            Notes from the work<span>.</span>
                        </h1>
                    </div>
                    <p className="desc">Process, pricing and the small decisions behind a build like yours, written down as they happen.</p>
                </div>
            </section>

            <div className="wrap">
                <article className="feat">
                    <Link className="ph" href={`/blog/${featured.slug}`} aria-hidden="true" tabIndex={-1} />
                    <div>
                        <div className="eyebrow">Featured · {postCategoryLabel[featured.category]}</div>
                        <h2>
                            <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
                        </h2>
                        <p>{featured.excerpt}</p>
                        <div className="byline">
                            <span className="author">
                                <span className="avatar" />
                                {featured.author}
                            </span>
                            <time dateTime={featured.publishedAt}>{date.day(featured.publishedAt)}</time>
                            <span>{featured.readMinutes} min read</span>
                            <span>{featured.comments} comments</span>
                            {featured.tags.map((t) => (
                                <span key={t} className="pill">
                                    #{t}
                                </span>
                            ))}
                        </div>
                        <Link className="btn" href={`/blog/${featured.slug}`}>
                            Read post
                        </Link>
                    </div>
                </article>

                <div className="cur">
                    <div className="cur-main">
                        {best && (
                            <section>
                                <h2 className="label">Best of the Week</h2>
                                <Link className="best" href={`/blog/${best.slug}`}>
                                    <span className="tag">post image</span>
                                    <div className="scrim" />
                                    <div className="gnum" aria-hidden="true">
                                        <span>01.</span>
                                        <span>01.</span>
                                    </div>
                                    <div className="gword" aria-hidden="true">
                                        {postCategoryLabel[best.category]}
                                    </div>
                                    <div className="body">
                                        <div className="cat">{postCategoryLabel[best.category]}</div>
                                        <h3>{best.title}</h3>
                                        <div className="bmeta">
                                            <time dateTime={best.publishedAt}>{date.day(best.publishedAt)}</time>
                                            <span>{best.comments} comments</span>
                                            <span>{best.views} views</span>
                                            {best.tags[0] && <span className="pill on-dark">#{best.tags[0]}</span>}
                                        </div>
                                    </div>
                                </Link>
                            </section>
                        )}

                        <section>
                            <h2 className="label">Top Rated</h2>
                            <div className="rated">
                                {topRated.map((p) => (
                                    <Link key={p.slug} className="rate" href={`/blog/${p.slug}`}>
                                        <div className="ph" />
                                        <div className="kicker">{postCategoryLabel[p.category]}</div>
                                        <h3>{p.title}</h3>
                                        <div className="rmeta">
                                            <time dateTime={p.publishedAt}>{date.month(p.publishedAt)}</time>
                                            {p.tags[0] && <span className="pill">#{p.tags[0]}</span>}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>

                    <section className="cur-side">
                        <h2 className="label">Most Viewed</h2>
                        <div className="mv">
                            {bigViewed && (
                                <Link className="mv-big" href={`/blog/${bigViewed.slug}`}>
                                    <div className="ph" />
                                    <div className="kicker">{postCategoryLabel[bigViewed.category]}</div>
                                    <h3>{bigViewed.title}</h3>
                                    <div className="mmeta">
                                        <time dateTime={bigViewed.publishedAt}>{date.month(bigViewed.publishedAt)}</time>
                                        <span>{bigViewed.views} views</span>
                                        {bigViewed.tags[0] && <span className="pill">#{bigViewed.tags[0]}</span>}
                                    </div>
                                </Link>
                            )}
                            {viewedRows.map((p) => (
                                <Link key={p.slug} className="mv-row" href={`/blog/${p.slug}`}>
                                    <div className="ph" />
                                    <div className="mv-t">
                                        <div className="kicker">{postCategoryLabel[p.category]}</div>
                                        <h3>{p.title}</h3>
                                        <div className="mmeta">
                                            <time dateTime={p.publishedAt}>{date.month(p.publishedAt)}</time>
                                            <span>{p.views} views</span>
                                            {p.tags[0] && <span className="pill">#{p.tags[0]}</span>}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                <section className="arch" id="archive" aria-labelledby="arch-h">
                    <h2 id="arch-h">Browse all posts</h2>
                    {q.t && (
                        <p className="tagged">
                            Tagged <span className="pill">#{q.t}</span>
                            <Link href={at({ t: undefined })} scroll={false}>
                                Show every tag
                            </Link>
                        </p>
                    )}
                    <nav className="cats" aria-label="Filter by category">
                        <Link href={at({ c: undefined })} scroll={false} aria-current={q.c ? undefined : 'true'}>
                            All<sup>{tagged.length}</sup>
                        </Link>
                        {counts.map(([c, n]) => (
                            <Link key={c} href={at({ c })} scroll={false} aria-current={q.c === c ? 'true' : undefined}>
                                {postCategoryLabel[c]}
                                <sup>{n}</sup>
                            </Link>
                        ))}
                    </nav>
                    <div className="ctl">
                        <nav className="sort" aria-labelledby="sort-cap">
                            <span className="ctl-cap" id="sort-cap">
                                Sort by
                            </span>
                            {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
                                <Link key={s} href={at({ sort: s })} scroll={false} aria-current={q.sort === s ? 'true' : undefined}>
                                    {SORT_LABEL[s]}
                                </Link>
                            ))}
                        </nav>
                        <nav className="view" aria-label="Layout">
                            <Link href={at({ view: 'grid', page: q.page })} scroll={false} aria-current={q.view === 'grid' ? 'true' : undefined} aria-label="Grid view">
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                                    <rect x="1" y="1" width="6" height="6" />
                                    <rect x="9" y="1" width="6" height="6" />
                                    <rect x="1" y="9" width="6" height="6" />
                                    <rect x="9" y="9" width="6" height="6" />
                                </svg>
                            </Link>
                            <Link href={at({ view: 'list', page: q.page })} scroll={false} aria-current={q.view === 'list' ? 'true' : undefined} aria-label="List view">
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                                    <line x1="1" y1="3" x2="15" y2="3" />
                                    <line x1="1" y1="8" x2="15" y2="8" />
                                    <line x1="1" y1="13" x2="15" y2="13" />
                                </svg>
                            </Link>
                        </nav>
                    </div>
                    <div className="arch-rule" />

                    {shown.length > 0 ? (
                        <div className={q.view === 'list' ? 'posts list' : 'posts'}>
                            {shown.map((p) => (
                                <PostCard key={p.slug} post={p} month={date.month(p.publishedAt)} />
                            ))}
                        </div>
                    ) : (
                        <p className="empty">
                            No posts in this category with that tag yet. <Link href={at({ c: undefined })}>See them all</Link>
                        </p>
                    )}
                    {more && (
                        <div className="more">
                            <Link className="btn" href={at({ page: q.page + 1 })} scroll={false}>
                                Load more posts
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

