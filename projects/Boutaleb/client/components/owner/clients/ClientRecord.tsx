'use client';

import { CONTACT_TYPED, type ClientRow, type ContactView } from '@repo/schemas';
import { OptionRow } from '@repo/ui';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { QueryGate } from '@/components/owner/data/QueryGate';
import { KindMark } from '@/components/owner/list/List';
import {
    RecMore,
    RecNone,
    RecordCols,
    RecordHead,
    RecSection,
    RecStat,
    Sep,
    TabNav,
} from '@/components/owner/record/Record';
import { AppPage } from '@/components/owner/shell/AppPage';
import {
    agoText,
    CLIENT_STATUS,
    DERIVED,
    drift,
    KIND,
    LANG,
    live,
    silence,
    silent,
    standing,
    turn,
} from '@/lib/clients/derive';
import { useClient, useContacts, useLogContact } from '@/lib/clients/queries';
import { CLIENT_TABS, type ClientTab } from '@/lib/clients/tabs';
import { ago, PARKED, STATUS, todayIso } from '@/lib/projects/derive';

// One client (wireframes/client.html, shell/client.js). The list answers
// "who needs me"; this answers what you have with this person and what you
// have stopped doing about it. Clients owns the Client record; the projects
// are the board's and the money is Finance's (M10, "—" until then).
//
// Added to the wireframe: "Log contact" on Communication. The log is
// append-only and read everywhere, and without a way to write a call or a
// reply into it, silence could never be measured.

export function ClientRecord({ id, tab }: { id: string; tab: ClientTab }) {
    const query = useClient(id);
    return (
        <AppPage title="Clients" kicker="The people the work is for">
            <QueryGate
                query={query}
                kind="rec"
                what="clients"
                one="client"
                back="/app/clients"
                tabs={CLIENT_TABS.map((t) => t.label)}
                className="b-rec-wrap cd-rec"
            >
                {(c) => <Ready c={c} tab={tab} />}
            </QueryGate>
        </AppPage>
    );
}

function Ready({ c, tab }: { c: ClientRow; tab: ClientTab }) {
    const today = todayIso();
    const log = useContacts(c.id);
    const rows = log.data ?? [];
    return (
        <>
            <Head c={c} today={today} />
            <TabNav
                tabs={CLIENT_TABS}
                active={tab}
                href={(k) => (k === 'overview' ? `/app/clients/${c.id}` : `/app/clients/${c.id}?tab=${k}`)}
                label="Client sections"
            />
            <RecordCols
                main={
                    tab === 'overview' ? (
                        <>
                            <RecSection title="Their work" note={c.self ? undefined : 'owned by the board'} i={0}>
                                <Work c={c} />
                            </RecSection>
                            <RecSection title="Recent contact" note="last five" i={1}>
                                <LogState q={log}>
                                    {rows.length ? (
                                        <>
                                            <History rows={rows.slice(0, 5)} today={today} />
                                            {rows.length > 5 && (
                                                <RecMore href={`/app/clients/${c.id}?tab=log`}>
                                                    All {rows.length} entries
                                                </RecMore>
                                            )}
                                        </>
                                    ) : (
                                        <div className="cd-none-block">Nothing logged with {c.name} yet.</div>
                                    )}
                                </LogState>
                            </RecSection>
                        </>
                    ) : (
                        <RecSection title="History" note={rows.length ? `${rows.length} ${rows.length === 1 ? 'entry' : 'entries'}` : undefined}>
                            <LogContact c={c} />
                            <LogState q={log}>
                                <p className="cd-state">{stateLine(c, rows, today)}</p>
                                {rows.length ? (
                                    <History rows={rows} today={today} />
                                ) : (
                                    <div className="cd-none-block">
                                        An enquiry, a call or a reply logged here is what starts the clock on this
                                        relationship.
                                    </div>
                                )}
                            </LogState>
                        </RecSection>
                    )
                }
                rail={
                    <>
                        <RecSection title="Contact">
                            <Contact c={c} />
                            <RecMore href={`/app/clients/${c.id}/edit`}>Edit details</RecMore>
                        </RecSection>
                        {!c.self && tab === 'overview' && (
                            <RecSection title="Their language">
                                <div className="cd-card">
                                    <div className="cd-lang">{LANG[c.language]}</div>
                                    <p className="cd-note">
                                        Intake questions, the brief they read back, and quote and invoice documents
                                        are written in this language. Nothing else changes.
                                    </p>
                                </div>
                            </RecSection>
                        )}
                    </>
                }
            />
        </>
    );
}

/* ---------- header ---------- */

/** The same clock the list showed for this row. Money outranks silence once Finance exists. */
function clock(c: ClientRow, today: string): [string, ReactNode] {
    if (c.self) return ['Contact', <RecNone key="c">Internal</RecNone>];
    const q = silence(c, today);
    if (q === null) return ['Contact', <RecNone key="c">Never contacted</RecNone>];
    if (turn(c, today) === 'mine' && silent(c, today))
        return ['Attention', <span key="c" className="due late">Silent {q} days</span>];
    return [c.lastTheirs ? 'Last spoke' : 'No reply yet', <span key="c" className="cd-ago">{agoText(q)}</span>];
}

function Head({ c, today }: { c: ClientRow; today: string }) {
    const [lbl, val] = clock(c, today);
    const all = c.projects.length;
    const liveN = live(c).length;
    return (
        <RecordHead
            name={c.name}
            meta={
                <>
                    <span>{c.company}</span>
                    <Sep />
                    {c.self ? (
                        <span>Internal</span>
                    ) : (
                        <>
                            <span>{CLIENT_STATUS[c.status as keyof typeof CLIENT_STATUS] ?? c.status}</span>
                            {drift(c) && (
                                <>
                                    <Sep />
                                    <span className="cd-drift">{DERIVED[standing(c)]}</span>
                                </>
                            )}
                        </>
                    )}
                </>
            }
            stats={
                <>
                    <RecStat label="Value">
                        <RecNone>—</RecNone>
                    </RecStat>
                    <RecStat label="Outstanding">
                        <RecNone>—</RecNone>
                    </RecStat>
                    <RecStat label="Projects">
                        {all ? (liveN ? `${liveN} live of ${all}` : `${all} done`) : <RecNone>Nothing yet</RecNone>}
                    </RecStat>
                    <RecStat label={lbl}>{val}</RecStat>
                </>
            }
        />
    );
}

/* ---------- overview ---------- */

function Work({ c }: { c: ClientRow }) {
    if (!c.projects.length)
        return (
            <div className="cd-empty">
                <p>
                    Nothing signed yet.{' '}
                    {c.self
                        ? 'The studio’s own work lives on the board.'
                        : 'This is a lead: what they asked is in Communication.'}
                </p>
                {!c.self && (
                    <Link className="btn-solid" href={`/app/projects/new?client=${c.id}`}>
                        Start a project
                    </Link>
                )}
            </div>
        );
    const rows = [...c.projects].sort((a, b) => {
        const pa = PARKED.includes(a.status);
        const pb = PARKED.includes(b.status);
        return pa !== pb ? (pa ? 1 : -1) : a.name.localeCompare(b.name);
    });
    return (
        <div className="cd-work">
            {rows.map((p) => (
                <Link
                    key={p.id}
                    className={`cd-wrow${PARKED.includes(p.status) ? ' is-parked' : ''}`}
                    href={`/app/projects/${p.id}`}
                >
                    <span className="cd-wname">{p.name}</span>
                    <span className="cd-wstat">{STATUS[p.status].label}</span>
                    <span className="cd-wval money" />
                    <span className="cd-wowed money" />
                </Link>
            ))}
        </div>
    );
}

function LogState({ q, children }: { q: ReturnType<typeof useContacts>; children: ReactNode }) {
    if (q.isPending) return <div className="cd-none-block">Loading the history…</div>;
    if (q.isError) return <div className="cd-none-block">The history did not load. Reload to try again.</div>;
    return <>{children}</>;
}

function History({ rows, today }: { rows: ContactView[]; today: string }) {
    return (
        <div className="b-feed">
            {rows.map((l) => (
                <div className="b-ev" key={l.id}>
                    <span className="b-ev-d">{ago(l.at, today)}d</span>
                    <span className="b-ev-t">
                        <KindMark kind={l.kind} />
                        {l.text}
                        {l.project && <span className="b-ev-p">{l.project.name}</span>}
                    </span>
                </div>
            ))}
        </div>
    );
}

/** Empty fields are left out: a website nobody has is not a gap in the record. */
function Contact({ c }: { c: ClientRow }) {
    const line = (lbl: string, val: ReactNode) =>
        val ? (
            <div className="cd-cline">
                <span className="cd-clbl">{lbl}</span>
                <span className="cd-cval">{val}</span>
            </div>
        ) : null;
    const site = c.website?.replace(/^https?:\/\//, '');
    return (
        <div className="cd-card">
            {line('Email', <a href={`mailto:${c.email}`}>{c.email}</a>)}
            {line('Phone', c.phone)}
            {line('Site', site && <a href={`https://${site}`}>{site}</a>)}
            {line('Since', c.since)}
        </div>
    );
}

/* ---------- communication ---------- */

/** One sentence of state above the history: its most important fact is the gap at the top. */
function stateLine(c: ClientRow, rows: ContactView[], today: string): string {
    if (!rows.length) return 'Nothing logged yet.';
    if (!c.lastTheirs) return 'Logged, but they have never replied.';
    const q = ago(c.lastTheirs, today);
    return q === 0 ? 'You spoke today.' : `${q} days since they last replied or called.`;
}

const KINDS = CONTACT_TYPED.map((k) => ({ value: k, label: KIND[k] }));
const KIND_NOTE: Record<(typeof CONTACT_TYPED)[number], string> = {
    reply: 'They wrote back: this stops the silence clock.',
    call: 'You spoke: this stops the silence clock.',
    sent: 'You wrote to them. Chasing does not stop the clock; their answer does.',
    note: 'For you only. Does not touch the clock.',
};

function LogContact({ c }: { c: ClientRow }) {
    const today = todayIso();
    const [open, setOpen] = useState(false);
    const [kind, setKind] = useState<(typeof CONTACT_TYPED)[number] | null>(null);
    const [text, setText] = useState('');
    const [at, setAt] = useState(today);
    const [project, setProject] = useState('');
    const save = useLogContact(c.id);
    const reset = () => {
        setOpen(false);
        setKind(null);
        setText('');
        setAt(today);
        setProject('');
        save.reset();
    };
    if (!open)
        return (
            <button type="button" className="btn-solid cd-log-open" onClick={() => setOpen(true)}>
                Log contact
            </button>
        );
    const why = !kind ? 'Say what happened.' : !text.trim() ? 'Write one line about it.' : at > today ? 'That day has not happened yet.' : null;
    return (
        <form
            className="cd-log"
            aria-label="Log contact"
            onSubmit={(e) => {
                e.preventDefault();
                if (why || save.isPending) return;
                save.mutate(
                    { kind: kind!, text: text.trim(), at, ...(project ? { projectId: project } : {}) },
                    { onSuccess: reset }
                );
            }}
        >
            <OptionRow label="What happened" value={kind} options={KINDS} onChange={setKind} />
            {kind && <p className="cd-log-note">{KIND_NOTE[kind]}</p>}
            <label className="cd-log-l" htmlFor="cd-log-text">
                In one line
            </label>
            <input
                id="cd-log-text"
                className="cd-log-in"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={300}
                placeholder="Approved the homepage · Asked for a lower price"
                autoComplete="off"
            />
            <div className="cd-log-row">
                <div>
                    <label className="cd-log-l" htmlFor="cd-log-at">
                        When
                    </label>
                    <input
                        id="cd-log-at"
                        className="cd-log-in"
                        type="date"
                        value={at}
                        max={today}
                        onChange={(e) => setAt(e.target.value || today)}
                    />
                </div>
                {c.projects.length > 0 && (
                    <div>
                        <label className="cd-log-l" htmlFor="cd-log-p">
                            About (optional)
                        </label>
                        <select
                            id="cd-log-p"
                            className="cd-log-in"
                            value={project}
                            onChange={(e) => setProject(e.target.value)}
                        >
                            <option value="">The relationship in general</option>
                            {c.projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            {save.isError && <p className="cd-log-err">Not saved. Try again.</p>}
            <div className="cd-log-acts">
                {why && <span className="cd-log-req">{why}</span>}
                <button type="button" className="cd-log-cancel" onClick={reset}>
                    Cancel
                </button>
                <button type="submit" className="btn-solid" disabled={!!why || save.isPending}>
                    {save.isPending ? 'Saving…' : 'Save to history'}
                </button>
            </div>
        </form>
    );
}
