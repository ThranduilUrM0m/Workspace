'use client';

import { footerEnquiry, HONEYPOT, PROJECT_TYPES, type FooterEnquiry } from '@repo/schemas';
import { Field, Form, FormFail, Honeypot, SelectField, useSchemaForm } from '@repo/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { business } from '@/lib/business';
import { useErrorWords } from './error-words';
import { glyph } from './glyphs';
import { useFormToken } from '@/lib/form-token';

// The footer's short form (thanks.html), on the shared fields (C3/C4) and
// the enquiry schema the server will run too. It answers in place, inside
// the card: sending, the button says so and cannot send twice; sent, a clay
// square grows out of the button and turns into place until it covers the
// card, then the heading takes the focus; failed, every field is kept and
// the error sits above the button. The "Add budget and timeline" link
// carries the lead to /contact, whose draft is filled from this send.

const TYPE_KEY = { website: 'typeWebsite', erp: 'typeErp', both: 'typeBoth', 'not-sure': 'typeUnsure' } as const;

export function FooterForm() {
    const t = useTranslations('footer');
    const locale = useLocale();
    const errorWords = useErrorWords();
    const [idempotencyKey] = useState(() => crypto.randomUUID());
    const form = useSchemaForm(footerEnquiry, { name: '', email: '', projectType: 'website', message: '', idempotencyKey });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
    const [sent, setSent] = useState<{ name: string; email: string; lead: string }>();
    const [filled, setFilled] = useState(false);
    const card = useRef<HTMLDivElement>(null);
    const square = useRef<HTMLDivElement>(null);
    const button = useRef<HTMLButtonElement>(null);
    const heading = useRef<HTMLHeadingElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const token = useFormToken();

    const grow = () => {
        const b = button.current!.getBoundingClientRect();
        const c = card.current!.getBoundingClientRect();
        const x = b.left + b.width / 2 - c.left;
        const y = b.top + b.height / 2 - c.top;
        // Half-side of a square that still covers the card while turned.
        const r = Math.hypot(Math.max(x, c.width - x), Math.max(y, c.height - y)) * 1.5;
        Object.assign(square.current!.style, { left: `${x}px`, top: `${y}px`, width: `${2 * r}px`, height: `${2 * r}px` });
        const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
        square
            .current!.animate(
                [{ transform: 'translate(-50%,-50%) scale(0) rotate(-45deg)' }, { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)' }],
                { duration: still ? 0 : 650, easing: 'cubic-bezier(.3,.6,.2,1)', fill: 'forwards' },
            )
            .finished.then(() => setFilled(true));
        // Focus, not aria-live as well, or the answer is announced twice.
        heading.current?.focus({ preventScroll: true });
    };

    // After the render that shows the answer: the heading can take focus.
    useEffect(() => {
        if (status === 'sent') grow();
    }, [status]);

    const onSubmit = async (data: FooterEnquiry) => {
        if (status === 'sending') return;
        setStatus('sending');
        const body = new FormData();
        for (const [k, v] of Object.entries(data)) body.set(k, String(v));
        body.set('source', 'footer');
        body.set('locale', locale);
        body.set(HONEYPOT, (formRef.current?.elements.namedItem(HONEYPOT) as HTMLInputElement | null)?.value ?? '');
        try {
            const t = await token.take();
            if (!t) return setStatus('failed');
            body.set('t', t);
            const res = await fetch('/api/enquiries', { method: 'POST', body });
            if (res.status === 201) {
                const { lead } = (await res.json()) as { lead: string };
                // /contact opens on step 2 with this send's answers in place.
                sessionStorage.setItem('bt_contact_draft', JSON.stringify({ name: data.name, email: data.email, message: data.message, lead }));
                setSent({ name: data.name.split(/\s+/)[0] ?? data.name, email: data.email, lead });
                setStatus('sent');
                return;
            }
            if (res.status === 422) {
                const { errors } = (await res.json()) as { errors: Record<string, string> };
                // A form left open a day: a fresh token, and the failure state asks for one more press.
                if (errors.form) {
                    token.reset();
                    return setStatus('failed');
                }
                for (const [name, code] of Object.entries(errors)) form.setError(name as keyof FooterEnquiry, { message: code }, { shouldFocus: true });
                setStatus('idle');
                return;
            }
            setStatus('failed');
        } catch {
            setStatus('failed');
        }
    };

    return (
        <div ref={card} className={filled ? 'ff-card is-filled' : 'ff-card'} data-state={status === 'sent' ? 'sent' : undefined} onFocusCapture={token.prime}>
            <p className="ft-cap">{t('missedContact')}</p>
            <Form ref={formRef} className="ff-form" form={form} errorWords={errorWords} onSubmit={onSubmit} inert={status === 'sent'}>
                <div className="ff-pair">
                    <Field name="name" label={t('fullName')} icon={glyph.person} autoComplete="name" />
                    <Field name="email" type="email" label={t('email')} icon={glyph.mail} autoComplete="email" />
                </div>
                <SelectField
                    name="projectType"
                    label={t('projectType')}
                    icon={glyph.tag}
                    options={PROJECT_TYPES.map((v) => ({ value: v, label: t(TYPE_KEY[v]) }))}
                />
                <Field name="message" label={t('message')} icon={glyph.bubble} multiline />
                {status === 'failed' && <FormFail>{t('notSent', { email: business.email })}</FormFail>}
                <Honeypot />
                <div className="ff-send">
                    <p>
                        {t('usedOnlyToReply')} <Link href="/privacy">{t('privacyPolicy')}</Link>.
                    </p>
                    <button ref={button} type="submit" className="ff-go" aria-busy={status === 'sending' || undefined}>
                        {status === 'sending' ? t('sending') : t('start')}
                        <svg className="flip-rtl" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M7 17L17 7M9 7h8v8" />
                        </svg>
                    </button>
                </div>
            </Form>
            <div ref={square} className="ff-square" aria-hidden="true" />
            <div className="ff-done">
                {sent && (
                    <>
                        <h3 ref={heading} tabIndex={-1}>
                            {t('sentTitle', { name: sent.name })}
                        </h3>
                        <p>{t('sentBody', { email: sent.email })}</p>
                        <Link href={`/contact?lead=${encodeURIComponent(sent.lead)}`}>
                            {t('addDetail')}&nbsp;<span className="flip-rtl" aria-hidden="true">→</span>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
