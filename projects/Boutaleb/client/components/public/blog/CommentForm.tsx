'use client';

import type { FormEvent } from 'react';
import { Link } from '@/i18n/navigation';

// The comment form (blog-post.html), on the footer's .ff-* fields. It
// checks its fields in the browser and goes no further yet: comments are
// stored by the Posts API (T11.3), and the sent / failed answers grow in
// place like the footer form's (T5.3).

export function CommentForm() {
    const onSubmit = (e: FormEvent<HTMLFormElement>) => e.preventDefault();

    return (
        <div className="ff-card c-form">
            <p className="ft-cap">Leave a comment</p>
            <form className="ff-form" onSubmit={onSubmit}>
                <div className="ff-pair">
                    <div className="ff-field">
                        <svg className="ff-icon" viewBox="0 0 24 24" fill="none" stroke="rgba(27,27,31,.4)" strokeWidth="2" aria-hidden="true">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                        <input type="text" id="cm-name" name="name" placeholder=" " autoComplete="name" required maxLength={80} />
                        <label htmlFor="cm-name">Full name</label>
                    </div>
                    <div className="ff-field">
                        <svg className="ff-icon" viewBox="0 0 24 24" fill="none" stroke="rgba(27,27,31,.4)" strokeWidth="2" aria-hidden="true">
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="M3 7l9 6 9-6" />
                        </svg>
                        <input type="email" id="cm-email" name="email" placeholder=" " autoComplete="email" required maxLength={254} />
                        <label htmlFor="cm-email">Email</label>
                    </div>
                </div>
                <div className="ff-field ff-field-top">
                    <svg className="ff-icon" viewBox="0 0 24 24" fill="none" stroke="rgba(27,27,31,.4)" strokeWidth="2" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <textarea id="cm-msg" name="comment" placeholder=" " required maxLength={4000} />
                    <label htmlFor="cm-msg">Your comment</label>
                </div>
                <input className="hp" type="text" name="nickname" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <p className="c-note">
                    Your name is shown with the comment; your email is not, and is used only to reply. <Link href="/privacy">Privacy policy</Link>.
                </p>
                <button className="c-send" type="submit">
                    Join the conversation
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
