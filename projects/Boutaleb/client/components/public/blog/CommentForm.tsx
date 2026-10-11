'use client';

import { commentInput } from '@repo/schemas';
import { Field, Form, Honeypot, useSchemaForm, type ErrorWords } from '@repo/ui';
import { useState } from 'react';
import { glyph } from '@/components/public/forms/glyphs';
import { Link } from '@/i18n/navigation';

// The comment form (blog-post.html), on the shared fields (C3) and the
// comment schema the server will run too. It checks its fields and goes no
// further yet: comments are stored by the Posts API (T11.3), and the sent /
// failed answers grow in place like the footer form's (T5.3).

export function CommentForm({ slug, errorWords }: { slug: string; errorWords: ErrorWords }) {
    const [idempotencyKey] = useState(() => crypto.randomUUID());
    const form = useSchemaForm(commentInput, { name: '', email: '', comment: '', slug, idempotencyKey });

    return (
        <div className="ff-card c-form">
            <p className="ft-cap">Leave a comment</p>
            <Form className="ff-form" form={form} errorWords={errorWords} onSubmit={() => {}}>
                <div className="ff-pair">
                    <Field name="name" label="Full name" icon={glyph.person} autoComplete="name" />
                    <Field name="email" type="email" label="Email" icon={glyph.mail} autoComplete="email" />
                </div>
                <Field name="comment" label="Your comment" icon={glyph.bubble} multiline />
                <Honeypot />
                <p className="c-note">
                    Your name is shown with the comment; your email is not, and is used only to reply. <Link href="/privacy">Privacy policy</Link>.
                </p>
                <button className="c-send" type="submit">
                    Join the conversation
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                </button>
            </Form>
        </div>
    );
}
