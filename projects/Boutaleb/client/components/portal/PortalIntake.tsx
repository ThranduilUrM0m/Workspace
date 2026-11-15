'use client';

import { BRIEF_AREAS, BRIEF_PARTS, type PortalView } from '@repo/schemas';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { COPY, type PortalLang } from '@/lib/portal/copy';
import { LangSwitch } from './LangSwitch';

// The client's page behind their magic link (T8.4; wireframe
// Blueprinting/wireframes/shell/portal-intake.js, rewritten client-centred).
// THREE SCREENS, ONE PAGE: the introduction, the questions, the
// confirmation. Not three routes: a client who refreshes mid-answer must not
// lose their place, and their answers are saved on the server as they type.
//
// The opening is a scroll reveal, never a scroll hijack: a tall block with a
// sticky stage, the page scrolls normally, a fast reader arrives fast. Under
// prefers-reduced-motion the two lines are simply stacked.

type Screen = 'intro' | 'form' | 'sent';
type Saving = 'idle' | 'saving' | 'saved' | 'failed';

const TOTAL = BRIEF_PARTS.length;
const SAVE_AFTER = 800;
const RETRY_AFTER = 5000;

export function PortalIntake({ token, initial }: { token: string; initial: PortalView }) {
    const [lang, setLang] = useState<PortalLang>(initial.language);
    const [screen, setScreen] = useState<Screen>(initial.state === 'done' ? 'sent' : initial.state === 'sent_back' ? 'form' : 'intro');
    const [answers, setAnswers] = useState<Record<string, string>>(initial.answers);
    const [saving, setSaving] = useState<Saving>(Object.keys(initial.answers).length ? 'saved' : 'idle');
    const [sending, setSending] = useState(false);
    const [sendFailed, setSendFailed] = useState(false);
    const c = COPY[lang];

    /* ---------- saving as they type ---------- */

    // Only what changed since the last good save travels; a failed save puts
    // its keys back, so nothing typed is ever dropped.
    const dirty = useRef<Record<string, string>>({});
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const flush = useCallback(async (): Promise<boolean> => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        const batch = dirty.current;
        if (!Object.keys(batch).length) return true;
        dirty.current = {};
        setSaving('saving');
        try {
            const res = await fetch(`/api/portal/${token}/draft`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answers: batch }) });
            if (!res.ok) throw new Error(String(res.status));
            setSaving(Object.keys(dirty.current).length ? 'saving' : 'saved');
            return true;
        } catch {
            dirty.current = { ...batch, ...dirty.current };
            setSaving('failed');
            timer.current = setTimeout(() => void flush(), RETRY_AFTER);
            return false;
        }
    }, [token]);

    const type = (key: string, value: string) => {
        setAnswers((a) => ({ ...a, [key]: value }));
        dirty.current[key] = value;
        setSaving('saving');
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void flush(), SAVE_AFTER);
    };

    useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

    const answered = BRIEF_PARTS.filter((p) => answers[p.key]?.trim()).length;

    const send = async () => {
        setSending(true);
        setSendFailed(false);
        const kept = await flush();
        try {
            if (!kept) throw new Error('unsaved');
            const res = await fetch(`/api/portal/${token}/submit`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ answers }) });
            if (!res.ok) throw new Error(String(res.status));
            setScreen('sent');
            window.scrollTo(0, 0);
        } catch {
            setSendFailed(true);
        } finally {
            setSending(false);
        }
    };

    /* ---------- the opening reveal ---------- */

    const [still, setStill] = useState(false);
    useEffect(() => setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);

    const hero = useRef<HTMLDivElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (screen !== 'intro' || still) return;
        const h = hero.current;
        const s = stage.current;
        if (!h || !s) return;
        const tick = () => {
            const span = h.offsetHeight - window.innerHeight;
            if (span <= 0) return;
            const t = Math.min(1, Math.max(0, window.scrollY / span));
            s.dataset.beat = t < 0.38 ? '0' : '1';
            s.style.opacity = t > 0.8 ? String(Math.max(0, (1 - t) / 0.2)) : '1';
        };
        // Next frame, not this one: the stage must lay out in its pre-entry state first, or the entrance is not a transition.
        const raf = requestAnimationFrame(tick);
        window.addEventListener('scroll', tick, { passive: true });
        window.addEventListener('resize', tick);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', tick);
            window.removeEventListener('resize', tick);
        };
    }, [screen, still, lang]);

    /* ---------- screens ---------- */

    const savedLine = saving === 'idle' ? c.saveIdle : saving === 'saving' ? c.saving : saving === 'saved' ? c.saved : c.saveFailed;

    return (
        <div className="pt-root" dir={c.dir} lang={lang}>
            <header className="pt-top">
                <span className="pt-mark">
                    boutaleb<span className="pt-dot">.</span>
                </span>
                <LangSwitch lang={lang} onPick={setLang} />
            </header>

            <main className={`pt-main${screen === 'form' ? ' pt-main--form' : ' pt-main--intro'}`}>
                {screen === 'intro' && (
                    <>
                        {still ? (
                            <div className="pt-hero pt-hero--still">
                                <p className="pt-beat1">{c.beat1}</p>
                                <p className="pt-beat2">{c.beat2}</p>
                            </div>
                        ) : (
                            <div className="pt-hero" ref={hero}>
                                <div className="pt-stage" data-beat="pre" ref={stage}>
                                    <p className="pt-beat1">{c.beat1}</p>
                                    <p className="pt-beat2">{c.beat2}</p>
                                    <span className="pt-scrollcue" aria-hidden="true">
                                        {c.scroll}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="pt-body">
                            <span className="pt-kicker">{c.kicker(initial.project)}</span>
                            <h1>{c.h1}</h1>
                            <p className="pt-lede">
                                {c.lede1[0]}
                                <b>{c.lede1[1]}</b>
                                {c.lede1[2]}
                            </p>
                            <p className="pt-lede">{c.lede2}</p>
                            <p className="pt-lede">{c.lede3}</p>

                            <div className="pt-turn">
                                <span className="pt-deal-k">{c.turnK}</span>
                                <h2>{c.turnH}</h2>
                            </div>
                            <div className="pt-beats">
                                {c.phases.map((p) => (
                                    <div className="pt-beat" key={p.n}>
                                        <span className="pt-beat-n">{p.n}</span>
                                        <h2>{p.h}</h2>
                                        <p>{p.p}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-deal">
                                <span className="pt-deal-k">{c.dealK}</span>
                                <h2>{c.dealH}</h2>
                                <p>{c.dealP(initial.who)}</p>
                                <p className="pt-promise">
                                    <b>{c.promise[0]}</b>
                                    {c.promise[1]}
                                </p>
                            </div>

                            <div className="pt-expect">
                                {c.expect(TOTAL, BRIEF_AREAS.length).map((line, i) => (
                                    <span key={i}>{line}</span>
                                ))}
                            </div>

                            <div className="pt-acts">
                                <button
                                    className="pt-btn"
                                    type="button"
                                    onClick={() => {
                                        setScreen('form');
                                        window.scrollTo(0, 0);
                                    }}
                                >
                                    {c.start}
                                </button>
                                <span className="pt-esc">{c.talk}</span>
                            </div>
                        </div>
                    </>
                )}

                {screen === 'form' && (
                    <>
                        {initial.state === 'sent_back' && (
                            <div className="pt-back" role="note">
                                <h2>{c.backH}</h2>
                                <p>{c.backP}</p>
                                {initial.reason && <blockquote>{initial.reason}</blockquote>}
                            </div>
                        )}
                        <div className="pt-bar">
                            <div className="pt-bar-l">
                                <span className="pt-bar-n">{c.answered(answered, TOTAL)}</span>
                                <span className="pt-bar-s" role="status" aria-live="polite">
                                    {savedLine}
                                </span>
                            </div>
                            <nav className="pt-jump" aria-label={c.jump}>
                                {BRIEF_AREAS.map((a) => (
                                    <a className="pt-jump-a" href={`#sec-${a.key}`} key={a.key}>
                                        {c.areas[a.key].name}
                                    </a>
                                ))}
                            </nav>
                        </div>
                        <div className="pt-form">
                            {BRIEF_AREAS.map((area, ix) => (
                                <section className="pt-sec" id={`sec-${area.key}`} key={area.key} aria-labelledby={`h-${area.key}`}>
                                    <div className="pt-sec-l">
                                        <span className="pt-sec-n">{c.part(ix + 1, BRIEF_AREAS.length)}</span>
                                        <h2 className="pt-sec-h" id={`h-${area.key}`}>
                                            {c.areas[area.key].name}
                                        </h2>
                                        <p className="pt-sec-why">{c.areas[area.key].why}</p>
                                        <span className="pt-sec-c">{c.questionCount(area.parts.length)}</span>
                                    </div>
                                    <div className="pt-qs">
                                        {area.parts.map((part, qx) => {
                                            const key = `${area.key}.${part.key}`;
                                            const id = `q-${area.key}-${part.key}`;
                                            return (
                                                <Fragment key={key}>
                                                    <div className="pt-q">
                                                        <label htmlFor={id}>
                                                            <span className="pt-q-n">{String(qx + 1).padStart(2, '0')}</span>
                                                            {c.questions[key]}
                                                        </label>
                                                        <textarea id={id} dir="auto" rows={3} maxLength={4000} placeholder={c.placeholder} value={answers[key] ?? ''} onChange={(e) => type(key, e.target.value)} />
                                                    </div>
                                                </Fragment>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                            <div className="pt-send">
                                <p className="pt-send-n">{c.sendNote}</p>
                                <div className="pt-acts">
                                    <button className="pt-btn" type="button" disabled={!answered || sending} onClick={() => void send()}>
                                        {sending ? c.sending : c.send}
                                    </button>
                                    <span className="pt-esc">{c.sendLater}</span>
                                </div>
                                {sendFailed && (
                                    <p className="pt-fail" role="alert">
                                        {c.sendFailed}
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {screen === 'sent' && (
                    <div className="pt-body pt-done">
                        <span className="pt-kicker">{initial.project}</span>
                        <h1>{c.sentH}</h1>
                        <p className="pt-lede">{c.sentP1}</p>
                        <p className="pt-lede">{c.sentP2}</p>
                        <div className="pt-acts">
                            <span className="pt-esc">{c.close}</span>
                        </div>
                    </div>
                )}
            </main>

            <footer className="pt-foot">
                <span>{c.foot}</span>
            </footer>
        </div>
    );
}
