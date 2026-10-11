'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';

// The homepage "from the blog" card (homepage.html, BLOG SLIDER). One post at
// a time; the numbered buttons switch it. No autoplay: a card that changes
// under the reader's eyes is the testimonial slider's job, not this one's.

export type SlidePost = {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    date: string;
    dateTime: string;
    comments: number;
    likes: number;
    views: number;
};

const ICON = { fill: 'none', strokeWidth: 1.5 } as const;

/** `slideLabel` reads "Post {n}": a template, since a server page cannot pass a function. */
export function BlogSlider({ posts, slideLabel }: { posts: SlidePost[]; slideLabel: string }) {
    const [i, setI] = useState(0);
    const post = posts[i];
    if (!post) return null;

    return (
        <div className="bs-wrap">
            <div className="bs-right">
                <div className="bc-frame">
                    <div className="bc-ghostNumWrap" aria-hidden="true">
                        <div className="bc-ghostNum">{String(i + 1).padStart(2, '0')}.</div>
                        <div className="bc-ghostNumOutline">{String(i + 1).padStart(2, '0')}.</div>
                    </div>
                    <article className="bc-card" aria-live="polite">
                        <div className="bc-ghostWord" aria-hidden="true">
                            {post.category}
                        </div>
                        <div className="bc-inner">
                            <div className="bc-category">{post.category}</div>
                            <h2 className="bc-title">
                                <Link href={`/blog/${post.slug}`} className="bc-link">
                                    {post.title}
                                </Link>
                            </h2>
                            <div className="bc-excerptRow">
                                <p className="bc-excerpt">{post.excerpt}</p>
                                <span className="bc-arrow flip-rtl" aria-hidden="true">
                                    <svg viewBox="0 0 16 16" width="16" height="16">
                                        <path d="M4 12L12 4M12 4H6M12 4V10" stroke="#1B1B1F" strokeWidth="1.5" fill="none" strokeLinecap="square" />
                                    </svg>
                                </span>
                            </div>
                            <div className="bc-meta">
                                <div className="bc-metaLeft">
                                    <div className="bc-avatar" aria-hidden="true" />
                                    <span className="bc-author">{post.author}</span>
                                    <span className="bc-when">
                                        <span className="bc-dateIcon" aria-hidden="true">
                                            <svg viewBox="0 0 16 16" {...ICON} stroke="rgba(27,27,31,.4)" strokeWidth="1.3">
                                                <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
                                                <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
                                            </svg>
                                        </span>
                                        <time className="bc-date" dateTime={post.dateTime}>
                                            {post.date}
                                        </time>
                                    </span>
                                </div>
                                <div className="bc-stats">
                                    <span aria-label={`${post.comments} comments`}>
                                        <svg viewBox="0 0 16 16" {...ICON} stroke="rgba(27,27,31,.35)" aria-hidden="true">
                                            <path d="M2 3h12v8H6l-3 3V11H2z" />
                                        </svg>
                                        {post.comments}
                                    </span>
                                    <span aria-label={`${post.likes} likes`}>
                                        <svg viewBox="0 0 16 16" {...ICON} stroke="rgba(27,27,31,.35)" aria-hidden="true">
                                            <path d="M8 14s-6-3.5-6-7.5C2 3.5 4 2 6 2c1 0 2 .5 2 2 0-1.5 1-2 2-2 2 0 4 1.5 4 4.5C14 10.5 8 14 8 14z" />
                                        </svg>
                                        {post.likes}
                                    </span>
                                    <span aria-label={`${post.views} views`}>
                                        <svg viewBox="0 0 16 16" {...ICON} stroke="rgba(27,27,31,.35)" aria-hidden="true">
                                            <path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z" />
                                            <circle cx="8" cy="8" r="1.8" />
                                        </svg>
                                        {post.views}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
            {posts.length > 1 && (
                <div className="bc-dots">
                    {posts.map((p, n) => (
                        <button
                            key={p.slug}
                            type="button"
                            aria-label={slideLabel.replace('{n}', String(n + 1))}
                            aria-current={n === i ? 'true' : undefined}
                            onClick={() => setI(n)}
                        >
                            {n === i ? null : n + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
