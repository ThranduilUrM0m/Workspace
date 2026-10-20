'use client';

import { useAuth, useSignIn } from '@clerk/nextjs';
import { MIN_PASSWORD, newPassword, type NewPassword } from '@repo/schemas';
import { Field, Form, useSchemaForm } from '@repo/ui';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { readAuthError } from '@/lib/auth-errors';
import { CodeExpired } from './ForgotForm';
import { AUTH_WORDS, BackToLogin, FormMsg, glyph, PanelIcon, Submit, type Msg } from './parts';

// /reset-password (wireframes/reset-password.html). Reached from a right
// code on /forgot-password; Clerk holds that sign-in attempt, so arriving
// any other way (an old tab, a typed URL, a used or expired code) finds
// nothing to finish and gets the one "code expired" panel. Nothing is in
// the URL, so there is nothing to strip from it.

const REST: Msg = { text: 'Signing in on other devices will need the new one.' };

export function ResetForm() {
    const { isLoaded } = useAuth();
    const { signIn } = useSignIn();
    const [msg, setMsg] = useState<Msg>(REST);
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);

    const form = useSchemaForm(newPassword, { password: '', confirm: '' });
    // Live checklist, every keystroke: the rule is useful while composing.
    const [pw, confirm] = form.watch(['password', 'confirm']);
    const met = { len: pw.length >= MIN_PASSWORD, match: !!pw && pw === confirm };

    async function onSubmit(v: NewPassword) {
        setBusy(true);
        setMsg(REST);
        const { error } = await signIn.resetPasswordEmailCode.submitPassword({
            password: v.password,
            // The point of a reset: whoever else had the password loses their session.
            signOutOfOtherSessions: true,
        });
        if (error) {
            const f = readAuthError(error);
            setBusy(false);
            if (f.kind === 'breached') return setMsg({ text: 'That password appears in a known breach. Choose another.', tone: 'err' });
            if (f.kind === 'deadCode') return setMsg({ text: 'That code has expired. Ask for a new one.', tone: 'warn' });
            return setMsg({ text: 'Something went wrong. Try again.', tone: 'err' });
        }
        if (signIn.status === 'complete') {
            // Signed in with the new password; the panel offers the way in.
            await signIn.finalize({ navigate: () => {} });
            setDone(true);
        }
        setBusy(false);
    }

    if (!isLoaded) return <div className="au-card" aria-busy="true" />;

    if (done) {
        return (
            <div className="au-card">
                <div className="au-panel">
                    <PanelIcon tone="ok">{glyph.tick}</PanelIcon>
                    <p>Password changed.</p>
                    {/* Said because the phone asking to sign in again would otherwise read as a fault. */}
                    <p className="fine">Every other signed-in device has been signed out. You will need the new password on each of them.</p>
                    <Link className="au-submit" href="/app">
                        Go to your dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (signIn.status !== 'needs_new_password') return <CodeExpired />;

    return (
        <Form form={form} onSubmit={onSubmit} errorWords={AUTH_WORDS} className="au-card">
            <h1>Choose a new password.</h1>
            <FormMsg msg={msg} />
            <Field name="password" label="New password" type="password" reveal icon={glyph.lock} autoComplete="new-password" describedBy="au-reqs" />
            <ul className="au-reqs" id="au-reqs">
                <Req met={met.len}>At least {MIN_PASSWORD} characters</Req>
                <Req met={met.match}>Both fields match</Req>
            </ul>
            <Field name="confirm" label="Repeat new password" type="password" reveal icon={glyph.lock} autoComplete="new-password" />
            <Submit busy={busy} busyLabel="Saving…">
                Set new password
            </Submit>
            <BackToLogin />
        </Form>
    );
}

function Req({ met, children }: { met: boolean; children: ReactNode }) {
    return (
        <li data-met={met ? '' : undefined}>
            <span className="box">{glyph.tickBold}</span>
            {children}
        </li>
    );
}
