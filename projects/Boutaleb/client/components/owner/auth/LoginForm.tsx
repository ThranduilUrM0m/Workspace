'use client';

import { useSignIn } from '@clerk/nextjs';
import { resetCode, signInForm, type ResetCode, type SignInForm } from '@repo/schemas';
import { Field, Form, useSchemaForm } from '@repo/ui';
import type { OAuthStrategy } from '@clerk/nextjs/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { readAuthError, returnPath, tryAgain, type AuthFailure } from '@/lib/auth-errors';
import { AUTH_WORDS, FormMsg, glyph, Submit, type Msg } from './parts';
import { Resend } from './Resend';

// /login (wireframes/login.html). Email and password, or Google / GitHub,
// all through Clerk's custom-flow hooks. No sign-up link: accounts are
// invited. "Remember me" is gone: Clerk keeps one session length for the
// whole instance (dashboard › Sessions), so a per-sign-in switch could
// only pretend. Signing out (shell, T6.5) is the shared-computer answer.

const REST: Msg = { text: 'Sign in to continue.' };

export const RETURN_KEY = 'bt_auth_return';

export const SSO_FAILED: Record<string, Msg> = {
    'not-invited': { text: 'That account has not been invited.', tone: 'err' },
    failed: { text: 'That sign-in did not finish. Try again.', tone: 'err' },
};

function failureMsg(f: AuthFailure): Msg {
    switch (f.kind) {
        case 'creds':
            return { text: 'Email or password is incorrect.', tone: 'err' };
        case 'locked':
        case 'limited':
            return { text: `Too many attempts. ${tryAgain(f.minutes)}`, tone: 'warn' };
        case 'badCode':
            return { text: 'That code is not right. Check the email again.', tone: 'err' };
        case 'deadCode':
            return { text: 'That code has expired. Send a new one.', tone: 'warn' };
        case 'notInvited':
            return SSO_FAILED['not-invited']!;
        default:
            return { text: 'Something went wrong. Try again.', tone: 'err' };
    }
}

export function LoginForm({ redirectUrl, notice }: { redirectUrl?: string; notice?: string }) {
    const { signIn } = useSignIn();
    const router = useRouter();
    const [msg, setMsg] = useState<Msg>((notice && SSO_FAILED[notice]) || REST);
    const [busy, setBusy] = useState(false);
    const [locked, setLocked] = useState(false);
    const [step, setStep] = useState<'password' | 'code'>('password');
    const [email, setEmail] = useState('');

    const form = useSchemaForm(signInForm, { email: '', password: '' });
    const codeForm = useSchemaForm(resetCode, { code: '' });

    const target = () => returnPath(redirectUrl, window.location.origin);

    // Held on screen while the dashboard loads: a page that goes blank on
    // success reads as a failure.
    async function finish() {
        setMsg({ text: 'Welcome back. Taking you to your dashboard…', tone: 'ok' });
        await signIn.finalize({
            navigate: ({ decorateUrl }) => {
                const url = decorateUrl(target());
                if (url.startsWith('http')) window.location.href = url;
                else router.push(url);
            },
        });
    }

    function fail(error: unknown) {
        const f = readAuthError(error);
        if (f.kind === 'locked' || f.kind === 'limited') {
            setLocked(true);
            if (f.minutes) setTimeout(() => {
                    setLocked(false);
                    setMsg(REST);
                }, f.minutes * 60_000);
        }
        setMsg(failureMsg(f));
        setBusy(false);
    }

    async function onPassword(v: SignInForm) {
        setBusy(true);
        setMsg(REST);
        const { error } = await signIn.password({ identifier: v.email, password: v.password });
        if (error) return fail(error);
        if (signIn.status === 'complete') return finish();
        // A new device, or a second factor: Clerk emails a code first.
        if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
            const sent = await signIn.mfa.sendEmailCode();
            if (sent.error) return fail(sent.error);
            setEmail(v.email);
            setStep('code');
            setMsg({ text: `A code is on its way to ${v.email}.` });
            setBusy(false);
            return;
        }
        fail(null);
    }

    async function onCode(v: ResetCode) {
        setBusy(true);
        const { error } = await signIn.mfa.verifyEmailCode({ code: v.code });
        if (error) return fail(error);
        if (signIn.status === 'complete') return finish();
        fail(null);
    }

    async function withProvider(strategy: OAuthStrategy) {
        setMsg(REST);
        // The provider round trip loses ?redirect_url; the callback reads it back.
        sessionStorage.setItem(RETURN_KEY, target());
        const { error } = await signIn.sso({
            strategy,
            redirectUrl: target(),
            redirectCallbackUrl: '/login/sso-callback',
        });
        if (error) setMsg(failureMsg(readAuthError(error)));
    }

    if (step === 'code') {
        return (
            <Form form={codeForm} onSubmit={onCode} errorWords={AUTH_WORDS} className="au-card">
                <h1>Check your email.</h1>
                <FormMsg msg={msg} />
                <Field name="code" label="Code" icon={glyph.key} autoComplete="one-time-code" inputMode="numeric" maxLength={12} />
                <Submit busy={busy} busyLabel="Checking…">
                    Continue
                </Submit>
                <Resend
                    onResend={async () => {
                        const { error } = await signIn.mfa.sendEmailCode();
                        setMsg(error ? failureMsg(readAuthError(error)) : { text: `A new code is on its way to ${email}.` });
                    }}
                />
                <div className="au-back">
                    <button
                        type="button"
                        className="au-link au-linkbtn"
                        onClick={async () => {
                            await signIn.reset();
                            setStep('password');
                            setMsg(REST);
                        }}
                    >
                        Use another account
                    </button>
                </div>
            </Form>
        );
    }

    return (
        <Form form={form} onSubmit={onPassword} errorWords={AUTH_WORDS} className="au-card" data-locked={locked ? '' : undefined}>
            <h1>Login to your dashboard.</h1>
            <FormMsg msg={msg} />

            <div className="au-oauth">
                <button type="button" onClick={() => withProvider('oauth_google')}>
                    {glyph.google}
                    Google
                </button>
                <button type="button" onClick={() => withProvider('oauth_github')}>
                    {glyph.github}
                    GitHub
                </button>
            </div>

            <div className="au-or">
                <span>or</span>
            </div>

            <Field name="email" label="Email" type="email" icon={glyph.mail} autoComplete="username" />
            <Field name="password" label="Password" type="password" icon={glyph.lock} autoComplete="current-password" />

            <div className="au-sub">
                <Link className="au-link" href="/forgot-password">
                    Forgot password?
                </Link>
            </div>

            <Submit busy={busy} busyLabel="Signing in…" disabled={locked}>
                Log in
            </Submit>

            {/* No Terms here: nothing is accepted at a login (HANDOFF §4). The
                notice is reachable signed out; it is a placeholder until the
                draft has had a specialist's review. */}
            <div className="au-legal">
                <Link className="au-link" href="/privacy-notice">
                    How your data is handled
                </Link>
                <span className="sep">·</span>© 2026 Boutaleb
            </div>
        </Form>
    );
}
