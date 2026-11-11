'use client';

import type { ProjectView, RoundState, RoundView } from '@repo/schemas';
import Link from 'next/link';
import { useState } from 'react';
import { QueryGate } from '@/components/owner/data/QueryGate';
import { ApiError } from '@/lib/api';
import { useMilestones } from '@/lib/projects/milestones';
import { BundleError, useOpenPage, useRoundAct, useRoundUpload, useRounds, type UploadStep } from '@/lib/projects/wireframes';

// The Wireframes tab (wireframes/shell/project-wireframes.js, structure
// spec §2 WireframeRound, §8.06). A ROUND IS A DECISION, not a file: what
// was sent, when, and what came back. The deliverable is a folder of static
// files, uploaded as a zip; its pages are read out of it, never typed.
// Sending freezes it by copying, which is what makes "they approved round 2"
// mean something. History is append-only: no edit, no delete.
//
// One control per state and never a disabled one: where an action is
// impossible the screen says why in a sentence. Inline, never a modal.
// The client link is the overview's to issue (T8.4); this tab only reads it.

const STATE: Record<RoundState, [string, string]> = {
    draft: ['Draft', 'wf-tag--draft'],
    sent: ['With the client', 'wf-tag--sent'],
    changes: ['Changes asked', 'wf-tag--changes'],
    approved: ['Approved', 'wf-tag--ok'],
};

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export function WireframesTab({ p }: { p: ProjectView }) {
    const query = useRounds(p.id);
    return (
        <QueryGate query={query} kind="tab" what="wireframes" className="wf-wrap">
            {(rounds) => <Rounds p={p} rounds={rounds} />}
        </QueryGate>
    );
}

function Rounds({ p, rounds }: { p: ProjectView; rounds: RoundView[] }) {
    const planned = (useMilestones(p.id).data?.length ?? 0) > 0;
    const rec = `/app/projects/${p.id}`;

    if (!rounds.length) {
        // Two empty states, not one: "nothing here" and "nothing here YET, because something else comes first".
        if (!planned) {
            return (
                <div className="pi-empty" role="status">
                    <h2>No wireframes yet.</h2>
                    <p>The plan comes first. What gets drawn is the phases made visible; without them there is nothing to draw a round against.</p>
                    <Link className="pp-more" href={`${rec}?tab=plan`}>
                        Open the plan
                    </Link>
                </div>
            );
        }
        return (
            <div className="pi-empty" role="status">
                <h2>No wireframes yet.</h2>
                <p>
                    The plan is set. Round one starts empty: you upload the folder you built, the pages come out of it, then it goes to{' '}
                    {p.client ? p.client.company || p.client.name : 'the client'}.
                </p>
                <StartRound p={p} v={1} />
            </div>
        );
    }

    const [live, ...rest] = rounds;
    return (
        <>
            <Live p={p} r={live!} />
            {rest.length > 0 && (
                <section className="wf-hist" aria-labelledby="wf-hist-h">
                    <h3 className="wf-sec-h" id="wf-hist-h">
                        Earlier rounds
                    </h3>
                    {rest.map((r) => (
                        <Old key={r.id} p={p} r={r} />
                    ))}
                </section>
            )}
        </>
    );
}

function Tag({ s }: { s: RoundState }) {
    return <span className={`wf-tag ${STATE[s][1]}`}>{STATE[s][0]}</span>;
}

/* ---------- the live round ---------- */

function Live({ p, r }: { p: ProjectView; r: RoundView }) {
    return (
        <div className="wf-round">
            <div className="wf-round-h">
                <h2 className="wf-round-t">Round {r.v}</h2>
                <Tag s={r.state} />
                <span className="wf-round-d">{r.sentAt ? `sent ${fmt(r.sentAt)}` : 'never sent'}</span>
            </div>
            {r.note && <p className="wf-round-n">{r.note}</p>}
            {r.pages.length ? <Frames p={p} r={r} /> : r.state === 'draft' ? <Drop p={p} r={r} /> : <p className="wf-none">This round has no pages, which should not be possible once it is sent.</p>}
            <Comments r={r} />
            <Acts p={p} r={r} />
        </div>
    );
}

/**
 * A card per page. The thumbnail is the screenshot taken when the round was
 * frozen; until screenshots land (and on a draft, always) it is three grey
 * bars, deliberately unconvincing. Dashed while the folder can still change.
 * A card opens the page itself, in a new tab.
 */
function Frames({ p, r }: { p: ProjectView; r: RoundView }) {
    const open = useOpenPage(p.id);
    return (
        <ul className="wf-frames" aria-label={`Round ${r.v} pages`}>
            {r.pages.map((pg) => {
                const n = r.comments.filter((c) => c.page === pg.name).length;
                return (
                    <li key={pg.file}>
                        <button type="button" className={n ? 'wf-frame has-note' : 'wf-frame'} onClick={() => void open(r.v, pg.file)} aria-label={`Open ${pg.name} in a new tab`}>
                            <span className={r.frozen ? 'wf-frame-b' : 'wf-frame-b is-live'} aria-hidden="true">
                                <i />
                                <i />
                                <i />
                            </span>
                            <span className="wf-frame-n">{pg.name}</span>
                            <span className="wf-frame-f">{pg.file}</span>
                            {n > 0 && (
                                <span className="wf-frame-c">
                                    {n} note{n === 1 ? '' : 's'}
                                </span>
                            )}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

const PROBLEM: Record<string, string> = {
    empty: 'That zip is empty, or holds nothing a wireframe uses.',
    noPages: 'No .html file at the top of the folder, so there is no page to show. Pages inside sub-folders do not count.',
    tooMany: 'Too many files for one round (300 at most).',
    tooBig: 'Too large: 15 MB a file, 60 MB a round.',
    unreadable: 'That file could not be read as a zip.',
    storage: 'A file did not reach storage. Nothing changed; try again.',
};

function stepText(s: UploadStep) {
    if (s.at === 'reading') return 'Reading the zip…';
    if (s.at === 'sending') return `Uploading ${s.sent} of ${s.of} files…`;
    return 'Reading the pages…';
}

/** The zip input. As the drop zone on an empty draft, as a ghost "Replace the folder" once it has pages. */
function Upload({ p, r, ghost }: { p: ProjectView; r: RoundView; ghost?: boolean }) {
    const up = useRoundUpload(p.id);
    const input = (
        <input
            type="file"
            accept=".zip,application/zip"
            className="wf-file"
            disabled={up.isPending}
            onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) up.mutate({ v: r.v, file });
            }}
        />
    );
    const err = up.error instanceof BundleError ? PROBLEM[up.error.problem] : up.error ? (up.error instanceof ApiError && up.error.status === 400 ? 'The folder holds something the server will not take.' : 'Did not upload. Try again.') : null;
    const status = (
        <>
            {up.step && <span className="wf-drop-p" role="status">{stepText(up.step)}</span>}
            {err && (
                <span className="wf-fail" role="alert">
                    {err}
                </span>
            )}
            {!up.step && !err && up.isSuccess && up.skipped.length > 0 && (
                <span className="wf-drop-p">
                    Left out {up.skipped.length} file{up.skipped.length === 1 ? '' : 's'} a wireframe has no use for: {up.skipped.slice(0, 4).join(', ')}
                    {up.skipped.length > 4 ? '…' : ''}
                </span>
            )}
        </>
    );
    if (ghost) {
        return (
            <>
                <label className="pi-ghost wf-relabel">
                    {input}
                    {up.isPending ? 'Uploading…' : 'Replace the folder'}
                </label>
                <span className="wf-up-s">{status}</span>
            </>
        );
    }
    return (
        <label className="wf-drop">
            {input}
            <span className="wf-drop-h">Upload the round</span>
            <span className="wf-drop-s">A .zip of the folder you built: every top-level .html in it becomes a page, named from its &lt;title&gt;.</span>
            {r.sourceName && <span className="wf-drop-p">{r.sourceName}</span>}
            {status}
        </label>
    );
}

function Drop({ p, r }: { p: ProjectView; r: RoundView }) {
    return <Upload p={p} r={r} />;
}

function Comments({ r }: { r: RoundView }) {
    if (!r.comments.length) return null;
    return (
        <div className="wf-notes">
            <h4 className="wf-sec-h">What they said</h4>
            {r.comments.map((c, i) => (
                <div className="wf-note" key={i}>
                    <span className="wf-note-p">{c.page ?? 'On the whole thing'}</span>
                    <p className="wf-note-t">{c.body}</p>
                    <span className="wf-note-d">{fmt(c.at)}</span>
                </div>
            ))}
        </div>
    );
}

/* ---------- what you can do about the live round ---------- */

const REASON: Record<string, string> = {
    no_client: 'This project has no client, so there is nobody to send it to.',
    no_pages: 'Nothing uploaded yet, so there is nothing to send.',
    not_draft: 'This round has already gone out.',
    not_sent: 'That round is not with the client any more.',
    round_open: 'The current round is still open.',
    plan_missing: 'The plan comes first: add a phase, then start round one.',
};

function Fail({ error }: { error: Error | null }) {
    if (!error) return null;
    const reason = error instanceof ApiError && error.status === 409 ? (error.body as { reason?: string } | null)?.reason : undefined;
    return (
        <p className="wf-fail" role="alert">
            {(reason && REASON[reason]) ?? 'Did not save. Try again.'}
        </p>
    );
}

function Acts({ p, r }: { p: ProjectView; r: RoundView }) {
    const act = useRoundAct(p.id);
    const [verdict, setVerdict] = useState<'approved' | 'changes' | null>(null);

    if (r.state === 'draft') {
        if (!r.pages.length) {
            return <p className="wf-note-l">Nothing uploaded yet, so there is nothing to send. The round is whatever folder you built: upload it and the pages come out of it.</p>;
        }
        if (!p.client) {
            return (
                <>
                    <div className="wf-acts">
                        <Upload p={p} r={r} ghost />
                    </div>
                    <p className="wf-note-l">Nobody to send it to yet: this project has no client. The round stays a draft until it has one.</p>
                </>
            );
        }
        return (
            <>
                <div className="wf-acts">
                    <button type="button" className="btn-solid" disabled={act.isPending} onClick={() => act.mutate({ kind: 'send', v: r.v })}>
                        Send it to the client
                    </button>
                    <Upload p={p} r={r} ghost />
                </div>
                <Fail error={act.error} />
                <p className="wf-note-l">
                    Sending copies <b>{r.sourceName ?? 'the working folder'}</b> to a round of its own. That copy is never written again: it is what &ldquo;they approved round {r.v}&rdquo; means.
                </p>
                <p className="wf-note-l">
                    Client links arrive with the client pages; until then, sending freezes the round and you share it yourself. The <Link href={`/app/projects/${p.id}`}>overview</Link> will issue the link.
                </p>
            </>
        );
    }

    if (r.state === 'sent') {
        if (verdict) return <Verdict p={p} r={r} ok={verdict === 'approved'} close={() => setVerdict(null)} />;
        return (
            <>
                <div className="wf-acts">
                    <button type="button" className="btn-solid" onClick={() => setVerdict('approved')}>
                        Record their approval
                    </button>
                    <button type="button" className="pi-ghost" onClick={() => setVerdict('changes')}>
                        Record changes asked
                    </button>
                </div>
                <p className="wf-note-l">Sent {fmt(r.sentAt)}. The clock on this one is theirs, not yours.</p>
            </>
        );
    }

    return (
        <>
            <StartRound p={p} v={r.v + 1} quiet={r.state === 'approved'} />
            <p className="wf-note-l">
                {r.state === 'changes'
                    ? 'The next round starts from these pages. This one closes as it is: a round that came back is a record, and records do not get rewritten.'
                    : `Approved ${fmt(r.decidedAt)}. Another round is allowed, but this is the version the build is against until one exists.`}
            </p>
        </>
    );
}

/**
 * Their verdict, in their words. Changes need a sentence; an approval does
 * not. Typed here rather than remembered, because the alternative is a
 * design decision that lives only in WhatsApp.
 */
function Verdict({ p, r, ok, close }: { p: ProjectView; r: RoundView; ok: boolean; close: () => void }) {
    const act = useRoundAct(p.id);
    const [page, setPage] = useState('');
    const [text, setText] = useState('');
    const ready = ok || !!text.trim();
    return (
        <form
            className="wf-vbox"
            onSubmit={(e) => {
                e.preventDefault();
                if (!ready) return;
                act.mutate({ kind: 'verdict', v: r.v, verdict: ok ? 'approved' : 'changes', page: page || null, body: text.trim() }, { onSuccess: close });
            }}
        >
            <label className="wf-sec-h" htmlFor="wf-v-page">
                {ok ? 'Anything they said with it?' : 'What did they ask for?'}
            </label>
            <div className="wf-vrow">
                <select id="wf-v-page" className="wf-sel" value={page} onChange={(e) => setPage(e.target.value)} aria-label="Which page">
                    <option value="">On the whole thing</option>
                    {r.pages.map((pg) => (
                        <option key={pg.file} value={pg.name}>
                            {pg.name}
                        </option>
                    ))}
                </select>
            </div>
            <textarea
                className="pi-ta"
                rows={3}
                maxLength={4000}
                aria-label={ok ? 'What they said' : 'What they asked for'}
                placeholder={ok ? 'Optional: what they said as they signed it off.' : 'Their words, not your summary of them.'}
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
            />
            <div className="wf-acts">
                <button type="submit" className="btn-solid" disabled={!ready || act.isPending}>
                    {ok ? 'Record the approval' : 'Record it'}
                </button>
                <button type="button" className="pi-ghost" onClick={close}>
                    Cancel
                </button>
            </div>
            <Fail error={act.error} />
            {!ok && <p className="wf-note-l">Changes with no sentence attached are a round nobody can act on.</p>}
        </form>
    );
}

/**
 * Start a round. Round one starts with one click. Later rounds ask, inline
 * and optionally, what changed since the last: the note sits above the
 * frames, because it is what makes them readable.
 */
function StartRound({ p, v, quiet }: { p: ProjectView; v: number; quiet?: boolean }) {
    const act = useRoundAct(p.id);
    const [open, setOpen] = useState(false);
    const [note, setNote] = useState('');
    const cls = quiet ? 'pi-ghost' : 'btn-solid';
    if (v === 1 || !open) {
        return (
            <>
                <div className="wf-acts">
                    <button type="button" className={cls} disabled={act.isPending} onClick={() => (v === 1 ? act.mutate({ kind: 'start', note: null }) : setOpen(true))}>
                        Start round {v === 1 ? 'one' : v}
                    </button>
                </div>
                <Fail error={act.error} />
            </>
        );
    }
    return (
        <form
            className="wf-vbox"
            onSubmit={(e) => {
                e.preventDefault();
                act.mutate({ kind: 'start', note: note.trim() || null });
            }}
        >
            <label className="wf-sec-h" htmlFor="wf-note">
                What changes in round {v}?
            </label>
            <textarea id="wf-note" className="pi-ta" rows={2} maxLength={600} placeholder="Optional, in your words: what you are about to change." value={note} onChange={(e) => setNote(e.target.value)} autoFocus />
            <div className="wf-acts">
                <button type="submit" className="btn-solid" disabled={act.isPending}>
                    Start round {v}
                </button>
                <button type="button" className="pi-ghost" onClick={() => setOpen(false)}>
                    Cancel
                </button>
            </div>
            <Fail error={act.error} />
        </form>
    );
}

/* ---------- superseded rounds ----------
   Closed by default: history answers a question you already have. */

function Old({ p, r }: { p: ProjectView; r: RoundView }) {
    const [open, setOpen] = useState(false);
    const n = r.comments.length;
    return (
        <div className={open ? 'wf-old is-open' : 'wf-old'}>
            <button type="button" className="wf-old-h" aria-expanded={open} onClick={() => setOpen(!open)}>
                <span className="wf-old-v">Round {r.v}</span>
                <Tag s={r.state} />
                <span className="wf-old-d">
                    {fmt(r.sentAt)}
                    {r.decidedAt ? ` → ${fmt(r.decidedAt)}` : ''}
                </span>
                <span className="wf-old-c">{n ? `${n} note${n === 1 ? '' : 's'}` : 'no notes'}</span>
                <span className="wf-old-x" aria-hidden="true">
                    {open ? '−' : '+'}
                </span>
            </button>
            {open && (
                <div className="wf-old-b">
                    {r.note && <p className="wf-round-n">{r.note}</p>}
                    {r.pages.length ? <Frames p={p} r={r} /> : <p className="wf-none">No pages.</p>}
                    <Comments r={r} />
                </div>
            )}
        </div>
    );
}
