'use client';

import { portalResend } from '@repo/schemas';
import { useState, type FormEvent } from 'react';
import { type PortalLang } from '@/lib/portal/copy';
import { RESEND_COPY } from '@/lib/portal/resend-copy';
import { LangSwitch } from './LangSwitch';

// "Email me my access link" (T8.5): the page for a client whose link is lost
// or replaced. One field, one answer. The answer is the same words for every
// address (the API never says whether the address is a client's), so this
// page shows the same confirmation whenever the request went through, and
// only a request that did not go through is shown as a failure.

type Phase = 'form' | 'sending' | 'done';

export function PortalResend({ initialLang }: { initialLang: PortalLang }) {
    const [lang, setLang] = useState<PortalLang>(initialLang);
    const [email, setEmail] = useState('');
    const [phase, setPhase] = useState<Phase>('form');
    const [problem, setProblem] = useState<'invalid' | 'failed' | null>(null);
    const c = RESEND_COPY[lang];

    async function submit(e: FormEvent) {
        e.preventDefault();
        if (phase === 'sending') return;
        const parsed = portalResend.safeParse({ email });
        if (!parsed.success) return setProblem('invalid');
        setProblem(null);
        setPhase('sending');
        try {
            const res = await fetch('/api/portal/resend', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(parsed.data) });
            // 400 cannot happen after the check above, and 429 (too many tries from here) reads as "try later".
            if (!res.ok) throw new Error(String(res.status));
            setPhase('done');
        } catch {
            setProblem('failed');
            setPhase('form');
        }
    }

    return (
        <div className="pt-root" dir={c.dir} lang={lang}>
            <header className="pt-top">
                <span className="pt-mark">
                    boutaleb<span className="pt-dot">.</span>
                </span>
                <LangSwitch lang={lang} onPick={setLang} />
            </header>
            <main className="pt-main pt-resend">
                {phase === 'done' ? (
                    <section aria-live="polite">
                        <h1>{c.doneH}</h1>
                        <p className="pt-resend-p">{c.doneP}</p>
                    </section>
                ) : (
                    <form onSubmit={submit} noValidate>
                        <h1>{c.h1}</h1>
                        <p className="pt-resend-p">{c.lede}</p>
                        <div className="pt-q">
                            <label htmlFor="resend-email">{c.label}</label>
                            <input
                                id="resend-email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                dir="ltr"
                                maxLength={254}
                                placeholder={c.placeholder}
                                value={email}
                                aria-invalid={problem === 'invalid' || undefined}
                                aria-describedby={problem ? 'resend-problem' : undefined}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {problem && (
                            <p id="resend-problem" className="pt-fail" role="alert">
                                {problem === 'invalid' ? c.invalid : c.failed}
                            </p>
                        )}
                        <div className="pt-resend-go">
                            <button type="submit" className="pt-btn" disabled={phase === 'sending'}>
                                {phase === 'sending' ? c.sending : c.button}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
