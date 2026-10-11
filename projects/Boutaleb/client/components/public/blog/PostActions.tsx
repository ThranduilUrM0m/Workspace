'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';
import { Icon } from './PostCard';

// Like / "Not for me" / Share under a post (blog-post.html). The pair is
// exclusive: liking clears "not for me" and back. "Not for me" carries no
// count on purpose (decided 2026-10-06): the vote is recorded for the ERP
// blog console, never shown. Votes stay in the page until the Posts API
// takes them (T11.3). Share: the native sheet where there is one,
// otherwise the link goes to the clipboard.

type Vote = 'up' | 'down' | null;

export function PostActions({ likes, slug }: { likes: number; slug: string }) {
    const [vote, setVote] = useState<Vote>(null);
    const [copied, setCopied] = useState(false);
    const press = (v: Exclude<Vote, null>) => {
        const next = vote === v ? null : v;
        setVote(next);
        if (next) track(next === 'up' ? 'post_like' : 'post_not_for_me', { slug });
    };
    const count = likes + (vote === 'up' ? 1 : 0);

    const share = async () => {
        track('post_share', { slug });
        if (navigator.share) {
            await navigator.share({ title: document.title, url: location.href }).catch(() => {});
            return;
        }
        await navigator.clipboard.writeText(location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <div className="acts">
            <button className="ibtn" type="button" aria-pressed={vote === 'up'} aria-label={`Like, ${count}`} onClick={() => press('up')}>
                <Icon name="likes" />
                <span aria-hidden="true">{count}</span>
            </button>
            <button className="ibtn" type="button" aria-pressed={vote === 'down'} aria-label="Not for me" onClick={() => press('down')}>
                <Icon name="likes" className="down" />
            </button>
            <button className="ibtn share" type="button" onClick={share}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                    <path d="M4 8a4 4 0 118 0 4 4 0 01-8 0z" />
                    <path d="M8 1v2M8 13v2M1 8h2M13 8h2" />
                </svg>
                <span aria-live="polite">{copied ? 'Link copied' : 'Share'}</span>
            </button>
        </div>
    );
}

/** A comment's like and reply. Reply puts the reader in the comment box. */
export function CommentActions({ likes, name }: { likes: number; name: string }) {
    const [on, setOn] = useState(false);
    const count = likes + (on ? 1 : 0);
    const reply = () => {
        const box = document.getElementById('cm-msg');
        box?.scrollIntoView({ block: 'center' });
        box?.focus({ preventScroll: true });
    };
    return (
        <div className="cmt-acts">
            <button className="ibtn" type="button" aria-pressed={on} aria-label={`Like, ${count}`} onClick={() => setOn(!on)}>
                <Icon name="likes" />
                <span aria-hidden="true">{count}</span>
            </button>
            <button className="ibtn" type="button" aria-label={`Reply to ${name}`} onClick={reply}>
                <Icon name="comments" />
                Reply
            </button>
        </div>
    );
}
