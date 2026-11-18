import { postCategoryLabel, type Post } from '@/content/posts';
import { Link } from '@/i18n/navigation';

// The archive card (blog.html .post), also the related-posts card under a
// post (blog-post.html .card): top line, image, title, teaser, tags, author
// and public counts. Each count reads with its word; the icons are hidden.

const ICON = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, 'aria-hidden': true } as const;

export const icons = {
    comments: <path d="M2 3h12v8H5l-3 3V3z" />,
    views: (
        <>
            <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
            <circle cx="8" cy="8" r="2" />
        </>
    ),
    likes: <path d="M8 14s-6-3.5-6-7.5C2 3.5 4 2 6 2c1 0 2 .5 2 2 0-1.5 1-2 2-2 2 0 4 1.5 4 4.5C14 10.5 8 14 8 14z" />,
    clock: (
        <>
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4.5V8l3 1.8" />
        </>
    ),
};

export function Icon({ name, className }: { name: keyof typeof icons; className?: string }) {
    return (
        <svg {...ICON} className={className}>
            {icons[name]}
        </svg>
    );
}

export function PostCard({ post, month, className = 'post' }: { post: Post; month: string; className?: string }) {
    return (
        <Link className={className} href={`/blog/${post.slug}`}>
            <div className="top">
                <span className="c">{postCategoryLabel[post.category]}</span>
                <time className="d" dateTime={post.publishedAt}>
                    {month}
                </time>
            </div>
            <div className="ph" />
            <div className="pbody">
                <h3>{post.title}</h3>
                <p className="teaser">{post.excerpt}</p>
                <div className="tags">
                    {post.tags.map((t) => (
                        <span key={t} className="pill">
                            #{t}
                        </span>
                    ))}
                </div>
                <div className="pfoot">
                    <span className="author">
                        <span className="avatar" />
                        {post.author}
                    </span>
                    <div className="stats">
                        <span>
                            <Icon name="comments" />
                            {post.comments}
                            <span className="sr-only"> comments</span>
                        </span>
                        <span>
                            <Icon name="views" />
                            {post.views}
                            <span className="sr-only"> views</span>
                        </span>
                        <span>
                            <Icon name="likes" />
                            {post.likes}
                            <span className="sr-only"> likes</span>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

/** Dates as the blog prints them: "14 Jul 2026" on a post, "Jul 2026" on a card. */
export function postDates(lang: string) {
    const tag = lang === 'en' ? 'en-GB' : lang;
    const day = new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
    const month = new Intl.DateTimeFormat(tag, { month: 'short', year: 'numeric', timeZone: 'UTC' });
    return { day: (iso: string) => day.format(new Date(iso)), month: (iso: string) => month.format(new Date(iso)) };
}
