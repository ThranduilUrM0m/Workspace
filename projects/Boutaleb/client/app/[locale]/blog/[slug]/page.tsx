import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CommentForm } from '@/components/public/blog/CommentForm';
import { CommentActions, PostActions } from '@/components/public/blog/PostActions';
import { Icon, PostCard, postDates } from '@/components/public/blog/PostCard';
import { PhoneToc, SideToc } from '@/components/public/blog/PostToc';
import { authorCard, postBySlug, postCategoryLabel, posts, type PostBlock, type PostComment } from '@/content/posts';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { related } from '@/lib/blog';
import { seoFor } from '@/lib/seo';
import '@/styles/post.css';

// Ported from Blueprinting/wireframes/public/blog-post.html ("Option B v2").
// A page, not an overlay: a post is a long read with its own URL. Copy
// English only until translated; the post, its thread and the author card
// come from content/posts.ts (placeholder).

const TRANSLATED = ['en'] as const;

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
    return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, slug } = await params;
    const post = postBySlug(slug);
    if (!post) return {};
    return seoFor({ title: post.title, seo: { description: post.excerpt } }, locale as Locale, {
        path: `/blog/${slug}`,
        translated: TRANSLATED,
    });
}

export default async function PostPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);
    const post = postBySlug(slug);
    if (!post) notFound();
    const date = postDates('en');
    const toc = post.sections.map(({ id, title }) => ({ id, title }));

    return (
        <main className="post-v1" id="main" lang="en">
            <div className="progress" aria-hidden="true" />
            <article className="wrap">
                <Link className="back" href="/blog">
                    <span className="arr" aria-hidden="true">
                        ←
                    </span>
                    All posts
                </Link>
                <header className="p-head">
                    <div className="eyebrow">
                        <Link className="cat" href={`/blog?c=${post.category}`}>
                            {postCategoryLabel[post.category]}
                        </Link>
                        <span className="sep" aria-hidden="true" />
                        <time dateTime={post.publishedAt}>{date.day(post.publishedAt)}</time>
                    </div>
                    <h1>{post.title}</h1>
                    <span className="author">
                        <span className="avatar" />
                        {post.author}
                    </span>
                </header>

                <figure className="hero">
                    <div className="ph" role="img" aria-label="Featured image" />
                    <figcaption>
                        <span>{post.caption}</span>
                    </figcaption>
                </figure>

                <div className="engage">
                    <span className="stat">
                        <Icon name="views" />
                        {post.views} views
                    </span>
                    <span className="stat">
                        <Icon name="clock" />
                        {post.readMinutes} min read
                    </span>
                    <a className="stat" href="#comments">
                        <Icon name="comments" />
                        {post.comments} comments
                    </a>
                    <PostActions likes={post.likes} slug={post.slug} />
                </div>

                {toc.length > 1 && <PhoneToc items={toc} summary={`Contents · ${toc.length} sections`} label="Contents" />}

                <div className="body">
                    <div className="prose">
                        {post.sections.map((s, i) => (
                            <section key={s.id} id={s.id} aria-label={i === 0 ? s.title : undefined} aria-labelledby={i === 0 ? undefined : `${s.id}-h`}>
                                {i > 0 && <h2 id={`${s.id}-h`}>{s.title}</h2>}
                                {s.blocks.map((b, j) => (
                                    <Block key={j} block={b} />
                                ))}
                            </section>
                        ))}
                    </div>

                    <aside className="aside" aria-label="About this post">
                        <div className="acard">
                            <div className="who">
                                <span className="avatar" />
                                <p className="name">{authorCard.name}</p>
                            </div>
                            <p className="role">{authorCard.role}</p>
                            <p className="bio">{authorCard.bio}</p>
                            <div className="astats">
                                <b>{posts.filter((p) => p.author === post.author).length}</b> posts
                            </div>
                        </div>
                        {toc.length > 1 && <SideToc items={toc} label="On this page" />}
                        {post.tags.length > 0 && (
                            <div className="side-block">
                                <p className="side-cap">Tags</p>
                                <div className="tags">
                                    {post.tags.map((t) => (
                                        <Link key={t} className="pill" href={`/blog?t=${encodeURIComponent(t)}#archive`}>
                                            #{t}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>

                <section className="comments" id="comments" aria-labelledby="comments-h">
                    <h2 id="comments-h">
                        <Icon name="comments" />
                        Comments ({post.comments})
                    </h2>
                    <div className="c-layout">
                        <CommentForm />
                        {post.thread.length > 0 && (
                            <ol className="thread">
                                {post.thread.map((c) => (
                                    <Comment key={c.id} comment={c} day={date.day} />
                                ))}
                            </ol>
                        )}
                    </div>
                </section>

                <section className="related" aria-labelledby="related-h">
                    <h2 className="label" id="related-h">
                        Related posts
                    </h2>
                    <div className="rel">
                        {related(posts, post).map((p) => (
                            <PostCard key={p.slug} post={p} month={date.month(p.publishedAt)} className="card" />
                        ))}
                    </div>
                </section>
            </article>
        </main>
    );
}

function Block({ block }: { block: PostBlock }) {
    if (block.kind === 'quote')
        return (
            <blockquote className="pull">
                <p>{block.text}</p>
            </blockquote>
        );
    if (block.kind === 'image')
        return (
            <figure className="inline">
                <div className="ph" role="img" aria-label={block.label} />
            </figure>
        );
    return <p>{block.text}</p>;
}

function Comment({ comment, day }: { comment: PostComment; day: (iso: string) => string }) {
    return (
        <li className="cmt">
            <span className="avatar" />
            <div className="cmt-body">
                <div className="cmt-head">
                    <b>{comment.name}</b>
                    {comment.byAuthor && <span className="you">Author</span>}
                    <time dateTime={comment.at}>{day(comment.at)}</time>
                </div>
                <p>{comment.text}</p>
                <CommentActions likes={comment.likes} name={comment.name} />
                {comment.replies && comment.replies.length > 0 && (
                    <ol>
                        {comment.replies.map((r) => (
                            <Comment key={r.id} comment={r} day={day} />
                        ))}
                    </ol>
                )}
            </div>
        </li>
    );
}
