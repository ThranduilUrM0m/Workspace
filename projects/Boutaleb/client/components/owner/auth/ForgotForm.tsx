'use client';

import { useSignIn } from '@clerk/nextjs';
import { resetCode, resetRequest, type ResetCode, type ResetRequest } from '@repo/schemas';
import { Field, Form, useSchemaForm } from '@repo/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { readAuthError, tryAgain } from '@/lib/auth-errors';
import { AUTH_WORDS, STAY, BackToLogin, FormMsg, glyph, PanelIcon, Submit, type Msg } from './parts';
import { Resend } from './Resend';

// /forgot-password (wireframes/forgot-password.html). Clerk resets by an
// emailed code, not a link (decided 2026-10-16), so the code is typed here,
// in the same tab, and a right code moves on to /reset-password.
//
// SECURITY (HANDOFF §4): every well-formed address gets the same sent
// panel, an unknown one included, and in the same time: each request is
// held to a floor so a real account's email send cannot be timed apart
// from a refusal. A code typed for an unknown address is simply wrong.

/** Clerk's emailed codes stay valid ten minutes (Clerk docs, OTP expiration). */
export const CODE_MINUTES = 10;
const FLOOR_MS = 1500;

const REST: Msg = { text: 'Enter your email to get a reset code.' };

const held = async <T,>(work: Promise<T>): Promise<T> => {
    const [out] = await Promise.all([work, new Promise((r) => setTimeout(r, FLOOR_MS))]);
    return out;
};

export function ForgotForm() {
    const { signIn } = useSignIn();
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'sent' | 'dead'>('email');
    const [msg, setMsg] = useState<Msg>(REST);
    const [limited, setLimited] = useState(false);
    const [busy, setBusy] = useState(false);
    const [addr, setAddr] = useState('');
    const [known, setKnown] = useState(false);

    const form = useSchemaForm(resetRequest, { email: '' }, STAY);
    const codeForm = useSchemaForm(resetCode, { code: '' }, STAY);

    /** True when a code went out; false for an address with no account. Throws only on rate limiting. */
    async function request(email: string): Promise<boolean> {
        const created = await signIn.create({ identifier: email });
        if (created.error) {
            const f = readAuthError(created.error);
            if (f.kind === 'limited' || f.kind === 'locked') throw f;
            return false;
        }
        const sent = await signIn.resetPasswordEmailCode.sendCode();
        if (sent.error) {
            const f = readAuthError(sent.error);
            if (f.kind === 'limited' || f.kind === 'locked') throw f;
            return false;
        }
        return true;
    }

    function limit(f: unknown) {
        const minutes = (f as { minutes?: number | null }).minutes ?? null;
        setLimited(true);
        setMsg({ text: `Too many requests. ${tryAgain(minutes)}`, tone: 'warn' });
    }

    async function onEmail(v: ResetRequest) {
        setBusy(true);
        try {
            setKnown(await held(request(v.email)));
            setAddr(v.email);
            codeForm.reset({ code: '' });
            setStep('sent');
        } catch (f) {
            limit(f);
        } finally {
            setBusy(false);
        }
    }

    async function onCode(v: ResetCode) {
        setBusy(true);
        if (!known) {
            await held(Promise.resolve());
            codeForm.setError('code', { message: 'wrongCode' });
            setBusy(false);
            return;
        }
        const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code: v.code });
        if (!error && signIn.status === 'needs_new_password') return router.push('/reset-password');
        const f = readAuthError(error);
        setBusy(false);
        if (f.kind === 'deadCode') setStep('dead');
        else codeForm.setError('code', { message: 'wrongCode' });
    }

    if (step === 'dead') return <CodeExpired onAgain={() => setStep('email')} />;

    if (step === 'sent') {
        return (
            <Form form={codeForm} onSubmit={onCode} errorWords={{ ...AUTH_WORDS, wrongCode: 'Wrong code' }} className="au-card">
                <div className="au-panel">
                    <PanelIcon tone="ok">{glyph.mail}</PanelIcon>
                    <p>
                        If <b>{addr}</b> has an account, a reset code is on its way.
                    </p>
                    <p className="fine">
                        The code works once and expires in {CODE_MINUTES} minutes. Check spam before asking for another.
                    </p>
                    <Field name="code" label="Code" icon={glyph.key} autoComplete="one-time-code" inputMode="numeric" maxLength={12} />
                    <Submit busy={busy} busyLabel="Checking…">
                        Continue
                    </Submit>
                    <Resend
                        onResend={async () => {
                            try {
                                setKnown(await held(request(addr)));
                            } catch {
                                // Rate limited: the countdown already holds the button.
                            }
                        }}
                    />
                </div>
                <BackToLogin />
            </Form>
        );
    }

    return (
        <Form form={form} onSubmit={onEmail} errorWords={AUTH_WORDS} className="au-card">
            <h1>Reset your password.</h1>
            <FormMsg msg={msg} />
            <Field name="email" label="Email" type="email" icon={glyph.mail} autoComplete="username" />
            <Submit busy={busy} busyLabel="Sending…" disabled={limited}>
                Send reset code
            </Submit>
            <BackToLogin />
        </Form>
    );
}

/* Expired, already used and invalid share one panel: telling them apart
   out loud tells whoever holds the code that it was real (HANDOFF §4). */
export function CodeExpired({ onAgain }: { onAgain?: () => void }) {
    return (
        <div className="au-card">
            <div className="au-panel">
                <PanelIcon tone="warn">{glyph.dead}</PanelIcon>
                <p>That code no longer works.</p>
                <p className="fine">
                    Reset codes last {CODE_MINUTES} minutes and work once. Ask for a new one and it will arrive in a moment.
                </p>
                {onAgain ? (
                    <button type="button" className="au-submit" onClick={onAgain}>
                        Send a new code
                    </button>
                ) : (
                    <Link className="au-submit" href="/forgot-password">
                        Send a new code
                    </Link>
                )}
            </div>
            <BackToLogin />
        </div>
    );
}
