'use client';

import { BRIEF_AREAS, BRIEF_PARTS, isThin, REASON_MIN, type BriefArea, type BriefView, type ProjectView } from '@repo/schemas';
import { useState, type ReactNode } from 'react';
import { QueryGate } from '@/components/owner/data/QueryGate';
import { ApiError } from '@/lib/api';
import { useBrief, useBriefAct } from '@/lib/projects/brief';
import { ago, todayIso } from '@/lib/projects/derive';

// The Intake tab (wireframes/shell/project-intake.js, structure spec §7).
// THE OWNER'S SCREEN, not the client's: they answer behind their magic
// link (M8). Here you read what came back and rule on it.
//
// One submission per project. A thin answer is never bounced back to the
// client; it is a gap YOU close with a note. Send back survives for one
// purpose only, a brief you actively disagree with, and takes a reason.
// Everything is inline, never a modal: a dialog would cover the answers
// you are ruling on.
//
// Writing the brief yourself is the only way for a project with nobody to
// ask (an idea, or internal work). It is not offered on a client's project:
// on a client who is merely slow it reads as giving up on them.

export function IntakeTab({ p }: { p: ProjectView }) {
    const query = useBrief(p.id);
    return (
        <QueryGate query={query} kind="tab" what="brief" className="pi-wrap">
            {(b) => <Intake p={p} b={b} />}
        </QueryGate>
    );
}

function Intake({ p, b }: { p: ProjectView; b: BriefView }) {
    const [writing, setWriting] = useState(false);
    const nobodyToAsk = !p.client || p.client.self;
    if (writing) return <Write p={p} b={b} close={() => setWriting(false)} />;
    if (b.state === 'none' || b.state === 'awaiting') return <Nothing p={p} b={b} write={nobodyToAsk ? () => setWriting(true) : undefined} />;
    return <Review p={p} b={b} write={() => setWriting(true)} />;
}

/* ---------- nothing to read yet ---------- */

/** Three states, three different next actions. An empty state that cannot say what to do next is an apology. */
function Nothing({ p, b, write }: { p: ProjectView; b: BriefView; write?: () => void }) {
    if (write) {
        return (
            <Empty title={p.client?.self ? 'Internal work, so no questionnaire.' : 'No client, so no questionnaire.'}>
                <p>The brief is yours to write. The questions exist to pull what is in someone else&apos;s head onto paper, and there is nobody else here.</p>
                {b.seed && <Seed title="What you wrote when you started it">{b.seed}</Seed>}
                <div className="pi-acts">
                    <button type="button" className="btn-solid" onClick={write}>
                        Write the brief
                    </button>
                </div>
            </Empty>
        );
    }
    if (b.state === 'awaiting' && b.sentAt) {
        const n = ago(b.sentAt.slice(0, 10), todayIso());
        return (
            <Empty title={`Sent ${n} day${n === 1 ? '' : 's'} ago. Nothing back yet.`}>
                <p>Nobody has opened the questionnaire. A reminder is the whole correct answer to silence; it goes out from the magic link.</p>
            </Empty>
        );
    }
    return (
        <Empty title="Nothing sent yet.">
            <p>The questionnaire goes out with the magic link. Until it does there is no brief, and without a brief there is no plan.</p>
            {b.seed && (
                <Seed title="What they told you when they got in touch" note="The questions are built from this. The more of their own words are here, the less generic what they are asked will be.">
                    {b.seed}
                </Seed>
            )}
        </Empty>
    );
}

function Empty({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="pi-empty" role="status">
            <h2>{title}</h2>
            {children}
        </div>
    );
}

function Seed({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
    return (
        <div className="pi-seed">
            <span className="pi-seed-h">{title}</span>
            <p>{children}</p>
            {note && <span className="pi-seed-n">{note}</span>}
        </div>
    );
}

/* ---------- writing it yourself ---------- */

/** "Keep writing" resumes from what is there rather than restarting. */
function draftFrom(b: BriefView): Record<string, string> {
    const d: Record<string, string> = {};
    for (const a of b.areas) {
        for (const q of a.qs) {
            const part = BRIEF_PARTS.find((x) => x.area === a.key && x.label === q.q);
            if (part && q.a) d[part.key] = q.a;
        }
    }
    return d;
}

function Write({ p, b, close }: { p: ProjectView; b: BriefView; close: () => void }) {
    const [draft, setDraft] = useState(() => draftFrom(b));
    const act = useBriefAct(p.id);
    const n = BRIEF_PARTS.filter((x) => draft[x.key]?.trim()).length;
    const save = () => act.mutate({ kind: 'write', answers: draft }, { onSuccess: close });
    return (
        <div className="pi-write">
            <div className="pi-empty">
                <h2>Writing the brief.</h2>
                <p>There is nobody to ask, so the sections below are yours to answer. Write enough that someone reading this in six months, including you, can tell what this was meant to be and why.</p>
                {b.seed && <Seed title="What you wrote when you started it">{b.seed}</Seed>}
            </div>
            <div className="pi-w-areas">
                {BRIEF_AREAS.map((a, i) => (
                    <section className="pi-w-area" key={a.key} aria-labelledby={`w-h-${a.key}`}>
                        <h3 className="pi-area-h" id={`w-h-${a.key}`}>
                            <span className="pi-area-n">{i + 1}</span>
                            {a.label}
                        </h3>
                        <div className="pi-w-parts">
                            {a.parts.map((pt) => {
                                const id = `${a.key}.${pt.key}`;
                                return (
                                    <div className="pi-w-p" key={id}>
                                        <label className="pi-w-lbl" htmlFor={`w-${id}`}>
                                            {pt.label}
                                        </label>
                                        <textarea
                                            className="pi-ta"
                                            id={`w-${id}`}
                                            rows={3}
                                            maxLength={4000}
                                            placeholder={pt.hint}
                                            value={draft[id] ?? ''}
                                            onChange={(e) => setDraft((d) => ({ ...d, [id]: e.target.value }))}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
            <div className="pi-w-foot">
                <p className="pi-note">
                    A prompt left empty stays empty. It is not a blocker, and it is more honest than a paragraph invented to fill it.{' '}
                    <span className="pi-w-n">
                        {n} of {BRIEF_PARTS.length} written
                    </span>
                </p>
                <Failure error={act.error} />
                <div className="pi-acts pi-acts--tight">
                    <button type="button" className="btn-solid" disabled={!n || act.isPending} onClick={save}>
                        {act.isPending ? 'Saving…' : 'Save the brief'}
                    </button>
                    <button type="button" className="pi-ghost" onClick={close}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ---------- the review ---------- */

const fmt = (iso: string) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Casablanca' }).format(new Date(iso));

/** An area is thin when more than half its answers are, and you have not written in what you know. */
const areaThin = (a: BriefArea) => !a.note && a.qs.filter((q) => isThin(q.a)).length > a.qs.length / 2;

function Review({ p, b, write }: { p: ProjectView; b: BriefView; write: () => void }) {
    // Every area in the fixed order, even one the submission skipped.
    const areas = BRIEF_AREAS.map((d) => b.areas.find((a) => a.key === d.key) ?? { key: d.key, qs: [], note: null });
    const questions = b.areas.reduce((n, a) => n + a.qs.length, 0);
    return (
        <>
            <div className="pi-head">
                {b.mine ? (
                    <>
                        <span className="pi-head-l">Written by you {b.submittedAt && fmt(b.submittedAt)}</span>
                        <span className="pi-head-l">Nobody answered a questionnaire: every word below is yours</span>
                    </>
                ) : (
                    <>
                        <span className="pi-head-l">Answered {b.submittedAt && fmt(b.submittedAt)}</span>
                        <span className="pi-head-l">{questions} questions, written for this project</span>
                    </>
                )}
                {b.revision > 1 && <span className="pi-head-l">Revision {b.revision}</span>}
            </div>
            {b.reading && <Reading r={b.reading} />}
            <Decide p={p} b={b} thin={areas.filter(areaThin).length} write={write} />
            <div className="pi-areas">
                {areas.map((a, i) => (
                    <Area key={a.key} p={p} a={a} i={i} />
                ))}
            </div>
        </>
    );
}

/**
 * ONE reading over the whole submission, not one per section: the risk in
 * a brief is almost never inside one section. Three regions: what they
 * want, what could go wrong, and what was ASSUMED because nobody said.
 */
function Reading({ r }: { r: NonNullable<BriefView['reading']> }) {
    return (
        <section className="pi-ai" aria-labelledby="pi-ai-h">
            <div className="pi-ai-h">
                <h2 id="pi-ai-h">What they are asking for</h2>
                <span className="pi-ai-tag">Read from their answers</span>
            </div>
            <p className="pi-ai-sum">{r.summary}</p>
            <div className="pi-ai-cols">
                <div className="pi-ai-col pi-ai-col--risk">
                    <span className="pi-ai-k">Risks</span>
                    {r.risks.length ? (
                        <ul>
                            {r.risks.map((x) => (
                                <li key={x}>{x}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="pi-none">None flagged.</p>
                    )}
                </div>
                <div className="pi-ai-col pi-ai-col--assume">
                    <span className="pi-ai-k">Assumed, because nobody said</span>
                    {r.assumptions.length ? (
                        <ul>
                            {r.assumptions.map((x) => (
                                <li key={x}>{x}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="pi-none">Nothing left open.</p>
                    )}
                </div>
            </div>
        </section>
    );
}

/**
 * The ruling. The button says what pressing it does, including the part
 * you might not want to hear: approving over thin areas is legitimate, but
 * never something done without noticing.
 */
function Decide({ p, b, thin, write }: { p: ProjectView; b: BriefView; thin: number; write: () => void }) {
    const act = useBriefAct(p.id);
    const [back, setBack] = useState(false);
    const [reason, setReason] = useState('');

    if (b.state === 'approved') {
        return (
            <div className="pi-ruled pi-ruled--ok">
                <span>Approved {b.decidedAt && fmt(b.decidedAt)}. The plan can be drawn.</span>
                <button type="button" className="pi-ghost" disabled={act.isPending} onClick={() => act.mutate({ kind: 'reopen' })}>
                    Reopen
                </button>
                <Failure error={act.error} />
            </div>
        );
    }
    if (b.state === 'sent_back') {
        return (
            <div className="pi-ruled pi-ruled--back">
                <span className="pi-ruled-h">Sent back {b.decidedAt && fmt(b.decidedAt)}</span>
                <p className="pi-ruled-r">{b.reason}</p>
                <button type="button" className="pi-ghost" disabled={act.isPending} onClick={() => act.mutate({ kind: 'reopen' })}>
                    Reopen
                </button>
                <Failure error={act.error} />
            </div>
        );
    }
    if (back) {
        const ok = reason.trim().length >= REASON_MIN;
        return (
            <div className="pi-decide">
                <div className="pi-backbox">
                    <label className="pi-back-h" htmlFor="pi-reason">
                        Why is this going back?
                    </label>
                    <p className="pi-back-n" id="pi-reason-n">
                        They read this. It is the whole message they get, so it has to say what to change, not that something is wrong. A thin answer is not a reason: you fill those in yourself.
                    </p>
                    <textarea
                        className="pi-ta"
                        id="pi-reason"
                        aria-describedby="pi-reason-n"
                        rows={4}
                        maxLength={2000}
                        placeholder="The budget in Strategy and the feature list in Requirements cannot both be true…"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <Failure error={act.error} />
                    <div className="pi-acts pi-acts--tight">
                        <button type="button" className="btn-solid" disabled={!ok || act.isPending} onClick={() => act.mutate({ kind: 'send-back', reason: reason.trim() }, { onSuccess: () => setBack(false) })}>
                            Send it back
                        </button>
                        <button
                            type="button"
                            className="pi-ghost"
                            onClick={() => {
                                setBack(false);
                                setReason('');
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    // Your own writing has nowhere to be sent back to: the control is replaced, not greyed out.
    if (b.mine) {
        return (
            <div className="pi-decide">
                <div className="pi-acts">
                    <button type="button" className="btn-solid" disabled={act.isPending} onClick={() => act.mutate({ kind: 'approve' })}>
                        Approve the brief
                    </button>
                    <button type="button" className="pi-ghost" onClick={write}>
                        Keep writing
                    </button>
                </div>
                <Failure error={act.error} />
                <p className="pi-note">You wrote this, so approving it is you saying it is finished, not that you agree with someone else.</p>
            </div>
        );
    }
    return (
        <div className="pi-decide">
            <div className="pi-acts">
                <button type="button" className="btn-solid" disabled={act.isPending} onClick={() => act.mutate({ kind: 'approve' })}>
                    Approve the brief{thin ? ` · ${thin} area${thin === 1 ? '' : 's'} still thin` : ''}
                </button>
                <button type="button" className="pi-ghost" onClick={() => setBack(true)}>
                    Send it back
                </button>
            </div>
            <Failure error={act.error} />
            <p className="pi-note">{thin ? 'Approving with gaps is normal. You never ask a client twice; you plan around what you got and write in what you know.' : 'Nothing is thin. This is enough to plan against.'}</p>
        </div>
    );
}

/** One reading section. A thin one gets a note from you, never a second question to them. */
function Area({ p, a, i }: { p: ProjectView; a: BriefArea; i: number }) {
    const def = BRIEF_AREAS.find((d) => d.key === a.key)!;
    const thin = areaThin(a);
    const act = useBriefAct(p.id);
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const edit = () => {
        setText(a.note ?? '');
        setOpen(true);
    };
    const hid = `pi-area-${a.key}`;
    return (
        <section className="pi-area" aria-labelledby={hid}>
            <h3 className="pi-area-h" id={hid}>
                <span className="pi-area-n">{i + 1}</span>
                {def.label}
                {thin && <span className="pi-thin">thin</span>}
            </h3>
            <div className="pi-qas">
                {a.qs.length ? (
                    a.qs.map((q, k) => (
                        <div className={isThin(q.a) ? 'pi-qa is-thin' : 'pi-qa'} key={k}>
                            <span className="pi-q">{q.q}</span>
                            <span className="pi-a">{q.a ? q.a : <span className="pi-none">Left blank</span>}</span>
                        </div>
                    ))
                ) : (
                    <p className="pi-none">No questions in this area.</p>
                )}
            </div>
            {open ? (
                <div className="pi-mine">
                    <label className="pi-mine-h" htmlFor={`${hid}-note`}>
                        What you know that they did not say
                    </label>
                    <textarea
                        className="pi-ta"
                        id={`${hid}-note`}
                        rows={3}
                        maxLength={2000}
                        placeholder="From the call, the site you already looked at, the thing they showed you…"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <Failure error={act.error} />
                    <div className="pi-acts pi-acts--tight">
                        <button type="button" className="btn-solid" disabled={(!text.trim() && !a.note) || act.isPending} onClick={() => act.mutate({ kind: 'note', area: a.key, note: text.trim() }, { onSuccess: () => setOpen(false) })}>
                            Save note
                        </button>
                        <button type="button" className="pi-ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : a.note ? (
                <div className="pi-mine">
                    <span className="pi-mine-h">Your note</span>
                    <p>{a.note}</p>
                    <button type="button" className="pi-ghost" onClick={edit}>
                        Edit
                    </button>
                </div>
            ) : (
                <button type="button" className="pi-ghost pi-addnote" onClick={edit}>
                    {thin ? 'Fill this gap yourself' : 'Add a note'}
                </button>
            )}
        </section>
    );
}

/** What went wrong, in place, beside the control that failed. Nothing typed is lost. */
function Failure({ error }: { error: Error | null }) {
    if (!error) return null;
    const conflict = error instanceof ApiError && error.status === 409;
    return (
        <p className="pi-fail" role="alert">
            {conflict ? 'This brief changed since it was opened. Reload to see where it stands.' : 'Did not save. Nothing typed is lost; try again.'}
        </p>
    );
}
